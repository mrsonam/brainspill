"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState, useSyncExternalStore } from "react";

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
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

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
  const { isLoaded, isSignedIn } = useAuth();
  const localBoards = useSyncExternalStore(
    subscribeLocalBoards,
    getLocalBoardsSnapshot,
    getServerLocalBoardsSnapshot,
  );
  const cloudBoards = useQuery(
    api.boards.list,
    isLoaded && isSignedIn ? {} : "skip",
  );
  const createBoardMutation = useMutation(api.boards.create);
  const renameBoardMutation = useMutation(api.boards.rename);
  const archiveBoardMutation = useMutation(api.boards.archive);

  const boards = useMemo((): Board[] | undefined => {
    if (!isLoaded) {
      return undefined;
    }

    if (isSignedIn) {
      if (cloudBoards === undefined) {
        return undefined;
      }

      return cloudBoards.map((board) => ({
        id: board._id,
        title: board.title,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
      }));
    }

    return localBoards;
  }, [cloudBoards, isLoaded, isSignedIn, localBoards]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Board | null>(null);
  const [title, setTitle] = useState("");
  const [pendingAction, setPendingAction] = useState(false);

  async function handleCreateBoard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction(true);

    try {
      if (isSignedIn) {
        const board = await createBoardMutation({ title });
        setTitle("");
        setCreateDialogOpen(false);
        router.push(`/boards/${board._id}`);
        return;
      }

      const board = createLocalBoard({ title });
      setTitle("");
      setCreateDialogOpen(false);
      router.push(`/boards/${board.id}`);
    } finally {
      setPendingAction(false);
    }
  }

  async function handleRenameBoard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!renameTarget) {
      return;
    }

    setPendingAction(true);

    try {
      if (isSignedIn) {
        await renameBoardMutation({
          boardId: renameTarget.id as Id<"boards">,
          title,
        });
      } else {
        updateLocalBoardTitle(renameTarget.id, title);
      }

      setRenameTarget(null);
      setTitle("");
    } finally {
      setPendingAction(false);
    }
  }

  async function handleArchiveBoard(boardId: string) {
    setPendingAction(true);

    try {
      if (isSignedIn) {
        await archiveBoardMutation({ boardId: boardId as Id<"boards"> });
        return;
      }

      deleteLocalBoard(boardId);
    } finally {
      setPendingAction(false);
    }
  }

  function openRenameDialog(board: Board) {
    setRenameTarget(board);
    setTitle(board.title);
  }

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="recent-boards-heading">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-3">
            <div>
              <h2
                id="recent-boards-heading"
                className="text-sm font-medium text-foreground"
              >
                Recent boards
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isSignedIn
                  ? "Synced to your account. Open a board to pick up where you left off."
                  : "Stored on this device until you sign in to sync across browsers."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!isLoaded ? null : isSignedIn ? null : (
                <SignInButton mode="modal">
                  <Button variant="secondary" type="button">
                    Sign in to sync
                  </Button>
                </SignInButton>
              )}
              <Button
                variant="outline"
                disabled={!isLoaded || boards === undefined || pendingAction}
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus />
                New board
              </Button>
            </div>
          </div>

          {!isLoaded || boards === undefined ? (
            <div className="py-12 text-sm text-muted-foreground">
              Loading boards…
            </div>
          ) : boards.length === 0 ? (
            <div className="py-12">
              <p className="text-base font-medium tracking-tight">
                No boards yet.
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Create your first workspace for notes, references, and visual
                planning.
              </p>
              <Button
                className="mt-5"
                disabled={pendingAction}
                onClick={() => setCreateDialogOpen(true)}
              >
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
                      {isSignedIn
                        ? "Canvas contents stay in this browser for now; cloud-backed scenes arrive with realtime collaboration."
                        : "Canvas contents stay on this device until you sign in for cloud-backed boards."}
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
                      disabled={pendingAction}
                      onClick={() => openRenameDialog(board)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Archive ${board.title}`}
                      disabled={pendingAction}
                      onClick={() => void handleArchiveBoard(board.id)}
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
            {isSignedIn ? "Cloud boards" : "Local boards"}
          </p>
          <div className="mt-4 space-y-4 text-sm leading-6 text-muted-foreground">
            <p>
              {isSignedIn
                ? "Board titles and membership live in Convex. Canvas scenes stay local until the collaboration milestone lands."
                : "Nothing leaves this browser until you sign in. Use local boards for quick sketches or offline demos."}
            </p>
            {!isSignedIn ? (
              <p>
                Sign in when you are ready to keep boards with your account and
                open them on other devices.
              </p>
            ) : (
              <p>
                Removing a board archives it for your account; invite flows for
                shared boards arrive in a later milestone.
              </p>
            )}
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
              <Button type="submit" disabled={pendingAction}>
                Create and open
              </Button>
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
              <Button type="submit" disabled={pendingAction}>
                Save name
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
