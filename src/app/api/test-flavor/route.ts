import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const API_BASE = "https://api.almostcrackd.ai";

export async function GET() {
  return NextResponse.json({ status: "ok", method: "GET" });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const token = session.access_token;
  const { humor_flavor_id, image_id } = await req.json();

  if (!humor_flavor_id || !image_id) {
    return NextResponse.json({ error: "humor_flavor_id and image_id are required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE}/pipeline/generate-captions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageId: image_id,
        humorFlavorId: humor_flavor_id,
      }),
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: `API returned non-JSON (${res.status}): ${text.slice(0, 500)}` },
        { status: 502 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || data.message || data.detail || `API returned ${res.status}: ${text.slice(0, 500)}` },
        { status: res.status }
      );
    }

    const captions = data.captions || data.caption || data.results || data;

    return NextResponse.json({
      captions: Array.isArray(captions) ? captions : [captions],
      raw: data,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? `${err.name}: ${err.message}` : "Failed to call API" },
      { status: 500 }
    );
  }
}
