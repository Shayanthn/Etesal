export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    // This is a fallback handler. Static assets in ./dist/ are served automatically by Cloudflare Workers.
    // If a request reaches here, it means no static asset was found (e.g. an SPA route).
    // We can fallback to index.html using the ASSETS binding if it exists.
    if (env.ASSETS) {
      const url = new URL(request.url);
      url.pathname = "/index.html";
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }
    return new Response("Not Found", { status: 404 });
  }
};
