"use client";
import React, { useEffect, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useRouter } from "next/navigation";
import {
  compareQuery,
  getStatus,
  getHealth,
  getMetrics,
  clearLogs,
  createProjects,
  getProjects,
} from "@/api/similarityMatcher";
import Alert from "@/app/Components/CustomAlert/CustomAlert";

const endpoints = [
  {
    label: "POST /compare",
    description: "Compare a query with CSV data from project",
    method: "POST",
    apiCall: async () => {
      return await compareQuery("Example Query", 123, ["Example Project"]);
    },
  },
  {
    label: "GET /status/<request_id>",
    description: "Get status of a comparison request",
    method: "GET",
    apiCall: async () => await getStatus("example-request-id"),
  },
  {
    label: "GET /health",
    description: "Health check endpoint",
    method: "GET",
    apiCall: async () => await getHealth(),
  },
  {
    label: "GET /metrics",
    description: "System and application metrics",
    method: "GET",
    apiCall: async () => await getMetrics(),
  },
  {
    label: "POST /admin/logs/clear",
    description: "Clear log files, admin only",
    method: "POST",
    apiCall: async () => await clearLogs("<admin-secret>"),
  },
];

export default function UploadCSV() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const [responses, setResponses] = React.useState<{ [key: number]: string }>(
    {}
  );
  const [csvFile, setCsvFile] = useState<File>();
  const [loading, setLoading] = React.useState<number | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<string[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const projectsData = await getProjects();
        setProjects(projectsData.projects || []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    }

    fetchProjects();
  }, []);

  const handleClick = async (i: number) => {
    setOpenIndex(i);
    setLoading(i);

    try {
      const data = await endpoints[i].apiCall();
      setResponses((prev) => ({ ...prev, [i]: JSON.stringify(data, null, 2) }));
    } catch (err: any) {
      setResponses((prev) => ({ ...prev, [i]: err.message || "Error" }));
    } finally {
      setLoading(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  async function handleSubmit(
    e: React.FormEvent,
    csvFile: File,
    projectName: string
  ) {
    e.preventDefault();
    setBtnLoading(true);
    if (!csvFile) {
      setMessage("Please select a CSV file.");
      setError(true);
      return;
    }

    if (projects.find((p) => p === projectName)) {
      setMessage(
        "Project name already exists. The new data will be added the the old one "
      );
      setError(true);
    }

    if (!csvFile && projects.find((p) => p === projectName)) {
      setMessage("Please select a CSV file and a project name");
      setError(true);
      return;
    }
    const formData = new FormData();
    formData.append("csv_file", csvFile);
    formData.append("project_name", projectName);

    const response = await createProjects(formData);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Server error");
    }
    const data = await response.json();
    router.push("/similarity-matcher");
    console.log("Project created:", data);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 relative">
      {error && (
        <Alert
          message={message}
          onClose={() => setError(false)}
          className="bg-red-500"
        ></Alert>
      )}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 px-4 py-2 rounded bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 transition flex items-center"
        aria-label="Back"
        style={{ zIndex: 10 }}
      >
        {/* Back arrow icon */}
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          className="mr-2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back
      </button>
      <h1 className="text-2xl font-bold mb-6">Backend API Endpoints</h1>
      <div className="relative w-full max-w-lg">
        <ul className="space-y-4 w-full">
          {endpoints.map((ep, i) => (
            <Popover.Root
              key={ep.label}
              open={openIndex === i}
              onOpenChange={(open) => setOpenIndex(open ? i : null)}
            >
              <Popover.Trigger asChild>
                <li
                  className="flex items-center cursor-pointer group relative"
                  onClick={() => handleClick(i)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleClick(i);
                  }}
                >
                  <div className="flex-1">
                    <span className="text-blue-700 font-medium">
                      {ep.label}
                    </span>
                    <span className="ml-2 text-gray-500">
                      ({ep.description})
                    </span>
                  </div>
                </li>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  side="right"
                  align="center"
                  className="relative rounded-2xl shadow-lg border border-blue-400 bg-white p-4 min-w-[220px] max-w-[350px] text-xs text-left whitespace-pre-wrap z-50 radix-side-right:animate-slide-left"
                  sideOffset={0}
                  style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }}
                >
                  {/* Triangle pointer: tip to the left, right side flush with box edge */}
                  <svg
                    className="absolute -left-4 top-1/2 -translate-y-1/2"
                    width="16"
                    height="24"
                    viewBox="0 0 16 24"
                    fill="none"
                    style={{ zIndex: 51 }}
                  >
                    <polygon
                      points="0,12 16,4 16,20"
                      fill="#fff"
                      stroke="#60a5fa"
                      strokeWidth="2"
                    />
                  </svg>
                  {loading === i ? (
                    <span className="text-blue-400 font-semibold">
                      Loading...
                    </span>
                  ) : (
                    <span className="text-gray-800">
                      {responses[i] || "No response"}
                    </span>
                  )}
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          ))}
        </ul>
      </div>

      <h1 className="text-2xl font-bold  mt-10">Add Project</h1>

      <form
        className="w-full max-w-lg space-y-6"
        onSubmit={(e) => {
          handleSubmit(e, csvFile!, projectName);
        }}
      >
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">Project Name</label>
          <input
            onChange={(e) => setProjectName(e.target.value)}
            className={`rounded px-4 py-2 bg-white border-2 ${
              projects.find((p) => p === projectName)
                ? "border-red-600"
                : "border-blue"
            } focus:outline-none focus:ring-2 focus:ring-blue`}
            type="text"
            placeholder="Enter your project name"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <label
            htmlFor="csv-upload"
            className="rounded px-4 py-2 font-semibold shadow cursor-pointer text-center transition-transform duration-200 hover:scale-95 active:scale-90 bg-blue text-white max-w-[200px] w-full sm:w-auto"
          >
            {csvFile ? csvFile.name : "Choose CSV File"}
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {btnLoading ? (
            <button
              disabled
              type="submit"
              className="rounded animate-pulse  px-4 py-2 font-semibold shadow cursor-pointer text-center transition-transform duration-200 hover:scale-95 active:scale-90 bg-blue text-white max-w-[200px] w-full sm:w-auto"
            >
              Loading...
            </button>
          ) : (
            <button
              type="submit"
              className="rounded  px-4 py-2 font-semibold shadow cursor-pointer text-center transition-transform duration-200 hover:scale-95 active:scale-90 bg-blue text-white max-w-[200px] w-full sm:w-auto"
            >
              Submit Project
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
