
import { useEffect, useRef } from "react";
import type { FriendLocation } from "@/types";

interface MapProps {
  friends: FriendLocation[];
  myLocation: { latitude: number; longitude: number } | null;
  selectedFriend: string | null;
  onFriendClick: (id: string) => void;
}

export default function Map({
  friends,
  myLocation,
  selectedFriend,
  onFriendClick,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMap = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Record<string, any>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myMarkerRef = useRef<any>(null);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    import("leaflet").then((L) => {
      const map = L.map(mapRef.current!, {
        center: [20.5937, 78.9629], // India center
        zoom: 5,
        zoomControl: false,
      });

      // Colorful tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: "© OpenStreetMap © CARTO",
          maxZoom: 19,
        }
      ).addTo(map);

      // Custom zoom control position
      L.control.zoom({ position: "bottomright" }).addTo(map);

      leafletMap.current = map;
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update friend markers
  useEffect(() => {
    if (!leafletMap.current) return;

    import("leaflet").then((L) => {
      // Remove old markers
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};

      friends.forEach((friend) => {
        const initials = friend.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        const isSelected = selectedFriend === friend.user_id;

        const html = `
          <div style="
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          ">
            ${isSelected
            ? `<div style="
                position: absolute;
                width: 56px; height: 56px;
                background: rgba(59,130,246,0.25);
                border-radius: 50%;
                top: -8px; left: -8px;
                animation: ping-dot 1.5s ease-in-out infinite;
              "></div>`
            : ""
          }
            <div style="
              width: 40px; height: 40px;
              background: ${isSelected ? "#3b82f6" : "#1e40af"};
              border: 2.5px solid ${isSelected ? "#93c5fd" : "#3b82f6"};
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            ">
              <span style="
                transform: rotate(45deg);
                color: white;
                font-size: 12px;
                font-weight: 600;
                font-family: system-ui;
              ">${initials}</span>
            </div>
            <div style="
              margin-top: 4px;
              background: rgba(15,23,42,0.9);
              color: #e2e8f0;
              padding: 2px 8px;
              border-radius: 20px;
              font-size: 11px;
              font-family: system-ui;
              white-space: nowrap;
              border: 1px solid rgba(100,116,139,0.4);
            ">${friend.name.split(" ")[0]}</div>
          </div>
        `;

        const icon = L.divIcon({
          html,
          className: "",
          iconSize: [40, 55],
          iconAnchor: [20, 40],
        });

        const marker = L.marker([friend.latitude, friend.longitude], { icon })
          .addTo(leafletMap.current)
          .on("click", () => onFriendClick(friend.user_id));

        markersRef.current[friend.user_id] = marker;
      });
    });
  }, [friends, selectedFriend, onFriendClick]);

  // Update "my location" marker
  useEffect(() => {
    if (!leafletMap.current || !myLocation) return;

    import("leaflet").then((L) => {
      if (myMarkerRef.current) myMarkerRef.current.remove();

      const html = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute;
            width: 48px; height: 48px;
            background: rgba(34,197,94,0.2);
            border-radius: 50%;
            animation: ping-dot 2s ease-in-out infinite;
          "></div>
          <div style="
            width: 16px; height: 16px;
            background: #22c55e;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 12px rgba(34,197,94,0.6);
            position: relative; z-index: 1;
          "></div>
        </div>
      `;

      const icon = L.divIcon({
        html,
        className: "",
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      });

      myMarkerRef.current = L.marker(
        [myLocation.latitude, myLocation.longitude],
        { icon }
      )
        .addTo(leafletMap.current)
        .bindPopup("you are on here");
    });
  }, [myLocation]);

  // Fly to selected friend
  useEffect(() => {
    if (!leafletMap.current || !selectedFriend) return;
    const friend = friends.find((f) => f.user_id === selectedFriend);
    if (friend) {
      leafletMap.current.flyTo([friend.latitude, friend.longitude], 12, {
        duration: 1.2,
      });
    }
  }, [selectedFriend, friends]);

  return <div ref={mapRef} className="w-full h-full" />;
}
