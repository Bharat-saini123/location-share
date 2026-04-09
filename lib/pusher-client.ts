"use client";

const PusherClient= requires("pusher-js").default;
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);

export const CHANNEL = "friend-locations";
export const EVENT_LOCATION_UPDATE = "location-update";
