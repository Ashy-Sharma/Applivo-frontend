import { useNavigate, useParams } from "react-router-dom";
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import type { SessionStatusResponse } from "@/types.ts";
import { useDemoSocket } from "@/hooks/useDemoSocket.ts";
import { endSession, getSessionStatus } from "@/api/sessions.ts";
import { SESSION_POLL_INTERVAL_MS } from "@/config.ts";
import { extractErrorMessage } from "@/api/client.ts";
import {
  ANDROID_KEYCODES,
  getContainedImageRect,
  mapToEmulatorCoords,
  TAP_MOVEMENT_THRESHOLD_PX,
} from "@/utils/coordinateMapper.ts";
import {
  ArrowLeft,
  Keyboard,
  RotateCcw,
  Send,
  Smartphone,
  Square,
  XCircle,
} from "lucide-react";
import ErrorBanner from "@/components/ErrorBanner.tsx";

interface PointerTracker {
  x: number;
  y: number;
  time: number;
}

export default function Emulator() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<SessionStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [keyboardText, setKeyboardText] = useState("");
  const [ending, setEnding] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const pointerDownRef = useRef<PointerTracker | null>(null);

  const isActive = session?.status === "ACTIVE";
  const {
    screenshot,
    sendInteraction,
    status: socketStatus,
  } = useDemoSocket(isActive && sessionId ? sessionId : null);

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const status = await getSessionStatus(sessionId);
        if (cancelled) {
          return;
        }
        setSession(status);
        if (status.status === "CREATING") {
          timer = setTimeout(poll, SESSION_POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (!cancelled) {
          setError(extractErrorMessage(err, "Could not reach the session."));
        }
      }
    };

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sessionId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId) {
        endSession(sessionId).catch(() => undefined);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [sessionId]);

  const handleEndDemo = async () => {
    if (!sessionId) {
      return;
    }
    setEnding(true);
    try {
      await endSession(sessionId);
    } catch {
    } finally {
      navigate("/");
    }
  };

  const getDisplayRect = () => {
    const el = imgRef.current;
    if (!el) {
      return null;
    }
    return getContainedImageRect(el);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointerDownRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    console.log("pointer up fired", e.clientX, e.clientY);

    const start = pointerDownRef.current;
    pointerDownRef.current = null;
    if (!start || !session?.screenWidth || !session?.screenHeight) {
      return;
    }

    const rect = getDisplayRect();
    if (!rect) {
      return;
    }

    const startCoords = mapToEmulatorCoords(
      start.x,
      start.y,
      rect,
      session.screenWidth,
      session.screenHeight,
    );

    const endCoords = mapToEmulatorCoords(
      e.clientX,
      e.clientY,
      rect,
      session.screenWidth,
      session.screenHeight,
    );

    const dx = endCoords.x - startCoords.x;
    const dy = endCoords.y - startCoords.y;
    const movedFar = Math.hypot(dx, dy) > TAP_MOVEMENT_THRESHOLD_PX;
    const duration = Math.max(50, Date.now() - start.time);

    if (movedFar) {
      sendInteraction({
        type: "SWIPE",
        x: startCoords.x,
        y: startCoords.y,
        x2: endCoords.x,
        y2: endCoords.y,
        duration,
      });
    } else {
      sendInteraction({ type: "TAP", x: startCoords.x, y: startCoords.y });
    }
  };

  const handleSendText = () => {
    if (!keyboardText.trim()) {
      return;
    }
    sendInteraction({ type: "TEXT", text: keyboardText });
    setKeyboardText("");
  };

  const handleKey = (keyCode: number) => {
    sendInteraction({ type: "KEY", keyCode });
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-full max-w-[420px] flex items-center justify-between">
        <button
          onClick={handleEndDemo}
          className="flex items-center gap-1 font-label text-sm text-on-surface-variant hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <span className="font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Session #{sessionId}
        </span>
        <button
          onClick={handleEndDemo}
          disabled={ending}
          className="flex items-center gap-1 font-label text-sm text-error hover:opacity-80 disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
          {ending ? "Ending…" : "End demo"}
        </button>
      </div>

      {error && (
        <div className="w-full max-w-[420px]">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="relative w-full max-w-[326px] aspect-[9/19] bg-black rounded-[28px] border-[6px] border-surface-container-highest shadow-xl overflow-hidden select-none">
        {!isActive ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center px-6 bg-surface-container-lowest">
            <Smartphone className="w-8 h-8 text-tertiary animate-pulse" />
            <p className="font-headline text-sm font-bold text-on-surface">
              {session?.status === "FAILED"
                ? "Session failed"
                : session?.status === "ENDED" || session?.status === "TIMED_OUT"
                  ? "Session ended"
                  : "Starting emulator…"}
            </p>
            <p className="font-sans text-xs text-on-surface-variant">
              {session?.message ??
                "This can take a minute or two the first time."}
            </p>
          </div>
        ) : (
          <div
            className="w-full h-full relative cursor-pointer touch-none"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            {screenshot ? (
              <img
                ref={imgRef}
                src={screenshot}
                alt="Live emulator screen"
                className="w-full h-full object-contain bg-black pointer-events-none"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-xs font-sans">
                {socketStatus === "connecting"
                  ? "Connecting to stream…"
                  : "Waiting for first frame…"}
              </div>
            )}
          </div>
        )}
      </div>

      {isActive && (
        <>
          <div className="flex items-center gap-6 mt-1">
            <button
              onClick={() => handleKey(ANDROID_KEYCODES.BACK)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container border border-outline-variant/50"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 text-on-surface-variant" />
            </button>
            <button
              onClick={() => handleKey(ANDROID_KEYCODES.HOME)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container border border-outline-variant/50"
              title="Home"
            >
              <Square className="w-3.5 h-3.5 text-on-surface-variant" />
            </button>
            <button
              onClick={() => handleKey(ANDROID_KEYCODES.APP_SWITCH)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container border border-outline-variant/50"
              title="Recent apps"
            >
              <RotateCcw className="w-4 h-4 text-on-surface-variant" />
            </button>
          </div>

          <div className="w-full max-w-[326px] bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-2 flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-secondary ml-1.5 shrink-0" />
            <input
              type="text"
              value={keyboardText}
              onChange={(e) => setKeyboardText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendText();
              }}
              placeholder="Type text to send to the app…"
              className="flex-grow bg-transparent border-none focus:outline-none font-sans text-sm text-on-surface px-1 py-1"
            />
            <button
              onClick={handleSendText}
              className="bg-primary/10 text-primary hover:bg-primary/20 p-2 rounded-lg shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
