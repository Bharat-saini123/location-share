"use client";

import Image from "next/image";
import { MapPin, X, Navigation } from "lucide-react";
import type { FriendLocation } from "@/types";

interface FriendDetailProps {
  friend: FriendLocation;
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

export default function FriendDetail({ friend, onClose }: FriendDetailProps) {
  const mapsUrl = `https://www.google.com/maps?q=${friend.latitude},${friend.longitude}`;

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-2rem)] sm:w-80">
      <div className="bg-slate-900/95 backdrop-blur border border-slate-700 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {friend.image ? (
              <Image
                src={friend.image}
                alt={friend.name}
                width={44}
                height={44}
                className="rounded-full"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-blue-900/60 border border-blue-700 flex items-center justify-center text-blue-300 font-semibold">
                {friend.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-slate-900" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{friend.name}</p>
            <p className="text-slate-400 text-xs truncate">{friend.email}</p>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Location */}
        <div className="mt-3 bg-slate-800/60 rounded-xl p-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-sm font-medium truncate">
              {friend.city || "Location shared"}
            </p>
            <p className="text-slate-500 text-xs">
              {friend.latitude.toFixed(4)}, {friend.longitude.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Updated at */}
        <p className="text-slate-600 text-xs mt-2 text-center">
          Last update: {timeAgo(friend.updated_at)}
        </p>

        {/* Open in Maps */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-xl transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          View on Google Maps
        </a>
      </div>
    </div>
  );
}
