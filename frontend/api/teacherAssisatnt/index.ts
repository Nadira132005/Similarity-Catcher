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

export async function getUnitTestsForIssue(inquiry: string) {
  const response = await fetch(GENERATE_TESTS, {
    method: "POST",
    body: JSON.stringify({ prompt: inquiry }),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Server error");
  }

  return (await response.json()) as { response: string };
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
