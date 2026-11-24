# Ask AM! worker

The assistant works without this folder: it then shows the best-matching passages from the site. This worker makes it answer in sentences using Claude.

1. Create a free Cloudflare account, then **Workers & Pages → Create → Worker**, paste `ask-am.mjs`.
2. In the worker's **Settings → Variables**: add the secret `ANTHROPIC_API_KEY` (from console.anthropic.com), and the variables `ALLOWED_ORIGIN` = `https://abdelfattah.site` and (optional) `MODEL` = `claude-haiku-5-5`.
3. Add a **Rate limiting rule** (Security → WAF) on the worker URL, e.g. 20 requests per minute per IP, so nobody can run up the bill. Set a monthly spend limit in the Anthropic console too.
4. Put the worker URL in `src/data/site.json` → `assistant.endpoint` (or in the admin → Site settings later). The next deploy turns the AI answers on.

The key never reaches the site. Each question sends only the question and up to six short passages of the site's own text.
