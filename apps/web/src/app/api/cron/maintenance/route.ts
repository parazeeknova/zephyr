import { NextResponse } from "next/server";

const CRON_SECRET = process.env.CRON_SECRET;

async function runMaintenanceTasks() {
  try {
    // Run all maintenance tasks in sequence
    const tasks = [
      { path: "/api/cron/clear-uploads" },
      { path: "/api/cron/cleanup-media" },
      { path: "/api/cron/cleanup-unverified" },
      { path: "/api/cron/cleanup-reset-tokens" }
    ];

    for (const task of tasks) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}${task.path}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${CRON_SECRET}`
            }
          }
        );

        if (response.ok) {
          console.log(`Successfully completed task: ${task.path}`);
        } else {
          console.error(
            `Failed to run task ${task.path}:`,
            await response.text()
          );
        }
      } catch (error) {
        console.error(`Error running task ${task.path}:`, error);
        // Continue with other tasks even if one fails
      }
    }

    return { success: true, message: "All maintenance tasks completed" };
  } catch (error) {
    console.error("Error in maintenance tasks:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    // Verify the request is authorized
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await runMaintenanceTasks();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Maintenance route error:", error);
    return NextResponse.json(
      { error: "Failed to run maintenance tasks" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "edge";
