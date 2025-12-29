import {
  AUTH_ROUTE,
  COMPARE_QUERY,
  GET_STATUS,
  GET_HEALTH,
  GET_METRICS,
  CLEAR_LOGS,
  LIST_UPLOADED_CSVS,
  DOWNDLAD_UPLODED_CSVS,
  GENERATE_TESTS,
  CREATE_PROJECT_FROM_PDF,
  GET_TEACHER_PROJECTS,
  DELETE_PROJECT,
} from "./routeVariables";

export async function auth() {
  const res = await fetch(AUTH_ROUTE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "log in",
    }),
  });

  return res;
}

export interface ReturnedIssue {
  content: string;
  filename: string;
}

export interface ReturnedQueries {
  results: ReturnedIssue[];
}

export async function compareQueries(prompt: string) {
  const response = await fetch(COMPARE_QUERY, {
    method: "POST",
    body: JSON.stringify({ prompt }),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Server error");
  }

  return (await response.json()) as ReturnedQueries;
}

export async function getUnitTestsForIssue(inquiry: string, projectName?: string) {
  const response = await fetch(GENERATE_TESTS, {
    method: "POST",
    body: JSON.stringify({
      prompt: inquiry,
      project_name: projectName || "api_files"  // Default to old behavior
    }),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Server error");
  }

  return (await response.json()) as { response: string; project_name: string };
}

export async function getStatus(requestId: string) {
  const res = await fetch(GET_STATUS + requestId);
  if (!res.ok) throw new Error("Failed to get status from backend");
  return res.json();
}

export async function getHealth() {
  const res = await fetch(GET_HEALTH);
  if (!res.ok) throw new Error("Failed to get health from backend");
  return res.json();
}

export async function getMetrics() {
  const res = await fetch(GET_METRICS);
  if (!res.ok) throw new Error("Failed to get metrics from backend");
  return res.json();
}

export async function clearLogs(adminKey: string) {
  const res = await fetch(CLEAR_LOGS, {
    method: "POST",
    headers: { "Admin-Key": adminKey },
  });
  if (!res.ok) throw new Error("Failed to clear logs");
  return res.json();
}

export async function listUploadedCSVs() {
  const res = await fetch(LIST_UPLOADED_CSVS);
  if (!res.ok) throw new Error("Failed to fetch uploaded CSVs");
  return res.json();
}

export async function downloadUploadedCSV(filename: string) {
  const res = await fetch(DOWNDLAD_UPLODED_CSVS + encodeURIComponent(filename));
  if (!res.ok) throw new Error("Failed to download CSV");
  return res.blob();
}

export interface TeacherProject {
  name: string;
  problems_count: number;
}

export async function getTeacherProjects() {
  const response = await fetch(GET_TEACHER_PROJECTS);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch projects");
  }

  return (await response.json()) as { projects: TeacherProject[]; count: number };
}

export async function createProjectFromPDF(formData: FormData) {
  const response = await fetch(CREATE_PROJECT_FROM_PDF, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create project from PDF");
  }

  return await response.json();
}

export async function deleteProject(projectName: string) {
  const response = await fetch(DELETE_PROJECT + encodeURIComponent(projectName), {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete project");
  }

  return await response.json();
}

// export async function getProjects() {
//   const response = await fetch(GET_PROJECTS);

//   return await response.json();
// }

// export async function createProjects(formData: FormData) {
//   return await fetch(CREATE_PROJECT, {
//     method: "POST",
//     body: formData,
//   });
// }
