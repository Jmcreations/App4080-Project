"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useUserProfile } from "@/hooks/useUserProfile";
import Card from "@/components/ui/Card";
import DbIndicator from "@/components/ui/DbIndicator";

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`w-11 h-6 rounded-full transition-colors relative ${value ? "bg-indigo-600" : "bg-gray-200"}`}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { user } = useUser();
  const { profile, isLoading, saveProfile } = useUserProfile();
  const [dbStatus, setDbStatus] = useState<"live"|"loading"|"saved">("live");
  const [form, setForm]       = useState({ name: "", email: "", studentId: "STU-2024-001", major: "" });
  const [toggles, setToggles] = useState({ dataCollection: true, usageAnalytics: true, emailNotifications: true });
  const [checks, setChecks]   = useState({ deadlineReminders: true, workloadAlerts: true, weeklySummary: true });

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name, email: profile.email, studentId: profile.studentId, major: profile.major });
      setToggles(profile.privacy);
      setChecks(profile.notifications);
    } else if (user && profile === null) {
      setForm({ name: user.fullName ?? "", email: user.emailAddresses?.[0]?.emailAddress ?? "", studentId: "STU-2024-001", major: "Computer Science" });
    }
  }, [profile, user]);

  const handleSave = async () => {
    setDbStatus("loading");
    await saveProfile({ ...form, notifications: checks, privacy: toggles });
    setDbStatus("saved");
    setTimeout(() => setDbStatus("live"), 2500);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <DbIndicator status={isLoading ? "loading" : dbStatus} />
      </div>
      <p className="text-gray-500 mb-6">Manage your account and preferences</p>

      <div className="grid grid-cols-2 gap-5">
        <Card>
          <h2 className="text-base font-bold mb-5">Profile Information</h2>
          {isLoading ? <p className="text-gray-400 text-sm">Loading from database...</p> : (
            <>
              {[["Full Name","name",true],["Email Address","email",true],["Student ID","studentId",false],["Major","major",true]].map(([label, key, editable]) => (
                <div key={key as string} className="mb-4">
                  <label className="text-sm block mb-1">{label as string}</label>
                  <input value={(form as Record<string,string>)[key as string]} disabled={!editable as boolean}
                    onChange={e => setForm(p => ({ ...p, [key as string]: e.target.value }))}
                    className={`w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none ${editable ? "bg-white focus:ring-2 focus:ring-indigo-300" : "bg-gray-50 text-gray-400"}`} />
                  {key === "studentId" && <p className="text-xs text-gray-400 mt-1">Student ID cannot be changed</p>}
                </div>
              ))}
              <button onClick={handleSave} className={`w-full rounded-lg py-3 font-semibold text-sm text-white transition-colors ${dbStatus === "saved" ? "bg-green-600" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                {dbStatus === "loading" ? "Saving..." : dbStatus === "saved" ? "✓ Saved to DB!" : "Save Changes"}
              </button>
            </>
          )}
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <h2 className="text-base font-bold mb-4">Privacy & Consent</h2>
            {[["dataCollection","Data Collection"],["usageAnalytics","Usage Analytics"],["emailNotifications","Email Notifications"]].map(([k, label]) => (
              <div key={k} className="flex justify-between items-center mb-4">
                <span className="text-sm">{label}</span>
                <Toggle value={toggles[k as keyof typeof toggles]} onChange={() => setToggles(p => ({ ...p, [k]: !p[k as keyof typeof p] }))} />
              </div>
            ))}
            <div className="bg-yellow-50 rounded-lg px-3 py-2.5 text-xs">
              <strong>Important:</strong> SWIS is designed for academic productivity tracking only.
            </div>
          </Card>
          <Card>
            <h2 className="text-base font-bold mb-4">Notifications</h2>
            {[["deadlineReminders","Deadline Reminders"],["workloadAlerts","Workload Alerts"],["weeklySummary","Weekly Summary"]].map(([k, label]) => (
              <label key={k} className="flex items-center gap-2.5 mb-3 cursor-pointer text-sm">
                <input type="checkbox" checked={checks[k as keyof typeof checks]} onChange={() => setChecks(p => ({ ...p, [k]: !p[k as keyof typeof p] }))} className="w-4 h-4 accent-indigo-600" />
                {label}
              </label>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}