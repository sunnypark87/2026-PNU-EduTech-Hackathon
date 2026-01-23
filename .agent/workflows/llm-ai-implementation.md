---
description: connect ai api
---

Great job on the scaffold. Now, let's implement the **Real AI Logic** using LLM API, replacing the mock data hardcoding.

### Goal
- Connect **OpenAI (`gpt-4o-mini`)** or **Google Gemini (`gemini-1.5-flash`)** API.
- Implement logic to analyze the user's `Job Description` input and recommend the best matching courses from `courses.json`.

### Instructions

**1. Install Dependencies**
First, install the necessary SDK. (Choose one based on your preference or availability, preferably `openai` or `@google/generative-ai`.)

**2. Create Server Action (`src/app/actions/recommend.ts`)**
Instead of a standard API route, create a **Server Action** for simpler implementation.
- Function Name: `getRecommendations(jobDescription: string)`
- **Logic:**
  1. Load the `src/data/courses.json` file.
  2. Construct a prompt:
     - "Here is the list of university courses: [JSON Data]"
     - "Here is the job description provided by the user: [User Input]"
     - "Select the 3 most relevant courses that help build skills for this job."
     - "Return the output **strictly** in JSON format with an array of course objects (including reasoning for recommendation)."
  3. Call the LLM API (`gpt-4o-mini` or `gemini-1.5-flash`) with this prompt.
  4. Parse the response and return the JSON object to the client.

**3. Update Result Page (`src/app/result/page.tsx`)**
- Connect this Server Action to the page.
- When the page loads (or via `useEffect`), call `getRecommendations` with the input text.
- Replace the mock data with the **real data** returned from the AI.
- While loading, show a "Analyzing..." skeleton UI.

**4. Environment Variables**
- Create a `.env.local.example` file and list the required key (e.g., `OPENAI_API_KEY` or `GOOGLE_API_KEY`).

Please implement this strictly following the Server Actions pattern.