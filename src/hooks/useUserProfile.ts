"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useUserProfile() {
  const { user } = useUser();
  const userId = user?.id ?? "";

  const profile       = useQuery(api.userProfiles.getProfile, { userId });
  const upsertProfile = useMutation(api.userProfiles.upsertProfile);

  return {
    profile,
    isLoading: profile === undefined,
    saveProfile: (data: {
      name: string; email: string; studentId: string; major: string;
      notifications: { deadlineReminders: boolean; workloadAlerts: boolean; weeklySummary: boolean };
      privacy: { dataCollection: boolean; usageAnalytics: boolean; emailNotifications: boolean };
    }) => upsertProfile({ userId, ...data }),
  };
}