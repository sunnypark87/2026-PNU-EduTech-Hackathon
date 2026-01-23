import Link from 'next/link';
import { getRecommendations } from '@/app/actions/recommend';
import { Suspense } from 'react';

import jobsData from '@/data/jobs.json';

// ResultContent component acting as the main content that depends on searchParams
async function ResultContent({ searchParams }: { searchParams: Promise<{ job?: string; jobId?: string }> }) {
    const resolvedParams = await searchParams;

    let jobDescription = "";

    if (resolvedParams?.jobId) {
        const jobId = Number(resolvedParams.jobId);
        const job = jobsData.find(j => j.id === jobId);
        if (job) {
            jobDescription = job.content;
        }
    }

    // Fallback/Legacy support
    if (!jobDescription && resolvedParams?.job) {
        jobDescription = resolvedParams.job;
    }

    // Call Server Action
    const { keywords, modules } = await getRecommendations(jobDescription, resolvedParams?.jobId ? Number(resolvedParams.jobId) : undefined);

    return (
        <div>
            {/* Analysis Keywords Section */}
            <div className="mb-10 p-6 bg-white rounded-xl shadow-sm border border-blue-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🔍</span>
                    AI 채용공고 분석 결과: <span className="text-[#0e4ecf]">핵심 역량 (Core Competencies)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium border border-blue-100 shadow-sm">
                            {keyword}
                        </span>
                    ))}
                </div>
            </div>

            {/* Modules Grid */}
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>📚</span> 추천 교육 모듈 (Pentomino Modules)
            </h3>
            <div className="grid grid-cols-1 gap-8 mb-12">
                {modules.map((module, index) => (
                    <div key={module.id} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow relative">
                        {/* Top Decoration */}
                        <div className="h-3 w-full bg-gradient-to-r from-[#0e4ecf] to-cyan-500"></div>

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="inline-block bg-[#eff6ff] text-[#0e4ecf] text-sm px-3 py-1 rounded-full font-bold mb-2 border border-blue-100">
                                        {module.category}
                                    </span>
                                    <h2 className="text-2xl font-bold text-gray-900">{module.title}</h2>
                                </div>
                                <div className="bg-gray-100 text-gray-600 font-bold px-4 py-2 rounded-lg text-sm">
                                    {module.matchedCourses.length} 과목 포함
                                </div>
                            </div>

                            <p className="text-gray-600 mb-8 leading-relaxed">
                                {module.description}
                            </p>

                            {/* Included Courses Preview */}
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">포함된 주요 강의</h4>
                                <ul className="space-y-3">
                                    {module.matchedCourses.slice(0, 3).map(course => (
                                        <li key={course.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                {course.id}
                                            </span>
                                            <div>
                                                <div className="font-bold text-gray-800 text-sm">{course.title}</div>
                                                <div className="text-xs text-gray-500">{course.professor} 교수</div>
                                            </div>
                                        </li>
                                    ))}
                                    {module.matchedCourses.length > 3 && (
                                        <li className="text-center text-sm text-gray-400 pt-2">
                                            외 {module.matchedCourses.length - 3}개 강의 더보기...
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div className="mt-8 text-right">
                                <Link
                                    href={`/modules/${module.id}`}
                                    className="inline-flex items-center gap-2 text-[#0e4ecf] font-bold hover:underline"
                                >
                                    모듈 상세 커리큘럼 보기 →
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {modules.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        추천 모듈을 찾을 수 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}

// Fallback skeleton for loading
function ResultsSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-8 mb-12">
            {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden h-[400px] animate-pulse">
                    <div className="p-1 bg-gray-200 h-3" />
                    <div className="p-8">
                        <div className="mb-6 flex justify-between">
                            <div className="h-8 w-1/3 bg-gray-200 rounded" />
                            <div className="h-8 w-20 bg-gray-200 rounded" />
                        </div>
                        <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded" />
                        <div className="h-4 bg-gray-200 w-1/2 mb-8 rounded" />

                        <div className="h-40 bg-gray-200 rounded-xl" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default async function ResultPage(props: { searchParams: Promise<{ job?: string; jobId?: string }> }) {
    const params = await props.searchParams;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Header */}
            <header className="px-8 py-5 bg-[#0e4ecf] text-white flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold tracking-wide">Degree-folio</Link>
                <div className="text-sm opacity-80">Beta v1.0</div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-6">
                <div className="my-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Degree-folio 분석 리포트</h1>
                    <p className="text-lg text-gray-600">
                        지원자님의 채용공고 분석 결과, 귀하에게 딱 맞는 <span className="font-bold text-[#0e4ecf]">맞춤형 모듈(Pentomino Module)</span>을 제안합니다.
                    </p>
                </div>

                <Suspense fallback={<ResultsSkeleton />}>
                    <ResultContent searchParams={props.searchParams} />
                </Suspense>

                <div className="text-center pb-12">
                    <Link href="/portfolio" className="inline-block bg-[#0e4ecf] hover:bg-[#0b3d91] text-white text-lg font-bold px-10 py-4 rounded-xl transition-all shadow-lg active:scale-[0.99] animate-bounce-custom">
                        나만의 디그리폴리오 발급받기
                    </Link>
                </div>
            </main>
        </div>
    );
}
