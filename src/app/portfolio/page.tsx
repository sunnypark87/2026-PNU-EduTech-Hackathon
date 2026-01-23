import Link from 'next/link';

export default function PortfolioPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#f0f4f8]">
            {/* Header */}
            <header className="px-8 py-5 bg-[#0e4ecf] text-white">
                <Link href="/" className="text-2xl font-bold tracking-wide">Degree-folio</Link>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-3xl bg-white p-8 md:p-12 rounded shadow-2xl relative border-[10px] border-double border-[#C5A059] mx-auto">
                    {/* Certificate Inner Border */}
                    <div className="border border-gray-300 p-8 h-full flex flex-col items-center text-center">

                        <div className="w-20 h-20 bg-[#0e4ecf] rounded-full flex items-center justify-center text-white font-serif text-3xl font-bold mb-8 shadow-md">
                            D
                        </div>

                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0e4ecf] mb-2">OFFICIAL</h1>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-black mb-8 tracking-widest">DEGREE-FOLIO</h2>

                        <div className="w-24 h-1 bg-[#C5A059] mb-8"></div>

                        <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed max-w-xl">
                            위 학생은 <span className="font-bold text-black">핀테크 및 금융 데이터 분석</span> 과정을
                            성실히 수행하여 해당 분야의 핵심 역량을 입증하였으므로 이 증서를 수여합니다.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg text-left mt-4 mb-10 bg-gray-50 p-6 rounded-lg border border-gray-100">
                            <div>
                                <h4 className="font-bold text-gray-500 text-sm mb-1">취득 역량</h4>
                                <p className="text-[#0e4ecf] font-bold">핀테크, 블록체인, 금융 데이터</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-500 text-sm mb-1">추천 기업</h4>
                                <p className="text-[#0e4ecf] font-bold">BNK 부산은행, KRX 한국거래소</p>
                            </div>
                            <div className="md:col-span-2">
                                <h4 className="font-bold text-gray-500 text-sm mb-1">이수 강의</h4>
                                <p className="text-gray-800">1. 핀테크와 부산 금융 생태계 (김finance)</p>
                                <p className="text-gray-800">2. 스마트 해양 물류 데이터 분석 (박logis)</p>
                                <p className="text-gray-800">3. 센텀시티 스타트업 창업 실무 (이start)</p>
                            </div>
                        </div>

                        <div className="w-full flex justify-between items-end mt-4 px-4 sm:px-12">
                            <div className="text-left">
                                <p className="text-sm text-gray-400">Date</p>
                                <p className="font-serif text-lg">2026. 01. 23</p>
                            </div>
                            <div className="text-right">
                                <div className="relative inline-block">
                                    <span className="font-serif text-xl font-bold relative z-10">Degree-folio Director</span>
                                    <div className="absolute -top-4 -right-6 w-24 h-24 opacity-20 rotate-[-15deg]">
                                        <svg viewBox="0 0 100 100" className="fill-[#0e4ecf]">
                                            <circle cx="50" cy="50" r="40" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="mt-8 text-center text-gray-500 text-sm">
                    * This is an official digital certificate verified by Degree-folio.
                </div>
            </main>
        </div>
    );
}
