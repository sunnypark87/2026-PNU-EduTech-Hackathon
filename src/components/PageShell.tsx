import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export default function PageShell({ children, className }: PageShellProps) {
  const shellClassName = [
    "min-h-screen bg-slate-50 text-slate-900",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClassName}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        {children}
      </div>
    </div>
  );
}
