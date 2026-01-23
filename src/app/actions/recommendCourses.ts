'use server';

import OpenAI from 'openai';
import coursesData from '@/data/courses.json';
import modulesData from '@/data/modules.json';
import { Course } from '@/utils/recommendation';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}) : null;

import fs from 'fs';
import path from 'path';
import { getEmbedding, cosineSimilarity } from '@/utils/vector';

// In-memory cache for course embeddings (optimization for server runtime)
let cachedCourseEmbeddings: { [id: number]: number[] } | null = null;

async function getCourseEmbeddings(): Promise<{ [id: number]: number[] }> {
    if (cachedCourseEmbeddings) return cachedCourseEmbeddings;

    const cachePath = path.join(process.cwd(), 'src/data/course_embeddings.json');

    // 1. Try file cache
    if (fs.existsSync(cachePath)) {
        try {
            const raw = await fs.promises.readFile(cachePath, 'utf-8');
            cachedCourseEmbeddings = JSON.parse(raw);
            return cachedCourseEmbeddings!;
        } catch (e) {
            console.error("Error reading course embeddings cache:", e);
        }
    }

    // 2. Generate embeddings
    console.log("Generating Course Embeddings...");
    const embeddings: { [id: number]: number[] } = {};

    // Process in batches if using real API to avoid rate limits, but for mock/small data, serial is fine
    for (const course of coursesData) {
        // Embed a rich text representation of the course
        const textToEmbed = `${course.title} ${course.keywords.join(' ')} ${course.description}`;
        embeddings[course.id] = await getEmbedding(textToEmbed);
    }

    // 3. Save to file cache
    try {
        await fs.promises.writeFile(cachePath, JSON.stringify(embeddings), 'utf-8');
    } catch (e) {
        console.error("Error saving course embeddings cache:", e);
    }

    cachedCourseEmbeddings = embeddings;
    return embeddings;
}

export interface ModuleRecommendation {
    id: string;
    title: string;
    description: string;
    category: string;
    matchedCourses: Course[];
}

export async function recommendCourses(competencies: string[]): Promise<ModuleRecommendation[]> {
    try {
        console.log("Starting Vector Search (Module Aggregation)...");

        // 1. Get Query Embedding
        const queryText = competencies.join(' ');
        const queryVector = await getEmbedding(queryText);

        // 2. Get Course Embeddings
        const courseEmbeddings = await getCourseEmbeddings();

        // 3. Compute Cosine Similarity
        const scoredCourses = coursesData.map(course => {
            const vec = courseEmbeddings[course.id];
            if (!vec) return { ...course, score: 0 };
            const score = cosineSimilarity(queryVector, vec);
            return { ...course, score };
        });

        // 4. Sort and Take Top K (e.g., top 10 relevant courses)
        scoredCourses.sort((a, b) => b.score - a.score);
        const topCandidates = scoredCourses.slice(0, 10);

        // 5. Aggregate by Module
        const moduleMap = new Map<string, { module: any; courses: Course[] }>();

        for (const candidate of topCandidates) {
            // Check if course has a moduleId
            // @ts-ignore
            const moduleId = candidate.moduleId;
            if (!moduleId) continue;

            if (!moduleMap.has(moduleId)) {
                const moduleInfo = modulesData.find(m => m.id === moduleId);
                if (moduleInfo) {
                    moduleMap.set(moduleId, {
                        module: moduleInfo,
                        courses: []
                    });
                }
            }

            const entry = moduleMap.get(moduleId);
            if (entry) {
                entry.courses.push({
                    id: candidate.id,
                    moduleId: moduleId,
                    title: candidate.title,
                    professor: candidate.professor,
                    keywords: candidate.keywords,
                    description: candidate.description,
                    target_audience: candidate.target_audience
                });
            }
        }

        // 6. Format Result
        const results: ModuleRecommendation[] = Array.from(moduleMap.values()).map(entry => ({
            id: entry.module.id,
            title: entry.module.title,
            description: entry.module.description,
            category: entry.module.category,
            matchedCourses: entry.courses
        }));

        // Sort modules by matched course count
        results.sort((a, b) => b.matchedCourses.length - a.matchedCourses.length);

        const topModules = results.slice(0, 3); // Return top 3 modules

        console.log("Top Modules:", topModules.map(m => `${m.title} (${m.matchedCourses.length} courses)`));

        return topModules;

    } catch (error) {
        console.error("Module Recommendation Error:", error);
        return [];
    }
}
