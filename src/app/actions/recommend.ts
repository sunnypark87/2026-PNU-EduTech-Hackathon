'use server';

import coursesData from '@/data/courses.json';
import { Course } from '@/utils/recommendation';
import fs from 'fs';
import path from 'path';


import { extractCompetencies } from './analyzeJob';
import { recommendCourses } from './recommendCourses';

export async function getRecommendations(jobDescription: string, jobId?: number): Promise<{ keywords: string[], courses: Course[] }> {
    // 1. Check Cache if jobId is provided
    if (jobId) {
        try {
            const cachePath = path.join(process.cwd(), 'src/data/cached_analysis.json');
            if (fs.existsSync(cachePath)) {
                const cacheRaw = await fs.promises.readFile(cachePath, 'utf-8');
                const cache = JSON.parse(cacheRaw);
                if (cache[jobId]) {
                    console.log(`[Cache Hit] Returning cached analysis for Job ID ${jobId}`);
                    // Ensure courses are not just IDs if cache had short form
                    const cachedResult = cache[jobId];
                    if (cachedResult.courses.length > 0 && typeof cachedResult.courses[0] === 'number') {
                        const restoredCourses = cachedResult.courses.map((id: number) =>
                            coursesData.find(c => c.id === id) || coursesData[0]
                        );
                        return { ...cachedResult, courses: restoredCourses as Course[] };
                    }
                    return cachedResult;
                }
            }
        } catch (e) {
            console.error("Cache Read Error:", e);
        }
    }

    try {
        console.log("Starting Two-Step AI Analysis...");

        // Step 1: Extract Competencies
        const keywords = await extractCompetencies(jobDescription);

        // Step 2: Recommend Courses
        const courses = await recommendCourses(keywords);

        const finalResult = {
            keywords,
            courses
        };

        // 2. Write to Cache if jobId is provided
        if (jobId) {
            try {
                const cachePath = path.join(process.cwd(), 'src/data/cached_analysis.json');
                let cache: any = {};
                if (fs.existsSync(cachePath)) {
                    const cacheRaw = await fs.promises.readFile(cachePath, 'utf-8');
                    try { cache = JSON.parse(cacheRaw); } catch { }
                }

                cache[jobId] = finalResult;

                await fs.promises.writeFile(cachePath, JSON.stringify(cache, null, 2), 'utf-8');
                console.log(`[Cache Saved] Saved analysis for Job ID ${jobId}`);
            } catch (e) {
                console.error("Cache Write Error:", e);
            }
        }

        return finalResult;

    } catch (error) {
        console.error("AI Recommendation Error:", error);
        // Fallback
        return {
            keywords: ["데이터 분석", "프로젝트 관리", "커뮤니케이션", "문제 해결", "창의성"],
            courses: coursesData.slice(0, 3)
        };
    }
}
