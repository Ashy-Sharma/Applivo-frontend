import { useCallback, useEffect, useRef, useState } from "react";
import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { WS_BASE_URL } from "@/config.ts";
import { getAccessToken } from "@/utils/tokenStorage.ts";
import type { InteractionMessage, ScreenshotMessage } from "@/types.ts";

export type SocketStatus =
  "idle" | "connecting" | "error" | "closed" | "connected";

export function useDemoSocket(sessionId: number | string | null) {
  const [status, setStatus] = useState<SocketStatus>("idle");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    setStatus("connecting");

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${WS_BASE_URL}/ws`) as unknown as WebSocket,
      connectHeaders: {
        Authorization: `Bearer ${getAccessToken() ?? ""}`,
      },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setStatus("connected");

        client.subscribe(`/topic/demo/${sessionId}`, (message: IMessage) => {
          try {
            const payload = JSON.parse(message.body) as ScreenshotMessage;
            if (payload.type === "SCREENSHOT" && payload.data) {
              setScreenshot(`data:image/png;base64,${payload.data}`);
            }
          } catch {}
        });

        client.publish({ destination: `/app/demo/${sessionId}/start-stream` });
      },
      onStompError: () => setStatus("error"),
      onWebSocketClose: () => setStatus("closed"),
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [sessionId]);

  const sendInteraction = useCallback(
    (message: InteractionMessage) => {
      if (!sessionId || clientRef.current?.connected !== true) {
        return;
      }
      clientRef.current.publish({
        destination: `/app/demo/${sessionId}/interact`,
        body: JSON.stringify(message),
      });
    },
    [sessionId],
  );

  return { status, screenshot, sendInteraction };
}
