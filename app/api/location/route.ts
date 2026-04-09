import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { supabaseAdmin } from "@/lib/supabase";
import { pusherServer, CHANNEL, EVENT_LOCATION_UPDATE } from "@/lib/pusher";

// GET /api/location — fetch all friends' locations
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("locations")
    .select("*, users(name, email, image)")
    .eq("is_sharing", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const locations = (data || []).map((row: Record<string, unknown>) => ({
    id: row.user_id as string,
    user_id: row.user_id as string,
    name: (row.users as Record<string, string>)?.name || "Unknown",
    email: (row.users as Record<string, string>)?.email || "",
    image: (row.users as Record<string, string>)?.image || null,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    city: row.city as string | null,
    updated_at: row.updated_at as string,
    is_sharing: row.is_sharing as boolean,
  }));

  return NextResponse.json(locations);
}

// POST /api/location — update your own location
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { latitude, longitude, city, is_sharing } = body;

  const userId = (session.user as { id: string }).id;

  const { error } = await supabaseAdmin.from("locations").upsert(
    {
      user_id: userId,
      latitude,
      longitude,
      city: city || null,
      is_sharing: is_sharing ?? true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Broadcast real-time update to all connected clients via Pusher
  await pusherServer.trigger(CHANNEL, EVENT_LOCATION_UPDATE, {
    user_id: userId,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    latitude,
    longitude,
    city: city || null,
    is_sharing: is_sharing ?? true,
    updated_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
