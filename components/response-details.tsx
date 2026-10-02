"use client";
import { useState } from "react";
import { Brain, ChevronDown, Globe, LoaderCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { safeSourceUrl } from "@/lib/chat-protocol";
import type { Message } from "@/lib/types";

export function ReasoningDetails({ message, active, fa }: { message: Message; active: boolean; fa: boolean }) {
  const [open, setOpen] = useState(false);
  if (!message.reasoning) return null;
  const thinking = active && !message.content;
  const seconds = Math.round((message.reasoningDurationMs || 0) / 1000);
  const duration = seconds ? seconds.toLocaleString(fa ? "fa" : "en") : (fa ? "کمتر از ۱" : "<1");
  return <Collapsible className="reasoning-panel" open={open} onOpenChange={setOpen}>
    <CollapsibleTrigger className="reasoning-toggle">
      {thinking ? <LoaderCircle size={16} className="spin" /> : <Brain size={16} />}
      <span>{thinking ? (fa ? "در حال تفکر…" : "Thinking…")
        : message.stopped && !message.content ? (fa ? "تفکر متوقف شد" : "Thinking stopped")
        : message.error && !message.content ? (fa ? "تفکر ناتمام" : "Thinking interrupted")
        : message.reasoningDurationMs === undefined ? (fa ? "تفکر مدل" : "Model reasoning")
        : fa ? `تفکر · ${duration} ثانیه` : `Thought for ${duration}s`}</span>
      <ChevronDown size={14} className={open ? "is-expanded" : ""} />
    </CollapsibleTrigger>
    <CollapsibleContent className="reasoning-content">
      <p className="reasoning-label">{fa ? "توضیحات ارائه‌شده توسط مدل" : "Reasoning provided by the model"}</p>
      <div dir="auto">{message.reasoning}</div>
    </CollapsibleContent>
  </Collapsible>;
}

export function ResponseSources({ message, fa, active }: { message: Message; fa: boolean; active: boolean }) {
  const [open, setOpen] = useState(false);
  const sources = (message.sources || []).filter((source, i, all) =>
    safeSourceUrl(source.url) && all.findIndex((x) => x.url === source.url) === i);
  if (!sources.length) {
    return message.webRequested && !active && !!message.content && !message.error && !message.stopped
      ? <p className="source-note">{fa ? "این پاسخ منبعِ قابل بررسی از سرویس دریافت نکرد." : "The service did not return verifiable sources for this response."}</p> : null;
  }
  return <Collapsible className="response-sources" open={open} onOpenChange={setOpen}>
    <CollapsibleTrigger className="sources-toggle"><Globe size={16} />
      {fa ? `منابع (${sources.length.toLocaleString("fa")})` : `Sources (${sources.length})`}
      <ChevronDown size={14} className={open ? "is-expanded" : ""} />
    </CollapsibleTrigger>
    <CollapsibleContent><ol className="source-list">
      {sources.map((source, i) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">
        <span className="source-number">{(i + 1).toLocaleString(fa ? "fa" : "en")}</span>
        <span><b dir="auto">{source.title}</b><small dir="ltr">{new URL(source.url).hostname}</small></span>
      </a></li>)}
    </ol></CollapsibleContent>
  </Collapsible>;
}
