# Architecture rules
- Keep Adsterra creatives in client-mounted srcDoc iframes through AdsterraSlot; only the single global Social Bar runs in the main document, to isolate zone settings and avoid duplicate scripts.- 360° sequences filled with motion-interpolated in-betweens set `rest` in spin360.ts so the spinner always stops on a real photo, never a generated frame.

- Studio 360° (`studio360.ts`, `Studio360`): eight AI angles per car on a grey studio floor, generated from that car's own photos by `/api/public/hooks/studio360` (pg_cron, 2 angles per call); the front-left 3/4 anchor is generated first and every other angle matches it. When a car has all eight, it replaces the old Spin360 / photo orbit on cards and the detail page.
