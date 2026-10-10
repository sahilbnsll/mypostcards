"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { updateTag } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import { VISITOR_CARDS_TAG } from "@/content/visitors";
import { LIMITS, isCardColor, isKind, sanitizeDrawing } from "@/content/visitors-shared";

export interface CardFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

const MIN_WRITING_MS = 2500;
const LINKS = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ru|cn|xyz|top|shop|site|online|link)\b)/i;

const text = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
};

/** A fingerprint that changes every day: enough to limit spam, useless for following anyone. */
async function visitorHash(): Promise<string | null> {
  const requestHeaders = await headers();
  const ip = (requestHeaders.get("x-forwarded-for")?.split(",")[0] ?? requestHeaders.get("x-real-ip") ?? "").trim();
  if (!ip) return null;
  const today = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${process.env.VISITOR_SALT ?? "my-postcards"}|${ip}|${today}`).digest("hex");
}

/**
 * Receives a card from the guest desk form. Everything is checked again here and again in the
 * database; the form's own limits are only a courtesy. A valid card goes on the wall straight away
 * (there is no approval step); the owner can hide one later in the Supabase dashboard.
 */
export async function submitVisitorCard(_previous: CardFormState, formData: FormData): Promise<CardFormState> {
  // A hidden field only a script would fill in: pretend it worked and drop it.
  if (text(formData, "website")) return { status: "success" };

  const elapsed = Number(text(formData, "elapsed"));
  if (!Number.isFinite(elapsed) || elapsed < MIN_WRITING_MS) {
    return { status: "error", message: "That was quick. Take a moment, then send it again." };
  }

  const kind = text(formData, "kind");
  const color = text(formData, "color") || "paper";
  if (!isKind(kind) || !isCardColor(color)) return { status: "error", message: "Something about that card looks off. Please try again." };

  const name = text(formData, "name").trim();
  const message = text(formData, "message").trim();
  if (name.length > LIMITS.name) return { status: "error", message: `Names can be up to ${LIMITS.name} characters.` };
  if (message.length > LIMITS.message) return { status: "error", message: `Messages can be up to ${LIMITS.message} characters.` };

  let drawing = [] as ReturnType<typeof sanitizeDrawing>;
  const rawDrawing = text(formData, "drawing");
  if (rawDrawing) {
    if (rawDrawing.length > 60_000) return { status: "error", message: "That drawing is too big. Try a simpler one." };
    try {
      drawing = sanitizeDrawing(JSON.parse(rawDrawing));
    } catch {
      return { status: "error", message: "The drawing could not be read. Please try drawing it again." };
    }
  }

  if (!message && drawing.length === 0) return { status: "error", message: "Write something or draw something first." };
  if (LINKS.test(name) || LINKS.test(message)) return { status: "error", message: "Please leave links out of your card." };

  const supabase = getSupabase();
  if (!supabase) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[my-postcards] SUPABASE_URL or SUPABASE_ANON_KEY is missing. Fill them in .env.local and restart npm run dev.");
    }
    return { status: "error", message: "The guest desk is closed right now. Please come back later." };
  }

  const { error } = await supabase.rpc("submit_visitor_card", {
    p_kind: kind,
    p_name: name || null,
    p_message: message || null,
    p_drawing: drawing.length > 0 ? drawing : null,
    p_color: color,
    p_ip_hash: await visitorHash(),
  });

  if (error) {
    if (error.message.includes("rate_limited")) return { status: "error", message: "You have sent a few cards already. Please try again later." };
    if (error.message.includes("busy")) return { status: "error", message: "The desk is busy right now. Please try again in a little while." };
    console.warn(`[my-postcards] Could not save a visitor card: ${error.message}`);
    return { status: "error", message: "Your card could not be sent. Please try again in a moment." };
  }

  // Expire the cached wall so the new card shows up right away, for the sender and for everyone.
  updateTag(VISITOR_CARDS_TAG);
  return { status: "success" };
}
