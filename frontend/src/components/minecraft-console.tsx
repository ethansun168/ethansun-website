import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { minecraftClient } from "@/constants";
import { createMinecraftStatusOptions } from "@/hooks/minecraft";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';
import { useWebSocket } from '../hooks/websocket';
import { Spinner } from "./ui/shadcn-io/spinner";

export function MinecraftConsole() {
  const { messages, sendMessage, setMessages } = useWebSocket();
  const [input, setInput] = useState('');
  const [buttonError, setButtonError] = useState("");
  const { scrollRef, contentRef } = useStickToBottom();

  const queryClient = useQueryClient();
  const {data: status, isLoading: statusLoading } = useQuery(createMinecraftStatusOptions());

  const {mutateAsync: handleStart} = useMutation({
    mutationFn: async () => {
      const resp = await minecraftClient.api.v1.minecraft.start.$post(); 
      if (!resp.ok) {
        const body = await resp.json();
        throw new Error(body.message);
      } 
      return await resp.json();
    },
    onSuccess: () => {
      setButtonError("");
      queryClient.invalidateQueries({
        queryKey: createMinecraftStatusOptions().queryKey
      });
      setMessages([])
    },
  })

  const {mutateAsync: handleStop} = useMutation({
    mutationFn: async () => {
      const resp = await minecraftClient.api.v1.minecraft.stop.$post(); 
      if (!resp.ok) {
        const body = await resp.json();
        throw new Error(body.message);
      } 
      return await resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: createMinecraftStatusOptions().queryKey
      });
      setButtonError("");
    },
  })

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  // Keep the connection alive
  useEffect(() => {
    const interval = setInterval(() => {
      sendMessage('frontend-ping');
    }, 5000)
    return () => clearInterval(interval)
  }, [sendMessage])

  return (
    <Card className="flex flex-col h-[calc(100vh-200px)] w-full mx-auto shadow-lg border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-mono">
          Minecraft Server Output 
          {
            statusLoading ? <span className="inline-block ml-2"><Spinner className="w-4 h-4" /></span> :
              status === 'online' ? " (Online)" : " (Offline)"
          }
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-1 min-h-0">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 font-mono text-sm">
          <div ref={contentRef}>
            {messages.map((msg, i) => {
              const messageJSON = JSON.parse(msg);
              return (
                <div
                  key={i}
                  className={`mb-1 p-1 rounded ${
                    messageJSON.type === "stderr"
                    ? " text-red-700 dark:text-red-300"
                    : " text-gray-900 dark:text-gray-100"
                    }`}
                >
                  {messageJSON.message}
                </div>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            className="flex-1 font-mono"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send command"
          />
          <Button type="submit" variant="default">
            Send
          </Button>
        </form>
        <div className="flex gap-2 mt-3 justify-center">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={async () => {
              try {
                await handleStart();
              }
              catch (error) {
                if (error instanceof TypeError) {
                  setButtonError("Error: Cannot connect to server");
                  return;
                }
                setButtonError(String(error));
              }
            }}
          >
            Start
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={async () => {
              try {
                await handleStop();
              }
              catch (error){
                if (error instanceof TypeError) {
                  setButtonError("Error: Cannot connect to server");
                  return;
                }
                setButtonError(String(error));
              }
            }}
          >
            Stop
          </Button>
        </div>
        {buttonError ? 
          (
            <div className="text-red-700 dark:text-red-300 mt-2 font-mono flex justify-center">
              {buttonError}
            </div>
          ) : null
        }

      </CardContent>
    </Card>
  );
}
