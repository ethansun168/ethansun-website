# Ethan Website Backend

Backend API built with Hono and Cloudflare Workers

## Deploying

Set up environment variables in `.env`

```
CLOUDFLARE_ACCOUNT_ID=[accountId]
CLOUDFLARE_DATABASE_ID=[db id]
CLOUDFLARE_D1_TOKEN=[d1 edit token]
```

```
npx wrangler secret put COOKIE_SECRET

# add the cookie secret

# migrate database
npx drizzle-kit migrate

# deploy to cloudflare
npx wrangler deploy
```

## Development

Set up environment variables in `.dev.vars`

```
COOKIE_SECRET=[secret]
```

```
# Install dependencies
npm install

# Run dev server
npm run dev
```
