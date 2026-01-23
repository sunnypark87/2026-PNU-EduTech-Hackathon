"use client";

import SiteHeader from "@/components/SiteHeader";
import { getCourses } from "@/lib/data";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function Home() {
  const courses = getCourses();
  const [selectedMajor, setSelectedMajor] = useState("전체");

  const majors = useMemo(() => {
    const items = new Set<string>();
    for (const course of courses) {
      if (course.department) {
        items.add(course.department);
      }
    }
    return ["전체", ...Array.from(items)];
  }, [courses]);

  const filteredCourses =
    selectedMajor === "전체"
      ? courses
      : courses.filter((course) => course.department === selectedMajor);

  return (
    <div className="min-h-screen bg-[#0e4ecf]">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <section className="mx-auto w-full max-w-5xl rounded-3xl text-right bg-white px-8 py-10 shadow-lg">
          <h1 className="text-2xl text-slate-900">
            단순한 시간표 짜기를 넘어
            <br />
            나의 커리어 로드맵을 설계하는 <strong>AI 수강신청 어시스턴트</strong>
          </h1>
        </section>

        <section className="mx-auto w-full max-w-5xl rounded-3xl bg-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-8 py-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">강의 목록</h2>
              <p className="text-xs text-slate-500">
                전체 강의 {filteredCourses.length}개
              </p>
            </div>
            <select
              value={selectedMajor}
              onChange={(event) => setSelectedMajor(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#0e4ecf] shadow-sm focus:border-[#0e4ecf] focus:outline-none focus:ring-2 focus:ring-[#0e4ecf]/30"
            >
              {majors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>
          {filteredCourses.length === 0 ? (
            <div className="px-8 py-12 text-center text-sm text-slate-500">
              아직 등록된 강의가 없습니다.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 px-8 py-4">
              {filteredCourses.map((course) => (
                <li key={course.id}>
                  <Link
                    href={`/courses/${course.id}`}
                    className="group flex flex-col gap-3 py-5 transition hover:bg-slate-50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-slate-900 transition group-hover:text-[#0e4ecf]">
                          {course.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-[#0e4ecf]">
                            {course.id}
                          </span>
                          <span>•</span>
                          <span>{course.department}</span>
                          <span>•</span>
                          <span>{course.credit}학점</span>
                          <span>•</span>
                          <span>
                            연관 공고 {course.relatedJobIds.length}개
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-[#0e4ecf]/10 px-3 py-1 text-xs font-semibold text-[#0e4ecf]">
                        보기
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm text-slate-500">
                      {course.summary}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {course.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#0e4ecf]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
