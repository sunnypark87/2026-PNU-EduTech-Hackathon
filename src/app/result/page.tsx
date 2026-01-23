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
    const { keywords, courses } = await getRecommendations(jobDescription, resolvedParams?.jobId ? Number(resolvedParams.jobId) : undefined);

    return (
        <div>
            {/* Analysis Keywords Section */}
            <div className="mb-10 p-6 bg-white rounded-xl shadow-sm border border-blue-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🔍</span>
                    AI 채용공고 분석 결과: <span className="text-[#003d7c]">핵심 역량 (Core Competencies)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium border border-blue-100 shadow-sm">
                            {keyword}
                        </span>
                    ))}
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {courses.map((course, index) => (
                    <div key={course.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="p-1 bg-gradient-to-r from-blue-600 to-indigo-600 h-2" />
                        <div className="p-6">
                            <div className="flex gap-2 mb-3">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                                    Match {98 - index * 2}%
                                </span>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                                    채용 연계
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                            <p className="text-sm text-gray-500 mb-4">{course.professor} 교수</p>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                {course.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {course.keywords.map(kw => (
                                    <span key={kw} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">#{kw}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Fallback skeleton for loading
function ResultsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden h-[300px] animate-pulse">
                    <div className="p-1 bg-gray-200 h-2" />
                    <div className="p-6">
                        <div className="mb-3 flex gap-2">
                            <div className="h-5 w-16 bg-gray-200 rounded-full" />
                            <div className="h-5 w-16 bg-gray-200 rounded-full" />
                        </div>
                        <div className="h-6 bg-gray-200 w-3/4 mb-2 rounded" />
                        <div className="h-6 bg-gray-200 w-1/2 mb-4 rounded" />
                        <div className="h-20 bg-gray-200 rounded mb-4" />
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
            <header className="px-8 py-5 bg-[#003d7c] text-white flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold tracking-wide">Degree-folio</Link>
                <div className="text-sm opacity-80">Beta v1.0</div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-6">
                <div className="my-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Degree-folio 분석 리포트</h1>
                    <p className="text-lg text-gray-600">
                        지원자님의 채용공고 분석 결과, 아래 <span className="font-bold text-[#003d7c]">부산 지역 강의</span>가 가장 적합합니다.
                    </p>
                </div>

                <Suspense fallback={<ResultsSkeleton />}>
                    <ResultContent searchParams={props.searchParams} />
                </Suspense>

                <div className="text-center">
                    <Link href="/portfolio" className="inline-block bg-[#003d7c] hover:bg-[#002b57] text-white text-lg font-bold px-10 py-4 rounded-xl transition-all shadow-lg active:scale-[0.99] animate-bounce-custom">
                        나만의 디그리폴리오 발급받기
                    </Link>
                </div>
            </main>
        </div>
    );
}
