import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "src", "data");

const readJson = async (filePath) => {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
};

const coursesPath = path.join(dataDir, "courses.json");
const jobsPath = path.join(dataDir, "jobs.json");
const outputPath = path.join(dataDir, "graph.json");

const rawCourses = await readJson(coursesPath);
const rawJobs = await readJson(jobsPath);

const courses = [];
if (Array.isArray(rawCourses)) {
  courses.push(...rawCourses);
} else if (Array.isArray(rawCourses?.data)) {
  for (const block of rawCourses.data) {
    for (const course of block.course ?? []) {
      courses.push({
        ...course,
        _major: block.major ?? "",
      });
    }
  }
}

const jobs = Array.isArray(rawJobs?.job_postings)
  ? rawJobs.job_postings
  : Array.isArray(rawJobs)
    ? rawJobs
    : [];

const jobById = new Map(
  jobs.map((job) => [job.posting_id ?? job.id, job]),
);
const nodes = [];
const edges = [];
const edgeKeys = new Set();
const warnings = [];

for (const course of courses) {
  const courseId = course.course_code ?? course.id;
  if (!courseId) {
    continue;
  }
  nodes.push({
    id: `course:${courseId}`,
    type: "course",
    refId: courseId,
    label: course.course_name ?? course.title ?? courseId,
  });

  for (const jobId of course.relatedJobIds ?? []) {
    const job = jobById.get(jobId);
    if (!job) {
      warnings.push(`Missing job for course ${courseId}: ${jobId}`);
      continue;
    }

    if (!job.linked_courses?.includes(courseId)) {
      warnings.push(
        `Job ${jobId} missing back-link to course ${courseId}.`,
      );
    }

    const source = `course:${courseId}`;
    const target = `job:${jobId}`;
    const key = `${source}->${target}`;
    if (!edgeKeys.has(key)) {
      edgeKeys.add(key);
      edges.push({ source, target });
    }
  }
}

for (const job of jobs) {
  const jobId = job.posting_id ?? job.id;
  if (!jobId) {
    continue;
  }
  nodes.push({
    id: `job:${jobId}`,
    type: "job",
    refId: jobId,
    label:
      job.job_overview?.position ??
      job.main_tasks?.[0] ??
      job.job_overview ??
      job.title ??
      `Job ${jobId}`,
  });
}

if (warnings.length > 0) {
  console.warn("Graph build warnings:");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

const graph = { nodes, edges };
await writeFile(outputPath, `${JSON.stringify(graph, null, 2)}\n`, "utf8");
console.log(`Graph written to ${outputPath}`);
