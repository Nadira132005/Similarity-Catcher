import LinksList from "./Components/LinksListComponent/LinksList";
import React from "react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center w-full p-0 bg-blueLight">
      <h1 className="mb-10 font-bold text-2xl text-center w-full">AI Tools</h1>
      <LinksList />
    </main>
  );
}
