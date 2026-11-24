import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-slate-500">The page you're looking for doesn't exist.</p>
      <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">Go to dashboard</Link>
    </div>
  );
}
