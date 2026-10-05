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
- Agent integrations (MCP) live in src/lib/mcp and use Lovable Cloud OAuth; tools query as the signed-in user so database access rules still apply.
- 360° turntables: AI-generated orbit video per car, extracted to image sequences in public/spin/<slug>/ (large + s/ small) and registered in src/lib/spin360.ts; Spin360 always shows an 'AI simulation' label and real photos stay on the page — why: honest listings, no runtime video cost.
- Car ratings are anonymous visitor scores stored separately from cars; public pages expose only aggregate average/count and validated writes use the rate_car RPC — why: prevent forged direct writes while keeping ratings honest and privacy-safe.
