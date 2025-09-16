const BACKEND_URL = "http://localhost:8000/api/similarity-matcher";

export const AUTH_ROUTE = BACKEND_URL + "/authenticate";
export const COMPARE_QUERY = BACKEND_URL + "/compare";
export const GET_STATUS = BACKEND_URL + "/status/";
export const GET_HEALTH = BACKEND_URL + "/health";
export const GET_METRICS = BACKEND_URL + "/metrics";
export const CLEAR_LOGS = BACKEND_URL + "/admin/logs/clear";
export const LIST_UPLOADED_CSVS = BACKEND_URL + "/list_uploaded_csvs";
export const DOWNDLAD_UPLODED_CSVS = BACKEND_URL + "/download_uploaded_csv/";
export const GET_PROJECTS = BACKEND_URL + "/getProjects";
export const CREATE_PROJECT = BACKEND_URL + "/createProject";
