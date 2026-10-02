import { getChatGPTUser, chatGPTSignInPath } from "../chatgpt-auth";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const fa = (await searchParams).lang !== "en";
  const t = (f: string, e: string) => (fa ? f : e);
  if (await getChatGPTUser()) redirect("/");
  return (
    <main className="login-page" dir={fa ? "rtl" : "ltr"}>
      <a className="login-brand" href="/">
        MindGPT
      </a>
      <section className="login-card">
        <h1>{t("خوش آمدی", "Welcome back")}</h1>
        <p>
          {t(
            "برای نگهداری گفتگوها و تنظیمات در حساب خود وارد شو.",
            "Sign in to keep chats and settings with your account.",
          )}
        </p>
        <a
          className="login-continue"
          href={chatGPTSignInPath("/")}
          target="_top"
        >
          {t("ادامه با ChatGPT", "Continue with ChatGPT")}
        </a>
        <a className="login-guest" href="/">
          {t("ادامه بدون ورود", "Continue as guest")}
        </a>
        <small>
          {t(
            "ورود در صفحهٔ رسمی انجام می‌شود. MindGPT رمز عبور را دریافت نمی‌کند.",
            "Sign-in takes place on the official page. MindGPT does not receive your password.",
          )}
        </small>
      </section>
    </main>
  );
}
