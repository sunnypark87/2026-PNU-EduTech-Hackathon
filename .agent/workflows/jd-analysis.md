---
description: job board & jd analysis
---

We are implementing **Feature 1: Job Board & JD Analysis**.
Please modify the project structure and create new pages according to the following steps.

---

### Step 1: Create Mock Job Data (`src/data/jobs.json`)
Create a JSON file with 6-8 mock job postings focused on **Marine, Shipbuilding, and Port Logistics** industries in Busan.
- **Structure:** `id`, `title`, `company` (e.g., Busan Marine Tech, K-Shipbuilding), `location` (Busan), `summary`, `content` (Long detailed description including required skills).
- **Content Examples:**
  1. "Autonomous Ship Navigation System Developer" (C++, Embedded, Sensor fusion)
  2. "Smart Port Logistics Data Analyst" (Python, SQL, Optimization)
  3. "Offshore Plant Structural Engineer" (CAD, Physics, Simulation)
- **Note:** Ensure the content is in **Korean**.

### Step 2: Revamp Main Page (`src/app/page.tsx`)
Change the main page from a text input form to a **Job Board Layout**.
- **Hero Section:** Keep the "Degree-folio" branding but update the copy to "Explore Busan's Top Career Opportunities".
- **Grid List:** Display the jobs from `jobs.json` as clickable **Job Cards**.
- **Card Content:** Title, Company, Location, Short Summary.
- **Link:** Clicking a card should navigate to `/jobs/[id]`.

### Step 3: Create Job Detail Page (`src/app/jobs/[id]/page.tsx`)
Create a dynamic route to display the full job details.
- **UI:** Show the Job Title, Company, and the **Full Content** clearly.
- **Action Button:** Place a prominent button: **"이 채용공고 분석하기 (Analyze This Job)"**.
- **Interaction:**
  - When the button is clicked, trigger a Server Action to analyze the text.
  - Show a loading spinner during analysis.
  - Once finished, display the **"Core Competencies (핵심 역량)"** extracted by AI (e.g., as tags or a list) directly on this page or navigate to the Result page with this data.

### Step 4: Implement Analysis Logic (Server Action)
Update or create a Server Action `analyzeJob(jobContent: string)`.
- **LLM Prompt:** "Analyze the following job description and extract 5 Core Competencies (Key Skills). Return them as a JSON array of strings."
- **Output:** The UI should receive these keywords and display them.

---

Execute these steps immediately. Ensure the routing (`/` -> `/jobs/[id]`) works correctly.