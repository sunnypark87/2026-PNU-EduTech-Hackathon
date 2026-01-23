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
            You are an expert **University Curriculum Advisor**.
            Your goal is to analyze the provided Job Description and extract exactly 5 distinct 'Key Competencies' to recommend relevant university courses.

            Job Description:
            """
            ${jobDescription}
            """

            ### Analysis Guidelines (Strictly Follow):
            1. **Ensure Diversity (CRITICAL):** The 5 keywords MUST cover the following distinct categories:
            - **Domain Knowledge (Industry):** Specific field knowledge (e.g., Ocean Engineering, Shipbuilding, Fintech). **YOU MUST INCLUDE AT LEAST ONE DOMAIN KEYWORD.**
            - **Theoretical Foundation:** Math, Statistics, or Engineering principles (e.g., Regression Analysis, Fluid Dynamics).
            - **Technical Skills:** Tools or Languages (e.g., Python, CAD).

            2. **Academic Terminology:**
            - Use terms that are likely to appear in a University Course Catalog (e.g., use "Marine System Engineering" instead of just "Ship").

            ### Output Format:
            - Return a **Strict JSON Array of strings**.
            - Output language: **Korean**.
            - Example Output: ["해양 시스템 공학", "회귀분석 및 통계", "Python 데이터 분석", "유체 역학", "기술 커뮤니케이션"]

            JSON Output:
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
