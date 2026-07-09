"use client";

import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { requestCurrentPosition } from "@/lib/mobile/reminder";

type Station = {
  id: string;
  name: string;
  brand: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  products: unknown;
};

type NearbyResponse = {
  stations: Station[];
  count: number;
  radiusMeters: number;
};

type UserLocation = {
  latitude: number;
  longitude: number;
};

function getMapsUrl(latitude: number, longitude: number, origin: UserLocation | null) {
  const destination = `${latitude},${longitude}`;

  if (!origin) {
    return `https://www.google.com/maps/search/?api=1&query=${destination}`;
  }

  return `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination}`;
}

type ViewState =
  | { type: "loading" }
  | { type: "location-denied" }
  | { type: "error"; message: string }
  | { type: "empty" }
  | { type: "stations"; stations: Station[] };

export default function NearbyFuelStationsPage() {
  const [view, setView] = useState<ViewState>({ type: "loading" });
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const position = await requestCurrentPosition();

        if (!active) {
          return;
        }

        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        const response = await fetch(
          `/api/fuel-stations/nearby?lat=${position.coords.latitude}&lng=${position.coords.longitude}&radiusMeters=5000&limit=10`,
        );

        if (!active) {
          return;
        }

        if (!response.ok) {
          setView({ type: "error", message: "Erro ao buscar postos próximos." });
          return;
        }

        const payload = (await response.json()) as NearbyResponse;

        if (!active) {
          return;
        }

        if (payload.stations.length === 0) {
          setView({ type: "empty" });
          return;
        }

        setView({ type: "stations", stations: payload.stations });
      } catch {
        if (!active) {
          return;
        }

        setView({ type: "location-denied" });
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (view.type === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (view.type === "location-denied") {
    return (
      <EmptyState
        title="Localização indisponível"
        description="Permita o acesso à localização para encontrar os postos mais próximos de você."
      />
    );
  }

  if (view.type === "error") {
    return (
      <EmptyState
        title="Erro ao buscar postos"
        description={view.message}
      />
    );
  }

  if (view.type === "empty") {
    return (
      <EmptyState
        title="Nenhum posto encontrado"
        description="Não encontramos postos próximos à sua localização."
      />
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Postos próximos
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        10 postos mais próximos da sua localização atual
      </p>

      <div className="mt-4 space-y-3">
        {view.stations.map((station) => (
          <div
            key={station.id}
            className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {station.name}
                </h3>
                {station.brand && (
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {station.brand}
                  </p>
                )}
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {[station.address, station.neighborhood, station.city]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <a
                  href={getMapsUrl(station.latitude, station.longitude, userLocation)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Ir
                </a>
              </div>
              <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {station.distanceMeters < 1000
                  ? `${Math.round(station.distanceMeters)} m`
                  : `${(station.distanceMeters / 1000).toFixed(1)} km`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
