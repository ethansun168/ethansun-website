import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { client } from "@/constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Plus, Trash2, X, Upload, CheckCircle2, Pencil } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { Forbidden } from "./forbidden";
import { useRequireUser } from "@/hooks/query";

export function Gallery() {
  const { user } = useRequireUser();
  const queryKey = "images"
  const queryClient = useQueryClient()
  const { data: serverImages,
    isLoading: imagesLoading,
    isError: imagesError,
    refetch: refetchImages,
    dataUpdatedAt: imagesUpdatedAt
  } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const response = await client.api.v1.images.$get()
      if (response.status == 403) {
        setForbidden(true)
        return
      }
      if (!response.ok) throw new Error("Failed to fetch images")
      return await response.json()
    },
    staleTime: 1000 * 60 * 5, // 5 min
    refetchOnWindowFocus: false
  })

  type Image = NonNullable<typeof serverImages>[number] & { status: "uploading" | "done" | "error" }

  const [localImages, setLocalImages] = useState<Image[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [previewImage, setPreviewImage] = useState<Image | null>(null)
  const [forbidden, setForbidden] = useState(false)

  const [imageEdit, setImageEdit] = useState<Image | null>(null)
  const [editName, setEditName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Merge server images with local uploading/error state
  const images: Image[] = [
    ...localImages.filter((l) => l.status !== "done"),
    ...(serverImages ?? []).map((img) => ({ ...img, status: "done" as const })),
  ]

  const addFiles = (files: FileList | File[]) => {
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"))
    setPendingFiles((prev) => [...prev, ...valid])
  }

  const removePending = (idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const { mutateAsync: uploadImage } = useMutation({
    mutationFn: async (file: File) => {
      const res = await client.api.v1.images.$post({
        form: { file },
      })
      if (!res.ok) throw new Error("Upload failed")
      return await res.json()
    },
  })

  const { mutateAsync: editImage } = useMutation({
    mutationFn: async ({ key, name }: { key: string, name: string }) => {
      const res = await client.api.v1.images[":id"].$patch({
        json: { name },
        param: { id: key }
      })
      if (!res.ok) throw new Error("Edit image failed")
    },
    onMutate: async ({ key, name }: { key: string, name: string }) => {
      await queryClient.cancelQueries({ queryKey: [queryKey] })
      const previous = queryClient.getQueryData([queryKey])
      setImageEdit(null)
      queryClient.setQueryData([queryKey], (old: Image[]) =>
        old.map((msg) => msg.id === key ? { ...msg, name } : msg)
      )
      return { previous }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [queryKey], refetchType: 'none' }),
    onError: (_err, _vars, context) => {
      queryClient.setQueryData([queryKey], context?.previous)
    }
  })

  const { mutateAsync: deleteImage } = useMutation({
    mutationFn: async (id: string) => {
      if (previewImage?.id === id) setPreviewImage(null)
      const response = await client.api.v1.images[":id"].$delete({
        param: {
          id: id
        }
      })
      if (!response.ok) throw new Error("Failed to delete image")
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: [queryKey] })
      const previous = queryClient.getQueryData([queryKey])
      queryClient.setQueryData([queryKey], (old: Image[]) =>
        old.filter((msg) => msg.id !== id)
      )
      return { previous }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [queryKey], refetchType: 'none' }),
    onError: (_err, _vars, context) => {
      queryClient.setQueryData([queryKey], context?.previous)
    }
  })

  const handleUpload = async () => {
    if (!pendingFiles.length) return

    const newImages: Image[] = pendingFiles.map((file) => ({
      username: user?.username,
      created: new Date().toDateString(),
      name: file.name,
      id: file.name,
      url: URL.createObjectURL(file),
      status: "uploading" as const,
    }))

    setLocalImages((prev) => [...newImages, ...prev])
    setModalOpen(false)
    setPendingFiles([])

    await Promise.all(
      newImages.map(async (img) => {
        try {
          const file = pendingFiles.find((f) => f.name === img.id)!
          await uploadImage(file)
          setLocalImages((prev) => prev.filter((i) => i.id !== img.id))
        } catch {
          setLocalImages((prev) =>
            prev.map((i) => i.id === img.id ? { ...i, status: "error" } : i)
          )
        }
      })
    )
    queryClient.invalidateQueries({ queryKey: [queryKey] })
  }

  const openNew = () => {
    setPendingFiles([])
    setModalOpen(true)
  }

  if (forbidden) {
    return <Forbidden />
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-slate-950 relative">
      <div className="flex justify-center py-2">
        <p className="text-gray-400 dark:text-gray-600 text-xs">
          Last updated: {new Date(imagesUpdatedAt).toLocaleTimeString()}
        </p>
      </div>
      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full">
        {imagesError ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <X className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-gray-900 dark:text-white text-sm font-medium">Failed to load images</p>
            <Button size="sm" onClick={() => refetchImages()} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 shadow-xl">
              Try again
            </Button>
          </div>
        ) : imagesLoading ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white animate-spin" />
            <p className="text-gray-400 dark:text-gray-600 text-sm">Loading images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-600 mt-20 text-sm">
            No images yet. Upload something!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-8">
            {images.map((img) => (
              <Card
                key={img.id}
                className="w-full shadow-sm overflow-hidden group cursor-pointer"
                onClick={() => img.status === "done" && setPreviewImage(img)}
              >
                <CardContent className="p-0 relative">
                  <img
                    src={img.url}
                    alt={img.id}
                    className="w-full h-40 object-cover"
                  />

                  {/* Uploading overlay */}
                  {img.status === "uploading" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="h-7 w-7 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    </div>
                  )}

                  {/* Error overlay */}
                  {img.status === "error" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <p className="text-white text-xs">Upload failed</p>
                    </div>
                  )}

                  {/* Done badge */}
                  {img.status === "done" && (
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 drop-shadow" />
                    </div>
                  )}

                  {/* Delete button */}
                  {img.status === "done" && img.username === user.username && (
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-black/30 hover:bg-black/50 text-white hover:text-blue-400 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          setImageEdit(img)
                          setEditName(img.name)
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-black/30 hover:bg-black/50 text-white hover:text-red-400 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteImage(img.id)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}

                  {/* Key label */}
                  <div className="px-3 py-2">
                    <p className="text-gray-900 dark:text-white text-xs font-medium truncate">
                      {img.name}
                    </p>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between">
                    <p className="text-gray-900 dark:text-gray-400 text-xs font-medium truncate">
                      Uploaded by: {img.username}
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs flex-shrink-0">
                      {new Date(img.created).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating plus button */}
      <div className="absolute top-[1rem] right-6">
        <Button
          onClick={openNew}
          className="rounded-full h-14 w-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 shadow-xl hover:scale-110 active:scale-95 transition-all"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Upload Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Images</DialogTitle>
          </DialogHeader>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2
              py-10 cursor-pointer transition-colors select-none
              ${dragging
                ? "border-gray-900 dark:border-white bg-gray-100 dark:bg-slate-800"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
              }
            `}
          >
            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
              <Upload className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-900 dark:text-white text-sm font-medium">Drop images here</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </div>

          {pendingFiles.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {pendingFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <div className="h-9 w-9 rounded overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-slate-700">
                    <img src={URL.createObjectURL(file)} alt={file.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-white text-xs font-medium truncate">{file.name}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500 flex-shrink-0" onClick={() => removePending(idx)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button
              onClick={handleUpload}
              disabled={!pendingFiles.length}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200"
            >
              <ImageIcon className="h-4 w-4 mr-1.5" />
              Upload {pendingFiles.length > 0 ? `(${pendingFiles.length})` : ""}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="sm:max-w-2xl p-2">
          {previewImage && (
            <img src={previewImage.url} alt={previewImage.id} className="w-full max-h-[75vh] object-contain rounded-lg" />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Image Modal  */}
      <Dialog open={!!imageEdit} onOpenChange={() => setImageEdit(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Image</DialogTitle>
          </DialogHeader>
          <input
            className="w-full border rounded px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-700"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setEditName("")}>Cancel</Button>
            <Button onClick={async () => {
              editImage({ name: editName, key: imageEdit!.id })
            }}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
