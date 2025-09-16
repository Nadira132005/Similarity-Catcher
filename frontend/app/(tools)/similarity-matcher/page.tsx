import React from "react";
import { getProjects } from "../../../api/similarityMatcher";
import SimilarityMatcher from "../../Components/SimilarityMatcher";

export default async function SimilarityMatcherPage() {
  const projectsData = await getProjects();
  const projects = projectsData.projects || [];

  return <SimilarityMatcher projects={projects} />;
}
