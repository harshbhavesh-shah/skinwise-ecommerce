// Firestore timestamps come back as proper ISO strings (with a "Z"), but
// this also tolerates a bare "YYYY-MM-DD HH:MM:SS" in case older data
// (e.g. from a prior SQLite-backed version) is ever read.
export function formatDateTime(iso: string) {
  const date = new Date(iso.includes("Z") ? iso : `${iso.replace(" ", "T")}Z`);
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
