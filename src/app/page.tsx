'use client';

import Link from 'next/link';
import jobsData from '@/data/jobs.json';
import { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('전체');

  const tabs = ['전체', '개발·IT', '디자인', '마케팅', '기획·경영'];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="px-8 py-5 bg-[#0e4ecf] text-white shadow-md sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">Degree-folio</h1>
      </header>

      {/* Hero Section */}
      <div className="bg-[#0e4ecf] text-white py-12 px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          Explore Busan's Top Career Opportunities
        </h2>
        <p className="text-blue-100 mb-6 text-lg max-w-2xl mx-auto">
          부산/경남 지역의 유망 기업 채용공고를 확인하고, 직무에 딱 맞는 대학 강의를 추천받으세요.
        </p>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto flex gap-3 mt-8">
          <input
            type="text"
            placeholder="직무, 기업명 검색"
            className="flex-1 px-6 py-4 rounded-lg text-slate-50 focus:outline-none shadow-lg"
          />
          <button className="bg-white text-[#0e4ecf] px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg">
            검색
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 mt-6">
        {/* Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-4 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full font-medium transition-all ${activeTab === tab
                ? 'bg-[#0e4ecf] text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Job List View (Wide Cards, Original Content) */}
        <div className="flex flex-col gap-4">
          {jobsData.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#0e4ecf] transition-all p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">

                {/* Left: Main Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-50 text-[#0e4ecf] text-xs px-2 py-1 rounded font-bold">
                      {job.location}
                    </span>
                    <span className="text-gray-400 text-xs">New</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#0e4ecf] transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 font-medium mb-2">{job.company}</p>
                  <p className="text-gray-500 text-sm line-clamp-2">
                    {job.summary}
                  </p>
                </div>

                {/* Right: Action / Arrow */}
                <div className="hidden md:flex items-center text-[#0e4ecf] font-bold text-sm whitespace-nowrap">
                  상세보기
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>

              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="p-8 bg-white border-t border-gray-200 text-center text-gray-400 text-sm mt-12">
        © 2026 Degree-folio. Busan PNU EduTech Hackathon.
      </footer>
    </div>
  );
}

