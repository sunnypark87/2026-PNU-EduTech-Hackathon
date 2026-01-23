'use server';

import OpenAI from 'openai';
import coursesData from '@/data/courses.json';
import { Course } from '@/utils/recommendation';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function recommendCourses(competencies: string[]): Promise<Course[]> {
    // Check if we need to return full course objects or if partial is fine.
    // The existing UI expects Course Objects.

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-placeholder')) {
        console.warn("OpenAI API Key is missing. Returning mock courses.");
        await new Promise(resolve => setTimeout(resolve, 800));
        return coursesData.slice(0, 3);
    }

    try {
        const prompt = `
            Here is a list of required competencies: ${JSON.stringify(competencies)}

            Here is the list of university courses in JSON format:
            ${JSON.stringify(coursesData.map(c => ({ id: c.id, title: c.title, description: c.description, keywords: c.keywords })))}

            Task:
            Find the 3 most suitable courses from the provided Course List that match these skills.
            
            Return the output **strictly** in JSON format as an array of objects.
            Each object should contain the "id" of the course and a "reason" string explaining why it matches.
            Example: [{ "id": 1, "reason": "Matches Python skill" }]
            
            Do not include any markdown formatting. Just the raw JSON array.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an expert educational consultant. Output strictly valid JSON." },
                { role: "user", content: prompt },
            ],
            temperature: 0.3,
        });

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("No content received");

        const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const results = JSON.parse(cleanedContent);

        // Map back to full course objects
        const recommendedCourses = results.map((res: any) => {
            const original = coursesData.find(c => c.id === res.id);
            return original || coursesData[0]; // Fallback
        });

        return recommendedCourses.slice(0, 3) as Course[];

    } catch (error) {
        console.error("Course Recommendation Error:", error);
        return coursesData.slice(0, 3);
    }
}
