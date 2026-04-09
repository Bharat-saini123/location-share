"use client";

// Client-side only — real-time updates sunne ke liye
import PusherClient from "pusher-js";

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);

export const CHANNEL = "friend-locations";
export const EVENT_LOCATION_UPDATE = "location-update";
