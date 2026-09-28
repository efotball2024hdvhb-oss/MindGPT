"use client";
import {
  useEffect,
  useRef,
  useState,
  Fragment,
  type ReactNode,
  type CSSProperties,
} from "react";
import {
  Menu as MenuIcon,
  SquarePen,
  MoreVertical,
  Plus,
  Mic,
  AudioLines,
  ArrowUp,
  X,
  Search,
  Images,
  Library,
  Folder,
  Clock,
  AtSign,
  Settings,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  TextSelect,
  Pencil,
  Share2,
  Pin,
  PinOff,
  Trash2,
  Archive,
  FolderPlus,
  Paperclip,
  House,
  RotateCw,
  Globe,
  GitBranch,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Camera,
  ImagePlus,
  Brain,
  Pause,
  Play,
  Square,
  Download,
  ExternalLink,
  Languages,
  Sun,
  Moon,
  Monitor,
  SlidersHorizontal,
  Shield,
  MessageCircle,
  ArrowLeft,
  LoaderCircle,
  FileText,
  CalendarDays,
  Lightbulb,
  Code2,
  WifiOff,
  AlertCircle,
  PlusCircle,
  Undo2,
  CheckCheck,
  Send,
  ChevronsUpDown,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  api,
  uid,
  plain,
  type Chat,
  type Message,
  type Model,
  type Profile,
  type Asset,
} from "@/lib/types";
import { useVoice } from "@/hooks/use-voice";
import { extractText } from "@/lib/attachments";

type Item = {
  label: string;
  icon: ReactNode;
  action: () => void;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean;
};
function ActionMenu({
  children,
  items,
  title,
  open,
  onOpenChange,
  align = "end",
}: {
  children: ReactNode;
  items: Item[];
  title?: string;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  align?: "start" | "end";
}) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="action-menu" align={align} sideOffset={9}>
        {title && (
          <DropdownMenuLabel className="menu-label">{title}</DropdownMenuLabel>
        )}
        {items.map((item, i) => (
          <Fragment key={i}>
            {item.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              className="menu-item"
              variant={item.danger ? "destructive" : "default"}
              disabled={item.disabled}
              onSelect={item.action}
            >
              {item.icon}
              <span>{item.label}</span>
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
function IconButton({
  label,
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={"icon-button " + className}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function Wave({
  active = true,
  level = 0.3,
}: {
  active?: boolean;
  level?: number;
}) {
  return (
    <div className={"wave " + (active ? "active" : "")} aria-hidden="true">
      {Array.from({ length: 38 }, (_, i) => (
        <i
          key={i}
          style={
            {
              "--bar": `${4 + ((i * 13 + 7) % 23) * (active ? Math.max(0.2, level * 2) : 0.1)}px`,
              "--delay": `${i * 0.037}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
function Choice({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="select-control" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem value={o.value} key={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function CodeBlock({ children, ...props }: any) {
  const [copied, setCopied] = useState(false);
  const text = String(children?.props?.children || "");
  return (
    <div className="code-block">
      <div className="code-head">
        <span>
          {children?.props?.className?.replace("language-", "") || "code"}
        </span>
        <button
          aria-label="Copy code"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            } catch {
              toast.error("Copy failed");
            }
          }}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}{" "}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre {...props}>{children}</pre>
    </div>
  );
}
function ChatBody() {
  const { toggleSidebar, setOpenMobile, isMobile } = useSidebar();
  const [profile, setProfile] = useState<Profile>({
    language: "fa",
    theme: "dark",
    haptics: true,
    voiceRate: "1",
  });
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState("");
  const [panel, setPanel] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState<Asset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [web, setWeb] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [editing, setEditing] = useState<Message | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [rename, setRename] = useState<Chat | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteChat, setDeleteChat] = useState<Chat | null>(null);
  const [contextId, setContextId] = useState<string | null>(null);
  const [find, setFind] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [search, setSearch] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [taskText, setTaskText] = useState("");
  const [taskAt, setTaskAt] = useState("");
  const [imageAsset, setImageAsset] = useState<Asset | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [online, setOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const panelContent = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);
  const nearBottom = useRef(true);
  const profileQueue = useRef(Promise.resolve());
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fa = profile.language !== "en";
  const t = (f: string, e: string) => (fa ? f : e);
  const chat = chats.find((c) => c.id === activeId) || null;
  const messages = chat?.messages || [];
  const selectedModel = models.find((m) => m.id === profile.model);
  const currentModel =
    selectedModel?.name || selectedModel?.id || t("انتخاب مدل", "Select model");
  function errorMessage(s: string) {
    if (!fa) return s;
    if (s.includes("(403)"))
      return "سرویس CodeCraft دسترسی را نپذیرفت (۴۰۳). مجوز کلید یا دسترسی سرویس باید بررسی شود.";
    if (/key was rejected/.test(s)) return "کلید API پذیرفته نشد.";
    if (/credit/.test(s)) return "اعتبار سرویس API کافی نیست.";
    if (/temporarily unavailable/.test(s))
      return "ارتباط با سرویس برقرار نشد. متن شما حفظ شده؛ دوباره امتحان کنید.";
    if (/limit reached|Too many/.test(s))
      return "به محدودیت درخواست رسیدید. کمی بعد دوباره امتحان کنید.";
    if (/model cannot read images/.test(s))
      return "این مدل تصویر نمی‌خواند. یک مدل دارای قابلیت Vision انتخاب کن.";
    return s;
  }
  function fail(e: any) {
    toast.error(errorMessage(e.message || String(e)));
  }
  function haptic() {
    if (profile.haptics) navigator.vibrate?.(12);
  }
  const voice = useVoice(
    profile.language || "fa",
    (text) => {
      setDraft((d) => (d ? d + " " : "") + text);
      setVoiceMode(false);
      setTimeout(() => input.current?.focus(), 60);
      toast.success(
        t(
          "صدا به متن تبدیل شد؛ قبل از ارسال می‌توانی ویرایشش کنی.",
          "Transcribed. Review your text before sending.",
        ),
      );
    },
    (message) => toast.error(message),
    Number(profile.voiceRate || 1),
  );
  async function loadModels() {
    setModelLoading(true);
    setModelError("");
    try {
      const data = await api("models");
      setModels(data.data);
      if (
        !profileRef.current.model ||
        !data.data.some((m: Model) => m.id === profileRef.current.model)
      ) {
        const first =
          data.data.find((m: Model) => m.type === "chat") ||
          data.data.find((m: Model) => m.type !== "embedding");
        if (first) updateProfile({ model: first.id });
      }
    } catch (e: any) {
      setModelError(e.message);
    } finally {
      setModelLoading(false);
    }
  }
  async function bootstrap() {
    setBootError("");
    try {
      const data = await api("bootstrap");
      setChats(data.chats);
      setAssets(data.assets);
      try {
        const resume = JSON.parse(
          sessionStorage.getItem("mindgpt-draft") || "{}",
        );
        if (data.chats.some((c: Chat) => c.id === resume.chatId))
          setActiveId(resume.chatId);
        if (typeof resume.text === "string") setDraft(resume.text);
      } catch {}

      setProfile((p) => ({ ...p, ...data.profile }));
      profileRef.current = { ...profileRef.current, ...data.profile };
      setReady(true);
      void loadModels();
    } catch (e: any) {
      setBootError(e.message);
    }
  }
  useEffect(() => {
    void bootstrap();
    const online = () => setOnline(navigator.onLine);
    online();
    window.addEventListener("online", online);
    window.addEventListener("offline", online);
    const install = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", install);
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    const size = () =>
      document.documentElement.style.setProperty(
        "--app-height",
        `${window.visualViewport?.height || window.innerHeight}px`,
      );
    size();
    window.visualViewport?.addEventListener("resize", size);
    window.addEventListener("resize", size);
    return () => {
      abort.current?.abort();
      window.removeEventListener("online", online);
      window.removeEventListener("offline", online);
      window.removeEventListener("beforeinstallprompt", install);
      window.visualViewport?.removeEventListener("resize", size);
      window.removeEventListener("resize", size);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = fa ? "fa" : "en";
    document.documentElement.dir = fa ? "rtl" : "ltr";
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        profile.theme === "system"
          ? media.matches
            ? "dark"
            : "light"
          : profile.theme || "dark";
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [fa, profile.theme]);
  useEffect(() => {
    if (input.current) {
      input.current.style.height = "auto";
      input.current.style.height =
        Math.min(input.current.scrollHeight, 160) + "px";
    }
  }, [draft]);
  useEffect(() => {
    if (nearBottom.current)
      scroll.current?.scrollTo({
        top: scroll.current.scrollHeight,
        behavior: busy ? "instant" : "smooth",
      });
  }, [messages.length, messages[messages.length - 1]?.content, busy]);
  useEffect(() => {
    nearBottom.current = true;
    scroll.current?.scrollTo({ top: scroll.current.scrollHeight });
    setFindQuery("");
  }, [activeId]);
  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(
        "mindgpt-draft",
        JSON.stringify({ chatId: activeId, text: draft }),
      );
    } catch {}
  }, [ready, activeId, draft]);
  function updateProfile(patch: Partial<Profile>) {
    const next = { ...profileRef.current, ...patch };
    profileRef.current = next;
    setProfile(next);
    profileQueue.current = profileQueue.current
      .then(async () => {
        await api("profile", "POST", next);
      })
      .catch(fail);
  }
  function mergeChat(c: Chat) {
    setChats((cs) =>
      [c, ...cs.filter((x) => x.id !== c.id)].sort(
        (a, b) => b.updated - a.updated,
      ),
    );
  }
  async function persist(c: Chat) {
    await api("chats", "POST", c);
    mergeChat(c);
  }
  async function changeChat(c: Chat, patch: Partial<Chat>) {
    try {
      await persist({ ...c, ...patch, updated: Date.now() });
      haptic();
    } catch (e) {
      fail(e);
    }
  }
  function newChat() {
    if (busy) {
      toast(
        t("اول پاسخ فعلی را متوقف کن.", "Stop the current response first."),
      );
      return;
    }
    setActiveId(null);
    setDraft("");
    setFiles([]);
    setEditing(null);
    setFind(false);
    setOpenMobile(false);
    setProjectFilter("");
    input.current?.focus();
  }
  function openChat(c: Chat) {
    if (busy && c.id !== workingId) {
      toast(
        t("اول پاسخ فعلی را متوقف کن.", "Stop the current response first."),
      );
      return;
    }
    setActiveId(c.id);
    setEditing(null);
    setDraft("");
    setFiles([]);
    setOpenMobile(false);
    setPanel(null);
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      haptic();
      toast.success(t("کپی شد", "Copied"), { icon: <CheckCheck size={18} /> });
    } catch {
      setSelectedText(text);
      setPanel("select");
      toast(t("متن را انتخاب و کپی کن.", "Select and copy the text."));
    }
  }
  async function shareText(text: string) {
    try {
      if (navigator.share) await navigator.share({ title: "MindGPT", text });
      else await copy(text);
    } catch (e: any) {
      if (e.name !== "AbortError") fail(e);
    }
  }
  function exportData() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            app: "MindGPT",
            version: 1,
            exported: new Date().toISOString(),
            chats,
            profile,
            assets,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "MindGPT-export.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast.success(t("خروجی گفتگوها آماده شد", "Conversations exported"));
  }
  async function install() {
    if (installPrompt) {
      await installPrompt.prompt();
      setInstallPrompt(null);
    } else setPanel("install");
  }
  function modelForWeb() {
    return models.find((m) => m.capabilities?.includes("web_search"));
  }
  function enableWeb() {
    if (!modelForWeb()) {
      toast(
        t(
          "مدل دارای جست‌وجوی وب در فهرست فعلی سرویس پیدا نشد.",
          "No web-search model is available from the service.",
        ),
      );
      setPanel("models");
      return;
    }
    setWeb((w) => !w);
    haptic();
  }
  async function generate(c: Chat, withWeb = web) {
    let chosen = selectedModel;
    if (withWeb && !chosen?.capabilities?.includes("web_search"))
      chosen = modelForWeb();
    if (!chosen) {
      setBusy(false);
      toast.error(
        t(
          "ابتدا فهرست مدل‌ها را در تنظیمات بارگذاری کن.",
          "Load the model list in Settings first.",
        ),
      );
      setPanel("models");
      return;
    }
    setBusy(true);
    setWorkingId(c.id);
    const control = new AbortController();
    abort.current = control;
    const answer: Message = {
      id: uid(),
      role: "assistant",
      content: "",
      created: Date.now(),
      model: chosen.id,
    };
    let working = {
      ...c,
      messages: [...c.messages, answer],
      updated: Date.now(),
    };
    mergeChat(working);
    nearBottom.current = true;
    const update = (delta: string) => {
      answer.content += delta;
      working = { ...working, messages: [...c.messages, { ...answer }] };
      mergeChat(working);
    };
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: c.id,
          model: chosen.id,
          web: withWeb,
          reasoning: thinking,
          instructions: profile.instructions,
        }),
        signal: control.signal,
      });
      if (!response.ok) {
        const err: any = await response.json();
        throw new Error(err.error || "Request failed");
      }
      if (response.headers.get("Content-Type")?.includes("event-stream")) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let ended = false;
        while (!ended) {
          const { value, done } = await reader.read();
          buffer += decoder.decode(value, { stream: !done });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          if (done && buffer) lines.push(buffer);
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const raw = line.slice(5).trim();
            if (raw === "[DONE]") {
              ended = true;
              continue;
            }
            if (!raw) continue;
            let j: any;
            try {
              j = JSON.parse(raw);
            } catch {
              continue;
            }
            if (j.error) throw new Error(j.error.message || "Stream failed");
            const delta = j.choices?.[0]?.delta?.content;
            if (typeof delta === "string") update(delta);
          }
          if (done) break;
        }
      } else {
        const j: any = await response.json();
        const content = j.choices?.[0]?.message?.content;
        if (typeof content === "string") update(content);
      }
      if (!answer.content.trim())
        throw new Error(
          t(
            "مدل پاسخ متنی برنگرداند. یک مدل دیگر را امتحان کن.",
            "The model returned no text. Try a different model.",
          ),
        );
    } catch (e: any) {
      if (e.name === "AbortError") {
        answer.stopped = true;
        if (!answer.content)
          answer.content = t("پاسخ متوقف شد.", "Response stopped.");
      } else {
        answer.error = e.message;
        fail(e);
      }
    } finally {
      working = {
        ...working,
        messages: [...c.messages, { ...answer }],
        updated: Date.now(),
      };
      mergeChat(working);
      try {
        await persist(working);
      } catch (e) {
        fail(e);
        toast.error(
          t(
            "ذخیرهٔ آخرین پاسخ ناموفق بود. قبل از خروج آن را کپی کن.",
            "The last reply could not be saved. Copy it before leaving.",
          ),
        );
      }
      setBusy(false);
      setWorkingId(null);
      abort.current = null;
    }
  }
  async function send() {
    if (busy || uploading || (!draft.trim() && !files.length)) return;
    if (!ready) {
      fail(new Error(bootError || "Session expired. Reload the app."));
      return;
    }
    if (!selectedModel) {
      setPanel("models");
      return;
    }
    setBusy(true);
    haptic();
    const original = draft;
    const originalFiles = files;
    let c: Chat = chat
      ? { ...chat, messages: [...chat.messages] }
      : {
          id: uid(),
          title:
            original.trim().slice(0, 48) ||
            files[0]?.name ||
            t("گفتگوی جدید", "New chat"),
          messages: [],
          created: Date.now(),
          updated: Date.now(),
        };
    if (editing) {
      const index = c.messages.findIndex((m) => m.id === editing.id);
      c.messages = c.messages.slice(0, index);
    }
    c.messages.push({
      id: uid(),
      role: "user",
      content: original.trim(),
      created: Date.now(),
      attachments: originalFiles,
    });
    c.updated = Date.now();
    try {
      await persist(c);
      setActiveId(c.id);
      setDraft("");
      setFiles([]);
      setEditing(null);
      await generate(c);
    } catch (e) {
      setDraft(original);
      setFiles(originalFiles);
      setBusy(false);
      fail(e);
    }
  }
  async function retry(index: number, withWeb = false) {
    if (busy || !chat) return;
    if (!selectedModel || (withWeb && !modelForWeb())) {
      setPanel("models");
      return;
    }
    setBusy(true);
    const c = {
      ...chat,
      messages: chat.messages.slice(0, index),
      updated: Date.now(),
    };
    try {
      await persist(c);
      await generate(c, withWeb);
    } catch (e) {
      setBusy(false);
      fail(e);
    }
  }
  async function branch(index: number) {
    if (!chat || busy) return;
    const c = {
      ...chat,
      id: uid(),
      title: chat.title + " · " + t("شاخه", "branch"),
      messages: chat.messages.slice(0, index + 1),
      pinned: false,
      created: Date.now(),
      updated: Date.now(),
    };
    try {
      await persist(c);
      setActiveId(c.id);
      toast.success(t("گفتگوی تازه ساخته شد", "New branch created"));
    } catch (e) {
      fail(e);
    }
  }
  function editMessage(m: Message) {
    if (busy) return;
    setEditing(m);
    setDraft(m.content);
    setFiles(m.attachments || []);
    input.current?.focus();
  }
  async function upload(list: FileList | null) {
    if (!list?.length) return;
    if (!ready) return;
    setUploading(true);
    try {
      for (const f of Array.from(list).slice(0, 4 - files.length)) {
        if (f.size > 10 * 1024 * 1024)
          throw new Error(
            t(
              "حداکثر اندازهٔ هر فایل ۱۰ مگابایت است.",
              "Maximum file size is 10 MB.",
            ),
          );
        const extracted = await extractText(f);
        const fd = new FormData();
        fd.append("file", f);
        fd.append("extracted", extracted);
        const r = await fetch("/api/upload", { method: "POST", body: fd });
        const data: any = await r.json();
        if (!r.ok) throw new Error(data.error);
        setAssets((a) => [data, ...a]);
        setFiles((fs) => [...fs, data]);
      }
      haptic();
    } catch (e) {
      fail(e);
    } finally {
      setUploading(false);
      [fileInput, cameraInput, photoInput].forEach((r) => {
        if (r.current) r.current.value = "";
      });
    }
  }
  function holdStart(id: string) {
    hold.current = setTimeout(() => {
      haptic();
      setContextId(id);
    }, 480);
  }
  function holdEnd() {
    if (hold.current) clearTimeout(hold.current);
  }
  function chatItems(c: Chat): Item[] {
    return [
      {
        label: c.pinned ? t("برداشتن پین", "Unpin") : t("پین", "Pin"),
        icon: c.pinned ? <PinOff /> : <Pin />,
        action: () => void changeChat(c, { pinned: !c.pinned }),
        disabled: busy,
      },
      {
        label: t("تغییر نام", "Rename"),
        disabled: busy,
        icon: <Pencil />,
        action: () => {
          setRename(c);
          setRenameValue(c.title);
        },
      },
      {
        label: t("حذف", "Delete"),
        icon: <Trash2 />,
        danger: true,
        action: () => setDeleteChat(c),
        disabled: busy,
      },
    ];
  }
  const headerItems: Item[] = [
    {
      label: t("اشتراک‌گذاری", "Share"),
      icon: <Share2 />,
      action: () =>
        void shareText(
          messages
            .map(
              (m) =>
                `${m.role === "user" ? t("شما", "You") : "MindGPT"}: ${m.content}`,
            )
            .join("\n\n"),
        ),
      disabled: !chat || busy,
    },
    {
      label: chat?.pinned ? t("برداشتن پین", "Unpin") : t("پین", "Pin"),
      icon: <Pin />,
      action: () => chat && void changeChat(chat, { pinned: !chat.pinned }),
      disabled: !chat || busy,
    },
    {
      label: t("افزودن به پروژه", "Add to project"),
      icon: <FolderPlus />,
      action: () => setPanel("addproject"),
      disabled: !chat || busy,
    },
    {
      label: t("فایل‌های بارگذاری‌شده", "Uploaded files"),
      icon: <Paperclip />,
      action: () => setPanel("chatfiles"),
    },
    {
      label: t("جست‌وجو در گفتگو", "Find in chat"),
      icon: <Search />,
      action: () => setFind(true),
      disabled: !chat || busy,
    },
    {
      label: t("افزودن به صفحهٔ اصلی", "Add to home"),
      icon: <House />,
      action: () => void install(),
    },
    {
      label: t("بایگانی", "Archive"),
      icon: <Archive />,
      action: () => {
        if (chat) {
          void changeChat(chat, { archived: true });
          setActiveId(null);
        }
      },
      disabled: !chat || busy,
    },
    {
      label: t("حذف", "Delete"),
      icon: <Trash2 />,
      danger: true,
      action: () => setDeleteChat(chat),
      disabled: !chat || busy,
    },
  ];
  const addItems: Item[] = [
    {
      label: t("دوربین", "Camera"),
      icon: <Camera />,
      action: () => cameraInput.current?.click(),
    },
    {
      label: t("تصاویر", "Photos"),
      icon: <ImagePlus />,
      action: () => photoInput.current?.click(),
    },
    {
      label: t("فایل‌ها", "Files"),
      icon: <Paperclip />,
      action: () => fileInput.current?.click(),
    },
    {
      label: t("ابزارها", "Plugins"),
      icon: <AtSign />,
      action: () => setPanel("tools"),
    },
    {
      label: t("عمیق‌تر فکر کن", "Think harder"),
      icon: <Brain />,
      action: () => setThinking((x) => !x),
    },
    {
      label: t("جست‌وجوی وب", "Search the web"),
      icon: <Globe />,
      action: enableWeb,
    },
  ];
  const visibleChats = chats.filter(
    (c) => !c.archived && (!projectFilter || c.project === projectFilter),
  );
  const grouped = [
    {
      title: t("پین‌شده", "Pinned"),
      items: visibleChats.filter((c) => c.pinned),
    },
    {
      title: t("گفتگوها", "Chats"),
      items: visibleChats.filter((c) => !c.pinned),
    },
  ];
  const matched = messages.filter(
    (m) =>
      findQuery && m.content.toLowerCase().includes(findQuery.toLowerCase()),
  );
  useEffect(() => {
    const context = (document as any).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const registrations = [
      {
        name: "list_mindgpt_chats",
        title: "List MindGPT chats",
        description: "List saved conversations in the current browser session.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute: () => ({
          chats: chats.map((c) => ({
            id: c.id,
            title: c.title,
            pinned: !!c.pinned,
            archived: !!c.archived,
          })),
        }),
      },
      {
        name: "stage_mindgpt_prompt",
        title: "Prepare a prompt",
        description:
          "Place text in the visible composer for review. Does not send it to the AI service.",
        inputSchema: {
          type: "object",
          properties: { text: { type: "string", maxLength: 12000 } },
          required: ["text"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute: (input: any) => {
          if (
            typeof input?.text !== "string" ||
            input.text.length > 12000 ||
            Object.keys(input).some((k) => k !== "text")
          )
            throw new Error("Expected text up to 12000 characters");
          if (busy) throw new Error("Wait for the current reply");
          setDraft(input.text);
          return { staged: true, sent: false };
        },
      },
    ];
    for (const tool of registrations)
      try {
        Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {}
    return () => lifecycle.abort();
  }, [chats, busy]);
  return (
    <>
      <Sidebar side="left" className="mind-sidebar">
        <SidebarHeader className="side-heading">
          <b dir="ltr">MindGPT</b>
          <IconButton
            label={t("جست‌وجوی گفتگوها", "Search chats")}
            onClick={() => {
              setPanel("search");
              setOpenMobile(false);
            }}
          >
            <Search />
          </IconButton>
        </SidebarHeader>
        <SidebarContent className="side-content">
          <nav className="side-nav">
            {[
              { icon: <Images />, label: t("تصاویر", "Images"), key: "images" },
              {
                icon: <Library />,
                label: t("کتابخانه", "Library"),
                key: "library",
              },
              {
                icon: <Folder />,
                label: t("پروژه‌ها", "Projects"),
                key: "projects",
              },
              {
                icon: <Clock />,
                label: t("زمان‌بندی", "Scheduled"),
                key: "scheduled",
              },
              {
                icon: <AtSign />,
                label: t("ابزارها", "Plugins"),
                key: "tools",
              },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setPanel(item.key);
                  setOpenMobile(false);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="side-divider" />
          {projectFilter && (
            <button
              className="project-filter"
              onClick={() => setProjectFilter("")}
            >
              <X size={15} />
              {profile.projects?.find((p) => p.id === projectFilter)?.name}
            </button>
          )}
          {grouped.map(
            (g) =>
              g.items.length > 0 && (
                <section key={g.title} className="chat-group">
                  <h2>{g.title}</h2>
                  {g.items.map((c) => (
                    <div
                      className={
                        "chat-row " + (c.id === activeId ? "selected" : "")
                      }
                      key={c.id}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextId(c.id);
                      }}
                      onPointerDown={() => holdStart(c.id)}
                      onPointerUp={holdEnd}
                      onPointerMove={holdEnd}
                      onPointerCancel={holdEnd}
                    >
                      <button
                        className="chat-title"
                        onClick={() => openChat(c)}
                      >
                        {c.pinned && <Pin size={13} />}
                        <span dir="auto">{c.title}</span>
                      </button>
                      <ActionMenu
                        open={contextId === c.id}
                        onOpenChange={(v) => setContextId(v ? c.id : null)}
                        items={chatItems(c)}
                      >
                        <button
                          className="chat-dots"
                          aria-label={t("گزینه‌های گفتگو", "Chat options")}
                        >
                          <MoreVertical size={17} />
                        </button>
                      </ActionMenu>
                    </div>
                  ))}
                </section>
              ),
          )}
          {!visibleChats.length && (
            <div className="side-empty">
              <MessageCircle size={22} />
              <p>
                {t(
                  "گفتگوهای تو اینجا می‌مانند",
                  "Your conversations will appear here",
                )}
              </p>
            </div>
          )}
        </SidebarContent>
        <SidebarFooter className="side-footer">
          <button className="new-chat" onClick={newChat}>
            <SquarePen size={18} />
            {t("گفتگوی جدید", "New chat")}
          </button>
          <IconButton
            label={t("تنظیمات", "Settings")}
            className="settings-button"
            onClick={() => {
              setPanel("settings");
              setOpenMobile(false);
            }}
          >
            <Settings />
          </IconButton>
        </SidebarFooter>
      </Sidebar>
      <main className="chat-app" dir={fa ? "rtl" : "ltr"}>
        <header className="topbar" dir="ltr">
          <IconButton
            label={t("باز کردن فهرست گفتگوها", "Open sidebar")}
            className="round-button"
            onClick={toggleSidebar}
          >
            <MenuIcon />
          </IconButton>
          <button className="model-heading" onClick={() => setPanel("models")}>
            <span>MindGPT</span>
            <ChevronDown size={16} />
            <small dir="auto">
              {selectedModel?.name || selectedModel?.id || ""}
            </small>
          </button>
          <div className="header-right">
            {!chat && (
              <button className="plus-button" onClick={() => setPanel("plus")}>
                Get Plus <span>✦</span>
              </button>
            )}
            <div className="header-capsule">
              <IconButton
                label={t("گفتگوی جدید", "New chat")}
                onClick={newChat}
              >
                <SquarePen />
              </IconButton>
              <ActionMenu title={chat?.title} items={headerItems}>
                <button
                  className="icon-button"
                  aria-label={t("گزینه‌های گفتگو", "Conversation menu")}
                >
                  <MoreVertical />
                </button>
              </ActionMenu>
            </div>
          </div>
        </header>
        {!online && (
          <div className="notice">
            <WifiOff size={16} />
            {t(
              "اتصال اینترنت قطع است. پیش‌نویس تو حفظ می‌شود.",
              "You are offline. Your draft stays here.",
            )}
          </div>
        )}
        {bootError && (
          <div className="notice error">
            <AlertCircle size={18} />
            <span>{errorMessage(bootError)}</span>
            <button onClick={bootstrap}>{t("تلاش دوباره", "Retry")}</button>
          </div>
        )}
        {voice.player && (
          <div className="audio-player" dir="ltr">
            <IconButton
              label={t("بستن پخش صدا", "Close player")}
              onClick={voice.stopSpeaking}
            >
              <X />
            </IconButton>
            <Wave active={!voice.player.paused} />
            <time>
              {Math.floor(voice.player.elapsed / 60)
                .toString()
                .padStart(2, "0")}
              :{(voice.player.elapsed % 60).toString().padStart(2, "0")}
            </time>
            <IconButton
              label={voice.player.paused ? t("پخش", "Play") : t("مکث", "Pause")}
              className="player-toggle"
              onClick={voice.togglePlayer}
            >
              {voice.player.paused ? (
                <Play fill="currentColor" />
              ) : (
                <Pause fill="currentColor" />
              )}
            </IconButton>
          </div>
        )}
        {find && (
          <div className="find-bar">
            <IconButton
              label={t("بستن جست‌وجو", "Close search")}
              onClick={() => {
                setFind(false);
                setFindQuery("");
              }}
            >
              <ArrowLeft />
            </IconButton>
            <input
              autoFocus
              placeholder={t("جست‌وجو در گفتگو", "Search in chat")}
              value={findQuery}
              onChange={(e) => setFindQuery(e.target.value)}
            />
            <span>{matched.length}</span>
            {matched.length > 0 && (
              <button
                onClick={() =>
                  document
                    .getElementById("msg-" + matched[0].id)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
              >
                {t("نمایش", "Find")}
              </button>
            )}
          </div>
        )}
        <div
          ref={scroll}
          className={
            "conversation-scroll " + (!messages.length ? "is-empty" : "")
          }
          onScroll={() => {
            const el = scroll.current!;
            nearBottom.current =
              el.scrollHeight - el.scrollTop - el.clientHeight < 120;
          }}
        >
          {!messages.length ? (
            <div className="empty-chat">
              <div className="brand-mark" aria-hidden="true">
                M
              </div>
              <h1>{t("به چی فکر می‌کنی؟", "What’s on your mind?")}</h1>
              <div className="suggestions">
                {[
                  {
                    icon: <Lightbulb />,
                    color: "amber",
                    text: t(
                      "یک ایدهٔ تازه پیدا کنیم",
                      "Let’s find a fresh idea",
                    ),
                    prompt: t(
                      "کمکم کن یک ایدهٔ خلاقانه برای پروژهٔ بعدی‌ام پیدا کنم. اول ازم سؤال بپرس.",
                      "Help me brainstorm a creative idea for my next project. Ask me a question first.",
                    ),
                  },
                  {
                    icon: <Code2 />,
                    color: "blue",
                    text: t("با هم چیزی بسازیم", "Let’s build something"),
                    prompt: t(
                      "می‌خواهم برنامه‌نویسی یاد بگیرم. قدم به قدم کمکم کن.",
                      "I want to learn coding. Help me step by step.",
                    ),
                  },
                  {
                    icon: <FileText />,
                    color: "green",
                    text: t(
                      "یک متن را بهتر بنویسیم",
                      "Make something read better",
                    ),
                    prompt: t(
                      "می‌خواهم متنی را بازنویسی کنم. متن را در پیام بعدی می‌فرستم.",
                      "Help me rewrite a piece of text. I will send it next.",
                    ),
                  },
                ].map((s) => (
                  <button
                    key={s.color}
                    onClick={() => {
                      setDraft(s.prompt);
                      input.current?.focus();
                    }}
                  >
                    <span className={s.color}>{s.icon}</span>
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((m, index) => (
                <article
                  key={m.id}
                  id={"msg-" + m.id}
                  className={`message ${m.role} ${findQuery && m.content.toLowerCase().includes(findQuery.toLowerCase()) ? "search-hit" : ""}`}
                >
                  {m.role === "user" ? (
                    <div className="user-content">
                      {m.attachments?.length ? (
                        <div className="message-attachments">
                          {m.attachments.map((a) =>
                            a.mime.startsWith("image/") ? (
                              <button
                                key={a.id}
                                className="image-attachment"
                                onClick={() => setImageAsset(a)}
                              >
                                <img src={"/api/files/" + a.id} alt={a.name} />
                              </button>
                            ) : (
                              <a
                                key={a.id}
                                href={"/api/files/" + a.id}
                                className="file-attachment"
                                download
                              >
                                <FileText size={24} />
                                <span>
                                  {a.name}
                                  <small>{(a.size / 1024).toFixed(0)} KB</small>
                                </span>
                              </a>
                            ),
                          )}
                        </div>
                      ) : null}
                      {m.content && (
                        <ActionMenu
                          title={new Date(m.created).toLocaleTimeString(
                            fa ? "fa-IR" : "en-US",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                          items={[
                            {
                              label: t("کپی", "Copy"),
                              icon: <Copy />,
                              action: () => void copy(m.content),
                            },
                            {
                              label: t("انتخاب متن", "Select text"),
                              icon: <TextSelect />,
                              action: () => {
                                setSelectedText(m.content);
                                setPanel("select");
                              },
                            },
                            {
                              label: t("ویرایش پیام", "Edit message"),
                              icon: <Pencil />,
                              action: () => editMessage(m),
                              disabled: busy,
                            },
                            {
                              label: t("اشتراک‌گذاری پیام", "Share prompt"),
                              icon: <Share2 />,
                              action: () => void shareText(m.content),
                            },
                          ]}
                        >
                          <button
                            className="user-bubble"
                            dir="auto"
                            onContextMenu={(e) => {
                              e.preventDefault();
                              e.currentTarget.click();
                            }}
                          >
                            {m.content}
                          </button>
                        </ActionMenu>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="assistant-body" dir="auto">
                        {m.error ? (
                          <div className="response-error">
                            <AlertCircle size={20} />
                            <p>{errorMessage(m.error)}</p>
                            <button
                              onClick={() => retry(index)}
                              disabled={busy}
                            >
                              <RotateCw size={15} />
                              {t("تلاش دوباره", "Retry")}
                            </button>
                          </div>
                        ) : m.content ? (
                          <Markdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                              pre: CodeBlock,
                              a: ({ children, ...props }) => (
                                <a
                                  {...props}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {children}
                                </a>
                              ),
                              table: ({ children }) => (
                                <div className="table-scroll">
                                  <table>{children}</table>
                                </div>
                              ),
                              img: ({ src, alt }) => (
                                <a
                                  href={
                                    typeof src === "string" ? src : undefined
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {alt || t("باز کردن تصویر", "Open image")}
                                </a>
                              ),
                            }}
                          >
                            {m.content}
                          </Markdown>
                        ) : (
                          <div className="thinking">
                            <span />
                            <span />
                            <span />
                            <small>{t("در حال فکر کردن", "Thinking")}</small>
                          </div>
                        )}
                      </div>
                      {m.content && (
                        <div className="response-actions">
                          <IconButton
                            label={t("کپی پاسخ", "Copy response")}
                            onClick={() => void copy(m.content)}
                          >
                            <Copy />
                          </IconButton>
                          <IconButton
                            label={t("پاسخ خوب", "Good response")}
                            className={m.feedback === "up" ? "is-active" : ""}
                            onClick={() => {
                              if (chat)
                                void changeChat(chat, {
                                  messages: messages.map((x) =>
                                    x.id === m.id
                                      ? {
                                          ...x,
                                          feedback:
                                            m.feedback === "up"
                                              ? undefined
                                              : "up",
                                        }
                                      : x,
                                  ),
                                });
                            }}
                            disabled={busy}
                          >
                            <ThumbsUp />
                          </IconButton>
                          <IconButton
                            label={t("پاسخ ضعیف", "Bad response")}
                            className={m.feedback === "down" ? "is-active" : ""}
                            onClick={() => {
                              if (chat)
                                void changeChat(chat, {
                                  messages: messages.map((x) =>
                                    x.id === m.id
                                      ? {
                                          ...x,
                                          feedback:
                                            m.feedback === "down"
                                              ? undefined
                                              : "down",
                                        }
                                      : x,
                                  ),
                                });
                            }}
                            disabled={busy}
                          >
                            <ThumbsDown />
                          </IconButton>
                          <IconButton
                            label={t("خواندن پاسخ", "Read aloud")}
                            onClick={() => voice.speak(m.content)}
                          >
                            <Volume2 />
                          </IconButton>
                          <IconButton
                            label={t("اشتراک‌گذاری پاسخ", "Share response")}
                            onClick={() => void shareText(m.content)}
                          >
                            <Share2 />
                          </IconButton>
                          <ActionMenu
                            title={m.model}
                            items={[
                              {
                                label: t(
                                  "شاخه در گفتگوی جدید",
                                  "Branch in new chat",
                                ),
                                icon: <GitBranch />,
                                action: () => void branch(index),
                                disabled: busy,
                              },
                              {
                                label: t("تلاش دوباره", "Retry"),
                                icon: <RotateCw />,
                                action: () => void retry(index),
                                separator: true,
                                disabled: busy,
                              },
                              {
                                label: t("جست‌وجوی وب", "Search the web"),
                                icon: <Globe />,
                                action: () => {
                                  if (modelForWeb()) void retry(index, true);
                                  else {
                                    enableWeb();
                                  }
                                },
                                disabled: busy,
                              },
                              {
                                label: t("انتخاب متن", "Select text"),
                                icon: <TextSelect />,
                                action: () => {
                                  setSelectedText(m.content);
                                  setPanel("select");
                                },
                              },
                            ]}
                          >
                            <button
                              className="icon-button"
                              aria-label={t(
                                "گزینه‌های پاسخ",
                                "Response options",
                              )}
                            >
                              <MoreVertical />
                            </button>
                          </ActionMenu>
                        </div>
                      )}
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
        <div className="composer-dock">
          <div className="composer-wrap">
            {editing && (
              <div className="edit-notice">
                <Pencil size={16} />
                <span>
                  {t(
                    "ویرایش، ادامهٔ گفتگو را از این پیام دوباره می‌سازد.",
                    "Editing restarts the conversation from this message.",
                  )}
                </span>
                <IconButton
                  label={t("لغو ویرایش", "Cancel editing")}
                  onClick={() => {
                    setEditing(null);
                    setDraft("");
                    setFiles([]);
                  }}
                >
                  <X />
                </IconButton>
              </div>
            )}
            {(web || thinking) && (
              <div className="mode-chips">
                {web && (
                  <button onClick={() => setWeb(false)}>
                    <Globe size={15} />
                    {t("جست‌وجوی وب", "Search")}
                    <X size={13} />
                  </button>
                )}
                {thinking && (
                  <button onClick={() => setThinking(false)}>
                    <Brain size={15} />
                    {t("تفکر عمیق", "Think harder")}
                    <X size={13} />
                  </button>
                )}
              </div>
            )}
            {files.length > 0 && (
              <div className="draft-files">
                {files.map((a) => (
                  <div key={a.id}>
                    {a.mime.startsWith("image/") ? (
                      <img src={"/api/files/" + a.id} alt="" />
                    ) : (
                      <FileText />
                    )}
                    <span>{a.name}</span>
                    <IconButton
                      label={t("حذف پیوست", "Remove attachment")}
                      onClick={() =>
                        setFiles((fs) => fs.filter((f) => f.id !== a.id))
                      }
                    >
                      <X size={14} />
                    </IconButton>
                  </div>
                ))}
              </div>
            )}
            {voice.recording ? (
              <div className="voice-composer" dir="ltr">
                <IconButton
                  label={t("لغو ضبط", "Cancel recording")}
                  onClick={voice.cancel}
                >
                  <X />
                </IconButton>
                <Wave active={!voice.paused} level={voice.level} />
                <time>
                  {Math.floor(voice.seconds / 60)}:
                  {(voice.seconds % 60).toString().padStart(2, "0")}
                </time>
                <IconButton
                  label={
                    voice.paused
                      ? t("ادامهٔ ضبط", "Resume recording")
                      : t("مکث ضبط", "Pause recording")
                  }
                  onClick={voice.pause}
                >
                  {voice.paused ? (
                    <Play size={16} />
                  ) : (
                    <Square size={14} fill="currentColor" />
                  )}
                </IconButton>
                <IconButton
                  label={t("تبدیل به متن", "Transcribe recording")}
                  className="send-button"
                  onClick={voice.confirm}
                >
                  <Check />
                </IconButton>
              </div>
            ) : (
              <div className={"composer " + (busy ? "generating" : "")}>
                <ActionMenu items={addItems} align="start">
                  <button
                    className="icon-button attach-button"
                    aria-label={t("افزودن فایل و ابزار", "Add files and tools")}
                    disabled={uploading || busy}
                  >
                    {uploading ? <LoaderCircle className="spin" /> : <Plus />}
                  </button>
                </ActionMenu>
                <textarea
                  ref={input}
                  aria-label={t("پیام به MindGPT", "Message MindGPT")}
                  placeholder={t(
                    chat ? "پاسخ به MindGPT" : "از MindGPT بپرس",
                    chat ? "Reply to MindGPT" : "Ask MindGPT",
                  )}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={1}
                  dir={draft.trim() ? "auto" : fa ? "rtl" : "ltr"}
                  maxLength={30000}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !isMobile &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                />
                <IconButton
                  label={t("شروع ضبط صدا", "Start dictation")}
                  onClick={() => void voice.start()}
                  disabled={busy}
                >
                  <Mic />
                </IconButton>
                {busy ? (
                  <IconButton
                    label={t("توقف پاسخ", "Stop response")}
                    className="send-button"
                    onClick={() => abort.current?.abort()}
                  >
                    <Square size={15} fill="currentColor" />
                  </IconButton>
                ) : draft.trim() || files.length ? (
                  <IconButton
                    label={
                      editing
                        ? t("ذخیره و ارسال", "Save and send")
                        : t("ارسال پیام", "Send message")
                    }
                    className="send-button"
                    onClick={() => void send()}
                    disabled={uploading || !ready}
                  >
                    <ArrowUp />
                  </IconButton>
                ) : (
                  <IconButton
                    label={t("حالت صوتی", "Voice mode")}
                    className="send-button"
                    onClick={() => setVoiceMode(true)}
                  >
                    <AudioLines />
                  </IconButton>
                )}
              </div>
            )}
            <div className="composer-footnote">
              {voice.recording ? (
                t(
                  "با تأیید تو به متن تبدیل می‌شود؛ خودکار ارسال نمی‌شود.",
                  "Confirm to transcribe. Nothing is sent automatically.",
                )
              ) : (
                <span className="composer-brand" dir="ltr">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-dark.png"
                    alt="MindGPT"
                    className="composer-logo composer-logo-dark"
                    width={120}
                    height={89}
                    draggable={false}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-light.png"
                    alt=""
                    aria-hidden="true"
                    className="composer-logo composer-logo-light"
                    width={120}
                    height={89}
                    draggable={false}
                  />
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
      <input
        ref={fileInput}
        type="file"
        hidden
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif,.pdf,.docx,.txt,.md,.csv,.tsv,.json,.js,.ts,.py,.html,.css,.xml,.yaml,.yml,.log,.sql"
        onChange={(e) => void upload(e.target.files)}
      />
      <input
        ref={photoInput}
        type="file"
        hidden
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(e) => void upload(e.target.files)}
      />
      <input
        ref={cameraInput}
        type="file"
        hidden
        accept="image/*"
        capture="environment"
        onChange={(e) => void upload(e.target.files)}
      />
      <Dialog
        open={!!panel}
        onOpenChange={(v) => {
          if (!v) setPanel(null);
        }}
      >
        <DialogContent
          ref={panelContent}
          className={
            "mind-dialog " +
            (panel === "settings" ? "settings-dialog" : "") +
            (panel === "select" ? " selection-dialog" : "")
          }
          dir={fa ? "rtl" : "ltr"}
        >
          <DialogTitle>
            {
              (
                {
                  settings: t("تنظیمات", "Settings"),
                  models: t("انتخاب مدل", "Choose a model"),
                  plus: "Get Plus",
                  search: t("جست‌وجوی گفتگوها", "Search chats"),
                  select: t("انتخاب متن", "Select text"),
                  library: t("کتابخانه", "Library"),
                  images: t("تصاویر", "Images"),
                  chatfiles: t("فایل‌های این گفتگو", "Uploaded files"),
                  projects: t("پروژه‌ها", "Projects"),
                  addproject: t("افزودن به پروژه", "Add to project"),
                  scheduled: t("زمان‌بندی", "Scheduled"),
                  tools: t("ابزارها", "Plugins"),
                  install: t("نصب MindGPT", "Install MindGPT"),
                  archive: t("گفتگوهای بایگانی‌شده", "Archived chats"),
                } as Record<string, string>
              )[panel || ""]
            }
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("گزینه‌ها و تنظیمات MindGPT", "MindGPT options and settings")}
          </DialogDescription>
          {panel === "settings" && (
            <Tabs defaultValue="general" className="settings-tabs">
              <TabsList className="settings-tab-list">
                {[
                  {
                    key: "general",
                    icon: <SlidersHorizontal />,
                    label: t("عمومی", "General"),
                  },
                  {
                    key: "models",
                    icon: <Brain />,
                    label: t("مدل‌ها", "Models"),
                  },
                  {
                    key: "personal",
                    icon: <Pencil />,
                    label: t("شخصی‌سازی", "Personalize"),
                  },
                  { key: "voice", icon: <Volume2 />, label: t("صدا", "Voice") },
                  {
                    key: "data",
                    icon: <Shield />,
                    label: t("داده‌ها", "Data"),
                  },
                ].map((tab) => (
                  <TabsTrigger key={tab.key} value={tab.key}>
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="settings-content">
                <TabsContent value="general">
                  <div className="setting-row">
                    <span>
                      <Languages />
                      {t("زبان", "Language")}
                    </span>
                    <Choice
                      label="Language"
                      value={profile.language || "fa"}
                      onChange={(v) =>
                        updateProfile({ language: v as "fa" | "en" })
                      }
                      options={[
                        { value: "fa", label: "فارسی" },
                        { value: "en", label: "English" },
                      ]}
                    />
                  </div>
                  <div className="setting-row">
                    <span>
                      <Moon />
                      {t("ظاهر", "Appearance")}
                    </span>
                    <Choice
                      label={t("ظاهر", "Appearance")}
                      value={profile.theme || "dark"}
                      onChange={(v) =>
                        updateProfile({ theme: v as Profile["theme"] })
                      }
                      options={[
                        { value: "dark", label: t("تیره", "Dark") },
                        { value: "light", label: t("روشن", "Light") },
                        { value: "system", label: t("سیستم", "System") },
                      ]}
                    />
                  </div>
                  <div className="setting-row">
                    <label htmlFor="haptics">
                      {t("بازخورد لمسی", "Haptic feedback")}
                    </label>
                    <Switch
                      id="haptics"
                      checked={profile.haptics !== false}
                      onCheckedChange={(v) => updateProfile({ haptics: v })}
                    />
                  </div>
                  <button
                    className="setting-link"
                    onClick={() => void install()}
                  >
                    <House />
                    {t("افزودن به صفحهٔ اصلی", "Add to home screen")}
                    <ChevronRight />
                  </button>
                  <div className="about-card">
                    <div className="mini-mark">M</div>
                    <div>
                      <b>MindGPT</b>
                      <small>
                        {t(
                          "مایند جی‌پی‌تی · نسخهٔ ۱.۰",
                          "Your AI workspace · Version 1.0",
                        )}
                      </small>
                    </div>
                  </div>
                  <p className="muted-note">
                    {t(
                      "یک دستیار مستقل با اتصال به CodeCraft. وابسته به OpenAI نیست.",
                      "An independent assistant connected to CodeCraft. Not affiliated with OpenAI.",
                    )}
                  </p>
                </TabsContent>
                <TabsContent value="models">
                  <div className="model-current">
                    <Brain size={25} />
                    <div>
                      <b dir="auto">{currentModel}</b>
                      <p>
                        {models.length
                          ? t(
                              `${models.length} مدل از سرویس دریافت شد`,
                              `${models.length} models from your service`,
                            )
                          : t(
                              "فهرست مدل‌ها هنوز در دسترس نیست",
                              "Model list is not yet available",
                            )}
                      </p>
                    </div>
                  </div>
                  <button
                    className="primary-button full"
                    onClick={() => setPanel("models")}
                  >
                    {t("مشاهده و انتخاب مدل", "Browse and select a model")}
                  </button>
                  {modelError && (
                    <p className="error-text">{errorMessage(modelError)}</p>
                  )}
                  <p className="muted-note">
                    {t(
                      "مدل‌ها و قابلیت‌هایشان مستقیماً از سرویس خوانده می‌شوند. مدل‌های بردارسازی برای گفتگو قابل انتخاب نیستند.",
                      "Models and capabilities are loaded directly from the service. Embedding models cannot be used for conversation.",
                    )}
                  </p>
                </TabsContent>
                <TabsContent value="personal">
                  <label className="field-label" htmlFor="instructions">
                    {t(
                      "دوست داری MindGPT چطور پاسخ بدهد؟",
                      "How should MindGPT respond?",
                    )}
                  </label>
                  <textarea
                    id="instructions"
                    className="form-textarea"
                    value={profile.instructions || ""}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        instructions: e.target.value,
                      }))
                    }
                    maxLength={3000}
                    rows={7}
                    placeholder={t(
                      "مثلاً: ساده و مرحله‌به‌مرحله توضیح بده...",
                      "For example: keep explanations simple and step by step…",
                    )}
                  />
                  <button
                    className="primary-button"
                    onClick={() => {
                      updateProfile({ instructions: profile.instructions });
                      toast.success(t("ذخیره شد", "Saved"));
                    }}
                  >
                    {t("ذخیرهٔ ترجیحات", "Save preferences")}
                  </button>
                </TabsContent>
                <TabsContent value="voice">
                  <div className="setting-row">
                    <span>{t("سرعت خواندن پاسخ", "Playback speed")}</span>
                    <Choice
                      label="Playback speed"
                      value={profile.voiceRate || "1"}
                      onChange={(v) => updateProfile({ voiceRate: v })}
                      options={[
                        { value: ".8", label: "0.8×" },
                        { value: "1", label: "1×" },
                        { value: "1.2", label: "1.2×" },
                        { value: "1.5", label: "1.5×" },
                      ]}
                    />
                  </div>
                  <button
                    className="setting-link"
                    onClick={() =>
                      voice.speak(
                        t(
                          "سلام، من مایند جی‌پی‌تی هستم. خوش آمدی.",
                          "Hello. Welcome to MindGPT.",
                        ),
                      )
                    }
                  >
                    <Volume2 />
                    {t("آزمایش صدا", "Test voice")}
                    <Play />
                  </button>
                  <p className="muted-note">
                    {t(
                      "تبدیل گفتار با سرویس مرورگر انجام می‌شود. صدای خواندن فارسی به صدای نصب‌شده روی دستگاه بستگی دارد. میکروفون تنها پس از اجازهٔ تو فعال می‌شود.",
                      "Dictation uses your browser’s speech service. Playback languages depend on voices installed on your device. Microphone access is requested when you start recording.",
                    )}
                  </p>
                </TabsContent>
                <TabsContent value="data">
                  <button className="setting-link" onClick={exportData}>
                    <Download />
                    {t("دریافت خروجی گفتگوها", "Export conversations")}
                    <ChevronRight />
                  </button>
                  <button
                    className="setting-link"
                    onClick={() => setPanel("archive")}
                  >
                    <Archive />
                    {t("مدیریت بایگانی", "Manage archived chats")}
                    <ChevronRight />
                  </button>
                  <button
                    className="setting-link"
                    onClick={() => setPanel("library")}
                  >
                    <Library />
                    {t("فایل‌های من", "My files")}
                    <ChevronRight />
                  </button>
                  <p className="muted-note">
                    {t(
                      "گفتگوها و فایل‌ها روی سرور ذخیره می‌شوند و با شناسهٔ خصوصی همین مرورگر در دسترس‌اند. پاک کردن کوکی یا تغییر مرورگر دسترسی به این تاریخچه را قطع می‌کند؛ قبل از آن خروجی بگیر. پیام‌ها و پیوست‌های ارسالی برای پاسخ‌گویی به CodeCraft فرستاده می‌شوند.",
                      "Chats and files are stored on the server and linked to this browser’s private session. Clearing cookies or switching browsers loses access to this history; export first. Submitted messages and attachments are sent to CodeCraft to generate responses.",
                    )}
                  </p>
                </TabsContent>
              </div>
            </Tabs>
          )}
          {panel === "models" && (
            <>
              <div className="model-picker-head">
                <span>{t("مدل‌های سرویس شما", "Your available models")}</span>
                <IconButton
                  label={t("بارگذاری دوباره مدل‌ها", "Refresh models")}
                  onClick={() => void loadModels()}
                  disabled={modelLoading}
                >
                  <RotateCw className={modelLoading ? "spin" : ""} />
                </IconButton>
              </div>
              {modelLoading ? (
                <div className="panel-empty">
                  <LoaderCircle className="spin" />
                  <p>{t("در حال دریافت مدل‌ها…", "Loading models…")}</p>
                </div>
              ) : modelError ? (
                <div className="connection-card">
                  <AlertCircle />
                  <p>{errorMessage(modelError)}</p>
                  <button
                    className="secondary-button"
                    onClick={() => void loadModels()}
                  >
                    {t("تلاش دوباره", "Try again")}
                  </button>
                </div>
              ) : models.length > 0 ? (
                <>
                  <Combobox
                    items={models.map((m) => m.id)}
                    value={profile.model || null}
                    onValueChange={(value: string | null) => {
                      if (value) {
                        const m = models.find((m) => m.id === value);
                        if (m?.type === "embedding") {
                          toast(
                            t(
                              "این مدل مخصوص بردارسازی است.",
                              "This is an embedding model.",
                            ),
                          );
                          return;
                        }
                        updateProfile({ model: value });
                        haptic();
                        toast.success(t("مدل انتخاب شد", "Model selected"));
                      }
                    }}
                  >
                    <ComboboxInput
                      aria-label={t("جست‌وجوی مدل", "Search models")}
                      placeholder={t(
                        "جست‌وجو در همهٔ مدل‌ها…",
                        "Search all models…",
                      )}
                      className="model-combobox"
                    />
                    <ComboboxContent
                      className="model-options"
                      container={panelContent}
                    >
                      <ComboboxEmpty>
                        {t("مدلی پیدا نشد", "No models found")}
                      </ComboboxEmpty>
                      <ComboboxList>
                        {(id: string) => {
                          const m = models.find((m) => m.id === id)!;
                          return (
                            <ComboboxItem
                              key={id}
                              value={id}
                              disabled={m.type === "embedding"}
                            >
                              <div>
                                <strong>{m.name || id}</strong>
                                <small>{m.id}</small>
                                <div className="capabilities">
                                  {m.capabilities?.map((c) => (
                                    <span key={c}>{c}</span>
                                  ))}
                                </div>
                              </div>
                            </ComboboxItem>
                          );
                        }}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  <div className="selected-model-card">
                    <Brain />
                    <h3 dir="auto">
                      {selectedModel?.name || selectedModel?.id}
                    </h3>
                    <p>{selectedModel?.description}</p>
                    <div className="capabilities">
                      {selectedModel?.capabilities?.map((c) => (
                        <span key={c}>{c}</span>
                      ))}
                    </div>
                    {selectedModel?.context_window && (
                      <small>
                        {t("ظرفیت متن", "Context window")}:{" "}
                        {selectedModel.context_window.toLocaleString()} tokens
                      </small>
                    )}
                  </div>
                  <p className="muted-note">
                    {t(
                      `${models.length} مدل در فهرست. قابلیت هر مدل را پیش از ارسال تصویر یا جست‌وجو بررسی کن.`,
                      `${models.length} models available. Check each model’s capabilities before sending images or searching.`,
                    )}
                  </p>
                  <button
                    className="primary-button full"
                    onClick={() => setPanel(null)}
                  >
                    {t("ادامهٔ گفتگو", "Continue chatting")}
                  </button>
                </>
              ) : (
                <button
                  className="primary-button"
                  onClick={() => void loadModels()}
                >
                  {t("دریافت مدل‌ها", "Load models")}
                </button>
              )}
            </>
          )}
          {panel === "plus" && (
            <div className="plus-panel">
              <div className="plus-emblem">✦</div>
              <h2>ChatGPT Plus</h2>
              <p className="plus-price">
                <b>$20</b>
                <span>{t("/ ماه", "/ month")}</span>
              </p>
              <p>
                {t(
                  "قیمت پایهٔ رسمی اشتراک ماهانهٔ ChatGPT",
                  "Official base price of the monthly ChatGPT subscription",
                )}
              </p>
              <ul>
                {[
                  t(
                    "اولویت دسترسی در زمان شلوغی",
                    "Priority access during busy periods",
                  ),
                  t(
                    "سقف استفادهٔ بالاتر و دسترسی گسترده‌تر به مدل‌ها",
                    "Higher limits and broader model access",
                  ),
                  t(
                    "استدلال پیشرفته و پاسخ‌های سریع‌تر",
                    "Advanced reasoning and faster responses",
                  ),
                  t(
                    "گفت‌وگوی صوتی، ساخت تصویر و تحلیل فایل",
                    "Voice, image creation, and file analysis",
                  ),
                  t(
                    "دسترسی گسترده‌تر به پژوهش عمیق، در مناطق پشتیبانی‌شده",
                    "Expanded deep research where available",
                  ),
                ].map((x) => (
                  <li key={x}>
                    <Check />
                    {x}
                  </li>
                ))}
              </ul>
              <p className="muted-note">
                {t(
                  "قابلیت‌ها و محدودیت‌ها ممکن است تغییر کنند. هزینهٔ API جداست. این توضیح مربوط به ChatGPT Plus است؛ خرید آن به‌تنهایی امکانات MindGPT یا اعتبار CodeCraft را افزایش نمی‌دهد.",
                  "Features and limits can change. API usage is billed separately. These benefits describe ChatGPT Plus; purchasing it does not automatically upgrade MindGPT or add CodeCraft credits.",
                )}
              </p>
              <a
                className="primary-button full"
                href="https://t.me/dev_vexel"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Send size={18} />
                {t("گفتگو دربارهٔ خرید", "Ask about purchasing")}
                <span dir="ltr">@dev_vexel</span>
              </a>
              <a
                className="source-link"
                href="https://help.openai.com/en/articles/6950777-what-is-chatgpt-plus"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t(
                  "توضیحات رسمی ChatGPT Plus",
                  "Official ChatGPT Plus details",
                )}
                <ExternalLink size={13} />
              </a>
              <small className="muted-note">
                {t(
                  "این تماس تلگرامی، فروشندهٔ مستقل است؛ وابستگی رسمی تأیید نشده است.",
                  "The Telegram contact is independent; official affiliation is not verified.",
                )}
              </small>
            </div>
          )}
          {panel === "search" && (
            <Command className="chat-search" shouldFilter={false}>
              <CommandInput
                placeholder={t(
                  "جست‌وجو در عنوان و متن گفتگو…",
                  "Search titles and messages…",
                )}
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                <CommandEmpty>
                  {t("گفتگویی پیدا نشد", "No conversations found")}
                </CommandEmpty>
                {chats
                  .filter((c) =>
                    (c.title + " " + c.messages.map((m) => m.content).join(" "))
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((c) => (
                    <CommandItem key={c.id} onSelect={() => openChat(c)}>
                      <MessageCircle size={17} />
                      <span dir="auto">{c.title}</span>
                    </CommandItem>
                  ))}
              </CommandList>
            </Command>
          )}
          {panel === "select" && (
            <>
              <textarea
                className="selectable-text"
                readOnly
                value={selectedText}
                dir="auto"
                aria-label={t("متن قابل انتخاب", "Selectable text")}
              />
              <button
                className="secondary-button"
                onClick={() => void copy(selectedText)}
              >
                <Copy size={17} />
                {t("کپی همهٔ متن", "Copy all text")}
              </button>
            </>
          )}
          {["library", "images", "chatfiles"].includes(panel || "") && (
            <>
              {panel === "images" && (
                <p className="muted-note">
                  {t(
                    "تصاویر بارگذاری‌شدهٔ تو. ساخت و ویرایش مولد تصویر در API مستندِ متصل ارائه نشده است.",
                    "Your uploaded images. Generative image creation and editing are not provided by the connected API’s documented endpoints.",
                  )}
                </p>
              )}
              <div className="asset-grid">
                {(panel === "chatfiles"
                  ? messages
                      .flatMap((m) => m.attachments || [])
                      .filter(
                        (a, i, arr) =>
                          arr.findIndex((x) => x.id === a.id) === i,
                      )
                  : assets
                )
                  .filter(
                    (a) => panel !== "images" || a.mime.startsWith("image/"),
                  )
                  .map((a) => (
                    <div className="asset-card" key={a.id}>
                      {a.mime.startsWith("image/") ? (
                        <button
                          className="asset-preview"
                          onClick={() => setImageAsset(a)}
                        >
                          <img
                            src={"/api/files/" + a.id}
                            alt={a.name}
                            loading="lazy"
                          />
                        </button>
                      ) : (
                        <div className="document-preview">
                          <FileText size={32} />
                        </div>
                      )}
                      <div className="asset-caption">
                        <span>{a.name}</span>
                        <a
                          href={"/api/files/" + a.id}
                          download={a.name}
                          aria-label={t("دریافت فایل", "Download file")}
                        >
                          <Download size={17} />
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
              {(panel === "chatfiles"
                ? !messages.some((m) => m.attachments?.length)
                : !assets.filter(
                    (a) => panel !== "images" || a.mime.startsWith("image/"),
                  ).length) && (
                <div className="panel-empty">
                  <Library size={38} />
                  <p>{t("هنوز فایلی اینجا نیست", "No files here yet")}</p>
                  <button
                    className="secondary-button"
                    onClick={() => {
                      setPanel(null);
                      fileInput.current?.click();
                    }}
                  >
                    <Plus size={18} />
                    {t("بارگذاری فایل", "Upload a file")}
                  </button>
                </div>
              )}
            </>
          )}
          {["projects", "addproject"].includes(panel || "") && (
            <>
              <form
                className="inline-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!projectName.trim()) return;
                  updateProfile({
                    projects: [
                      ...(profile.projects || []),
                      { id: uid(), name: projectName.trim() },
                    ],
                  });
                  setProjectName("");
                }}
              >
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  maxLength={70}
                  placeholder={t("نام پروژهٔ جدید", "New project name")}
                  aria-label={t("نام پروژه", "Project name")}
                />
                <button className="primary-button" type="submit">
                  <Plus size={18} />
                </button>
              </form>
              <div className="panel-list">
                {profile.projects?.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (panel === "addproject" && chat) {
                        void changeChat(chat, { project: p.id });
                        toast.success(
                          t("به پروژه اضافه شد", "Added to project"),
                        );
                      } else {
                        setProjectFilter(p.id);
                        setOpenMobile(true);
                      }
                      setPanel(null);
                    }}
                  >
                    <Folder />
                    <span>{p.name}</span>
                    <small>
                      {chats.filter((c) => c.project === p.id).length}
                    </small>
                    <ChevronRight size={17} />
                  </button>
                ))}
              </div>
              {!profile.projects?.length && (
                <p className="muted-note">
                  {t(
                    "برای مرتب کردن گفتگوها یک پروژه بساز.",
                    "Create a project to organize your conversations.",
                  )}
                </p>
              )}
            </>
          )}
          {panel === "archive" && (
            <div className="panel-list">
              {chats
                .filter((c) => c.archived)
                .map((c) => (
                  <div className="archive-row" key={c.id}>
                    <span>{c.title}</span>
                    <IconButton
                      label={t("بازگرداندن گفتگو", "Restore chat")}
                      onClick={() => void changeChat(c, { archived: false })}
                    >
                      <Undo2 />
                    </IconButton>
                    <IconButton
                      label={t("حذف گفتگو", "Delete chat")}
                      onClick={() => setDeleteChat(c)}
                    >
                      <Trash2 />
                    </IconButton>
                  </div>
                ))}
              {!chats.some((c) => c.archived) && (
                <div className="panel-empty">
                  <Archive />
                  <p>{t("بایگانی خالی است", "Your archive is empty")}</p>
                </div>
              )}
            </div>
          )}
          {panel === "scheduled" && (
            <>
              <p className="muted-note">
                {t(
                  "یادآوری بساز و فایل تقویم آن را دریافت کن. برای اعلان در زمان مقرر، فایل را به تقویم گوشی اضافه کن؛ این برنامه در پس‌زمینه اعلان ارسال نمی‌کند.",
                  "Create a reminder and download its calendar file. Add it to your phone calendar for notifications at the chosen time; this app does not send background notifications.",
                )}
              </p>
              <form
                className="stack-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!taskText.trim() || !taskAt) return;
                  updateProfile({
                    tasks: [
                      ...(profile.tasks || []),
                      { id: uid(), text: taskText.trim(), at: taskAt },
                    ],
                  });
                  setTaskText("");
                  setTaskAt("");
                  toast.success(t("یادآوری ذخیره شد", "Reminder saved"));
                }}
              >
                <input
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  placeholder={t(
                    "چه چیزی را یادآوری کنیم؟",
                    "What should you remember?",
                  )}
                  aria-label={t("عنوان یادآوری", "Reminder title")}
                  required
                />
                <input
                  type="datetime-local"
                  value={taskAt}
                  onChange={(e) => setTaskAt(e.target.value)}
                  aria-label={t("زمان یادآوری", "Reminder time")}
                  required
                />
                <button className="primary-button" type="submit">
                  <Plus size={17} />
                  {t("افزودن یادآوری", "Add reminder")}
                </button>
              </form>
              <div className="panel-list">
                {profile.tasks?.map((task) => (
                  <div className="task-row" key={task.id}>
                    <Clock />
                    <div>
                      <b>{task.text}</b>
                      <small>
                        {new Date(task.at).toLocaleString(
                          fa ? "fa-IR" : "en-US",
                        )}
                      </small>
                    </div>
                    <IconButton
                      label={t("افزودن به تقویم", "Add to calendar")}
                      onClick={() => {
                        const stamp =
                          new Date(task.at)
                            .toISOString()
                            .replace(/[-:]/g, "")
                            .split(".")[0] + "Z";
                        const escape = (s: string) =>
                          s
                            .replace(/\\/g, "\\\\")
                            .replace(/;/g, "\\;")
                            .replace(/,/g, "\\,")
                            .replace(/\n/g, "\\n");
                        const txt = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//MindGPT//Reminders//EN\r\nBEGIN:VEVENT\r\nUID:${task.id}@mindgpt\r\nDTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z\r\nDTSTART:${stamp}\r\nSUMMARY:${escape(task.text)}\r\nBEGIN:VALARM\r\nACTION:DISPLAY\r\nTRIGGER:-PT0M\r\nDESCRIPTION:${escape(task.text)}\r\nEND:VALARM\r\nEND:VEVENT\r\nEND:VCALENDAR`;
                        const u = URL.createObjectURL(
                          new Blob([txt], { type: "text/calendar" }),
                        );
                        const a = document.createElement("a");
                        a.href = u;
                        a.download = "MindGPT-reminder.ics";
                        a.click();
                        setTimeout(() => URL.revokeObjectURL(u), 1000);
                      }}
                    >
                      <CalendarDays />
                    </IconButton>
                    <IconButton
                      label={t("حذف یادآوری", "Remove reminder")}
                      onClick={() =>
                        updateProfile({
                          tasks: profile.tasks?.filter((x) => x.id !== task.id),
                        })
                      }
                    >
                      <X />
                    </IconButton>
                  </div>
                ))}
              </div>
            </>
          )}
          {panel === "tools" && (
            <div className="tools-list">
              <button
                onClick={() => {
                  enableWeb();
                  if (modelForWeb()) setPanel(null);
                }}
              >
                <Globe />
                <span>
                  <b>{t("جست‌وجوی وب", "Search the web")}</b>
                  <small>
                    {t(
                      "با مدل دارای جست‌وجوی داخلی",
                      "Using a model with built-in search",
                    )}
                  </small>
                </span>
                <ChevronRight />
              </button>
              <button
                onClick={() => {
                  setThinking(true);
                  setPanel(null);
                }}
              >
                <Brain />
                <span>
                  <b>{t("تفکر عمیق", "Think harder")}</b>
                  <small>
                    {t(
                      "برای مسئله‌های چندمرحله‌ای",
                      "For questions with multiple steps",
                    )}
                  </small>
                </span>
                <ChevronRight />
              </button>
              <button
                onClick={() => {
                  setPanel(null);
                  fileInput.current?.click();
                }}
              >
                <FileText />
                <span>
                  <b>{t("تحلیل فایل و تصویر", "Analyze files and images")}</b>
                  <small>PDF · DOCX · TXT · PNG · JPG</small>
                </span>
                <ChevronRight />
              </button>
              <p className="muted-note">
                {t(
                  "ابزارهای قابل استفاده به قابلیت مدل انتخاب‌شده بستگی دارند.",
                  "Available tools depend on the selected model.",
                )}
              </p>
            </div>
          )}
          {panel === "install" && (
            <div className="install-panel">
              <div className="mini-mark">M</div>
              <h3>{t("MindGPT همیشه دم دستت", "Keep MindGPT close")}</h3>
              <ol>
                <li>
                  {t(
                    "وب‌اپ را در Chrome اندروید باز کن.",
                    "Open this web app in Chrome on Android.",
                  )}
                </li>
                <li>
                  {t(
                    "منوی سه‌نقطهٔ مرورگر را باز کن.",
                    "Open the browser’s three-dot menu.",
                  )}
                </li>
                <li>
                  {t(
                    "گزینهٔ «نصب برنامه» یا «افزودن به صفحهٔ اصلی» را بزن.",
                    "Choose “Install app” or “Add to Home screen”.",
                  )}
                </li>
              </ol>
              <p className="muted-note">
                {t(
                  "برای گفتگو و دریافت پاسخ، اینترنت لازم است.",
                  "An internet connection is required for AI responses.",
                )}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!rename}
        onOpenChange={(v) => {
          if (!v) setRename(null);
        }}
      >
        <DialogContent
          className="mind-dialog small-dialog"
          dir={fa ? "rtl" : "ltr"}
        >
          <DialogTitle>
            {t("تغییر نام گفتگو", "Rename conversation")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("نام جدید را وارد کن", "Enter a new name")}
          </DialogDescription>
          <form
            className="stack-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (rename && renameValue.trim()) {
                await changeChat(rename, { title: renameValue.trim() });
                setRename(null);
              }
            }}
          >
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
              maxLength={100}
              aria-label={t("نام گفتگو", "Conversation name")}
            />
            <button className="primary-button" type="submit">
              {t("ذخیره", "Save")}
            </button>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!deleteChat}
        onOpenChange={(v) => {
          if (!v) setDeleteChat(null);
        }}
      >
        <AlertDialogContent
          className="mind-dialog small-dialog"
          dir={fa ? "rtl" : "ltr"}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("گفتگو حذف شود؟", "Delete this conversation?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteChat?.title}
              <br />
              {t(
                "پیام‌های این گفتگو حذف می‌شوند. این کار قابل بازگشت نیست. فایل‌ها در کتابخانه باقی می‌مانند.",
                "Its messages will be deleted permanently. Uploaded files remain in your library.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("انصراف", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="delete-confirm"
              onClick={async () => {
                if (!deleteChat) return;
                try {
                  await api(
                    "chats?id=" + encodeURIComponent(deleteChat.id),
                    "DELETE",
                  );
                  setChats((cs) => cs.filter((c) => c.id !== deleteChat.id));
                  if (activeId === deleteChat.id) setActiveId(null);
                  toast.success(t("گفتگو حذف شد", "Conversation deleted"));
                } catch (e) {
                  fail(e);
                }
                setDeleteChat(null);
              }}
            >
              {t("حذف گفتگو", "Delete conversation")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={!!imageAsset}
        onOpenChange={(v) => {
          if (!v) setImageAsset(null);
        }}
      >
        <DialogContent className="image-viewer" showCloseButton={false}>
          <DialogTitle className="sr-only">{imageAsset?.name}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("نمایش تصویر", "Image preview")}
          </DialogDescription>
          <div className="viewer-toolbar">
            <IconButton
              label={t("بستن تصویر", "Close image")}
              onClick={() => setImageAsset(null)}
            >
              <X />
            </IconButton>
            <span>{imageAsset?.name}</span>
            <a
              className="icon-button"
              href={"/api/files/" + imageAsset?.id}
              download={imageAsset?.name}
              aria-label={t("ذخیرهٔ تصویر", "Download image")}
            >
              <Download />
            </a>
          </div>
          {imageAsset && (
            <img
              className="viewer-image"
              src={"/api/files/" + imageAsset.id}
              alt={imageAsset.name}
            />
          )}
          <button
            className="secondary-button"
            onClick={() => {
              if (imageAsset) {
                setFiles([imageAsset]);
                setDraft(
                  t(
                    "این تصویر را با جزئیات بررسی کن.",
                    "Analyze this image in detail.",
                  ),
                );
                setImageAsset(null);
                setPanel(null);
              }
            }}
          >
            <ImagePlus size={18} />
            {t("پرسیدن دربارهٔ این تصویر", "Ask about this image")}
          </button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={voiceMode}
        onOpenChange={(v) => {
          if (!v) {
            voice.cancel();
            setVoiceMode(false);
          }
        }}
      >
        <DialogContent className="voice-dialog" showCloseButton={false}>
          <DialogTitle className="sr-only">
            {t("حالت صوتی", "Voice mode")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("ضبط صدا با تأیید دستی", "Record and confirm manually")}
          </DialogDescription>
          <div className="voice-top">
            <span dir="ltr">MindGPT</span>
            <IconButton
              label={t("بستن حالت صوتی", "Close voice mode")}
              onClick={() => {
                voice.cancel();
                setVoiceMode(false);
              }}
            >
              <X />
            </IconButton>
          </div>
          <div
            className={
              "voice-orb " +
              (voice.recording && !voice.paused ? "listening" : "")
            }
            style={{ "--level": voice.level } as CSSProperties}
          >
            <div />
          </div>
          <div className="voice-caption">
            <h2>
              {voice.recording
                ? t("گوش می‌دهم…", "I’m listening…")
                : t("بیا حرف بزنیم", "Let’s talk")}
            </h2>
            <p>
              {voice.recording
                ? voice.transcript ||
                  t(
                    "صدای تو اینجا به متن تبدیل می‌شود",
                    "Your words will appear here",
                  )
                : t(
                    "میکروفون را بزن؛ هر وقت تمام شد، خودت تأیید کن.",
                    "Tap the microphone. Confirm when you’re finished.",
                  )}
            </p>
          </div>
          <div className="voice-controls">
            <IconButton
              label={t("لغو", "Cancel")}
              className="voice-close"
              onClick={() => {
                voice.cancel();
                setVoiceMode(false);
              }}
            >
              <X />
            </IconButton>
            {voice.recording ? (
              <>
                <IconButton
                  label={
                    voice.paused ? t("ادامه", "Resume") : t("مکث", "Pause")
                  }
                  onClick={voice.pause}
                >
                  {voice.paused ? <Play /> : <Pause />}
                </IconButton>
                <button className="primary-button" onClick={voice.confirm}>
                  <Check size={19} />
                  {t("تبدیل به متن", "Use transcript")}
                </button>
              </>
            ) : (
              <button
                className="primary-button"
                onClick={() => void voice.start()}
              >
                <Mic size={21} />
                {t("شروع صحبت", "Start talking")}
              </button>
            )}
          </div>
          <small>
            {t(
              "هیچ پیامی بدون تأیید تو ارسال نمی‌شود.",
              "Nothing is sent without your confirmation.",
            )}
          </small>
        </DialogContent>
      </Dialog>
      <Toaster
        position="top-center"
        theme={profile.theme === "light" ? "light" : "dark"}
        closeButton
        richColors
        dir={fa ? "rtl" : "ltr"}
      />
    </>
  );
}
export default function Page() {
  return (
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar-width": "272px",
          "--sidebar-width-mobile": "288px",
        } as CSSProperties
      }
      className="app-shell"
      dir="ltr"
    >
      <ChatBody />
    </SidebarProvider>
  );
}
