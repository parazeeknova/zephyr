import { NextResponse } from "next/server";

const CRON_SECRET = process.env.CRON_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_URL;

async function runMaintenanceTasks() {
  const logs: string[] = [];
  const taskResults: Record<string, any> = {};

  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  try {
    log("🚀 Starting maintenance tasks...");

    const tasks = [
      {
        path: "/api/cron/clear-uploads",
        name: "Clear Uploads"
      },
      {
        path: "/api/cron/cleanup-media",
        name: "Cleanup Media"
      },
      {
        path: "/api/cron/cleanup-unverified",
        name: "Cleanup Unverified Users"
      },
      {
        path: "/api/cron/cleanup-reset-tokens",
        name: "Cleanup Reset Tokens"
      }
    ];

    for (const task of tasks) {
      try {
        log(`⏳ Starting ${task.name}...`);

        const response = await fetch(`${BASE_URL}${task.path}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${CRON_SECRET}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          taskResults[task.name] = result;

          // Log specific success messages based on task
          switch (task.path) {
            case "/api/cron/clear-uploads":
              log(
                `✅ ${task.name} completed: ${result.deleted || 0} uploads cleared`
              );
              break;
            case "/api/cron/cleanup-media":
              log(
                `✅ ${task.name} completed: ${result.deleted || 0} media files cleaned up`
              );
              break;
            case "/api/cron/cleanup-unverified":
              log(
                `✅ ${task.name} completed: ${result.deletedCount || 0} unverified users removed`
              );
              break;
            case "/api/cron/cleanup-reset-tokens":
              log(
                `✅ ${task.name} completed: ${result.deletedCount || 0} expired tokens removed`
              );
              break;
            default:
              log(`✅ ${task.name} completed successfully`);
          }
        } else {
          const errorText = await response.text();
          log(`❌ Failed to run ${task.name}: ${errorText}`);
          taskResults[task.name] = {
            error: errorText,
            status: response.status
          };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        log(`❌ Error in ${task.name}: ${errorMessage}`);
        taskResults[task.name] = { error: errorMessage };
        // Continue with other tasks even if one fails
      }
    }

    const successCount = Object.values(taskResults).filter(
      (r) => !r.error
    ).length;
    const failureCount = tasks.length - successCount;

    const summary = {
      success: true,
      message: "Maintenance tasks completed",
      tasksRun: tasks.length,
      successful: successCount,
      failed: failureCount,
      results: taskResults,
      logs,
      timestamp: new Date().toISOString()
    };

    log(`
🏁 Maintenance Summary:
- Total Tasks: ${tasks.length}
- Successful: ${successCount}
- Failed: ${failureCount}
- Completed at: ${new Date().toLocaleString()}
    `);

    return summary;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`❌ Fatal error in maintenance tasks: ${errorMessage}`);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    // Verify the request is authorized
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    if (!CRON_SECRET) {
      return NextResponse.json(
        {
          error: "CRON_SECRET not configured",
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    const result = await runMaintenanceTasks();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Maintenance route error:", error);
    return NextResponse.json(
      {
        error: "Failed to run maintenance tasks",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
