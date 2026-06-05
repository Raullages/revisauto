"use client";

import { useRouter } from "next/navigation";
import { useVehicles } from "@/features/vehicles/viewmodel/useVehicles";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";

const fuelLabels: Record<string, string> = {
  Gasolina: "Gasolina",
  Etanol: "Etanol",
  Flex: "Flex",
  Diesel: "Diesel",
  GNV: "GNV",
  Elétrico: "Elétrico",
  Híbrido: "Híbrido",
};

export default function VehiclesPage() {
  const router = useRouter();
  const { data: vehicles, isLoading } = useVehicles();

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Veículos</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gerencie seus veículos</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Veículos</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gerencie seus veículos</p>
          </div>
        </div>
        <EmptyState
          title="Nenhum veículo cadastrado"
          description="Cadastre seu primeiro veículo para começar"
          icon={
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          }
          action={
            <Button onClick={() => router.push("/vehicles/new")}>
              Cadastrar veículo
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Veículos</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {vehicles.length} veículo{vehicles.length !== 1 ? "s" : ""} cadastrado{vehicles.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => router.push("/vehicles/new")}>
          Novo veículo
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/vehicles/${vehicle.id}`)}>
            <CardBody>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 font-bold text-sm">
                    {vehicle.brand.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {vehicle.brand} {vehicle.model}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.year}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {vehicle.plate && (
                  <div className="rounded-md bg-gray-50 px-2 py-1 dark:bg-gray-900">
                    <span className="text-gray-500 dark:text-gray-400">Placa</span>
                    <p className="font-medium text-gray-900 dark:text-white uppercase tracking-wider">{vehicle.plate}</p>
                  </div>
                )}
                <div className="rounded-md bg-gray-50 px-2 py-1 dark:bg-gray-900">
                  <span className="text-gray-500 dark:text-gray-400">KM Atual</span>
                  <p className="font-medium text-gray-900 dark:text-white">{vehicle.current_km.toLocaleString()}</p>
                </div>
                {vehicle.fuel && (
                  <div className="rounded-md bg-gray-50 px-2 py-1 dark:bg-gray-900">
                    <span className="text-gray-500 dark:text-gray-400">Combustivel</span>
                    <p className="font-medium text-gray-900 dark:text-white">{fuelLabels[vehicle.fuel] || vehicle.fuel}</p>
                  </div>
                )}
                {vehicle.color && (
                  <div className="rounded-md bg-gray-50 px-2 py-1 dark:bg-gray-900">
                    <span className="text-gray-500 dark:text-gray-400">Cor</span>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-3 w-3 rounded-full border border-gray-300 dark:border-gray-600" style={{ backgroundColor: vehicle.color }} />
                      <p className="font-medium text-gray-900 dark:text-white">{vehicle.color}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
