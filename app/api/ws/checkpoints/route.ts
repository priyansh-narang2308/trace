import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return new Response(JSON.stringify({ error: "projectId parameter required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let isConnected = true;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: unknown) => {
        if (!isConnected) return;
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      try {
        const initialCheckpoints = await prisma.checkpoint.findMany({
          where: { projectId },
          orderBy: { createdAt: "desc" },
          take: 20,
        });

        sendEvent({
          type: "INIT_TIMELINE",
          checkpoints: initialCheckpoints,
          timestamp: new Date().toISOString(),
        });

        let lastCheckTime = new Date();

        const pollInterval = setInterval(async () => {
          if (!isConnected) {
            clearInterval(pollInterval);
            return;
          }

          try {
            const newCheckpoints = await prisma.checkpoint.findMany({
              where: {
                projectId,
                createdAt: {
                  gt: lastCheckTime,
                },
              },
              orderBy: { createdAt: "desc" },
            });

            if (newCheckpoints.length > 0) {
              lastCheckTime = new Date();
              sendEvent({
                type: "NEW_CHECKPOINTS",
                checkpoints: newCheckpoints,
                timestamp: new Date().toISOString(),
              });
            } else {
              sendEvent({
                type: "PING",
                timestamp: new Date().toISOString(),
              });
            }
          } catch (err) {
            console.error("Stream polling error:", err);
          }
        }, 3000);

        request.signal.addEventListener("abort", () => {
          isConnected = false;
          clearInterval(pollInterval);
          controller.close();
        });
      } catch (error) {
        console.error("Stream startup error:", error);
        controller.error(error);
      }
    },
    cancel() {
      isConnected = false;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
