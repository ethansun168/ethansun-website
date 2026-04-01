import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { client } from "@/constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/hooks/auth";
import { Forbidden } from "./forbidden";

export function Messages() {
  const { user, isLoading } = useRequireAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  const [forbidden, setForbidden] = useState(false)

  const queryClient = useQueryClient();
  const queryKey = "messages";

  const { data: messages, isFetching: messagesLoading, isError: messagesError, refetch: refetchMessages } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const resp = await client.api.v1.messages.$get()
      if (resp.status == 403) {
        setForbidden(true)
        return
      }
      if (!resp.ok) throw new Error("Error occurred");

      return await resp.json();
    },
    refetchOnWindowFocus: false
  })

  type Message = NonNullable<typeof messages>[number];

  const { mutateAsync: createMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      let response;
      try {
        response = await client.api.v1.messages.$post({
          json: { message }
        })
      }
      catch {
        throw new Error("Cannot connect to server")
      }
      if (!response.ok) {
        throw new Error("Unknown error");
      }
      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKey]
      });
    },
    onError: () => {
      // TODO: error creating message
    }
  })

  const { mutateAsync: editMessage } = useMutation({
    mutationFn: async ({ id, message }: { id: string, message: string }) => {
      const response = await client.api.v1.messages[":id"].$patch(
        {
          json: { message },
          param: { id }
        }
      )
      if (!response.ok) throw new Error("Failed to edit message")
    },
    onMutate: async ({ id, message }: { id: string, message: string }) => {
      await queryClient.cancelQueries({ queryKey: [queryKey] })
      const previous = queryClient.getQueryData([queryKey])
      queryClient.setQueryData([queryKey], (old: Message[]) =>
        old.map((msg) => msg.id === id ? { ...msg, content: message } : msg)
      )
      return { previous }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [queryKey], refetchType: 'none' }),
    onError: (_err, _vars, context) => {
      queryClient.setQueryData([queryKey], context?.previous)
    }
  })

  const { mutateAsync: deleteMessage } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await client.api.v1.messages[":id"].$delete({
        param: { id }
      })
      if (!response.ok) {
        throw new Error("Failed to delete message")
      }
    },
    onMutate: async ({ id }: { id: string }) => {
      await queryClient.cancelQueries({ queryKey: [queryKey] })
      const previous = queryClient.getQueryData([queryKey])
      queryClient.setQueryData([queryKey], (old: Message[]) =>
        old.filter((msg) => msg.id !== id)
      )
      return { previous }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [queryKey], refetchType: 'none' }),
    onError: (_err, _vars, context) => {
      queryClient.setQueryData([queryKey], context?.previous)
    }
  })

  const [editingId, setEditingId] = useState<string | null>(null);

  const openEdit = (msg: Message) => {
    setEditingId(msg.id);
    setModalText(msg.content);
    setModalOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setModalText("");
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (editingId) {
      editMessage({ id: editingId, message: modalText });
    } else {
      sendMessage();
    }
    setModalOpen(false);
    setModalText("");
    setEditingId(null);
  };

  const sendMessage = async () => {
    if (!modalText.trim()) return;
    await createMessage({ message: modalText })
    setModalText("");
    setModalOpen(false);
  };

  if (!user || isLoading) return "Logging in...";
  if (forbidden) {
    return <Forbidden />
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-slate-950 relative">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 max-w-4xl mx-auto w-full pr-24">
        {
          messagesError ? (
            <div className="flex flex-col items-center justify-center mt-20 gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-gray-900 dark:text-white text-sm font-medium">Failed to load messages</p>
              <Button size="sm" onClick={() => refetchMessages()} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200 shadow-xl">
                Try again
              </Button>
            </div>
          ) : messagesLoading ? (
            <div className="flex flex-col items-center justify-center mt-20 gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white animate-spin" />
              <p className="text-gray-400 dark:text-gray-600 text-sm">Loading messages...</p>
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-600 mt-20 text-sm">
              No messages yet. Say something!
            </div>
          ) :
            messages.map((msg) => (
              <div key={msg.id} className="w-full">
                <Card className="w-full shadow-sm">
                  <CardContent className="px-4 py-3 pt-0">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                        {msg.username}
                      </p>
                      <div className="flex items-center gap-1">
                        <p className="text-gray-400 dark:text-gray-500 text-xs mr-2">
                          {new Date(msg.createdAt).toLocaleString([], { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {
                          msg.username === user.username ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                                onClick={() => openEdit(msg)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-400 hover:text-red-500 cursor-pointer"
                                onClick={() => deleteMessage({ id: msg.id })}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : null
                        }
                      </div>
                    </div>
                    <p className="text-gray-900 dark:text-white text-sm">{msg.content}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
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

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Message" : "New Message"}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={modalText}
            onChange={(e) => setModalText(e.target.value)}
            placeholder="Write your message..."
            className="min-h-32 resize-none"
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>{editingId ? "Save" : "Send"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
