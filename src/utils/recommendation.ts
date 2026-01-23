import coursesData from '@/data/courses.json';

export interface Course {
    id: number;
    title: string;
    professor: string;
    keywords: string[];
    description: string;
    target_audience: string;
}

// Mock Mode: Set to true to bypass any real API calls (if added later)
const MOCK_MODE = true;

/**
 * recommendCourses
 * Analyzes the job posting text and returns appropriate courses.
 * Currently uses a simple mock strategy or basic keyword matching if extended.
 * 
 * @param jobPostingText - The text from the job posting
 * @returns Promise<Course[]> - Top 3 recommended courses
 */
export async function recommendCourses(jobPostingText: string): Promise<Course[]> {
    // In a real scenario, we would call an LLM here.
    // For the hackathon MVP, we prioritize speed and stability.

    if (MOCK_MODE) {
        // Mock Implementation: Always return 3 specific lectures suitable for a general demo
        // e.g., Fintech(#1), Smart Logistics(#2), Startup(#3)
        const recommendedIds = [1, 2, 3];
        const recommended = coursesData.filter((course) => recommendedIds.includes(course.id));

        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));

        return recommended;
    }

    // Fallback (if Mock Mode is off but no logic implemented yet)
    return coursesData.slice(0, 3);
}
