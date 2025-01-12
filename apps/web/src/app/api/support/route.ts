import { rateLimitMiddleware } from "@/lib/rate-limiter";
import { NextResponse } from "next/server";
import { Unsend } from "unsend";

const unsend = new Unsend(
  process.env.UNSEND_API_KEY,
  "https://mails.zephyyrr.in"
);

const SENDER = "zephyyrr.in";

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const identifier = (forwardedFor?.split(",")[0] || "unknown").trim();

    const rateLimitResponse = await rateLimitMiddleware(
      request,
      identifier,
      5,
      3600000
    );
    if (rateLimitResponse) return rateLimitResponse;

    const {
      email,
      type,
      subject,
      message,
      priority,
      attachments,
      category,
      os,
      browser
    } = await request.json();

    const attachmentsList = attachments?.length
      ? `<h3>Attachments:</h3>
         <ul>
           ${attachments
             .map(
               (att: any) => `
             <li>
               <a href="${att.url}" target="_blank">${att.originalName}</a> 
               (${(att.size / 1024).toFixed(2)} KB)
             </li>
           `
             )
             .join("")}
         </ul>`
      : "";

    await unsend.emails.send({
      from: `Zephyr Support <no-reply@${SENDER}>`,
      to: process.env.SUPPORT_EMAIL || "",
      subject: `[Zephyr Support - ${type}] ${subject}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Priority:</strong> ${priority}</p>
        <p><strong>Environment:</strong></p>
        <ul>
          <li>OS: ${os}</li>
          <li>Browser: ${browser}</li>
        </ul>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, "<br>")}</p>
        ${attachmentsList}
        <hr>
        <p style="color: #666; font-size: 12px;">
          This support request was sent via the Zephyr Support System
        </p>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Support form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
