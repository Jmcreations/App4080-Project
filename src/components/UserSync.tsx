"use client";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export function UserSync() {
  const { isSignedIn } = useUser();
  const storeUser = useMutation(api.users.storeUser);

  useEffect(() => {
    if (isSignedIn) {
      storeUser();
    }
  }, [isSignedIn, storeUser]);

  return null;
}