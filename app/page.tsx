"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Users, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import FriendsList from "@/components/FriendsList";
import FriendDetail from "@/components/FriendDetail";
import LocationShare from "@/components/LocationShare";
import type { FriendLocation } from "@/types";
import { pusherClient, CHANNEL, EVENT_LOCATION_UPDATE } from "@/lib/pusher-client";

// Leaflet must be loaded client-side only (no SSR)
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [friends, setFriends] = useState<FriendLocation[]>([]);
  const [myLocation, setMyLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Fetch all friends' locations
  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch("/api/location");
      if (!res.ok) return;
      const data: FriendLocation[] = await res.json();
      // Filter out self
      const myId = (session?.user as { id?: string })?.id;
      setFriends(data.filter((f) => f.user_id !== myId));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) fetchLocations();
  }, [session, fetchLocations]);

  // Real-time updates via Pusher
  useEffect(() => {
    const channel = pusherClient.subscribe(CHANNEL);

    channel.bind(EVENT_LOCATION_UPDATE, (data: FriendLocation) => {
      const myId = (session?.user as { id?: string })?.id;
      if (data.user_id === myId) return;

      setFriends((prev) => {
        const exists = prev.findIndex((f) => f.user_id === data.user_id);
        if (!data.is_sharing) {
          return prev.filter((f) => f.user_id !== data.user_id);
        }
        if (exists >= 0) {
          const updated = [...prev];
          updated[exists] = data;
          return updated;
        }
        return [...prev, data];
      });
    });

    return () => {
      pusherClient.unsubscribe(CHANNEL);
    };
  }, [session]);

  const handleMyLocation = useCallback(
    (lat: number, lng: number) => {
      setMyLocation({ latitude: lat, longitude: lng });
    },
    []
  );

  const handleFriendSelect = useCallback((id: string) => {
    setSelectedFriend((prev) => (prev === id ? null : id));
  }, []);

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Map load ho raha hai...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const selectedFriendData = friends.find((f) => f.user_id === selectedFriend);

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      <Navbar />

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside
          className={`
            flex flex-col bg-slate-900 border-r border-slate-800
            transition-all duration-300 ease-in-out flex-shrink-0
            ${sidebarOpen ? "w-72" : "w-0 overflow-hidden"}
          `}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-slate-200 text-sm font-medium">
                Friends
              </span>
              <span className="bg-blue-900/60 text-blue-300 text-xs px-1.5 py-0.5 rounded-full">
                {friends.length}
              </span>
            </div>
            <button
              onClick={fetchLocations}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <FriendsList
            friends={friends}
            selectedFriend={selectedFriend}
            onSelect={handleFriendSelect}
          />

          <div className="border-t border-slate-800 pt-2">
            <LocationShare onLocationUpdate={handleMyLocation} />
          </div>
        </aside>

        {/* Map area */}
        <main className="flex-1 relative min-w-0">
          {/* Toggle sidebar button */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="absolute top-3 left-3 z-[1000] bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white p-2 rounded-xl transition-colors backdrop-blur"
            title={sidebarOpen ? "Sidebar band karo" : "Sidebar kholo"}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  sidebarOpen
                    ? "M11 19l-7-7 7-7M18 19l-7-7 7-7"
                    : "M13 5l7 7-7 7M6 5l7 7-7 7"
                }
              />
            </svg>
          </button>

          {/* Stats badge */}
          <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-1.5 flex items-center gap-2 backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-slate-300 text-xs">
              {friends.filter(
                (f) => Date.now() - new Date(f.updated_at).getTime() < 600000
              ).length}{" "}
              online
            </span>
          </div>

          <Map
            friends={friends}
            myLocation={myLocation}
            selectedFriend={selectedFriend}
            onFriendClick={handleFriendSelect}
          />

          {/* Friend detail popup */}
          {selectedFriendData && (
            <FriendDetail
              friend={selectedFriendData}
              onClose={() => setSelectedFriend(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
