# FEU Roosevelt IT Photobooth

A fully web-based photobooth for the IT department booth — no app install,
just a website that runs in any phone or desktop browser. Flow: live camera
preview → choose a portrait or landscape strip template → 3-shot countdown →
a composed photostrip → a QR code that guests scan to pull the photo
straight onto their own phone. Green & gold theme (FEU's official colors —
green for hope, gold for opportunity).

**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer
Motion + the native `getUserMedia`/Canvas APIs for capture + Vercel Blob for
storage + the `qrcode` package. Nothing here needs a database or a backend
server beyond one small API route — it deploys to Vercel's free tier as-is.

---

## 1. How it works

1. **Start screen** — big "Start Photobooth" button.
2. **Template picker** — guest chooses **Portrait strip** (classic vertical
   strip, 3 shots stacked top to bottom) or **Landscape strip** (1 big shot
   on the left, 2 shots stacked on the right) — every cell in both templates
   keeps its own natural aspect ratio, and each card shows a small diagram
   of its own layout. A **Back** button on this screen and the camera
   screen lets guests return to the previous step (going back from the
   camera screen also clears any shots taken so far for a clean restart).
3. **Camera stage** — on wider screens, the live mirrored webcam preview
   and the strip preview sit as two separate, opposing panels side by side
   (camera on the left, the strip's real proportions shown on the right) —
   they're two different things, so they're never merged into one stacked
   column. On narrow screens there's no room for two columns, so a compact
   thumbnail row sits above the (still large) camera view instead. One tap
   on "Start Capturing" runs the *whole* session automatically: a
   3‑2‑1‑Smile countdown, a flash, shot 1 appears instantly in the preview,
   a short pause, then it repeats for shots 2 and 3 — no extra clicks in
   between.
4. **Compose** — once all 3 shots are in, they're stitched into one
   photostrip on a `<canvas>` with a creative frame: a rounded card with
   little ticket-style notches along the sides, a deep-green header, each
   photo double-matted in cream/green/gold with a soft drop shadow, and a
   footer with today's date plus a rotating witty IT/Tamaraw tagline.
5. **Review** — the strip is shown with a **Download** button (saves
   directly on the current device) and a **QR code**. The QR is generated
   client-side after the strip is uploaded to Vercel Blob storage — it
   encodes the photo's public URL, so any phone that scans it opens the
   image directly and can save it, no app required.
6. **New Session** — one tap resets everything (template choice, shots,
   strip) so the next guest can start fresh.

---

## 2. Run it locally

```bash
npm install
npm run dev
```

Open **http://localhost:3000**. Camera access works on `localhost` without
HTTPS (browsers require a secure context for `getUserMedia` everywhere
else). Allow the camera permission prompt.

The QR/upload step needs a Blob store token — see the next section. Without
it, everything works except the QR code (you'll see a friendly error there,
and Download-on-this-device still works fine).

---

## 3. Set up Vercel Blob storage (for the QR download flow)

1. Push this project to a GitHub repo and import it into
   [vercel.com/new](https://vercel.com/new) (or run `vercel` from this
   folder with the Vercel CLI).
2. In the Vercel dashboard, open your project → **Storage** tab → **Create
   Database** → **Blob**. Connect it to your project.
3. Vercel automatically adds a `BLOB_READ_WRITE_TOKEN` environment variable
   to your project — no manual copying needed.
4. For local development, pull it down:
   ```bash
   vercel link
   vercel env pull .env.local
   ```
5. Restart `npm run dev`. The QR code will now work locally too.

That's it — `app/api/upload/route.ts` uses `@vercel/blob`'s `put()` to store
each photostrip as a public PNG and returns its URL.

---

## 4. Deploy to Vercel

```bash
npm i -g vercel   # if you don't have it
vercel
```

Or push to GitHub and click **Deploy** from the Vercel dashboard — it
auto-detects Next.js, no build settings to change. Make sure the Blob store
from step 3 is attached to the project *before* your first deploy, so
`BLOB_READ_WRITE_TOKEN` is present at build/runtime.

Once deployed, put a QR code **to your Vercel URL itself** on a printed
sign or table tent at the booth (any free QR generator, or reuse the
`qrcode` package in a one-off script) — that's the "download the app via
QR code" part: guests scan it, it opens the photobooth in their phone's
browser (or your booth's tablet/laptop), no install needed. The **in-app**
QR code guests see afterward is a separate, second QR that sends them their
finished photo.

> Tip: for a real physical booth, run the site full-screen on a tablet or
> laptop (kiosk mode) so guests interact with a fixed camera, and print the
> "open the photobooth" QR separately for guests who want to try it on
> their own phone too.

---

## 5. Customize

**Colors / theme** — `tailwind.config.ts` → the `feu` color palette
(`green`, `greenDark`, `gold`, `cream`, `ink`). Everything in the UI pulls
from these tokens, so changing them re-themes the whole app.

**Fonts** — `app/layout.tsx` loads Poppins (display/headings), Inter (body),
and JetBrains Mono (small labels/countdown) via `next/font/google`. Swap the
font names there to change the type system.

**Templates** — `lib/types.ts` → the `TEMPLATES` object. Each entry sets the
overall composed-strip canvas size (`totalW`/`totalH` — keep this ratio at
roughly 4:10 for portrait or exactly 16:9 for landscape), header/footer
height, padding, gap, and a `layout`: `"row"` (uniform cells side by side),
`"stack"` (uniform cells top to bottom, used by portrait), `"featured"`
(1 big cell on top + a row of small cells below), or `"featured-row"` (1 big
cell on the left + a column of small cells on the right, used by
landscape — this keeps every cell widescreen instead of column-splitting
the whole 16:9 card into narrow strips). `getCellRects()` in the same file turns those numbers into the
actual per-shot rectangles — both the live camera preview and the final
capture crop read from it, so changing a template's numbers (or adding a
new `layout` case) reshapes everything consistently. Add a third template
by adding another entry; it appears automatically in the picker screen.

**Number of shots** — `shotCount` on a template in `lib/types.ts`.

**Strip look / border / tagline / decorations** — `lib/capture.ts`:
- `drawFramedPhoto()` draws each photo's mat, pinstripe, gold hairline, drop
  shadow, and corner accent — tweak colors, `mat` thickness, or corner
  radius there.
- `composeStrip()` draws the rounded card shape, the side notches (ticket
  look), the header band (centered "FEU ROOSEVELT" title with a small
  "ACES · Alliance of Computing Education Students" credit line beneath
  it), and the footer.
- `TAGLINE` at the top of the file is the footer's terminal-style line
  (currently `git commit -m "FEURture Dev"`) — edit the string to change it.
- Decorative touches live in three small helper functions: `drawDotGrid()`
  (the faint PCB-style dot texture across the card), `drawCornerBrackets()`
  (the gold camera-viewfinder corners), and `drawCircuitFlank()` (the small
  circuit-trace line + nodes flanking the header title). Adjust spacing,
  opacity, or color in each to restyle them, or delete a call in
  `composeStrip()` to remove one.

**Countdown timing** — the `sleep(...)` calls inside `runSession()` in
`components/Photobooth.tsx`.

---

## 6. Notes & troubleshooting

- **Camera permissions**: the browser will prompt once per site. If a guest
  denies it, they'll see an inline message — no crash. Camera requires
  HTTPS in production (Vercel gives you this automatically) or `localhost`
  in dev.
- **iOS Safari**: works, but Safari sometimes needs a user tap before video
  playback starts — the "Start Photobooth" button provides that tap.
- **Mirroring**: the live preview and the captured frame are both
  mirrored, so the photo matches what the guest saw in the "mirror" (text
  and logos on clothing will read backwards, same as any selfie camera —
  this is expected and matches how photobooths normally feel).
- **No database required**: Blob storage handles the only persistent piece
  (the finished photostrip image, so it has a stable URL for the QR code).
