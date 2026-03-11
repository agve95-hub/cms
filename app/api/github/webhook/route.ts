import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { pullFromRemote } from "@/lib/github/pull";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });

  const body = await req.text();
  const signature = req.headers.get("x-hub-signature-256");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 401 });

  const expected = `sha256=${crypto.createHmac("sha256", secret).update(body).digest("hex")}`;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    logger.warn("Invalid webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (process.env.GITHUB_PULL_AUTO === "true") {
    const result = await pullFromRemote();
    return NextResponse.json(result);
  }

  return NextResponse.json({ message: "Webhook received, auto-pull disabled" });
}
