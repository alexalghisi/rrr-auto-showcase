<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Rules
- Google advertising consent uses the certified Google Privacy & Messaging CMP delivered by the existing AdSense tag; site-owned settings only invoke its revocation API, never grant consent from local storage or replace the CMP — why: EU TCF consent must come from the certified provider and its published message.
- Agent integrations (MCP) live in src/lib/mcp and use Lovable Cloud OAuth; tools query as the signed-in user so database access rules still apply.
- 360° turntables use registered local frame sequences packed into WebP sprite sheets (one sm sheet per car, a few lg sheets); Spin360 shares bounded sheet loads, shows the small set first and upgrades to large on desktop, starts only with a complete sequence, measures movement in turns and renders only while visible/active. Always label AI simulations and retain real photos — why: consistent gestures without missing-frame jumps or misleading listings.
- Car ratings are anonymous visitor scores stored separately from cars; public pages expose only aggregate average/count and validated writes use the rate_car RPC — why: prevent forged direct writes while keeping ratings honest and privacy-safe.
- Daily blog articles: the 03:35 UTC seo-daily cron publishes 2-4 AI articles into public.blog_posts (niche-restricted prompt), merged with static BLOG_POSTS in /blog, /blog/$slug and sitemap-blog — why: fresh SEO content without redeploys.
