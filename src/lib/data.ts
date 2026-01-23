import coursesData from "@/data/courses.json";
import jobsData from "@/data/jobs.json";

type RawCourse = {
  course_code?: string;
  id?: string;
  course_name?: string;
  credits?: number | string;
  category_in_curriculum?: string;
  class_type?: string;
  course_overview?: string;
  tools?: string[];
  learning_objectives?: string[];
  key_topics?: string[];
  typical_outputs?: string[];
  relatedJobIds?: string[];
};

type RawCourseBlock = {
  major?: string;
  course?: RawCourse[];
};

type RawCoursesPayload = {
  data?: RawCourseBlock[];
};

type RawJob = {
  posting_id?: string;
  id?: string;
  job_overview?:
    | string
    | {
        company?: string;
        position?: string;
        employment_type?: string;
        location?: string;
        summary?: string;
        description?: string;
      };
  main_tasks?: string[];
  required_skills?: string[];
  preferred?: string[];
  linked_courses?: Array<string | { course_code?: string; id?: string }>;
};

type RawJobsPayload = {
  job_postings?: RawJob[];
};

export type Course = {
  id: string;
  title: string;
  department: string;
  credit: number;
  category: string;
  classType: string;
  summary: string;
  skills: string[];
  learningObjectives: string[];
  keyTopics: string[];
  typicalOutputs: string[];
  relatedJobIds: string[];
};

export type Job = {
  id: string;
  title: string;
  company: string;
  employmentType: string;
  location: string;
  summary: string;
  mainTasks: string[];
  requirements: string[];
  preferred: string[];
  relatedCourseIds: string[];
};

const parseCredit = (value: RawCourse["credits"]) => {
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

const rawCoursesPayload = coursesData as RawCoursesPayload | RawCourse[];
const rawJobsPayload = jobsData as RawJobsPayload | RawJob[];

const courses: Course[] = [];

if (Array.isArray(rawCoursesPayload)) {
  for (const course of rawCoursesPayload) {
    const id = course.course_code ?? course.id ?? "";
    if (!id) {
      continue;
    }
    courses.push({
      id,
      title: course.course_name ?? "",
      department: "",
      credit: parseCredit(course.credits),
      category: course.category_in_curriculum ?? "",
      classType: course.class_type ?? "",
      summary: course.course_overview ?? "",
      skills: course.tools ?? [],
      learningObjectives: course.learning_objectives ?? [],
      keyTopics: course.key_topics ?? [],
      typicalOutputs: course.typical_outputs ?? [],
      relatedJobIds: course.relatedJobIds ?? [],
    });
  }
} else {
  for (const block of rawCoursesPayload.data ?? []) {
    for (const course of block.course ?? []) {
      const id = course.course_code ?? course.id ?? "";
      if (!id) {
        continue;
      }
      courses.push({
        id,
        title: course.course_name ?? "",
        department: block.major ?? "",
        credit: parseCredit(course.credits),
        category: course.category_in_curriculum ?? "",
        classType: course.class_type ?? "",
        summary: course.course_overview ?? "",
        skills: course.tools ?? [],
        learningObjectives: course.learning_objectives ?? [],
        keyTopics: course.key_topics ?? [],
        typicalOutputs: course.typical_outputs ?? [],
        relatedJobIds: course.relatedJobIds ?? [],
      });
    }
  }
}

const jobs: Job[] = [];
const rawJobs = Array.isArray(rawJobsPayload)
  ? rawJobsPayload
  : rawJobsPayload.job_postings ?? [];

for (const job of rawJobs) {
  const id = job.posting_id ?? job.id ?? "";
  if (!id) {
    continue;
  }
  const overview =
    job.job_overview && typeof job.job_overview === "object"
      ? job.job_overview
      : null;
  const overviewText =
    typeof job.job_overview === "string" ? job.job_overview : "";
  const title =
    overview?.position ??
    overviewText ??
    job.main_tasks?.[0] ??
    `채용 공고 ${id}`;
  const relatedCourseIds = (job.linked_courses ?? [])
    .map((courseRef) =>
      typeof courseRef === "string"
        ? courseRef
        : courseRef.course_code ?? courseRef.id ?? "",
    )
    .filter(Boolean);
  jobs.push({
    id,
    title,
    company: overview?.company ?? "",
    employmentType: overview?.employment_type ?? "",
    location: overview?.location ?? "",
    summary:
      overviewText ||
      overview?.summary ||
      overview?.description ||
      job.main_tasks?.[0] ||
      "",
    mainTasks: job.main_tasks ?? [],
    requirements: job.required_skills ?? [],
    preferred: job.preferred ?? [],
    relatedCourseIds,
  });
}

const courseById = new Map(courses.map((course) => [course.id, course]));
const jobById = new Map(jobs.map((job) => [job.id, job]));

const validateRelations = () => {
  const issues: string[] = [];

  for (const course of courses) {
    for (const jobId of course.relatedJobIds) {
      const job = jobById.get(jobId);
      if (!job) {
        issues.push(`Course ${course.id} references missing job ${jobId}.`);
        continue;
      }
      if (!job.relatedCourseIds.includes(course.id)) {
        issues.push(
          `Course ${course.id} references job ${jobId}, but job is missing the course.`,
        );
      }
    }
  }

  for (const job of jobs) {
    for (const courseId of job.relatedCourseIds) {
      const course = courseById.get(courseId);
      if (!course) {
        issues.push(`Job ${job.id} references missing course ${courseId}.`);
        continue;
      }
      if (!course.relatedJobIds.includes(job.id)) {
        issues.push(
          `Job ${job.id} references course ${courseId}, but course is missing the job.`,
        );
      }
    }
  }

  if (issues.length > 0) {
    const message = `Data relationship mismatch:\n${issues.join("\n")}`;
    if (process.env.NODE_ENV !== "production") {
      throw new Error(message);
    } else {
      console.warn(message);
    }
  }
};

validateRelations();

export const getCourses = () => courses;

export const getJobs = () => jobs;

export const getCourseById = (id: string) => courseById.get(id);

export const getJobById = (id: string) => jobById.get(id);

export const getJobsByCourseId = (courseId: string) => {
  const course = courseById.get(courseId);
  if (!course) {
    return [];
  }
  return course.relatedJobIds
    .map((jobId) => jobById.get(jobId))
    .filter((job): job is Job => Boolean(job));
};

export const getCoursesByJobId = (jobId: string) => {
  const job = jobById.get(jobId);
  if (!job) {
    return [];
  }
  return job.relatedCourseIds
    .map((courseId) => courseById.get(courseId))
    .filter((course): course is Course => Boolean(course));
};
