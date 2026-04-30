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
              Local board shell · canvas runtime next
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

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative flex flex-1 items-center justify-center">
          <div className="max-w-sm rounded-3xl border border-black/10 bg-background/90 p-6 text-center shadow-sm backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Canvas placeholder
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              Paste an image, write a note, or turn on grid.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Board records now persist locally. Phase 4 starts the actual pan,
              zoom, grid, and object runtime.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
