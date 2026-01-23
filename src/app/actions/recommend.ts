'use server';

import coursesData from '@/data/courses.json';
import { Course } from '@/utils/recommendation';
import fs from 'fs';
import path from 'path';


import { extractCompetencies } from './analyzeJob';
import { recommendCourses, ModuleRecommendation } from './recommendCourses';

export async function getRecommendations(jobDescription: string, jobId?: number): Promise<{ keywords: string[], modules: ModuleRecommendation[] }> {
    // 1. Check Cache (Keywords Only) if jobId is provided
    let cachedKeywords: string[] | null = null;

    if (jobId) {
        try {
            const cachePath = path.join(process.cwd(), 'src/data/job_competencies.json');
            if (fs.existsSync(cachePath)) {
                const cacheRaw = await fs.promises.readFile(cachePath, 'utf-8');
                const cache = JSON.parse(cacheRaw);
                // We only care if keywords exist
                if (cache[jobId] && cache[jobId].keywords) {
                    console.log(`[Cache Hit] Using cached keywords for Job ID ${jobId}`);
                    cachedKeywords = cache[jobId].keywords;
                }
            }
        } catch (e) {
            console.error("Cache Read Error:", e);
        }
    }

    try {
        // Step 1: Extract Skills (Use Cache or AI)
        let keywords: string[] = [];

        if (cachedKeywords) {
            keywords = cachedKeywords;
        } else {
            console.log("Analyzing Job with AI...");
            keywords = await extractCompetencies(jobDescription);

            // Save to Cache if jobId exists
            if (jobId) {
                try {
                    const cachePath = path.join(process.cwd(), 'src/data/job_competencies.json');
                    let cache: any = {};
                    if (fs.existsSync(cachePath)) {
                        const cacheRaw = await fs.promises.readFile(cachePath, 'utf-8');
                        try { cache = JSON.parse(cacheRaw); } catch { }
                    }

                    // Only save keywords
                    cache[jobId] = { keywords };

                    await fs.promises.writeFile(cachePath, JSON.stringify(cache, null, 2), 'utf-8');
                    console.log(`[Cache Saved] Saved keywords for Job ID ${jobId}`);
                } catch (e) {
                    console.error("Cache Write Error:", e);
                }
            }
        }

        // Step 2: Recommend Modules
        const modules = await recommendCourses(keywords);

        return {
            keywords,
            modules
        };

    } catch (error) {
        console.error("Recommendation Error:", error);
        // Fallback
        return {
            keywords: ["데이터 분석", "프로젝트 관리", "커뮤니케이션", "문제 해결", "창의성"],
            modules: []
        };
    }
}
