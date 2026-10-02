const tones: Record<string, string> = {
  professional: "Use a polished, professional tone.",
  friendly: "Use a warm, conversational tone.",
  candid: "Be direct and candid, while remaining respectful.",
  concise: "Be concise and avoid unnecessary detail.",
};
export function personalization(profile: {
  tone?: string;
  nickname?: string;
  occupation?: string;
  about?: string;
  instructions?: string;
}): string {
  return [
    tones[profile.tone || ""] || "",
    profile.nickname
      ? `User's preferred name: ${profile.nickname.slice(0, 120)}`
      : "",
    profile.occupation
      ? `User's occupation: ${profile.occupation.slice(0, 120)}`
      : "",
    profile.about
      ? `Background supplied by the user: ${profile.about.slice(0, 1000)}`
      : "",
    (profile.instructions || "").slice(0, 3000),
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 4500);
}
