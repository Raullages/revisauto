"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useMaintenance, useDeleteMaintenance, useUpdateMaintenance } from "@/features/maintenances/viewmodel/useMaintenances";
import type { MaintenanceStatus } from "@/features/maintenances/model/types";
import type { MaintenanceFormData } from "@/features/maintenances/model/schemas";
import { attachmentService } from "@/features/maintenances/services/attachment.service";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface Attachment {
  id: string;
  maintenance_id: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fileIcon(type: string) {
  if (type.startsWith("image/")) return "🖼️";
  if (type === "application/pdf") return "📄";
  return "📎";
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function MaintenanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: maintenance, isLoading } = useMaintenance(id);
  const { mutateAsync: deleteMaintenance, isPending: deleting } = useDeleteMaintenance();
  const { mutateAsync: updateMaintenance, isPending: transitioning } = useUpdateMaintenance();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [attachmentsLoading, setAttachmentsLoading] = useState(true);

  const loadAttachments = useCallback(async () => {
    try {
      const data = await attachmentService.list(id);
      setAttachments(data);
    } catch {
      // bucket may not exist yet
    } finally {
      setAttachmentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAttachments();
  }, [loadAttachments]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Formato inválido. Use PDF, JPG, PNG ou WEBP.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error("Arquivo muito grande. Máximo 5MB.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      await attachmentService.upload(id, file);
      toast.success("Arquivo enviado!");
      loadAttachments();
    } catch {
      toast.error("Erro ao enviar arquivo. Verifique se o bucket de Storage foi criado.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    try {
      await attachmentService.remove(attachmentId);
      toast.success("Arquivo removido");
      loadAttachments();
    } catch {
      toast.error("Erro ao remover arquivo");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!maintenance) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Manutenção não encontrada</p>
        <Link href="/maintenances" className="mt-2 inline-block text-blue-600 hover:text-blue-500 dark:text-blue-400 text-sm">
          Voltar para lista
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteMaintenance(maintenance.id);
      toast.success("Manutenção removida");
      router.push("/maintenances");
    } catch {
      toast.error("Erro ao remover manutenção");
    }
  };

  const handleTransition = async (newStatus: MaintenanceStatus) => {
    try {
      const data: Partial<MaintenanceFormData> = { status: newStatus };

      if ((newStatus === "scheduled" || newStatus === "completed") && !maintenance.maintenance_date) {
        data.maintenance_date = new Date().toISOString().split("T")[0];
      }

      await updateMaintenance({ id: maintenance.id, data });
      toast.success(`Status alterado para ${statusLabel[newStatus]}`);
    } catch {
      toast.error("Erro ao alterar status");
    }
  };

  const nextKm = maintenance.next_change_km && maintenance.next_change_km > 0;
  const nextDate = maintenance.next_change_date;
  const today = new Date().toISOString().split("T")[0];
  const kmOverdue = nextKm && maintenance.next_change_km! <= maintenance.vehicle_km;
  const dateOverdue = nextDate && nextDate <= today;

  const statusLabel: Record<string, string> = { pending: "Pendente", scheduled: "Agendado", completed: "Concluído" };
  const priorityLabel: Record<string, string> = { low: "Baixa",   medium: "Média", high: "Alta" };
  const statusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    scheduled: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/maintenances"
          className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold ${statusColor[maintenance.status]}`}>
                {statusLabel[maintenance.status]}
              </span>
              {maintenance.status === "pending" && (
                <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold ${
                  maintenance.priority === "high"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : maintenance.priority === "medium"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                }`}>
                  {priorityLabel[maintenance.priority]}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {maintenance.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {maintenance.vehicles?.brand} {maintenance.vehicles?.model}
              {maintenance.maintenance_categories?.name && ` — ${maintenance.maintenance_categories.name}`}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push(`/maintenances/${maintenance.id}/edit`)}>
            Editar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">Detalhes do serviço</h2>
        </CardHeader>
        <CardBody>
          <dl className="divide-y divide-gray-100 dark:divide-gray-700">
            {maintenance.maintenance_date && (
              <div className="flex justify-between py-2.5 text-sm">
                <dt className="text-gray-500 dark:text-gray-400">Data</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {new Date(maintenance.maintenance_date + "T12:00:00").toLocaleDateString("pt-BR")}
                </dd>
              </div>
            )}
            <div className="flex justify-between py-2.5 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">KM</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{maintenance.vehicle_km.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between py-2.5 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">Valor</dt>
              <dd className="font-medium text-gray-900 dark:text-white">{formatCurrency(maintenance.amount)}</dd>
            </div>
            {maintenance.workshop && (
              <div className="flex justify-between py-2.5 text-sm">
                <dt className="text-gray-500 dark:text-gray-400">Oficina</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{maintenance.workshop}</dd>
              </div>
            )}
            {maintenance.description && (
              <div className="py-2.5 text-sm">
                <dt className="text-gray-500 dark:text-gray-400 mb-1">Descrição</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{maintenance.description}</dd>
              </div>
            )}
            {maintenance.notes && (
              <div className="py-2.5 text-sm">
                <dt className="text-gray-500 dark:text-gray-400 mb-1">Observações</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{maintenance.notes}</dd>
              </div>
            )}
          </dl>
        </CardBody>
      </Card>

      {(nextKm || nextDate) && (
        <Card className="mt-4">
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white">Próxima troca</h2>
          </CardHeader>
          <CardBody>
            <dl className="divide-y divide-gray-100 dark:divide-gray-700">
              {nextKm && (
                <div className="flex justify-between py-2.5 text-sm">
                  <dt className="text-gray-500 dark:text-gray-400">KM</dt>
                  <dd className={`font-medium ${kmOverdue ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                    {maintenance.next_change_km!.toLocaleString()}
                    {kmOverdue && <span className="ml-2 text-[10px] font-bold text-red-600">VENCIDO</span>}
                  </dd>
                </div>
              )}
              {nextDate && (
                <div className="flex justify-between py-2.5 text-sm">
                  <dt className="text-gray-500 dark:text-gray-400">Data</dt>
                  <dd className={`font-medium ${dateOverdue ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                    {new Date(nextDate + "T12:00:00").toLocaleDateString("pt-BR")}
                    {dateOverdue && <span className="ml-2 text-[10px] font-bold text-red-600">VENCIDO</span>}
                  </dd>
                </div>
              )}
            </dl>
          </CardBody>
        </Card>
      )}

      <Card className="mt-4">
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">Ações</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {maintenance.status === "pending" && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  loading={transitioning}
                  onClick={() => handleTransition("scheduled")}
                >
                  Agendar manutenção
                </Button>
                <Button
                  size="sm"
                  loading={transitioning}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleTransition("completed")}
                >
                  Marcar como concluída
                </Button>
              </>
            )}
            {maintenance.status === "scheduled" && (
              <>
                <Button
                  size="sm"
                  loading={transitioning}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleTransition("completed")}
                >
                  Finalizar manutenção
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={transitioning}
                  onClick={() => handleTransition("pending")}
                >
                  Voltar para pendente
                </Button>
              </>
            )}
            {maintenance.status === "completed" && (
              <Button
                variant="secondary"
                size="sm"
                loading={transitioning}
                onClick={() => handleTransition("pending")}
              >
                Reabrir manutenção
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Comprovantes</h2>
          <label className="cursor-pointer inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            {uploading ? "Enviando..." : "Anexar"}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </CardHeader>
        <CardBody>
          {attachmentsLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : attachments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nenhum comprovante anexado. Formatos aceitos: PDF, JPG, PNG, WEBP (max 5MB).
            </p>
          ) : (
            <div className="space-y-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-700"
                >
                  <a
                    href={att.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 min-w-0 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <span className="text-lg shrink-0">{fileIcon(att.file_name.endsWith(".pdf") ? "application/pdf" : att.file_name.match(/\.(jpg|jpeg|png|webp)$/i) ? "image/" : "")}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {att.file_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(att.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </a>
                  <button
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="shrink-0 rounded p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    aria-label="Remover arquivo"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="mt-6">
        {!confirmDelete ? (
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} className="text-red-600 hover:text-red-700 dark:text-red-400">
            Remover manutenção
          </Button>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-400">Tem certeza? Esta ação não pode ser desfeita.</p>
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button size="sm" loading={deleting} onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Sim, remover
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
