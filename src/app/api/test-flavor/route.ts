import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ status: "ok", method: "GET" });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { humor_flavor_id, image_id } = body;

  if (!humor_flavor_id || !image_id) {
    return NextResponse.json({ error: "humor_flavor_id and image_id are required" }, { status: 400 });
  }

  try {
    // Get the user's session token to pass to the API
    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch("https://api.almostcrackd.ai/caption-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({
        humor_flavor_id,
        image_id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error || data.message || "API request failed" },
        { status: res.status }
      );
    }

    // Try to extract captions from the response
    const captions = data.captions || data.caption || data.results || data;

    return NextResponse.json({
      captions: Array.isArray(captions) ? captions : [captions],
      raw: data,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to call API" },
      { status: 500 }
    );
  }
}
