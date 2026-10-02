import type { Model } from "./types";

export type ChatMode = { web?: boolean; reasoning?: boolean; vision?: boolean };
export function isChatModel(model: Model) {
  return !model.type || model.type === "chat" || model.type === "text";
}
export function supportsMode(model: Model, mode: ChatMode) {
  const caps = model.capabilities || [];
  return isChatModel(model) && (!mode.web || caps.includes("web_search"))
    && (!mode.reasoning || caps.includes("reasoning"))
    && (!mode.vision || caps.includes("vision"));
}
export function selectModeModel(models: Model[], selected: string | undefined, mode: ChatMode) {
  const current = models.find((model) => model.id === selected);
  if (current && supportsMode(current, mode)) return current;
  return models.find((model) => supportsMode(model, mode));
}
