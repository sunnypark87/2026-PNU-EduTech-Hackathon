import Link from 'next/link';
import jobsData from '@/data/jobs.json';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="px-8 py-5 bg-[#003d7c] text-white shadow-md sticky top-0 z-10">
        <h1 className="text-2xl font-bold tracking-wide">Degree-folio</h1>
      </header>

      {/* Hero Section */}
      <div className="bg-[#003d7c] text-white py-16 px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          Explore Busan's Top Career Opportunities
        </h2>
        <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
          부산/경남 지역의 유망 기업 채용공고를 확인하고,<br className="hidden md:block" />
          AI 분석을 통해 직무에 딱 맞는 대학 강의를 추천받으세요.
        </p>
      </div>

      {/* Job Board Grid */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobsData.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="group">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-block bg-blue-50 text-[#003d7c] text-xs px-2 py-1 rounded font-bold">
                      {job.location}
                    </span>
                    <span className="text-gray-400 text-xs">New</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#003d7c] transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 font-medium mb-3">{job.company}</p>
                  <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                    {job.summary}
                  </p>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-sm text-[#003d7c] font-bold">
                  채용 공고 보기
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transform group-hover:translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="p-6 bg-white border-t border-gray-200 text-center text-gray-500 text-sm mt-12">
        © 2026 Degree-folio. Busan PNU EduTech Hackathon.
      </footer>
    </div>
  );
}
