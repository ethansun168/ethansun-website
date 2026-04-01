// Uses B2 and S3-API
// Since backend is on Cloudflare workers, we can't use AWS-SDK

import { Hono } from "hono";
import { AwsClient } from "aws4fetch";
import { AppEnv } from "./types.js";
import { requireAuth } from "./middleware.js";
import { createImage, deleteImage, editImage, getImages } from "../db/images.js";
import { bodyLimit } from "hono/body-limit";
import { zValidator } from "@hono/zod-validator";
import z from "zod";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

function getClient(env: AppEnv['Bindings']) {
  const region = env.B2_ENDPOINT.split(".")[1];
  return new AwsClient({
    accessKeyId: env.B2_KEY_ID,
    secretAccessKey: env.B2_APP_KEY,
    region,
    service: "s3"
  })
}

function getUrl(env: AppEnv['Bindings'], key: string) {
  return `${env.B2_ENDPOINT}/${env.B2_BUCKET_NAME}/${key}`;
}

// TODO: may have to cache the signed urls
const app = new Hono<AppEnv>()
  .get("/api/v1/images", async (c) => {
    const aws = getClient(c.env);
    const res = await aws.fetch(getUrl(c.env, ""), {
      method: "GET",
    });

    if (!res.ok) return c.json({ message: "Failed to list images" }, 500);

    const xml = await res.text();
    const keys = [...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map(m => m[1]);

    const ids = keys.map((key) => key.split(".")[0])
    const images = await getImages(c.get('db'), ids)

    const signedURLs = await Promise.all(keys.map(async (key) => {
      const url = new URL(getUrl(c.env, key));
      url.searchParams.set("X-Amz-Expires", "3600");

      const signed = await aws.sign(
        new Request(url.toString(), { method: "GET" }),
        { aws: { signQuery: true } }
      );
      return { id: key.split(".")[0], url: signed.url }
    }))

    const imgs = images.map((img) => {
      const signed = signedURLs.find((s) => s.id === img.id)!
      return { ...img, url: signed.url }
    })

    return c.json(imgs);
  })

  .post("/api/v1/images",
    requireAuth,
    zValidator('form',
      z.object({
        file: z.instanceof(File)
      }),
    ),
    bodyLimit({
      maxSize: 10 * 1024 * 1024, // 10MB
      onError: (c) => {
        return c.json({ message: "File too large" }, 413)
      }
    }),
    async (c) => {
      const id = crypto.randomUUID()
      const { file } = c.req.valid('form')

      if (!ALLOWED_TYPES.includes(file.type)) {
        return c.json({ message: "Invalid file type" }, 400)
      }

      const ext = file.type.split("/")[1] ?? "jpg";
      const key = `${id}.${ext}`

      const url = getUrl(c.env, key)
      createImage(c.get('db'), id, url, file.name, c.get('username'))

      const aws = getClient(c.env)
      const res = await aws.fetch(url, {
        method: "PUT",
        body: await file.arrayBuffer(),
        headers: { "Content-Type": file.type }
      })

      if (!res.ok) return c.json({ message: "Upload failed" }, 500)
      return c.json({ key, url })
    })
  .patch("/api/v1/images/:id",
    requireAuth,
    zValidator('json',
      z.object({
        name: z.string()
      })
    ),
    async (c) => {
      const id = c.req.param("id");
      const { name } = c.req.valid('json')
      if (await editImage(c.get('db'), id, name, c.get('username'))) {
        return c.body(null, 204)
      }
      return c.json({ "message": "Image update failed" }, 404)
    })
  .delete("/api/v1/images/:id", requireAuth, async (c) => {
    const id = c.req.param("id");

    if (!deleteImage(c.get('db'), id, c.get('username'))) {
      return c.json({ message: "Cannot delete image" }, 404)
    }

    const aws = getClient(c.env);
    const res = await aws.fetch(getUrl(c.env, id), { method: "DELETE" });
    if (!res.ok) return c.json({ message: "Delete failed" }, 500);
    return c.json({ message: "Deleted" });
  });

export default app;
