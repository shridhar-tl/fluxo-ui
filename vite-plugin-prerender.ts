import { spawn } from "child_process";
import fs from "fs-extra";
import path from "path";
import puppeteer from "puppeteer";
import type { PluginOption } from "vite";

type PrerenderOptions = {
  outDir?: string;
  indexPath?: string;
  port?: number;
  maxDepth?: number;
  timeoutMs?: number;
  domain?: string;
  generateSitemap?: boolean;
  sitemapPath?: string;
  chromePath?: string;
  lastmodISOString?: string; // optional override, otherwise uses build time
  defaultPriority?: number; // 0.5..1, fallback priority
};

function isInternalLink(href: string) {
  return (
    href.startsWith("/") &&
    !href.startsWith("//") &&
    !href.startsWith("/#") &&
    !href.endsWith(".pdf") &&
    !href.endsWith(".jpg") &&
    !href.endsWith(".png") &&
    !href.includes(":")
  );
}

export default function vitePluginPrerender(
  opts: PrerenderOptions = {},
): PluginOption {
  const {
    outDir = "dist",
    indexPath = "index.html",
    port = 4173,
    maxDepth = 20,
    timeoutMs = 60000,
    domain,
    generateSitemap = false,
    sitemapPath = "sitemap.xml",
    chromePath = "",
    lastmodISOString,
    defaultPriority = 0.7,
  } = opts;

  const baseUrl = `http://localhost:${port}`;

  return {
    name: "vite-plugin-prerender",
    apply: "build",
    async closeBundle() {
      console.log("Starting prerendering...");
      const preview = spawn(
        "npx",
        ["vite", "preview", "--port", String(port)],
        { shell: true, stdio: "ignore" },
      );
      console.log(`Preview server started on port ${port}.`);
      const executablePath =
        chromePath || process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
      const browser = await puppeteer.launch(
        executablePath
          ? { headless: true, executablePath, args: ["--no-sandbox", "--disable-setuid-sandbox"] }
          : { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] },
      );
      console.log("Waiting for preview server to be ready...");
      await new Promise((r) => setTimeout(r, 2500));

      const page = await browser.newPage();

      const toVisit = new Set<string>();
      const completed = new Set<string>();
      const pageDepth = new Map<string, number>();

      toVisit.add("/");
      pageDepth.set("/", 0);

      while (toVisit.size) {
        const route = Array.from(toVisit)[0];
        toVisit.delete(route);
        if (completed.has(route)) continue;
        const depth = pageDepth.get(route) ?? 0;
        if (depth > maxDepth) continue;
        try {
          const url = baseUrl + route;
          await page.goto(url, {
            waitUntil: "networkidle0",
            timeout: timeoutMs,
          });
          console.log(`Prerendering ${url}...`);
          const html = await page.content();
          const dest = path.join(outDir, route === "/" ? "" : route, indexPath);
          await fs.ensureDir(path.dirname(dest));
          await fs.writeFile(dest, html);

          completed.add(route);

          const hrefs = (await page.$$eval("a[href]", (as) =>
            as.map((a) => a.getAttribute("href") || "").filter(Boolean),
          )) as string[];
          for (let href of hrefs) {
            if (!href) continue;
            href = href.replace(/[?#].*$/, "");
            if (!isInternalLink(href)) continue;
            href = href.replace(/\/+$/, "") || "/";
            if (!completed.has(href) && !toVisit.has(href)) {
              toVisit.add(href);
              pageDepth.set(href, depth + 1);
            }
          }
        } catch (err) {
          console.error("Error loading page", err);
        }
      }

      if (domain && generateSitemap) {
        console.log("Generating sitemap...");
        const buildDate = lastmodISOString || new Date().toISOString();
        const urls = Array.from(completed).map((route) => {
          const fullUrl = domain.endsWith("/") ? domain.slice(0, -1) : domain;
          const loc = `${fullUrl}${route === "/" ? "" : route}`;
          const priority = route === "/" ? 1.0 : defaultPriority;
          return `<url><loc>${loc}</loc><lastmod>${buildDate}</lastmod><priority>${priority.toFixed(1)}</priority></url>`;
        });
        const sitemap = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls,
          "</urlset>",
        ].join("\n");
        await fs.writeFile(path.join(outDir, sitemapPath), sitemap);
      }

      await browser.close();
      preview.kill();

      console.log("Prerendering completed.");
    },
  };
}
