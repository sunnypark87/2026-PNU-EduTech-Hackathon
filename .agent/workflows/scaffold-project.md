---
description: initial prompt
---

We are building **[Degree-folio]**, a micro-degree recommendation service connecting local talent with local companies.
Since time is tight, please scaffold the project quickly and accurately according to the steps below.

---

### Step 1: Generate Mock Data (`src/data/courses.json`)
Create 20 mock university lecture data points in JSON format, reflecting the characteristics of the **Busan/Gyeongnam region**.
- **Context:** Local flagship universities like Pusan National University or Pukyong National University.
- **Departments:** Computer Science, Business Administration, Marine Logistics, Tourism Management (Key industries in Busan).
- **Fields:** `id`, `title`, `professor`, `keywords` (array), `description`, `target_audience` (e.g., BNK Busan Bank, Busan Port Authority, Local Startups).
- **Examples:** "Fintech and Busan Finance Ecosystem", "Smart Marine Logistics Data Analysis", "Centum City Startup Practice".
- **Note:** All data content must be in **Korean**.

### Step 2: Implement Service Logic (`src/utils/recommendation.ts`)
Implement the function assuming usage of an LLM API (Gemini/OpenAI), but include a **'Mock Mode'** so the demo works without an API key right now.
- Logic: Compare the input job posting text with `courses.json` and return the 3 most suitable lectures.
- Mock Implementation: Comment out the real API call and implement a dummy return function that always returns 3 specific lectures for the demo.

### Step 3: Implement UI/UX Pages
Create the following 3 pages using Next.js App Router. Apply the **'Pusan Blue (Deep Blue & White)'** theme using Tailwind CSS.

1. **Main Page (`/`):**
   - Header: **"Degree-folio"** Logo (Bold text).
   - Hero Copy: "지역 채용공고에 딱 맞는 강의를 찾아드립니다." (Find the perfect lecture for local job postings).
   - Feature: A wide `Textarea` for job posting input and an "Analyze (분석 시작하기)" button.

2. **Result Page (`/result`):**
   - Header: "Degree-folio 분석 리포트" (Analysis Report).
   - Content: "지원자님의 채용공고 분석 결과, 아래 부산 지역 강의가 가장 적합합니다."
   - UI: Display 3 recommended lectures as **Card UI**. Each card must have badges like [Match 98%], [Recruitment Linked].
   - Action: Emphasize the "Get My Degree-folio (나만의 디그리폴리오 발급받기)" button at the bottom.

3. **Portfolio Page (`/portfolio`):**
   - **Design Key:** Implement a luxurious Box UI in the center that looks like a real **'Certificate (Award)'** with a gold border.
   - Title: **"OFFICIAL DEGREE-FOLIO"**
   - Content: "The student above has completed this curriculum to acquire core competencies in [Job Field]." (Write this in Korean: "위 학생은...").
   - Bottom: Detailed analysis content listed as a text report.

---

Based on the instructions above, generate the `courses.json` file first, and then set up the entire project structure.