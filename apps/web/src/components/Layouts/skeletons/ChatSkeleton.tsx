import NavigationCard from "@zephyr-ui/Home/sidebars/left/NavigationCard";
import SuggestedConnections from "@zephyr-ui/Home/sidebars/right/SuggestedConnections";
import StickyFooter from "@zephyr-ui/Layouts/StinkyFooter";

const ChatSkeleton = () => {
  return (
    <main className="flex h-[calc(100vh-4rem)] w-full min-w-0 gap-5 overflow-hidden shadow-sm">
      {/* Left Sidebar */}
      <aside className="sticky top-[5rem] hidden h-full w-72 flex-shrink-0 overflow-y-auto bg-muted md:block">
        <div className="mt-5 mr-2 ml-2">
          <NavigationCard
            isCollapsed={false}
            className="h-[calc(100vh-6rem)]"
            stickyTop="5rem"
          />
        </div>
        <div className="mt-2 mr-2 ml-2">
          <SuggestedConnections />
        </div>
        <div className="mt-4 mr-2 ml-2">
          <StickyFooter />
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="mt-5 mr-2 mb-4 w-full min-w-0 space-y-5 overflow-hidden rounded-2xl border border-border shadow-md">
        <div className="flex h-full animate-pulse">
          {/* Chat Sidebar Skeleton */}
          <div className="w-80 border-border border-r bg-background">
            {/* Search Bar */}
            <div className="border-border border-b p-4">
              <div className="h-10 rounded-md bg-muted" />
            </div>
            {/* Chat List */}
            <div className="space-y-4 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-3 w-32 rounded bg-muted" />
                  </div>
                  <div className="h-2 w-2 rounded-full bg-muted" />
                </div>
              ))}
            </div>
          </div>

          {/* Chat Content Skeleton */}
          <div className="flex flex-1 flex-col">
            {/* Chat Header */}
            <div className="flex items-center space-x-3 border-border border-b p-4">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 space-y-4 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex items-end space-x-2 ${i % 2 === 0 ? "justify-end" : ""}`}
                >
                  {i % 2 !== 0 && (
                    <div className="h-8 w-8 rounded-full bg-muted" />
                  )}
                  <div
                    className={`space-y-2 ${i % 2 === 0 ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`h-4 w-48 rounded bg-muted ${i % 2 === 0 ? "ml-auto" : ""}`}
                    />
                    <div
                      className={`h-4 w-32 rounded bg-muted ${i % 2 === 0 ? "ml-auto" : ""}`}
                    />
                  </div>
                  {i % 2 === 0 && (
                    <div className="h-8 w-8 rounded-full bg-muted" />
                  )}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="border-border border-t p-4">
              <div className="flex items-center space-x-2">
                <div className="h-10 flex-1 rounded-md bg-muted" />
                <div className="h-10 w-10 rounded-md bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ChatSkeleton;
