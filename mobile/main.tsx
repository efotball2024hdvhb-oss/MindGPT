import { createRoot } from "react-dom/client";
import { installLocalApi } from "@/lib/local-api";
import Page from "@/app/page";
import "@/app/globals.css";

// Replace the Cloudflare server with the on-device implementation.
installLocalApi();
createRoot(document.getElementById("root")!).render(<Page />);
