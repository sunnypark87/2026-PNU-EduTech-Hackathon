import Badge from "@/components/Badge";
import ButtonLink from "@/components/ButtonLink";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import SiteHeader from "@/components/SiteHeader";
import SplitPane from "@/components/SplitPane";
import { getCourseById, getJobsByCourseId } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";

type CourseDetailPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { courseId } = await params;
  const course = getCourseById(courseId);
  if (!course) {
    notFound();
  }

  const relatedJobs = getJobsByCourseId(course.id);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />

      <div className="bg-[#0e4ecf] px-6 py-14 text-center text-white">
        <h2 className="mb-3 text-3xl font-bold leading-tight md:text-4xl">
          {course.title}
        </h2>
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 text-sm text-blue-100">
          <span className="font-semibold">{course.id}</span>
          <span>•</span>
          <span>{course.category || "분류 미정"}</span>
          <span>•</span>
          <span>{course.department || "전공 미정"}</span>
          <span>•</span>
          <span>{course.credit}학점</span>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 p-6">
        <SplitPane
          left={
            <Card>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    강의 상세 정보
                  </h3>
                  <p className="text-sm text-slate-500">
                    {course.classType || "수업 형태 미정"}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700">
                    강의 개요
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {course.summary}
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">
                    사용 도구
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {course.skills.length === 0 ? (
                      <span className="text-sm text-slate-400">
                        등록된 도구가 없습니다.
                      </span>
                    ) : (
                      course.skills.map((skill) => (
                        <Badge key={skill}>{skill}</Badge>
                      ))
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">
                    학습 목표
                  </h4>
                  {course.learningObjectives.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      등록된 학습 목표가 없습니다.
                    </p>
                  ) : (
                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                      {course.learningObjectives.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">
                    핵심 주제
                  </h4>
                  {course.keyTopics.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      등록된 핵심 주제가 없습니다.
                    </p>
                  ) : (
                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                      {course.keyTopics.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">
                    예상 산출물
                  </h4>
                  {course.typicalOutputs.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      등록된 산출물이 없습니다.
                    </p>
                  ) : (
                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                      {course.typicalOutputs.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Card>
          }
          right={
            relatedJobs.length === 0 ? (
              <EmptyState
                title="연결된 채용 공고가 없습니다"
                description="다른 강의를 선택하거나 곧 추가될 공고를 확인해 주세요."
              />
            ) : (
              <div className="space-y-4">
                {relatedJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="block">
                    <Card interactive>
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">
                            {job.title}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {job.company
                              ? `${job.company}`
                              : `공고 ID: ${job.id}`}
                          </p>
                        </div>
                        {job.requirements.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {job.requirements.slice(0, 4).map((item) => (
                              <Badge key={item}>{item}</Badge>
                            ))}
                          </div>
                        ) : null}
                        <p className="line-clamp-1 text-sm text-slate-500">
                          {job.summary}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )
          }
        rightHeader={
          <div className="flex w-full items-center justify-end gap-2">
            <ButtonLink
              href={`/courses/${course.id}`}
              variant="primary"
              className="bg-[#0e4ecf] hover:bg-[#0b3fa8]"
            >
              상세 보기
            </ButtonLink>
            <ButtonLink
              href={`/graph/course/${course.id}`}
              variant="ghost"
              className="text-[#0e4ecf] hover:bg-[#0e4ecf]/10"
            >
              그래프 보기
            </ButtonLink>
          </div>
        }
      />
      </main>

      <footer className="mt-12 border-t border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        © 2026 Degree-folio. Busan PNU EduTech Hackathon.
      </footer>
    </div>
  );
}
