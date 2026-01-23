import Link from 'next/link';
import { notFound } from 'next/navigation';
import modulesData from '@/data/modules.json';
import coursesData from '@/data/courses.json';

export default async function ModuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const moduleInfo = modulesData.find(m => m.id === id);

    if (!moduleInfo) {
        notFound();
    }

    // Get all courses belonging to this module
    const moduleCourses = coursesData.filter(c => c.moduleId === id);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* Header */}
            <header className="px-8 py-5 bg-[#0e4ecf] text-white shadow-md">
                <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold tracking-wide">Degree-folio</Link>
                    <Link href="/result" className="text-sm text-blue-200 hover:text-white transition-colors">← Back to Results</Link>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full p-6 my-8">
                {/* Module Hero */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-[100px] -z-0"></div>
                    <div className="relative z-10">
                        <span className="inline-block bg-[#0e4ecf] text-white text-sm px-4 py-1.5 rounded-full font-bold mb-4 shadow-sm">
                            {moduleInfo.category} Module
                        </span>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{moduleInfo.title}</h1>
                        <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                            {moduleInfo.description}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Course List (Pentomino Style) */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span>🎓</span> 모듈 구성 강의 ({moduleCourses.length})
                        </h2>

                        <div className="space-y-4">
                            {moduleCourses.map((course) => (
                                <div key={course.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6">
                                    <div className="flex-shrink-0 flex flex-col items-center justify-center bg-gray-50 w-24 h-24 rounded-lg border border-gray-100">
                                        <span className="text-xs text-gray-400 font-bold uppercase">Code</span>
                                        <span className="text-xl font-bold text-gray-700">C-{course.id}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
                                            <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded font-bold">3 Credits</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">{course.professor} 교수</p>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
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
                            {moduleCourses.length === 0 && (
                                <div className="p-8 text-center bg-gray-100 rounded-xl text-gray-500">
                                    등록된 강의가 없습니다.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Summary / Stats */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-8">
                            <h3 className="font-bold text-lg text-gray-900 mb-4">이수 예상 효과</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span className="text-gray-600 text-sm">해당 직무 핵심 역량 80% 이상 습득 가능</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span className="text-gray-600 text-sm">실무 프로젝트 경험 제공 (Capstone)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-500 font-bold">✓</span>
                                    <span className="text-gray-600 text-sm">관련 기업(BNK, KRX 등) 인턴십 연계</span>
                                </li>
                            </ul>

                            <hr className="my-6 border-gray-100" />

                            <div className="text-center">
                                <button className="w-full bg-[#0e4ecf] text-white font-bold py-3 rounded-xl hover:bg-[#0b3d91] transition-colors shadow-lg active:scale-[0.98]">
                                    이 모듈 수강신청 담기
                                </button>
                                <p className="text-xs text-gray-400 mt-3">
                                    * Degree-folio 시스템에서 원클릭으로 가상 수강신청이 가능합니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
