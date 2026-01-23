import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "src", "data");

const coursesPath = path.join(dataDir, "courses.json");
const jobsPath = path.join(dataDir, "jobs.json");
const outputCoursesPath = path.join(dataDir, "courses.linked.json");
const outputJobsPath = path.join(dataDir, "jobs.linked.json");

const readJson = async (filePath) => {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
};

const writeJson = async (filePath, data) => {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
};

const stopwords = new Set([
  "the",
  "and",
  "or",
  "for",
  "with",
  "from",
  "into",
  "that",
  "this",
  "these",
  "those",
  "are",
  "is",
  "was",
  "were",
  "be",
  "as",
  "of",
  "to",
  "in",
  "on",
  "at",
  "by",
  "및",
  "과",
  "등",
  "또는",
]);

const tokenize = (value) => {
  if (!value) {
    return [];
  }
  return String(value)
    .toLowerCase()
    .split(/[^0-9a-zA-Z가-힣]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !stopwords.has(token));
};

const toTokenSet = (values) => {
  const tokens = new Set();
  for (const value of values) {
    for (const token of tokenize(value)) {
      tokens.add(token);
    }
  }
  return tokens;
};

const overlapCount = (setA, setB) => {
  let count = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      count += 1;
    }
  }
  return count;
};

const containsAny = (set, keywords) =>
  keywords.some((keyword) => set.has(keyword));

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

const fallbackRules = [
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

const rawCourses = await readJson(coursesPath);
const rawJobs = await readJson(jobsPath);

const jobs = Array.isArray(rawJobs)
  ? rawJobs.map((job) => ({
      ...job,
      relatedCourseIds: [],
    }))
  : [];

if (jobs.length === 0) {
  throw new Error("jobs.json must be a non-empty array.");
}

const jobById = new Map(jobs.map((job) => [job.id, job]));

const jobTokenInfo = jobs.map((job) => {
  const jobTokens = toTokenSet([
    job.title,
    job.summary,
    ...(job.requirements ?? []),
    ...(job.preferred ?? []),
    ...(job.tags ?? []),
  ]);
  const reqPrefTokens = toTokenSet([
    ...(job.requirements ?? []),
    ...(job.preferred ?? []),
  ]);
  const tagTokens = toTokenSet(job.tags ?? []);
  return { job, jobTokens, reqPrefTokens, tagTokens };
});

const courseItems = [];

const addCourseItem = (course, major) => {
  const courseId = course.course_code ?? course.id;
  if (!courseId) {
    return;
  }
  courseItems.push({
    course,
    courseId: String(courseId),
    major: major ?? course.department ?? "",
  });
};

if (Array.isArray(rawCourses)) {
  for (const course of rawCourses) {
    addCourseItem(course, course.department);
  }
} else if (rawCourses && Array.isArray(rawCourses.data)) {
  for (const majorBlock of rawCourses.data) {
    const major = majorBlock.major ?? "";
    const courses = Array.isArray(majorBlock.course) ? majorBlock.course : [];
    for (const course of courses) {
      addCourseItem(course, major);
    }
  }
} else {
  throw new Error(
    "courses.json must be a flat array or an object with data[].course[].",
  );
}

const courseMatches = new Map();

for (const { course, courseId } of courseItems) {
  const courseTokens = toTokenSet([
    course.course_name ?? course.title,
    course.course_overview ?? course.summary,
    ...(course.key_topics ?? []),
    ...(course.tools ?? []),
  ]);
  const toolTokens = toTokenSet(course.tools ?? []);

  const scored = jobTokenInfo.map(({ job, jobTokens, reqPrefTokens, tagTokens }) => {
    const base = overlapCount(courseTokens, jobTokens);
    const toolBoost = overlapCount(toolTokens, reqPrefTokens);
    const tagBoost = overlapCount(courseTokens, tagTokens);
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
    for (const fallback of fallbackRules) {
      if (!containsAny(courseTokens, fallback.courseTokens)) {
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
    const ordered = deterministicOrder(courseId, jobs);
    for (const job of ordered) {
      if (selected.size >= targetK) {
        break;
      }
      selected.add(job.id);
    }
  }

  const relatedJobIds = Array.from(selected);
  course.relatedJobIds = relatedJobIds;
  courseMatches.set(courseId, relatedJobIds);
}

for (const [courseId, jobIds] of courseMatches.entries()) {
  for (const jobId of jobIds) {
    const job = jobById.get(jobId);
    if (job) {
      job.relatedCourseIds.push(courseId);
    }
  }
}

for (const job of jobs) {
  job.relatedCourseIds = Array.from(new Set(job.relatedCourseIds));
}

const validationErrors = [];
for (const { course, courseId } of courseItems) {
  const relatedJobIds = course.relatedJobIds ?? [];
  for (const jobId of relatedJobIds) {
    const job = jobById.get(jobId);
    if (!job) {
      validationErrors.push(`Course ${courseId} references missing job ${jobId}.`);
      continue;
    }
    if (!job.relatedCourseIds.includes(courseId)) {
      validationErrors.push(
        `Course ${courseId} links to job ${jobId}, but job missing course.`,
      );
    }
  }
}

for (const job of jobs) {
  for (const courseId of job.relatedCourseIds) {
    const linked = courseMatches.get(courseId);
    if (!linked) {
      validationErrors.push(`Job ${job.id} references missing course ${courseId}.`);
      continue;
    }
    if (!linked.includes(job.id)) {
      validationErrors.push(
        `Job ${job.id} links to course ${courseId}, but course missing job.`,
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

await writeJson(outputCoursesPath, rawCourses);
await writeJson(outputJobsPath, jobs);

console.log(
  `Linked ${courseItems.length} courses to ${jobs.length} jobs. Outputs written to src/data/*.linked.json`,
);
