import { readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "src", "data");

const inputCoursesPath =
  process.env.COURSES_INPUT ?? path.join(rootDir, "courses.json");
const inputJobsPath =
  process.env.JOBS_INPUT ?? path.join(rootDir, "jobs.json");

const outputCoursesPath = path.join(dataDir, "courses.json");
const outputJobsPath = path.join(dataDir, "jobs.json");
const backupCoursesPath = path.join(dataDir, "courses.original.json");
const backupJobsPath = path.join(dataDir, "jobs.original.json");

const fileExists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const readJson = async (filePath) => {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
};

const writeJson = async (filePath, data) => {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
};

const parseCredit = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const match = value.match(/\d+/);
    if (match) {
      return Number.parseInt(match[0], 10);
    }
  }
  return 0;
};

const tokenizeText = (text) => {
  if (!text) {
    return [];
  }
  return String(text)
    .toLowerCase()
    .split(/[^0-9a-zA-Z가-힣]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
};

const uniqueTokens = (items) => {
  const tokens = new Set();
  for (const item of items) {
    for (const token of tokenizeText(item)) {
      tokens.add(token);
    }
  }
  return tokens;
};

const countOverlap = (setA, setB) => {
  let count = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      count += 1;
    }
  }
  return count;
};

const hasAny = (tokens, keywords) =>
  keywords.some((keyword) => tokens.has(keyword));

const deterministicOrder = (courseId, jobs) => {
  const hash = (value) => {
    let hashValue = 0;
    for (let i = 0; i < value.length; i += 1) {
      hashValue = (hashValue << 5) - hashValue + value.charCodeAt(i);
      hashValue |= 0;
    }
    return Math.abs(hashValue);
  };

  return [...jobs].sort((a, b) => {
    const aScore = hash(`${courseId}:${a.id}`);
    const bScore = hash(`${courseId}:${b.id}`);
    return aScore - bScore;
  });
};

if (!(await fileExists(inputCoursesPath))) {
  throw new Error(
    `Missing input courses file at ${inputCoursesPath}. Place courses.json in the repo root or set COURSES_INPUT.`,
  );
}

if (!(await fileExists(inputJobsPath))) {
  throw new Error(
    `Missing input jobs file at ${inputJobsPath}. Place jobs.json in the repo root or set JOBS_INPUT.`,
  );
}

const rawCourses = await readJson(inputCoursesPath);
const rawJobs = await readJson(inputJobsPath);

if (!rawCourses?.data || !Array.isArray(rawCourses.data)) {
  throw new Error(
    "Input courses.json must have a top-level { data: [...] } array.",
  );
}

const courseRows = [];
for (const majorBlock of rawCourses.data) {
  const major = majorBlock.major ?? "Unspecified";
  const courses = Array.isArray(majorBlock.course) ? majorBlock.course : [];
  for (const courseItem of courses) {
    const id = String(courseItem.course_code ?? "").trim();
    if (!id) {
      continue;
    }
    const skills = Array.isArray(courseItem.tools)
      ? courseItem.tools.filter(Boolean)
      : [];
    courseRows.push({
      id,
      title: courseItem.course_name ?? "",
      department: major,
      credit: parseCredit(courseItem.credits ?? courseItem.credit),
      summary: courseItem.course_overview ?? "",
      skills,
      relatedJobIds: [],
      _source: courseItem,
    });
  }
}

const jobs = Array.isArray(rawJobs)
  ? rawJobs.map((job) => ({
      ...job,
      relatedCourseIds: [],
    }))
  : [];

if (courseRows.length === 0) {
  throw new Error("No courses found after flattening input data.");
}

if (jobs.length === 0) {
  throw new Error("No jobs found in input jobs.json.");
}

const jobById = new Map(jobs.map((job) => [job.id, job]));

const jobTokenInfo = jobs.map((job) => {
  const jobTokens = uniqueTokens([
    job.title,
    job.summary,
    ...(job.requirements ?? []),
    ...(job.preferred ?? []),
    ...(job.tags ?? []),
  ]);
  const reqPrefTokens = uniqueTokens([
    ...(job.requirements ?? []),
    ...(job.preferred ?? []),
  ]);
  const tagTokens = uniqueTokens(job.tags ?? []);
  return { job, jobTokens, reqPrefTokens, tagTokens };
});

const topicFallbacks = [
  {
    courseTokens: ["sql", "db", "database", "데이터베이스", "데이터"],
    jobTokens: ["sql", "data", "bi", "analytics", "backend", "db"],
  },
  {
    courseTokens: ["python", "ml", "ai", "머신러닝", "인공지능", "딥러닝"],
    jobTokens: ["python", "ml", "ai", "data", "model", "analytics"],
  },
  {
    courseTokens: ["네트워크", "tcp", "tcp/ip", "라우팅", "routing", "network"],
    jobTokens: ["network", "infra", "devops", "sre"],
  },
  {
    courseTokens: ["보안", "security", "crypt", "암호", "정보보안"],
    jobTokens: ["security", "soc", "infosec"],
  },
  {
    courseTokens: ["프론트", "ui", "웹", "frontend", "react", "web"],
    jobTokens: ["frontend", "react", "web", "ui"],
  },
];

const courseJobLinks = new Map();

for (const course of courseRows) {
  const source = course._source ?? {};
  const courseTokens = uniqueTokens([
    course.title,
    course.summary,
    ...(source.tools ?? []),
    ...(source.key_topics ?? []),
  ]);
  const toolTokens = uniqueTokens(source.tools ?? []);

  const scored = jobTokenInfo.map(({ job, jobTokens, reqPrefTokens, tagTokens }) => {
    const base = countOverlap(courseTokens, jobTokens);
    const toolBoost = countOverlap(toolTokens, reqPrefTokens);
    const tagBoost = countOverlap(courseTokens, tagTokens);
    const score = base + toolBoost * 2 + tagBoost;
    return { jobId: job.id, score };
  });

  scored.sort((a, b) => b.score - a.score || a.jobId.localeCompare(b.jobId));
  const positive = scored.filter((item) => item.score > 0);

  let targetK = 3;
  if (positive.length >= 6) {
    targetK = 6;
  } else if (positive.length >= 5) {
    targetK = 5;
  } else if (positive.length >= 4) {
    targetK = 4;
  }
  targetK = Math.min(targetK, jobs.length);
  if (jobs.length >= 2) {
    targetK = Math.max(targetK, 2);
  }

  const selected = new Set(positive.slice(0, targetK).map((item) => item.jobId));

  if (selected.size < targetK) {
    for (const fallback of topicFallbacks) {
      if (!hasAny(courseTokens, fallback.courseTokens)) {
        continue;
      }
      for (const { job, jobTokens } of jobTokenInfo) {
        if (
          selected.size < targetK &&
          fallback.jobTokens.some((token) => jobTokens.has(token))
        ) {
          selected.add(job.id);
        }
      }
    }
  }

  if (selected.size < targetK) {
    const ordered = deterministicOrder(course.id, jobs);
    for (const job of ordered) {
      if (selected.size >= targetK) {
        break;
      }
      selected.add(job.id);
    }
  }

  const jobIds = Array.from(selected);
  course.relatedJobIds = jobIds;
  courseJobLinks.set(course.id, jobIds);
}

for (const [courseId, jobIds] of courseJobLinks.entries()) {
  for (const jobId of jobIds) {
    const job = jobById.get(jobId);
    if (!job) {
      continue;
    }
    job.relatedCourseIds.push(courseId);
  }
}

for (const job of jobs) {
  job.relatedCourseIds = Array.from(new Set(job.relatedCourseIds));
}

const validationErrors = [];

const courseById = new Map(courseRows.map((course) => [course.id, course]));

for (const course of courseRows) {
  for (const jobId of course.relatedJobIds) {
    const job = jobById.get(jobId);
    if (!job) {
      validationErrors.push(`Course ${course.id} links to missing job ${jobId}.`);
      continue;
    }
    if (!job.relatedCourseIds.includes(course.id)) {
      validationErrors.push(
        `Course ${course.id} links to job ${jobId} but job missing course.`,
      );
    }
  }
}

for (const job of jobs) {
  for (const courseId of job.relatedCourseIds) {
    const course = courseById.get(courseId);
    if (!course) {
      validationErrors.push(
        `Job ${job.id} links to missing course ${courseId}.`,
      );
      continue;
    }
    if (!course.relatedJobIds.includes(job.id)) {
      validationErrors.push(
        `Job ${job.id} links to course ${courseId} but course missing job.`,
      );
    }
  }
}

if (validationErrors.length > 0) {
  console.error("Validation errors:");
  for (const error of validationErrors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
}

const sanitizedCourses = courseRows.map(({ _source, ...course }) => course);

if (await fileExists(outputCoursesPath)) {
  await writeJson(backupCoursesPath, await readJson(outputCoursesPath));
}

if (await fileExists(outputJobsPath)) {
  await writeJson(backupJobsPath, await readJson(outputJobsPath));
}

await writeJson(outputCoursesPath, sanitizedCourses);
await writeJson(outputJobsPath, jobs);

console.log(`Migrated ${sanitizedCourses.length} courses and ${jobs.length} jobs.`);
