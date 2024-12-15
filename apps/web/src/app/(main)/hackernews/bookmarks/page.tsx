import { HNBookmarkedStories } from "@zephyr/ui";

export default function HNBookmarksPage() {
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="mb-8 font-bold text-2xl">Bookmarked HN Stories</h1>
      <HNBookmarkedStories />
    </div>
  );
}
