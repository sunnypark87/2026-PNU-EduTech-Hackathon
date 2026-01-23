---
description: seperate prompt into JD analysis and recommend courses
---

We need to refactor the AI logic into a **Two-Step Sequential Pipeline** to improve accuracy and control.
Currently, the API is called once. We must separate this into two distinct Server Actions with specific prompts.

Please follow these steps to implement the separation:

### Step 1: Implement "Competency Extraction" Action
Create or modify `src/app/actions/analyzeJob.ts`.
- **Function:** `extractCompetencies(jobDescription: string)`
- **Prompt:**
  - Role: "You are an HR Expert."
  - Task: "Analyze the provided Job Description and extract the top 5 'Core Competencies' (Technical Skills & Soft Skills)."
  - Output format: **Strict JSON Array of strings** (e.g., `["React", "Data Analysis", "Python", ...]`).
- **Goal:** This action effectively converts unstructured text into structured keywords.

### Step 2: Implement "Course Recommendation" Action
Create or modify `src/app/actions/recommendCourses.ts`.
- **Function:** `getRecommendations(competencies: string[])`
- **Input:** It receives the list of keywords extracted from Step 1.
- **Data Source:** Load `src/data/courses.json`.
- **Prompt:**
  - Task: "Here is a list of required competencies: [Insert Competencies]. Find the 3 most suitable courses from the provided Course List that match these skills."
  - Output format: JSON Array of course objects with a `reason` field explaining why it matches.

### Step 3: Wire up the UI (Chain the Calls)
Update the "Analyze" button logic in `src/app/jobs/[id]/page.tsx` (or the relevant client component).
- **Current Flow:** Click -> Single Call -> Result.
- **New Flow:**
  1. User clicks "Analyze".
  2. Call `extractCompetencies(jd)`.
  3. **Display Step:** Show the extracted keywords (tags) on the screen temporarily (e.g., "Identified Skills: Python, AI...").
  4. Automatically (or via "Find Courses" button) call `getRecommendations(competencies)`.
  5. Display the final course cards.

---

Refactor the code now to enforce this two-step separation.