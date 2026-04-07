"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useStudySessions() {
  const { user } = useUser();
  const userId = user?.id ?? "";

  const sessions   = useQuery(api.studySessions.getSessions, { userId });
  const logSession = useMutation(api.studySessions.logSession);
  const deleteOne  = useMutation(api.studySessions.deleteSession);
  const seed       = useMutation(api.studySessions.seedSessions);

  const totalPlanned = (sessions ?? []).reduce((s, x) => s + x.planned, 0);
  const totalActual  = (sessions ?? []).reduce((s, x) => s + x.actual,  0);

  return {
    sessions,
    isLoading: sessions === undefined,
    totalPlanned,
    totalActual,
    logSession: (data: { course: string; date: string; planned: number; actual: number; notes: string }) =>
      logSession({ userId, ...data }),
    deleteSession: (id: Id<"studySessions">) => deleteOne({ id }),
    seed: () => seed({ userId }),
  };
}