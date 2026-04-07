"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Priority, Status } from "@/constants";

export function useAssignments() {
  const { user } = useUser();
  const userId = user?.id ?? "";

  const assignments   = useQuery(api.assignments.getAssignments, { userId });
  const addAssignment = useMutation(api.assignments.addAssignment);
  const updateStatus  = useMutation(api.assignments.updateStatus);
  const deleteOne     = useMutation(api.assignments.deleteAssignment);
  const seed          = useMutation(api.assignments.seedAssignments);

  return {
    assignments,
    isLoading: assignments === undefined,
    addAssignment: (data: { title: string; desc: string; course: string; deadline: string; hours: string; priority: Priority; status: Status }) =>
      addAssignment({ userId, ...data }),
    updateStatus: (id: Id<"assignments">, status: Status) => updateStatus({ id, status }),
    deleteAssignment: (id: Id<"assignments">) => deleteOne({ id }),
    seed: () => seed({ userId }),
  };
}