import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createMinecraftStatusOptions } from "@/hooks/minecraft"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { FileItem } from "ethansun-website-backend"
import {
    AlertCircleIcon,
    Archive,
    ChevronDown,
    ChevronRight,
    Code,
    File,
    FileText,
    Folder,
    ImageIcon,
    Music,
    Save,
    Upload,
    Video,
    X
} from "lucide-react"
import { useState } from "react"
import { Alert, AlertTitle } from "./ui/alert"
import { Spinner } from "./ui/shadcn-io/spinner"
import { Textarea } from "./ui/textarea"
import { createMinecraftFilesOptions } from "@/hooks/minecraft"

function getFileIcon(fileName: string, type: "file" | "folder") {
  if (type === "folder") {
    return <Folder className="h-4 w-4 text-blue-500" />
  }

  const extension = fileName.split(".").pop()?.toLowerCase()

  switch (extension) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
      return <ImageIcon className="h-4 w-4 text-green-500" />
    case "txt":
    case "md":
    case "pdf":
    case "doc":
    case "docx":
    case "properties":
      return <FileText className="h-4 w-4 text-red-500" />
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "css":
    case "html":
    case "json":
      return <Code className="h-4 w-4 text-purple-500" />
    case "zip":
    case "rar":
    case "7z":
      return <Archive className="h-4 w-4 text-orange-500" />
    case "mp3":
    case "wav":
    case "flac":
      return <Music className="h-4 w-4 text-pink-500" />
    case "mp4":
    case "avi":
    case "mov":
      return <Video className="h-4 w-4 text-indigo-500" />
    default:
      return <File className="h-4 w-4 text-gray-500" />
  }
}

export function MinecraftFiles() {
  const [openFile, setOpenFile] = useState<FileItem | null | undefined>(null)
  const [fileContent, setFileContent] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false);
  const queryClient = useQueryClient();
  const {data: status, isLoading: statusLoading } = useQuery(createMinecraftStatusOptions());
  const fileExplorerDisabled = statusLoading || status === 'online';

  const {data: files = [], isLoading: filesLoading} = useQuery(createMinecraftFilesOptions());

  const toggleFolder = (id: string) => {
    const updateFiles = (items: FileItem[]): FileItem[] => {
      return items.map((item) => {
        if (item.fullPath === id && item.type === "folder") {
          return { ...item, expanded: !item.expanded }
        }
        if (item.children) {
          return { ...item, children: updateFiles(item.children) }
        }
        return item
      })
    }
    queryClient.setQueryData<FileItem[]>(['files'], (oldFiles = []) => {
      return updateFiles(oldFiles)
    })
  }


  const FileTreeItem = ({ item, level = 0 }: { item: FileItem; level?: number }) => (
    <div key={item.fullPath} className="px-2">
      <div
        className={`flex items-center gap-2 p-2 rounded-md
          ${fileExplorerDisabled ?
          'opacity-50 cursor-not-allowed pointer-events-none' :
          'hover:bg-accent cursor-pointer'}
        `}

        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => {
          if (item.type === "folder") {
            toggleFolder(item.fullPath)
          }
          else {
            openFileInEditor(item);
          }
        }}
      >
        {item.type === "folder" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={(e) => {
              e.stopPropagation()
              toggleFolder(item.fullPath)
            }}
          >
            {item.expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        )}
        {getFileIcon(item.name, item.type)}
        <span className="flex-1 text-sm">{item.name}</span>
      </div>
      {item.type === "folder" && item.expanded && item.children && (
        <div>
          {item.children.map((child: FileItem) => (
            <FileTreeItem key={child.fullPath} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )

  const isEditableFile = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    return ["txt", "md", "json", "js", "ts", "jsx", "tsx", "css", "html", "xml", "yaml", "yml", "csv", "properties"].includes(
      extension || "",
    )
  }

  const openFileInEditor = (file: FileItem) => {
    if (file.type === "file" && isEditableFile(file.name)) {
      if (hasUnsavedChanges) {
        setAlertOpen(true);
        return;
      }
      setOpenFile(file)
      setFileContent(file.content || "")
      setHasUnsavedChanges(false)
    }
    else {
      setOpenFile(undefined);
      setHasUnsavedChanges(false)
    }
  }

  const saveFile = () => {
    if (openFile) {
      const updateFileContent = (items: FileItem[]): FileItem[] => {
        return items.map((item) => {
          if (item.fullPath === openFile.fullPath) {
            return { ...item, content: fileContent }
          }
          if (item.children) {
            return { ...item, children: updateFileContent(item.children) }
          }
          return item
        })
      }
      queryClient.setQueryData<FileItem[]>(['files'], (oldFiles = []) => {
        return updateFileContent(oldFiles)
      })
      setHasUnsavedChanges(false)
    }
  }

  const closeEditor = () => {
    if (hasUnsavedChanges && !fileExplorerDisabled) {
      setAlertOpen(true);
      return;
    }
    setOpenFile(null)
    setFileContent("")
    setHasUnsavedChanges(false)
  }

  const handleContentChange = (value: string) => {
    setFileContent(value)
    setHasUnsavedChanges(value !== (openFile?.content || ""))
  }

  return (
    <Card className="flex flex-row h-[calc(100vh-200px)] p-0 shadow-lg gap-0 border">
      <div className="flex flex-col h-full">
        <div className=" p-4 flex items-center gap-2">
          <h2 className="text-lg font-semibold">File Explorer</h2>
          {
            filesLoading ? <Spinner/> : null
          }
        </div>
        <ScrollArea className="flex-1 min-h-0">
          {files.map((item) => (
            <div key={item.fullPath}>
              <FileTreeItem item={item} />
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col border-l min-h-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b gap-4">
          {
            fileExplorerDisabled ? 
              <Alert variant="destructive" className="inline-flex w-auto">
                <AlertCircleIcon />
                <AlertTitle>File explorer disabled because server is online.</AlertTitle>
              </Alert> : null
          }
          {
            openFile ? 
              <div className="flex items-center gap-2">
                {getFileIcon(openFile.name, openFile.type)}
                <Breadcrumb>
                  <BreadcrumbList>
                    {openFile
                      .fullPath
                      .split('/')
                      .filter(Boolean)
                      .map((part: string, index: number, arr: string[]) => {
                        const href = "/" + arr.slice(0, index + 1).join("/")
                        const isLast = index === arr.length - 1;
                        return (
                          <BreadcrumbItem key={href}>
                            {!isLast ? (
                                <>
                                {part}
                                  <BreadcrumbSeparator />
                                </>
                              ) : (
                                <span>{part}</span>
                            )}
                          </BreadcrumbItem>
                        )
                      })
                    }
                  </BreadcrumbList>
                </Breadcrumb>

                {hasUnsavedChanges && (
                  <Badge variant="destructive" className="text-xs">
                    Unsaved
                  </Badge>
                )}
              </div>: null
          } 
          <div className="flex items-center gap-2 ml-auto">
            {
              openFile ? 
                <>
                  <Button variant="ghost" size="sm" onClick={closeEditor}>
                    <X className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveFile}
                    disabled={!hasUnsavedChanges || fileExplorerDisabled}>
                    <Save className="mr-2 h-4 w-4"
                  />
                    Save
                  </Button>
                </> : null
            }
            <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                  <AlertDialogDescription>
                    You have unsaved changes. Are you sure you want to leave without saving?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setAlertOpen(false)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={saveFile}>Save Changes</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" size="sm" disabled={fileExplorerDisabled}>
              <Upload className="mr-2 h-4 w-4" />
              Upload World
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {openFile ? (
            <div className="flex-1 flex flex-col p-4 min-h-0">
              <Textarea
                disabled={fileExplorerDisabled}
                value={fileContent}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start typing..."
                className="w-full h-full resize-none font-mono text-sm overflow-auto"
              />
            </div>
          ) : 
            openFile === null ?
            (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No file selected</p>
                  <p className="text-sm">Click on a text file to open it in the editor</p>
                </div>
              </div>
            ) :  //undefined
            (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2 text-red-600 dark:text-red-400">File cannot be edited</p>
                  <p className="text-sm">Click on a text file to open it in the editor</p>
                </div>
              </div>
            ) 
          }
        </div>
      </div>
    </Card>
  )
}

