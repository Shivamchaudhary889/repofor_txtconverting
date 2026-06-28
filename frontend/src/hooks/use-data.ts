import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import type {
  Activity,
  Assessment,
  AttendanceRecord,
  AttendanceStatus,
  Batch,
  Candidate,
  Feedback,
  Notification,
  ScheduleSession,
  Trainer,
} from "@/data/types";

export interface DashboardSummary {
  activeBatches: number;
  inTraining: number;
  avgAttendance: number;
  avgPassRate: number;
  avgUtilization: number;
  atRiskCount: number;
  totalBatches: number;
  totalCandidates: number;
  totalTrainers: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface DashboardCharts {
  enrollmentTrends: ChartDataPoint[];
  locationData: ChartDataPoint[];
  techMix: ChartDataPoint[];
}

export const useDashboardSummary = () =>
  useQuery({ queryKey: ["dashboard-summary"], queryFn: () => apiGet<DashboardSummary>("/dashboard/summary") });

export const useDashboardCharts = () =>
  useQuery({ queryKey: ["dashboard-charts"], queryFn: () => apiGet<DashboardCharts>("/dashboard/charts") });

export const useActivities = () =>
  useQuery({ queryKey: ["activities"], queryFn: () => apiGet<Activity[]>("/activities") });

export const useBatches = () =>
  useQuery({ queryKey: ["batches"], queryFn: () => apiGet<Batch[]>("/batches") });

export const useBatch = (id: string | undefined) =>
  useQuery({
    queryKey: ["batch", id],
    queryFn: () => apiGet<Batch>(`/batches/${id}`),
    enabled: !!id,
  });

export const useCreateBatch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Batch> & { candidateIds?: string[] }) =>
      apiPost<Batch>("/batches", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["batches"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
      qc.invalidateQueries({ queryKey: ["dashboard-charts"] });
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
  });
};

export const useCandidates = () =>
  useQuery({ queryKey: ["candidates"], queryFn: () => apiGet<Candidate[]>("/candidates") });

export const useCandidate = (id: string | undefined) =>
  useQuery({
    queryKey: ["candidate", id],
    queryFn: () => apiGet<Candidate>(`/candidates/${id}`),
    enabled: !!id,
  });

export const useTrainers = () =>
  useQuery({ queryKey: ["trainers"], queryFn: () => apiGet<Trainer[]>("/trainers") });

export const useTrainer = (id: string | undefined) =>
  useQuery({
    queryKey: ["trainer", id],
    queryFn: () => apiGet<Trainer>(`/trainers/${id}`),
    enabled: !!id,
  });

export const useSessions = () =>
  useQuery({ queryKey: ["sessions"], queryFn: () => apiGet<ScheduleSession[]>("/sessions") });

export const useAssessments = () =>
  useQuery({ queryKey: ["assessments"], queryFn: () => apiGet<Assessment[]>("/assessments") });

export const useFeedback = () =>
  useQuery({ queryKey: ["feedback"], queryFn: () => apiGet<Feedback[]>("/feedback") });

export const useNotifications = () =>
  useQuery({ queryKey: ["notifications"], queryFn: () => apiGet<Notification[]>("/notifications") });

export const useAttendanceRecords = (batchId: string | undefined) =>
  useQuery({
    queryKey: ["attendance", batchId],
    queryFn: () => apiGet<AttendanceRecord[]>(`/attendance?batchId=${batchId}`),
    enabled: !!batchId,
  });

export interface BulkAttendancePayload {
  records: Array<{ candidateId: string; batchId: string; date: string; status: AttendanceStatus }>;
}

export const useSaveAttendance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkAttendancePayload) =>
      apiPost<{ updated: number; candidates: Candidate[] }>("/attendance/bulk", payload),
    onSuccess: (_data, variables) => {
      const batchId = variables.records[0]?.batchId;
      qc.invalidateQueries({ queryKey: ["attendance", batchId] });
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: ["batches"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
};
