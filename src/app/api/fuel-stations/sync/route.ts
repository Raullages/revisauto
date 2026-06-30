import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAndNormalizeAnpFuelStationsPage } from "@/lib/anp/fuel-stations";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const page = Number(body?.page ?? 1);

  if (!Number.isInteger(page) || page < 1) {
    return NextResponse.json({ error: "Página inválida" }, { status: 400 });
  }

  try {
    const result = await fetchAndNormalizeAnpFuelStationsPage(page);

    if (!result.stations.length) {
      return NextResponse.json({ synced: 0, page, totalPages: result.totalPages, totalRecords: result.totalRecords });
    }

    const { error } = await supabase
      .from("fuel_stations")
      .upsert(result.stations, { onConflict: "source,source_id", ignoreDuplicates: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      synced: result.stations.length,
      page,
      totalPages: result.totalPages,
      totalRecords: result.totalRecords,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao sincronizar postos da ANP" },
      { status: 500 },
    );
  }
}
