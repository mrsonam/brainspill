"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import {
  ArrowLeft,
  Grid3X3,
  ImageIcon,
  MousePointer2,
  StickyNote,
} from "lucide-react";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CanvasViewport } from "@/features/canvas/components/CanvasViewport";
import { CloudBoardSceneSync } from "@/features/canvas/sync/cloud-board-scene-sync";
import {
  createLocalImage,
  createLocalStickyNote,
} from "@/features/canvas/state/local-scene-store";
import {
  getLocalBoardsSnapshot,
  getServerLocalBoardsSnapshot,
  subscribeLocalBoards,
} from "@/features/boards/local-board-store";
import { isLocalPrototypeBoardId } from "@/lib/board-id";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

type BoardWorkspaceShellProps = {
  boardId: string;
};

const tools = [
  {
    label: "Select",
    description: "Clear selection and pan the board",
    icon: MousePointer2,
  },
  { label: "Note", description: "Add a sticky note", icon: StickyNote },
  {
    label: "Image",
    description: "Add an image from your device",
    icon: ImageIcon,
  },
  { label: "Grid", description: "Toggle the canvas grid", icon: Grid3X3 },
];

function titleFromBoardId(boardId: string) {
  const title = boardId
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");

  return title || "Untitled board";
}

function imageFileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Could not read image file."));
    });
    reader.addEventListener("error", () => {
      reject(reader.error ?? new Error("Could not read image file."));
    });
    reader.readAsDataURL(file);
  });
}

function readImageDimensions(src: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    });
    image.addEventListener("error", () => {
      reject(new Error("Could not load image dimensions."));
    });
    image.src = src;
  });
}

export function BoardWorkspaceShell({ boardId }: BoardWorkspaceShellProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [gridVisible, setGridVisible] = useState(true);
  const { isLoaded, isSignedIn } = useAuth();
  const fallbackTitle = useMemo(() => titleFromBoardId(boardId), [boardId]);
  const boards = useSyncExternalStore(
    subscribeLocalBoards,
    getLocalBoardsSnapshot,
    getServerLocalBoardsSnapshot,
  );
  const fetchCloudBoard =
    isLoaded &&
    isSignedIn &&
    !isLocalPrototypeBoardId(boardId);
  const cloudBoard = useQuery(
    api.boards.get,
    fetchCloudBoard ? { boardId: boardId as Id<"boards"> } : "skip",
  );
  const markOpened = useMutation(api.boards.markOpened);

  const cloudBoardId =
    cloudBoard !== undefined && cloudBoard !== null ? cloudBoard._id : undefined;

  useEffect(() => {
    if (!fetchCloudBoard || cloudBoardId === undefined) {
      return;
    }

    void markOpened({ boardId: cloudBoardId });
  }, [cloudBoardId, fetchCloudBoard, markOpened]);

  const title = useMemo(() => {
    const localTitle = boards.find((board) => board.id === boardId)?.title;

    if (fetchCloudBoard) {
      if (cloudBoard === undefined) {
        return localTitle ?? fallbackTitle;
      }

      if (cloudBoard === null) {
        return localTitle ?? "Board unavailable";
      }

      return cloudBoard.title;
    }

    return localTitle ?? fallbackTitle;
  }, [
    boards,
    boardId,
    cloudBoard,
    fallbackTitle,
    fetchCloudBoard,
  ]);

  const addImageFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        return;
      }

      const src = await imageFileToDataUrl(file);
      const dimensions = await readImageDimensions(src);
      const maxWidth = 360;
      const scale = Math.min(1, maxWidth / dimensions.width);

      createLocalImage(boardId, {
        x: 360,
        y: 96,
        src,
        fileName: file.name,
        mimeType: file.type,
        naturalWidth: dimensions.width,
        naturalHeight: dimensions.height,
        width: Math.round(dimensions.width * scale),
        height: Math.round(dimensions.height * scale),
      });
    },
    [boardId],
  );

  function handleImageInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      void addImageFile(file);
    }

    event.target.value = "";
  }

  function handleToolClick(label: string) {
    if (label === "Note") {
      createLocalStickyNote(boardId, {
        x: 80,
        y: 80,
        text: "Brainspill starts here.",
      });
      return;
    }

    if (label === "Image") {
      imageInputRef.current?.click();
      return;
    }

    if (label === "Grid") {
      setGridVisible((visible) => !visible);
    }
  }

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const target = event.target;
      const isTextInput =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA");

      if (isTextInput) {
        return;
      }

      const imageItem = Array.from(event.clipboardData?.items ?? []).find(
        (item) => item.type.startsWith("image/"),
      );
      const file = imageItem?.getAsFile();

      if (!file) {
        return;
      }

      event.preventDefault();
      void addImageFile(file);
    }

    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [addImageFile]);

  return (
    <main className="flex h-screen overflow-hidden flex-col bg-[#f7f5ef] text-foreground">
      <header className="z-40 flex h-14 shrink-0 items-center justify-between border-b border-black/10 bg-background/90 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="Back to boards">
            <Link href="/boards">
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <p className="text-sm font-medium leading-none">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {fetchCloudBoard && cloudBoard === undefined
                ? "Loading board…"
                : "Pan, zoom, notes, and images · scenes stay on this device for now"}
            </p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {isSignedIn ? "Signed in" : "Local-only boards"}
        </div>
      </header>

      <section className="isolate relative flex min-h-0 flex-1 overflow-hidden">
        <aside
          aria-label="Canvas tools"
          role="toolbar"
          aria-orientation="vertical"
          className="absolute left-4 top-4 z-30 flex flex-col gap-2 rounded-2xl border border-black/10 bg-background/90 p-2 shadow-sm backdrop-blur"
        >
          {tools.map((tool) => {
            const Icon = tool.icon;
            const pressed =
              tool.label === "Select" ||
              (tool.label === "Grid" && gridVisible);

            return (
              <Tooltip key={tool.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant={pressed ? "default" : "ghost"}
                    size="icon"
                    aria-label={tool.description}
                    aria-pressed={
                      tool.label === "Grid" ? gridVisible : undefined
                    }
                    onClick={() => handleToolClick(tool.label)}
                  >
                    <Icon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span>{tool.label}</span>
                  <span className="text-background/70">{tool.description}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </aside>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageInputChange}
        />

        <CloudBoardSceneSync boardId={boardId} enabled={fetchCloudBoard} />

        <CanvasViewport boardId={boardId} gridVisible={gridVisible} />
      </section>
    </main>
  );
}
