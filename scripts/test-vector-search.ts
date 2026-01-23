
import dotenv from 'dotenv';
dotenv.config({ path: '.env' }); // Load env before imports

import { recommendCourses } from '../src/app/actions/recommendCourses';
import { getEmbedding, cosineSimilarity } from '../src/utils/vector';

async function main() {
    console.log("=== Testing Vector Search Implementation ===");

    // 1. Test Vector Utilities
    console.log("\n1. Testing Vector Utils");
    const vecA = [1, 0, 0];
    const vecB = [1, 0, 0];
    const vecC = [0, 1, 0];
    console.log("Sim(A, B) should be 1:", cosineSimilarity(vecA, vecB));
    console.log("Sim(A, C) should be 0:", cosineSimilarity(vecA, vecC));

    const mockEmbed = await getEmbedding("test");
    console.log("Mock/Real Embedding Length:", mockEmbed.length);

    // 2. Test Recommendation Flow
    console.log("\n2. Testing recommendCourses (Hybrid Search)");
    const competencies = ["Python", "Data Analysis", "AI"];
    console.log("Input Competencies:", competencies);

    try {
        const results = await recommendCourses(competencies);
        console.log("\nRecommended Courses:");
        results.forEach(c => {
            console.log(`- [${c.id}] ${c.title}`);
        });
    } catch (e) {
        console.error("Error in recommendation:", e);
    }
}

main();
