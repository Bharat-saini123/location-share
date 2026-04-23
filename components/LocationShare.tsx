"use client";

import { useState, useEffect, useCallback } from "react";
import { Navigation, NavigationOff, Loader2, Radio } from "lucide-react";
import clsx from "clsx";

interface LocationShareProps {
  onLocationUpdate: (lat: number, lng: number, city?: string) => void;
}

type ShareMode = "none" | "normal" | "live";

export default function LocationShare({ onLocationUpdate }: LocationShareProps) {
  const [shareMode, setShareMode] = useState<ShareMode>("none");
  const [loadingMode, setLoadingMode] = useState<ShareMode>("none");
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  const getCityName = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      return (
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.state ||
        "Unknown"
      );
    } catch {
      return "Unknown";
    }
  };

  const updateLocation = useCallback(
    async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const city = await getCityName(latitude, longitude);

      await fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude, city, is_sharing: true }),
      });

      onLocationUpdate(latitude, longitude, city);
    },
    [onLocationUpdate]
  );

  const startSharing = useCallback(
    (mode: ShareMode) => {
      if (!navigator.geolocation) {
        setError("Your browser does not support geolocation");
        return;
      }

      setLoadingMode(mode);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await updateLocation(pos);
          setLoadingMode("none");
          setShareMode(mode);

          if (mode === "normal") {
            const id = navigator.geolocation.watchPosition(
              updateLocation,
              () => {},
              { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
            );
            setWatchId(id);
          } else if (mode === "live") {
            const id = window.setInterval(() => {
              navigator.geolocation.getCurrentPosition(
                (newPos) => updateLocation(newPos),
                () => {},
                { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
              );
            }, 5000);
            setIntervalId(id);
          }
        },
        (err) => {
          setLoadingMode("none");
          if (err.code === 1) setError("Location permission was denied");
          else setError("Location not found, try again");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    },
    [updateLocation]
  );

  const stopSharing = useCallback(async () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      setIntervalId(null);
    }
    setShareMode("none");

    await fetch("/api/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        latitude: 0,
        longitude: 0,
        is_sharing: false,
      }),
    });
  }, [watchId, intervalId]);

  useEffect(() => {
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, [watchId, intervalId]);

  return (
    <div className="px-3 pb-3 space-y-2">
      {error && <p className="text-xs text-red-400 mb-2 px-1">{error}</p>}
      <button
        onClick={() => (shareMode === "normal" ? stopSharing() : startSharing("normal"))}
        disabled={loadingMode !== "none" || shareMode === "live"}
        className={clsx(
          "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
          shareMode === "normal"
            ? "bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
            : "bg-blue-600 hover:bg-blue-500 text-white border border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {loadingMode === "normal" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : shareMode === "normal" ? (
          <>
            <Navigation className="w-4 h-4" />
            Sharing location
          </>
        ) : (
          <>
            <NavigationOff className="w-4 h-4" />
            Share Location
          </>
        )}
      </button>
      <button
        onClick={() => (shareMode === "live" ? stopSharing() : startSharing("live"))}
        disabled={loadingMode !== "none" || shareMode === "normal"}
        className={clsx(
          "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
          shareMode === "live"
            ? "bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
            : "bg-indigo-600 hover:bg-indigo-500 text-white border border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {loadingMode === "live" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : shareMode === "live" ? (
          <>
            <Radio className="w-4 h-4 animate-pulse" />
            Live Tracking (5s)
          </>
        ) : (
          <>
            <Radio className="w-4 h-4" />
            Live Location Tracker
          </>
        )}
      </button>
    </div>
  );
}
