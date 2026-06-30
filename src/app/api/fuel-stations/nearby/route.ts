import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getNearbyFuelStations } from "@/lib/fuel-stations";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latitude = Number(url.searchParams.get("lat"));
  const longitude = Number(url.searchParams.get("lng"));
  const radiusMeters = Number(url.searchParams.get("radiusMeters") ?? 150);
  const limit = Number(url.searchParams.get("limit") ?? 10);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: "Latitude e longitude são obrigatórias" }, { status: 400 });
  }

  if (!Number.isFinite(radiusMeters) || radiusMeters <= 0) {
    return NextResponse.json({ error: "Raio inválido" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const nearbyStations = await getNearbyFuelStations(
      supabase,
      latitude,
      longitude,
      radiusMeters,
      limit,
    );

    return NextResponse.json({
      stations: nearbyStations,
      count: nearbyStations.length,
      radiusMeters,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao buscar postos próximos" },
      { status: 500 },
    );
  }
}
