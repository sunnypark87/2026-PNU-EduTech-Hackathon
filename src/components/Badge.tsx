import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export default function Badge({ children, className }: BadgeProps) {
  const badgeClassName = [
    "inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-500",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={badgeClassName}>{children}</span>;
}
