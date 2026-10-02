# MindGPT 1.3

- Removed the composer and model-heading logos.
- Optional official ChatGPT sign-in on the Sites web edition; account-owned conversations, files and preferences. Guest history remains separate.
- Temporary conversations bypass saved-history storage. Submitted content still goes to the model provider; uploaded files stay in the file library.
- Thinking selects a genuinely reasoning-capable model. Reasoning text, duration and source links use provider data, with no invented activity or citations.
- Robust JSON/SSE handling preserves partial answers and explains interrupted streams and limits.
- Settings: appearance/language, searchable sections, tone, nickname/occupation/background, voice, data controls, storage and account.
- Android standalone support remains intact, including on-device storage and API-key settings. Standalone history does not automatically sync to web accounts.

Verified: TypeScript; 10 protocol, owner-identity, personalization and temporary-conversation tests; web mobile UI; Android web-bundle build. GitHub hosted jobs and physical-device speech/install still require verification.

CodeCraft rejected the live environment request with HTTP 403 / Cloudflare 1010. Successful live responses are not claimed. Deep Research, image generation, arbitrary agent tools, unattended AI tasks and model real-time voice are not implemented by the available provider contract. The speech features use browser dictation/read-aloud.

On independent hosting, account login needs a verified auth integration; never trust public spoofable identity headers. Account identity is enabled only behind Sites dispatch on `.chatgpt.site`.
