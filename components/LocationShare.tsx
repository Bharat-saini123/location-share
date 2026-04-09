"use client";

import { useState, useEffect, useCallback } from "react";
import { Navigation, NavigationOff, Loader2 } from "lucide-react";
import clsx from "clsx";

interface LocationShareProps {
  onLocationUpdate: (lat: number, lng: number, city?: string) => void;
}

export default function LocationShare({ onLocationUpdate }: LocationShareProps) {
  const [sharing, setSharing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

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

  const startSharing = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Aapka browser geolocation support nahi karta");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await updateLocation(pos);
        setLoading(false);
        setSharing(true);

        // Watch for continuous updates
        const id = navigator.geolocation.watchPosition(
          updateLocation,
          () => {},
          { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
        );
        setWatchId(id);
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) setError("Location permission denied kiya");
        else setError("Location nahi mili, dobara try karo");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [updateLocation]);

  const stopSharing = useCallback(async () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setSharing(false);

    await fetch("/api/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        latitude: 0,
        longitude: 0,
        is_sharing: false,
      }),
    });
  }, [watchId]);

  useEffect(() => {
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [watchId]);

  return (
    <div className="px-3 pb-3">
      {error && (
        <p className="text-xs text-red-400 mb-2 px-1">{error}</p>
      )}
      <button
        onClick={sharing ? stopSharing : startSharing}
        disabled={loading}
        className={clsx(
          "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
          sharing
            ? "bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
            : "bg-blue-600 hover:bg-blue-500 text-white border border-transparent"
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : sharing ? (
          <>
            <Navigation className="w-4 h-4" />
            Location share ho rahi hai
          </>
        ) : (
          <>
            <NavigationOff className="w-4 h-4" />
            Apni location share karo
          </>
        )}
      </button>
    </div>
  );
}
