import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
};

export default function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: ButtonLinkProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition";
  const variantClassName =
    variant === "primary"
      ? "bg-[#0e4ecf] text-white border border-[#0e4ecf] shadow-sm hover:bg-blue-200 hover:text-[#0e4ecf]"
      : "text-[#0e4ecf] border border-[#0e4ecf] hover:bg-blue-200";
  const buttonClassName = [base, variantClassName, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} className={buttonClassName}>
      {children}
    </Link>
  );
}
