import Badge from "@/components/Badge";
import ButtonLink from "@/components/ButtonLink";
import Card from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import SiteHeader from "@/components/SiteHeader";
import SplitPane from "@/components/SplitPane";
import { getCoursesByJobId, getJobById } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";

type JobDetailPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { jobId } = await params;
  const job = getJobById(jobId);
  if (!job) {
    notFound();
  }

  const relatedCourses = getCoursesByJobId(job.id);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />

      <div className="bg-[#0e4ecf] px-6 py-14 text-center text-white">
        <h2 className="mb-3 text-3xl font-bold leading-tight md:text-4xl">
          {job.title}
        </h2>
        <p className="mx-auto max-w-3xl text-base text-blue-100">
          {job.company
            ? `${job.company} • ${job.location || "근무지 미정"}`
            : `공고 ID: ${job.id}`}
        </p>
        <p className="mx-auto mt-3 max-w-3xl text-sm text-blue-100">
          {job.summary}
        </p>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 p-6">
        <SplitPane
          left={
            <Card>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    채용 공고 상세 정보
                  </h3>
                  <p className="text-sm text-slate-500">
                    {job.company || "회사 정보 미정"} 
                  </p>
                  <p className="text-xs text-slate-400">
                    {job.employmentType || "고용 형태 미정"} •{" "}
                    {job.location || "근무지 미정"}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  {job.summary}
                </p>
                {job.mainTasks.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700">
                      주요 업무
                    </h4>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                      {job.mainTasks.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">
                    필수 요건
                  </h4>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {job.requirements.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">
                    우대 사항
                  </h4>
                  {job.preferred.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      별도 우대 사항이 없습니다.
                    </p>
                  ) : (
                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                      {job.preferred.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Card>
          }
          right={
            relatedCourses.length === 0 ? (
              <EmptyState
                title="연결된 강의가 없습니다"
                description="다른 공고를 선택하거나 곧 추가될 강의를 확인해 주세요."
              />
            ) : (
              <div className="space-y-4">
                {relatedCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="block"
                  >
                    <Card interactive>
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">
                            {course.title}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {course.department} • {course.credit}학점
                          </p>
                        </div>
                        {course.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {course.skills.slice(0, 4).map((skill) => (
                              <Badge key={skill}>{skill}</Badge>
                            ))}
                          </div>
                        ) : null}
                        <p className="line-clamp-1 text-sm text-slate-500">
                          {course.summary}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )
          }
          rightHeader={
            <div className="flex items-center gap-2">
              <ButtonLink
                href={`/jobs/${job.id}`}
                variant="primary"
              >
                상세보기
              </ButtonLink>
              <ButtonLink
                href={`/graph/job/${job.id}`}
                variant="ghost"
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
