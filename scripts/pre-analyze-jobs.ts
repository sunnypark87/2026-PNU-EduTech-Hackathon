
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey || apiKey.startsWith('sk-placeholder')) {
    console.error('Error: valid OPENAI_API_KEY not found in .env');
    process.exit(1);
}

const openai = new OpenAI({ apiKey });

// Paths
const jobsPath = path.join(__dirname, '../src/data/jobs.json');
const coursesPath = path.join(__dirname, '../src/data/courses.json');
const cachePath = path.join(__dirname, '../src/data/cached_analysis.json');

// Read Data
const jobsData = JSON.parse(fs.readFileSync(jobsPath, 'utf-8'));
const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf-8'));

// Initialize Cache
let cache: any = {};
if (fs.existsSync(cachePath)) {
    try {
        cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    } catch (e) {
        console.warn('Cache file corrupted or empty, starting fresh.');
    }
}

async function analyzeJob(job: any) {
    if (cache[job.id]) {
        console.log(`[Skip] Job ${job.id} already analyzed.`);
        return;
    }

    console.log(`[Analyzing] Job ${job.id}: ${job.title}...`);

    try {
        const prompt = `
      Here is the list of university courses in JSON format:
      ${JSON.stringify(coursesData.map((c: any) => ({ id: c.id, title: c.title, description: c.description, keywords: c.keywords })))}

      Here is the job description provided by the user:
      "${job.content}"

      Task:
      1. Analyze the job description and extract 5 Core Competencies (Key Skills, e.g., "Python", "Data Analysis", "Project Management").
      2. Select the 3 most relevant courses that help build skills for this job.
      
      Return the output **strictly** in JSON format with the following structure:
      {
        "core_competencies": ["skill1", "skill2", "skill3", "skill4", "skill5"],
        "recommended_courses": [
          { "id": 1, "reason": "reasoning..." },
          ...
        ]
      }
      Do not include any markdown formatting. Just the raw JSON object.
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
        const result = JSON.parse(cleanedContent);

        // Map back to full course objects
        const recommendedCourses = result.recommended_courses.map((rec: any) => {
            const original = coursesData.find((c: any) => c.id === rec.id);
            return original || { ...coursesData[0], ...rec }; // Fallback
        });

        const finalResult = {
            keywords: result.core_competencies || [],
            courses: recommendedCourses.slice(0, 3)
        };

        cache[job.id] = finalResult;

        // Save incrementally
        fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8');
        console.log(`[Saved] Job ${job.id}`);

    } catch (error) {
        console.error(`[Error] Job ${job.id}:`, error);
    }
}

async function main() {
    console.log(`Starting pre-analysis for ${jobsData.length} jobs...`);
    for (const job of jobsData) {
        await analyzeJob(job);
        // Add small delay to avoid rate limits if any
        await new Promise(r => setTimeout(r, 500));
    }
    console.log('Pre-analysis complete!');
}

main();
