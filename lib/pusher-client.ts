"use client";

import PusherClient from "pusher-js";

export const pusherClient =
  typeof window !== "undefined"
    ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      })
    : (null as unknown as PusherClient);

export const CHANNEL = "friend-locations";
export const EVENT_LOCATION_UPDATE = "location-update";
