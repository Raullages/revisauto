import type { Database } from "@/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getBoundingBox, getDistanceInMeters } from "@/lib/geo";

type FuelStationRow = Pick<
  Database["public"]["Tables"]["fuel_stations"]["Row"],
  | "id"
  | "source"
  | "source_id"
  | "name"
  | "brand"
  | "address"
  | "neighborhood"
  | "city"
  | "state"
  | "latitude"
  | "longitude"
  | "products"
  | "validation"
  | "accuracy_estimate"
  | "updated_at"
>;

export async function getNearbyFuelStations(
  supabase: SupabaseClient<Database>,
  latitude: number,
  longitude: number,
  radiusMeters: number,
  limit: number,
) {
  const bounds = getBoundingBox(latitude, longitude, radiusMeters);

  const { data, error } = await supabase
    .from("fuel_stations")
    .select("id, source, source_id, name, brand, address, neighborhood, city, state, latitude, longitude, products, validation, accuracy_estimate, updated_at")
    .gte("latitude", bounds.minLatitude)
    .lte("latitude", bounds.maxLatitude)
    .gte("longitude", bounds.minLongitude)
    .lte("longitude", bounds.maxLongitude)
    .limit(Math.max(limit * 5, 25));

  if (error) {
    throw error;
  }

  return ((data ?? []) as FuelStationRow[])
    .map((station) => ({
      ...station,
      distanceMeters: Math.round(
        getDistanceInMeters(latitude, longitude, station.latitude, station.longitude),
      ),
    }))
    .filter((station) => station.distanceMeters <= radiusMeters)
    .sort((left, right) => left.distanceMeters - right.distanceMeters)
    .slice(0, limit);
}
