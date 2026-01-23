'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import { analyzeJob } from '@/app/actions/analyze'; // We will create this next

export default function AnalyzeButton({ jobContent, jobId }: { jobContent: string, jobId: number }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleAnalyze = async () => {
        setLoading(true);
        // For now, let's just redirect to results with job content as "job" param to reuse existing flow
        // In next step, we will implement actual analyzeJob action if specific keyword extraction is needed on this page.
        // The requirement says "return Core Competencies", so passing full content to /result is a good MVP step,
        // OR we trigger analysis here and show keywords.

        // Let's reuse /result page for consistency with Feature 1 requirements initially, 
        // but pass the job ID or refined content. For hackathon speed, passing content query is easiest integration.

        // Wait a bit to simulate processing
        await new Promise(resolve => setTimeout(resolve, 800));

        // const query = encodeURIComponent(jobContent);
        // router.push(`/result?job=${query}`);
        router.push(`/result?jobId=${jobId}`);
    };

    return (
        <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`
        px-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all
        ${loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#0e4ecf] hover:bg-[#0b3d91] active:scale-[0.98] animate-pulse-subtle'
                }
      `}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    분석 중...
                </span>
            ) : (
                "이 채용공고 분석하기"
            )}
        </button>
    );
}
