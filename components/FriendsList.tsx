"use client";

import Image from "next/image";
import { MapPin, Clock, WifiOff } from "lucide-react";
import type { FriendLocation } from "@/types";
import clsx from "clsx";

interface FriendsListProps {
  friends: FriendLocation[];
  selectedFriend: string | null;
  onSelect: (id: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Abhi abhi";
  if (mins < 60) return `${mins} min pehle`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ghante pehle`;
  return `${Math.floor(hrs / 24)} din pehle`;
}

function isOnline(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 10 * 60 * 1000; // 10 mins
}

export default function FriendsList({
  friends,
  selectedFriend,
  onSelect,
}: FriendsListProps) {
  const online = friends.filter((f) => isOnline(f.updated_at));
  const offline = friends.filter((f) => !isOnline(f.updated_at));

  const FriendRow = ({ friend }: { friend: FriendLocation }) => {
    const active = selectedFriend === friend.user_id;
    const online = isOnline(friend.updated_at);

    return (
      <button
        onClick={() => onSelect(friend.user_id)}
        className={clsx(
          "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-100 border-l-2",
          active
            ? "bg-blue-500/10 border-blue-500"
            : "border-transparent hover:bg-slate-800/50"
        )}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {friend.image ? (
            <Image
              src={friend.image}
              alt={friend.name}
              width={36}
              height={36}
              className="rounded-full"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-900/50 border border-blue-800 flex items-center justify-center text-blue-300 text-xs font-semibold">
              {friend.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <span
            className={clsx(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900",
              online ? "bg-green-400" : "bg-slate-500"
            )}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">
            {friend.name}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
            <span className="text-xs text-slate-500 truncate">
              {friend.city || `${friend.latitude.toFixed(2)}, ${friend.longitude.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {online ? (
            <Clock className="w-3 h-3 text-green-500" />
          ) : (
            <WifiOff className="w-3 h-3 text-slate-600" />
          )}
          <span className={clsx("text-xs", online ? "text-green-500" : "text-slate-600")}>
            {timeAgo(friend.updated_at)}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {online.length > 0 && (
        <div>
          <p className="px-4 pt-3 pb-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
            Online — {online.length}
          </p>
          {online.map((f) => (
            <FriendRow key={f.user_id} friend={f} />
          ))}
        </div>
      )}
      {offline.length > 0 && (
        <div className="mt-2">
          <p className="px-4 pt-3 pb-1.5 text-xs font-medium text-slate-600 uppercase tracking-wider">
            Offline — {offline.length}
          </p>
          {offline.map((f) => (
            <FriendRow key={f.user_id} friend={f} />
          ))}
        </div>
      )}
      {friends.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-slate-600 text-sm">
          <MapPin className="w-8 h-8 mb-2 opacity-40" />
          <p>Koi friend online nahi hai</p>
        </div>
      )}
    </div>
  );
}
