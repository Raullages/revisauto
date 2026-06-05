import { vehicleService } from "@/features/vehicles/services/vehicle.service";
import { maintenanceService } from "@/features/maintenances/services/maintenance.service";
import type { MaintenanceWithRelations } from "@/features/maintenances/model/types";

export interface DashboardData {
  totalVehicles: number;
  totalMaintenances: number;
  pendingCount: number;
  monthlySpending: number;
  yearlySpending: number;
  overdueAlerts: MaintenanceWithRelations[];
  upcomingAlerts: MaintenanceWithRelations[];
  pendingRepairs: MaintenanceWithRelations[];
  recentMaintenances: MaintenanceWithRelations[];
  upcomingChanges: MaintenanceWithRelations[];
}

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
  return { start, end };
}

function getYearRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
  const end = new Date(now.getFullYear(), 11, 31).toISOString().split("T")[0];
  return { start, end };
}

function daysFromNow(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T12:00:00");
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export const dashboardService = {
  async getData(): Promise<DashboardData> {
    const [vehicles, maintenances] = await Promise.all([
      vehicleService.list(),
      maintenanceService.list(),
    ]);

    const { start: monthStart, end: monthEnd } = getMonthRange();
    const { start: yearStart, end: yearEnd } = getYearRange();

    const monthlySpending = maintenances
      .filter((m) => m.maintenance_date && m.maintenance_date >= monthStart && m.maintenance_date <= monthEnd && m.status === "completed")
      .reduce((sum, m) => sum + m.amount, 0);

    const yearlySpending = maintenances
      .filter((m) => m.maintenance_date && m.maintenance_date >= yearStart && m.maintenance_date <= yearEnd && m.status === "completed")
      .reduce((sum, m) => sum + m.amount, 0);

    const today = new Date().toISOString().split("T")[0];

    const overdueAlerts = maintenances.filter((m) => {
      if (m.status === "pending") return false;
      const kmOverdue = m.next_change_km && m.next_change_km > 0 && m.next_change_km <= m.vehicle_km;
      const dateOverdue = m.next_change_date && m.next_change_date <= today;
      return kmOverdue || dateOverdue;
    });

    const upcomingAlerts = maintenances.filter((m) => {
      if (m.status === "pending") return false;
      const kmUpcoming = m.next_change_km && m.next_change_km > 0 && m.next_change_km > m.vehicle_km && m.next_change_km <= m.vehicle_km + 1000;
      const dateUpcoming = m.next_change_date && m.next_change_date > today && daysFromNow(m.next_change_date) <= 30;
      return (kmUpcoming || dateUpcoming) && !overdueAlerts.includes(m);
    });

    const upcomingChanges = maintenances
      .filter((m) => {
        if (!m.next_change_date && !(m.next_change_km && m.next_change_km > 0)) return false;
        if (overdueAlerts.includes(m)) return true;
        if (upcomingAlerts.includes(m)) return true;
        const futureDate = m.next_change_date && m.next_change_date > today && daysFromNow(m.next_change_date) <= 60;
        const futureKm = m.next_change_km && m.next_change_km > 0 && m.next_change_km > m.vehicle_km && m.next_change_km <= m.vehicle_km + 5000;
        return futureDate || futureKm;
      })
      .sort((a, b) => {
        const aDate = a.next_change_date || "9999-12-31";
        const bDate = b.next_change_date || "9999-12-31";
        return aDate.localeCompare(bDate);
      })
      .slice(0, 5);

    const recentMaintenances = maintenances
      .filter((m) => m.status === "completed")
      .slice(0, 5);

    const pendingRepairs = maintenances
      .filter((m) => m.status === "pending")
      .sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return (order[a.priority as keyof typeof order] || 1) - (order[b.priority as keyof typeof order] || 1);
      });

    return {
      totalVehicles: vehicles.length,
      totalMaintenances: maintenances.length,
      pendingCount: maintenances.filter((m) => m.status === "pending").length,
      monthlySpending,
      yearlySpending,
      overdueAlerts,
      upcomingAlerts,
      pendingRepairs,
      recentMaintenances,
      upcomingChanges,
    };
  },
};
