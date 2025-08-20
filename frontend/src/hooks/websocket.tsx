import { minecraftClient } from '@/constants';
import { useEffect, useState, useRef } from 'react';
import { useUsername } from './query';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const { data, isLoading } = useUsername();

  useEffect(() => {
    if (isLoading || !data) return;
    const ws = minecraftClient.api.v1.minecraft.logs.$ws();
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error', err);
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [isLoading, data]);

  const sendMessage = (msg: string) => {
    wsRef.current?.send(msg);
  };

  return { messages, sendMessage, setMessages, connected };
}
