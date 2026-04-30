"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Grid3X3,
  ImageIcon,
  MousePointer2,
  StickyNote,
} from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { CanvasViewport } from "@/features/canvas/components/CanvasViewport";
import {
  getLocalBoardsSnapshot,
  getServerLocalBoardsSnapshot,
  subscribeLocalBoards,
} from "@/features/boards/local-board-store";

type BoardWorkspaceShellProps = {
  boardId: string;
};

const tools = [
  { label: "Select", icon: MousePointer2 },
  { label: "Note", icon: StickyNote },
  { label: "Image", icon: ImageIcon },
  { label: "Grid", icon: Grid3X3 },
];

function titleFromBoardId(boardId: string) {
  const title = boardId
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");

  return title || "Untitled board";
}

export function BoardWorkspaceShell({ boardId }: BoardWorkspaceShellProps) {
  const fallbackTitle = useMemo(() => titleFromBoardId(boardId), [boardId]);
  const boards = useSyncExternalStore(
    subscribeLocalBoards,
    getLocalBoardsSnapshot,
    getServerLocalBoardsSnapshot,
  );
  const title =
    boards.find((board) => board.id === boardId)?.title ?? fallbackTitle;

  return (
    <main className="flex min-h-screen flex-col bg-[#f7f5ef] text-foreground">
      <header className="z-10 flex h-14 items-center justify-between border-b border-black/10 bg-background/90 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="Back to boards">
            <Link href="/boards">
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <p className="text-sm font-medium leading-none">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pan and zoom runtime · object rendering next
            </p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">Single-user prototype</div>
      </header>

      <section className="relative flex flex-1 overflow-hidden">
        <aside
          aria-label="Canvas tools"
          className="absolute left-4 top-4 z-10 flex flex-col gap-2 rounded-2xl border border-black/10 bg-background/90 p-2 shadow-sm backdrop-blur"
        >
          {tools.map((tool) => {
            const Icon = tool.icon;

            return (
              <Button
                key={tool.label}
                variant={tool.label === "Select" ? "default" : "ghost"}
                size="icon"
                aria-label={tool.label}
              >
                <Icon />
              </Button>
            );
          })}
        </aside>

        <CanvasViewport boardId={boardId} />
      </section>
    </main>
  );
}
