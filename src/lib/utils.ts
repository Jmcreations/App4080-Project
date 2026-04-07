export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "short", day: "numeric",
  });
}

export function calcAccuracy(planned: number, actual: number) {
  if (planned === 0) return "N/A";
  return ((1 - Math.abs(planned - actual) / planned) * 100).toFixed(1) + "%";
}

export function calcBias(planned: number, actual: number) {
  if (planned === 0) return 0;
  return +(((actual - planned) / planned) * 100).toFixed(0);
}

export const BADGE_CLASSES: Record<string, string> = {
  high:          "bg-red-100 text-red-600",
  medium:        "bg-yellow-100 text-yellow-600",
  low:           "bg-green-100 text-green-600",
  "in progress": "bg-indigo-100 text-indigo-600",
  pending:       "bg-gray-100 text-gray-500",
  completed:     "bg-green-100 text-green-600",
};