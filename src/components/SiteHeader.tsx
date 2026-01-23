import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="w-full bg-[#0e4ecf] py-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 text-white">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          Degree-folio
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-white/80 md:flex">
          <span className="text-white">홈</span>
          <span>강의 탐색</span>
          <span>경로 설계</span>
          <span>프로필</span>
        </nav>
      </div>
    </header>
  );
}
