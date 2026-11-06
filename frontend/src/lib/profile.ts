export type ThemeMode = "light" | "dark" | "system";

export type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  day: string;
  month: string;
  year: string;
  notifications: boolean;
  reminders: boolean;
  mentions: boolean;
  agentOnly: boolean;
  theme: ThemeMode;
  language: string;
  improve: boolean;
  done: boolean;
};

const KEY = "epicagent.profile";

export const emptyProfile: Profile = {
  firstName: "",
  lastName: "",
  email: "",
  day: "",
  month: "",
  year: "",
  notifications: true,
  reminders: true,
  mentions: true,
  agentOnly: true,
  theme: "light",
  language: "English",
  improve: false,
  done: false,
};

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...emptyProfile };
    return { ...emptyProfile, ...(JSON.parse(raw) as Partial<Profile>) };
  } catch {
    return { ...emptyProfile };
  }
}

export function saveProfile(profile: Profile) {
  localStorage.setItem(KEY, JSON.stringify(profile));
}

export function displayName(profile: Profile) {
  const name = `${profile.firstName} ${profile.lastName}`.trim();
  return name || "Maya Chen";
}

export function initials(profile: Profile) {
  const name = displayName(profile);
  const parts = name.split(" ").filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "MC";
}

export function dobLabel(profile: Profile) {
  if (!profile.day || !profile.month || !profile.year) return "Private";
  const date = new Date(Number(profile.year), Number(profile.month) - 1, Number(profile.day));
  if (Number.isNaN(date.getTime())) return "Private";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
