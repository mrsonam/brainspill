import type { Board, CreateBoardInput } from "./board-types";

const STORAGE_KEY = "brainspill.boards.v1";
const STORE_EVENT = "brainspill.boards.changed";

let boardSnapshot: Board[] | null = null;

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `board-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeTitle(title: string | undefined) {
  const trimmed = title?.trim();

  return trimmed && trimmed.length > 0 ? trimmed : "Untitled board";
}

function sortBoards(boards: Board[]) {
  return [...boards].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function readLocalBoards(): Board[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawBoards = window.localStorage.getItem(STORAGE_KEY);

    if (!rawBoards) {
      return [];
    }

    const parsedBoards = JSON.parse(rawBoards) as Board[];

    if (!Array.isArray(parsedBoards)) {
      return [];
    }

    return sortBoards(
      parsedBoards.filter((board) => {
        return (
          typeof board.id === "string" &&
          typeof board.title === "string" &&
          typeof board.createdAt === "number" &&
          typeof board.updatedAt === "number"
        );
      }),
    );
  } catch {
    return [];
  }
}

export function writeLocalBoards(boards: Board[]) {
  const nextBoards = sortBoards(boards);
  boardSnapshot = nextBoards;

  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBoards));
  window.dispatchEvent(new Event(STORE_EVENT));
}

export function subscribeLocalBoards(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStoreChange = () => {
    boardSnapshot = readLocalBoards();
    listener();
  };

  window.addEventListener(STORE_EVENT, handleStoreChange);
  window.addEventListener("storage", handleStoreChange);

  return () => {
    window.removeEventListener(STORE_EVENT, handleStoreChange);
    window.removeEventListener("storage", handleStoreChange);
  };
}

export function getLocalBoardsSnapshot() {
  boardSnapshot ??= readLocalBoards();

  return boardSnapshot;
}

export function getServerLocalBoardsSnapshot() {
  return [];
}

export function createLocalBoard(input: CreateBoardInput = {}) {
  const now = Date.now();
  const board: Board = {
    id: createId(),
    title: normalizeTitle(input.title),
    createdAt: now,
    updatedAt: now,
  };

  const boards = [board, ...readLocalBoards()];
  writeLocalBoards(boards);

  return board;
}

export function updateLocalBoardTitle(boardId: string, title: string) {
  const now = Date.now();
  const boards = readLocalBoards();
  const nextBoards = boards.map((board) => {
    if (board.id !== boardId) {
      return board;
    }

    return {
      ...board,
      title: normalizeTitle(title),
      updatedAt: now,
    };
  });

  writeLocalBoards(nextBoards);

  return nextBoards.find((board) => board.id === boardId) ?? null;
}

export function deleteLocalBoard(boardId: string) {
  const nextBoards = readLocalBoards().filter((board) => board.id !== boardId);
  writeLocalBoards(nextBoards);

  return nextBoards;
}

export function readLocalBoard(boardId: string) {
  return readLocalBoards().find((board) => board.id === boardId) ?? null;
}
