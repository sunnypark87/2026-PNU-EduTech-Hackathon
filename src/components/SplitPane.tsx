import type { ReactNode } from "react";

type SplitPaneProps = {
  left: ReactNode;
  right: ReactNode;
  rightHeader?: ReactNode;
};

export default function SplitPane({ left, right, rightHeader }: SplitPaneProps) {
  return (
    <div className="flex flex-col gap-4">
      {rightHeader ? (
        <div className="flex justify-end">{rightHeader}</div>
      ) : null}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-6">{left}</div>
        <div className="flex flex-col gap-6">{right}</div>
      </div>
    </div>
  );
}
