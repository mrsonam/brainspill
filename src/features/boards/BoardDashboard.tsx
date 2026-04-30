"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Board } from "@/features/boards/board-types";
import {
  createLocalBoard,
  deleteLocalBoard,
  getLocalBoardsSnapshot,
  getServerLocalBoardsSnapshot,
  subscribeLocalBoards,
  updateLocalBoardTitle,
} from "@/features/boards/local-board-store";

function formatUpdatedAt(updatedAt: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(updatedAt));
}

export function BoardDashboard() {
  const router = useRouter();
  const boards = useSyncExternalStore(
    subscribeLocalBoards,
    getLocalBoardsSnapshot,
    getServerLocalBoardsSnapshot,
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Board | null>(null);
  const [title, setTitle] = useState("");

  function handleCreateBoard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const board = createLocalBoard({ title });
    setTitle("");
    setCreateDialogOpen(false);
    router.push(`/boards/${board.id}`);
  }

  function handleRenameBoard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!renameTarget) {
      return;
    }

    updateLocalBoardTitle(renameTarget.id, title);
    setRenameTarget(null);
    setTitle("");
  }

  function handleDeleteBoard(boardId: string) {
    deleteLocalBoard(boardId);
  }

  function openRenameDialog(board: Board) {
    setRenameTarget(board);
    setTitle(board.title);
  }

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="recent-boards-heading">
          <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-3">
            <div>
              <h2
                id="recent-boards-heading"
                className="text-sm font-medium text-foreground"
              >
                Recent boards
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Stored locally for now, with the same boundary Convex will
                replace later.
              </p>
            </div>
            <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
              <Plus />
              New board
            </Button>
          </div>

          {boards.length === 0 ? (
            <div className="py-12">
              <p className="text-base font-medium tracking-tight">
                No boards yet.
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Create your first workspace for notes, references, and visual
                planning.
              </p>
              <Button className="mt-5" onClick={() => setCreateDialogOpen(true)}>
                <Plus />
                Create board
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className="group grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <Link
                    href={`/boards/${board.id}`}
                    className="min-w-0 rounded-lg outline-none transition-colors focus-visible:bg-muted/60"
                  >
                    <div className="flex items-center gap-3">
                      <h3 className="truncate text-base font-medium tracking-tight">
                        {board.title}
                      </h3>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {formatUpdatedAt(board.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      Local prototype board. Canvas content persistence starts
                      after the scene model phase.
                    </p>
                  </Link>
                  <div className="flex items-center gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/boards/${board.id}`}>
                        Open
                        <ArrowRight />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Rename ${board.title}`}
                      onClick={() => openRenameDialog(board)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${board.title}`}
                      onClick={() => handleDeleteBoard(board.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="border-l border-border/70 pl-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Local first
          </p>
          <div className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
            <p>
              These records live in browser storage while we validate the app
              shell and route boundaries.
            </p>
            <p>
              The store is isolated so Convex can become the board source of
              truth without changing the dashboard UI contract.
            </p>
          </div>
        </aside>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreateBoard}>
            <DialogHeader>
              <DialogTitle>Create board</DialogTitle>
              <DialogDescription>
                Name the workspace. You can rename it later.
              </DialogDescription>
            </DialogHeader>
            <Input
              className="mt-5"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Moodboard, launch plan, research wall..."
              autoFocus
            />
            <DialogFooter className="mt-6">
              <Button type="submit">Create and open</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRenameTarget(null);
            setTitle("");
          }
        }}
      >
        <DialogContent>
          <form onSubmit={handleRenameBoard}>
            <DialogHeader>
              <DialogTitle>Rename board</DialogTitle>
              <DialogDescription>
                Update the board name shown in the dashboard and workspace.
              </DialogDescription>
            </DialogHeader>
            <Input
              className="mt-5"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Board name"
              autoFocus
            />
            <DialogFooter className="mt-6">
              <Button type="submit">Save name</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
