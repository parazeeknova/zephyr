import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SuggestedConnectionsSkeleton = () => {
  return (
    <Card className="bg-card shadow-md">
      <CardHeader>
        <CardTitle className="font-semibold text-muted-foreground text-sm uppercase">
          Suggested Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <li
              key={index}
              className="flex animate-pulse items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded-md bg-muted" />
                  <div className="h-3 w-16 rounded-md bg-muted" />
                </div>
              </div>
              <div className="h-8 w-20 rounded-md bg-muted" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default SuggestedConnectionsSkeleton;
