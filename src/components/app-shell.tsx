import Link from "next/link";

import { Button } from "@/components/ui/button";

type AppShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: {
    href: string;
    label: string;
  };
};

export function AppShell({
  eyebrow = "Brainspill",
  title,
  description,
  children,
  action,
}: AppShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-5 lg:px-8">
        <header className="flex items-center justify-between border-b border-border/70 pb-5">
          <Link
            href="/boards"
            className="text-sm font-medium tracking-tight text-foreground"
          >
            Brainspill
          </Link>
          {action ? (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : null}
        </header>

        <section className="flex flex-1 flex-col py-10">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>

          <div className="mt-10 flex-1">{children}</div>
        </section>
      </div>
    </main>
  );
}
