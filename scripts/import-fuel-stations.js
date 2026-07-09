const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const XLSX = require("xlsx");
const { createClient } = require("@supabase/supabase-js");
const WebSocket = require("ws");

dotenv.config({ path: path.join(process.cwd(), ".env.local"), quiet: true });

const DEFAULT_BATCH_SIZE = 1000;
const EXCEL_EPOCH = Date.UTC(1899, 11, 30);
const HELP_TEXT = [
  "Usage: npm run import:fuel-stations -- <xlsx-path> [--dry-run] [--batch-size=1000]",
  "",
  "Examples:",
  '  npm run import:fuel-stations -- "~/Downloads/exportação.xlsx" --dry-run',
  '  npm run import:fuel-stations -- "~/Downloads/exportação.xlsx"',
].join("\n");

function exitWithError(message) {
  console.error(message);
  process.exit(1);
}

function expandHome(filePath) {
  if (!filePath.startsWith("~/")) {
    return filePath;
  }

  return path.join(process.env.HOME || "", filePath.slice(2));
}

function normalizeString(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = String(value).trim().replace(/\s+/g, " ");
  return normalized.length > 0 ? normalized : null;
}

function normalizeCoordinate(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(String(value).replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeExcelDate(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(EXCEL_EPOCH + Math.floor(value * 86400000));
    return date.toISOString().slice(0, 10);
  }

  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }

  const [day, month, year] = normalized.split("/");
  if (day && month && year) {
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return null;
}

function parseArgs(argv) {
  const flags = {
    dryRun: false,
    batchSize: DEFAULT_BATCH_SIZE,
    filePath: null,
  };

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      console.log(HELP_TEXT);
      process.exit(0);
    }

    if (arg === "--dry-run") {
      flags.dryRun = true;
      continue;
    }

    if (arg.startsWith("--batch-size=")) {
      const parsed = Number(arg.split("=")[1]);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        exitWithError("--batch-size deve ser um inteiro positivo");
      }
      flags.batchSize = parsed;
      continue;
    }

    if (arg.startsWith("--")) {
      exitWithError(`Flag não suportada: ${arg}`);
    }

    if (flags.filePath) {
      exitWithError("Informe apenas um caminho de arquivo");
    }

    flags.filePath = expandHome(arg);
  }

  if (!flags.filePath) {
    exitWithError(HELP_TEXT);
  }

  return flags;
}

function normalizeRow(row) {
  const sourceId = normalizeString(row["Código Instalação i-Simp"]);
  const name = normalizeString(row["Razão Social"]);
  const latitude = normalizeCoordinate(row.Latitude);
  const longitude = normalizeCoordinate(row.Longitude);

  if (!sourceId) {
    return { station: null, reason: "missing_source_id" };
  }

  if (!name) {
    return { station: null, reason: "missing_name" };
  }

  if (latitude === null || longitude === null) {
    return { station: null, reason: "missing_coordinates" };
  }

  const now = new Date().toISOString();

  return {
    station: {
      source: "anp",
      source_id: sourceId,
      name,
      brand: normalizeString(row["Vinculação a Distribuidor"]),
      cnpj: normalizeString(row.CNPJ),
      address: normalizeString(row.Endereço),
      address_complement: normalizeString(row.COMPLEMENTO),
      neighborhood: normalizeString(row.BAIRRO),
      city: normalizeString(row.MUNICÍPIO),
      state: normalizeString(row.UF),
      zip_code: normalizeString(row.CEP),
      latitude,
      longitude,
      products: [],
      validation: normalizeString(row["Status PMQC"]),
      accuracy_estimate: normalizeString(row.SRC),
      data_obtained_at: normalizeExcelDate(row["Data da Obtenção"]),
      last_synced_at: now,
      updated_at: now,
    },
    reason: null,
  };
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    exitWithError("NEXT_PUBLIC_SUPABASE_URL não está definido");
  }

  if (!serviceRoleKey) {
    exitWithError("SUPABASE_SERVICE_ROLE_KEY não está definido");
  }

  return createClient(url, serviceRoleKey, {
    realtime: {
      transport: WebSocket,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function importBatches(stations, batchSize) {
  const supabase = getSupabaseClient();
  let imported = 0;

  for (let start = 0; start < stations.length; start += batchSize) {
    const batch = stations.slice(start, start + batchSize);
    const { error } = await supabase
      .from("fuel_stations")
      .upsert(batch, { onConflict: "source,source_id", ignoreDuplicates: false });

    if (error) {
      throw error;
    }

    imported += batch.length;
    console.log(`Importados ${imported}/${stations.length} postos`);
  }
}

async function main() {
  const { filePath, dryRun, batchSize } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(filePath)) {
    exitWithError(`Arquivo não encontrado: ${filePath}`);
  }

  console.log(`Lendo planilha: ${filePath}`);
  const workbook = XLSX.readFile(filePath, { cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: null, raw: true });

  const stations = [];
  let ignoredRows = 0;
  const ignoredByReason = {
    missing_source_id: 0,
    missing_name: 0,
    missing_coordinates: 0,
  };

  for (const row of rows) {
    const { station, reason } = normalizeRow(row);
    if (!station) {
      ignoredRows += 1;
      if (reason) {
        ignoredByReason[reason] += 1;
      }
      continue;
    }

    stations.push(station);
  }

  console.log(`Aba: ${sheetName}`);
  console.log(`Linhas lidas: ${rows.length}`);
  console.log(`Postos válidos: ${stations.length}`);
  console.log(`Linhas ignoradas: ${ignoredRows}`);
  console.log("Motivos de descarte:", ignoredByReason);
  console.log("Amostra:", stations.slice(0, 3));

  if (dryRun) {
    console.log("Dry run concluído. Nenhum dado foi gravado.");
    return;
  }

  await importBatches(stations, batchSize);
  console.log("Importação concluída com sucesso.");
}

main().catch((error) => {
  console.error("Falha ao importar postos:", error instanceof Error ? error.message : error);
  process.exit(1);
});
