import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex items-center justify-center h-screen  bg-blueLight text-Text">
      <div>
        <p className="text-blue text-6xl font-bold">404</p>
        <h1 className="text-5xl font-bold">Page not found</h1>
        <p className="mt-3">
          Sorry, we couldn't find the page you're looking for.
        </p>

        <div className="flex gap-5 mt-4 w-full justify-center items-center">
          <Link
            className="bg-blue p-2 rounded-md text-white w-full text-center transition-transform duration-200 hover:scale-95 active:scale-90"
            href={"/"}
          >
            Go back home
          </Link>
        </div>
      </div>
    </main>
  );
}
