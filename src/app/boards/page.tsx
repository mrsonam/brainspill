import { AppShell } from "@/components/app-shell";
import { BoardDashboard } from "@/features/boards/BoardDashboard";

export default function BoardsPage() {
  return (
    <AppShell
      title="Your visual workspaces"
      description="Create quiet, flexible boards for thoughts, references, and project planning."
    >
      <BoardDashboard />
    </AppShell>
  );
}
