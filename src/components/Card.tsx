import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
};

export default function Card({
  children,
  className,
  interactive = false,
}: CardProps) {
  const cardClassName = [
    "rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm",
    interactive
      ? "cursor-pointer transition hover:border-indigo-300 hover:shadow-md"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={cardClassName}>{children}</div>;
}
