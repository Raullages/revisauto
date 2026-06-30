import type { Json } from "@/types/supabase";

const ANP_FUEL_STATIONS_URL = "https://revendedoresapi.anp.gov.br/v1/combustivel";

type AnpFuelStationProduct = {
  produto: string;
  tancagem?: number;
  unidMedidaTancagem?: string;
  qtdeBicos?: number;
};

type AnpFuelStationRecord = {
  codigoSIMP: string;
  razaoSocial: string;
  cnpj?: string;
  endereco?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  uf?: string;
  municipio?: string;
  distribuidora?: string;
  latitude?: string;
  longitude?: string;
  produtos?: AnpFuelStationProduct[];
  validacao?: string;
  estimativaAcuracia?: string;
  dataObtencao?: string;
};

type AnpFuelStationsResponse = {
  data?: AnpFuelStationRecord[];
  searchPageFilter?: {
    numeroPagina?: number;
    tamanhoPagina?: number;
    totalRegistro?: number;
    totalPagina?: number;
  };
};

export type FuelStationUpsert = {
  source: "anp";
  source_id: string;
  name: string;
  brand: string | null;
  cnpj: string | null;
  address: string | null;
  address_complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  latitude: number;
  longitude: number;
  products: Json;
  validation: string | null;
  accuracy_estimate: string | null;
  data_obtained_at: string | null;
  last_synced_at: string;
  updated_at: string;
};

function normalizeCoordinate(value?: string) {
  if (!value) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDate(value?: string) {
  if (!value) return null;
  const [day, month, year] = value.split("/");
  if (!day || !month || !year) return null;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function normalizeProducts(products?: AnpFuelStationProduct[]): Json {
  if (!products?.length) {
    return [];
  }

  return products.map((product) => ({
    produto: product.produto,
    tancagem: product.tancagem ?? null,
    unidMedidaTancagem: product.unidMedidaTancagem ?? null,
    qtdeBicos: product.qtdeBicos ?? null,
  }));
}

export async function fetchAnpFuelStationsPage(page: number) {
  const url = `${ANP_FUEL_STATIONS_URL}?numeropagina=${page}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`ANP request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as AnpFuelStationsResponse;
  return payload;
}

export function normalizeAnpFuelStation(record: AnpFuelStationRecord): FuelStationUpsert | null {
  const latitude = normalizeCoordinate(record.latitude);
  const longitude = normalizeCoordinate(record.longitude);

  if (latitude === null || longitude === null) {
    return null;
  }

  const now = new Date().toISOString();

  return {
    source: "anp",
    source_id: record.codigoSIMP,
    name: record.razaoSocial,
    brand: record.distribuidora ?? null,
    cnpj: record.cnpj ?? null,
    address: record.endereco ?? null,
    address_complement: record.complemento ?? null,
    neighborhood: record.bairro ?? null,
    city: record.municipio ?? null,
    state: record.uf ?? null,
    zip_code: record.cep ?? null,
    latitude,
    longitude,
    products: normalizeProducts(record.produtos),
    validation: record.validacao ?? null,
    accuracy_estimate: record.estimativaAcuracia ?? null,
    data_obtained_at: normalizeDate(record.dataObtencao),
    last_synced_at: now,
    updated_at: now,
  };
}

export async function fetchAndNormalizeAnpFuelStationsPage(page: number) {
  const payload = await fetchAnpFuelStationsPage(page);
  const stations = (payload.data ?? [])
    .map(normalizeAnpFuelStation)
    .filter((station): station is FuelStationUpsert => station !== null);

  return {
    page,
    totalPages: payload.searchPageFilter?.totalPagina ?? null,
    totalRecords: payload.searchPageFilter?.totalRegistro ?? null,
    stations,
  };
}
