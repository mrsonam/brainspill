import { BoardWorkspaceShell } from "@/features/boards/BoardWorkspaceShell";

type BoardWorkspacePageProps = {
  params: Promise<{
    boardId: string;
  }>;
};

export default async function BoardWorkspacePage({
  params,
}: BoardWorkspacePageProps) {
  const { boardId } = await params;

  return <BoardWorkspaceShell boardId={boardId} />;
}
