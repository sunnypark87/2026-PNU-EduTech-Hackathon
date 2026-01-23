import Link from 'next/link';
import jobsData from '@/data/jobs.json';
import { notFound } from 'next/navigation';
import AnalyzeButton from '@/app/components/AnalyzeButton';

export default async function JobDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const job = jobsData.find(j => j.id === Number(params.id));

    if (!job) {
        notFound();
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="px-8 py-5 bg-[#003d7c] text-white shadow-md">
                <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold tracking-wide">Degree-folio</Link>
                    <Link href="/" className="text-sm text-blue-200 hover:text-white transition-colors">← Back to Jobs</Link>
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto w-full p-6 my-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-8 md:p-10">
                        <div className="mb-6">
                            <span className="inline-block bg-blue-100 text-[#003d7c] text-sm px-3 py-1 rounded-full font-bold mb-4">
                                {job.location}
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{job.title}</h1>
                            <p className="text-xl text-gray-600 font-medium">{job.company}</p>
                        </div>

                        <div className="h-px bg-gray-100 w-full my-8"></div>

                        <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                            <h3 className="font-bold text-gray-900 mb-4">직무 요약</h3>
                            <p className="mb-8 p-4 bg-gray-50 rounded-lg border-l-4 border-[#C5A059]">{job.summary}</p>

                            <h3 className="font-bold text-gray-900 mb-4">상세 내용</h3>
                            <div className="text-base">{job.content}</div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-[#f8fbff] rounded-xl border border-blue-100">
                                <div>
                                    <h4 className="text-lg font-bold text-[#003d7c] mb-1">이 직무에 관심이 있으신가요?</h4>
                                    <p className="text-gray-600 text-sm">AI가 직무 내용을 정밀 분석하여 핵심 역량을 도출합니다.</p>
                                </div>
                                <AnalyzeButton jobContent={job.content} jobId={job.id} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
