'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function extractCompetencies(jobDescription: string): Promise<string[]> {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-placeholder')) {
        console.warn("OpenAI API Key is missing. Returning mock keywords.");
        await new Promise(resolve => setTimeout(resolve, 800));
        return ["데이터 분석", "프로젝트 관리", "커뮤니케이션", "문제 해결", "창의성"];
    }

    try {
        const prompt = `
            You are an HR Expert.
            Analyze the provided Job Description and extract the top 5 'Core Competencies' (Technical Skills & Soft Skills).
            
            Job Description:
            "${jobDescription}"

            Output format: **Strict JSON Array of strings** (e.g., ["React", "Data Analysis", "Python"]).
            Do not include any explanation or markdown formatting. Just the raw JSON array.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an HR Expert. Output strictly valid JSON." },
                { role: "user", content: prompt },
            ],
            temperature: 0.3,
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content received");

        const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const keywords = JSON.parse(cleanedContent);

        return keywords;

    } catch (error) {
        console.error("Competency Extraction Error:", error);
        return ["데이터 분석", "프로젝트 관리", "커뮤니케이션", "문제 해결", "창의성"];
    }
}
