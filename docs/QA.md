# Verification record

Date: 2026-09-28. Target: Android-oriented web app, tested in a cloud Chromium browser through the managed local preview. Mobile layout was inspected in a real 390 × 844 iframe viewport, plus the desktop layout. This is not a physical Android-device certification.

## Reference review

All 35 images in the supplied archive were reviewed, including the logo asset and Android captures. The implementation follows the black surface, blue user bubbles, compact top bar, capsule menu, rounded composer, left-side conversation drawer, pill menus, model/settings panels, audio controls and attachment flow. The public logged-out ChatGPT web surface was also inspected. MindGPT keeps its own identity and does not reproduce unavailable backend products merely because a control appears in a screenshot.

## Verified interactively

- Session/bootstrap and D1 persistence through reload.
- Streamed response rendering using a clearly labelled local service fixture.
- Editing a user message and regenerating the following response.
- AI retry and visible message/context menus.
- Conversation pin and pinned section.
- Conversation rename saved and reflected in the drawer.
- Text file upload to local R2, extraction, attachment rendering and inclusion in the server-built model request.
- Reloaded conversation retains messages, pin and attachment.
- Persian/English settings and text direction.
- Mobile settings overflow fixed and checked: panel scroll width equals client width.
- Searchable dynamic model picker; embedding option disabled. Pointer selection of a different model updates the selected model. The combobox popup is mounted inside its modal to preserve focus/pointer behavior.
- Plus information and Telegram destination rendered; no purchase was performed.

## Build checks

TypeScript checking and production build are run on the final source. The source repository and ZIP exclude `.env`, runtime state, private files and credentials.

## External dependencies and unverified behavior

The real CodeCraft endpoint returned 403 during a connectivity attempt from the execution environment. Successful real model generation, live web search and Vision were not verified. This is different from testing the app's streaming, persistence and request construction with a fixture. The fixture in `tests/service-fixture.ts` is inert: production code does not import or activate it.

Microphone permission, actual speech recognition, Android Persian TTS voice availability, native sharing, PWA installation, vibration, hardware keyboard resizing and long-press timing need final verification on a physical HTTPS Android session. Clipboard has a selectable-text fallback when browser access is unavailable. PDFs and DOCX use local browser parsing libraries; the end-to-end uploaded test was a text file. Image generation/editing and unattended scheduled AI tasks are not implemented.

WebMCP registration is capability-detected and exposes read-only chat listing and draft staging; the test browser did not advertise the required capability, so this integration was not exercised.

No guarantee of zero bugs or exact rendering across all devices is made.

## 1.1.0 branding and repository update

- The supplied logo was copied byte-for-byte and framed with CSS in the app.
- Both Persian and English footer disclaimer strings were removed. The recording-confirmation guidance remains.
- Mobile visual inspection confirmed the new top-bar and footer logo. Footer client width equals scroll width at 390 px.
- Issue forms, CI and draft-release workflow YAML were parsed locally. TypeScript passed.
- GitHub workflow execution is pending repository creation and a successful hosted run; no hosted CI success is claimed.


## 1.3.0 — 2026-10-02

- Signed-in ChatGPT UI inspected live: account menu, General, Personalization, Voice and Data controls, composer tools, response actions and conversation menu. An explicit short test chat was sent. No existing personal chats or account preferences were changed.
- TypeScript and 10 protocol/identity/personalization/temporary-validation tests passed.
- Mobile 390×844 UI checked: account menu, settings layout, guest login page and continuation, footer/header logo removal, temporary-chat exclusion from saved history, and persisted custom instructions/nickname after a fresh navigation.
- Reasoning/source streaming, partial-answer errors and stop behavior checked with labelled local fixtures. Production imports no fixture.
- Platform sign-in routes use bundled SIWC helpers; complete hosted sign-in/out and cross-browser account behavior remain to be verified over production HTTPS. Account-owner hashing and guest-cookie namespace separation were unit tested.
- CodeCraft live /models returned HTTP 403 Cloudflare 1010 browser_signature_banned. No workaround or successful live generation is claimed.
- Real-time model voice, image generation, Deep Research, agent execution and unattended AI tasks remain unavailable with the established provider contract. Existing voice is browser dictation/read-aloud.
