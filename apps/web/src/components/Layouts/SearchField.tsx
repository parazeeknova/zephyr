"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";

export default function SearchField() {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.q as HTMLInputElement).value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  // Progressive enhancement: use the browser's native search form
  // if JavaScript is disabled. The form will still work as expected.
  return (
    <form onSubmit={handleSubmit} method="GET" action="/search">
      <div className="relative">
        <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-2 h-4 w-4 transform text-gray-400" />
        <Input
          type="search"
          name="q"
          placeholder="Search..."
          className="rounded-full bg-muted py-1 pr-4 pl-8 text-muted-foreground text-sm"
        />
      </div>
    </form>
  );
}
