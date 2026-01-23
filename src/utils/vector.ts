
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}) : null;

/**
 * Calculates the Cosine Similarity between two vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Generates an embedding for the given text.
 * Uses OpenAI if a valid key is present; otherwise, falls back to a deterministic mock vector.
 */
export async function getEmbedding(text: string): Promise<number[]> {
    const shouldUseOpenAI = (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-placeholder')) && openai;

    if (shouldUseOpenAI) {
        try {
            const response = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: text,
            });
            return response.data[0].embedding;
        } catch (error) {
            console.warn("OpenAI Embedding Error, falling back to mock:", error);
        }
    }

    // Mock Embedding: Deterministic hash-based vector (Dimension: 1536 to match OpenAI Small)
    // For demo purposes, we can use a smaller dimension or just random seeded by text length/char codes to be loosely consistent.
    return generateMockEmbedding(text, 1536);
}

function generateMockEmbedding(text: string, dim: number): number[] {
    // Simple deterministic pseudo-random generator based on text
    let seed = 0;
    for (let i = 0; i < text.length; i++) {
        seed = ((seed << 5) - seed) + text.charCodeAt(i);
        seed |= 0;
    }

    const vector: number[] = [];
    for (let i = 0; i < dim; i++) {
        // pseudo-random using sin
        const val = Math.sin(seed + i) * 10000;
        vector.push(val - Math.floor(val)); // Normalized 0-1 (roughly)
    }
    return vector;
}
