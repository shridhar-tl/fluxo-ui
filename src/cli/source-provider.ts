import { promises as fs } from 'fs';
import path from 'path';
import https from 'https';
import { URL } from 'url';

export interface SourceFetchResult {
  content: string;
  bytes: Buffer;
  exists: boolean;
}

export interface SourceProvider {
  readonly id: string;
  fetchText(srcRelativePath: string): Promise<string | null>;
  fetchBinary(srcRelativePath: string): Promise<Buffer | null>;
  resolveOriginUrl(srcRelativePath: string): string;
}

export interface SourceProbeResult {
  ok: boolean;
  providerId: string;
  probedPath: string;
  originUrl: string;
  reason?: string;
  rawError?: unknown;
}

export const PROBE_KNOWN_FILES: readonly string[] = [
  'components/Button.tsx',
  'utils/lib.ts',
  'hooks/index.ts',
];

export async function probeSourceProvider(
  provider: SourceProvider,
  knownPaths: readonly string[] = PROBE_KNOWN_FILES
): Promise<SourceProbeResult> {
  const candidate = knownPaths[0] ?? PROBE_KNOWN_FILES[0];
  const originUrl = provider.resolveOriginUrl(candidate);
  for (const probe of knownPaths) {
    try {
      const text = await provider.fetchText(probe);
      if (text != null && text.length > 0) {
        return {
          ok: true,
          providerId: provider.id,
          probedPath: probe,
          originUrl: provider.resolveOriginUrl(probe),
        };
      }
    } catch (err) {
      return {
        ok: false,
        providerId: provider.id,
        probedPath: probe,
        originUrl: provider.resolveOriginUrl(probe),
        reason: err instanceof Error ? err.message : String(err),
        rawError: err,
      };
    }
  }
  return {
    ok: false,
    providerId: provider.id,
    probedPath: candidate,
    originUrl,
    reason: `No probe path resolved (tried ${knownPaths.join(', ')}).`,
  };
}

export interface LocalSourceProviderOptions {
  sourceRoot: string;
}

export class LocalSourceProvider implements SourceProvider {
  readonly id = 'local';
  private readonly sourceRoot: string;

  constructor(options: LocalSourceProviderOptions) {
    this.sourceRoot = path.resolve(options.sourceRoot);
  }

  async fetchText(srcRelativePath: string): Promise<string | null> {
    const abs = this.resolveAbsolute(srcRelativePath);
    try {
      return await fs.readFile(abs, 'utf-8');
    } catch {
      return null;
    }
  }

  async fetchBinary(srcRelativePath: string): Promise<Buffer | null> {
    const abs = this.resolveAbsolute(srcRelativePath);
    try {
      return await fs.readFile(abs);
    } catch {
      return null;
    }
  }

  resolveOriginUrl(srcRelativePath: string): string {
    return `file://${this.resolveAbsolute(srcRelativePath).split(path.sep).join('/')}`;
  }

  private resolveAbsolute(srcRelativePath: string): string {
    const clean = srcRelativePath.split('/').filter((seg) => seg.length > 0).join(path.sep);
    return path.join(this.sourceRoot, clean);
  }
}

export interface GitHubSourceProviderOptions {
  owner: string;
  repo: string;
  ref?: string;
  basePath?: string;
  fetcher?: (url: string, headers?: Record<string, string>) => Promise<Buffer | null>;
  cache?: Map<string, Buffer | null>;
  token?: string;
}

const DEFAULT_GITHUB_REF = 'main';
const DEFAULT_GITHUB_BASE_PATH = 'src';

export class GitHubSourceProvider implements SourceProvider {
  readonly id: string;
  private readonly owner: string;
  private readonly repo: string;
  private readonly ref: string;
  private readonly basePath: string;
  private readonly fetcher: (url: string, headers?: Record<string, string>) => Promise<Buffer | null>;
  private readonly cache: Map<string, Buffer | null>;
  private readonly token?: string;

  constructor(options: GitHubSourceProviderOptions) {
    this.owner = options.owner;
    this.repo = options.repo;
    this.ref = options.ref ?? DEFAULT_GITHUB_REF;
    this.basePath = (options.basePath ?? DEFAULT_GITHUB_BASE_PATH).replace(/^\/+|\/+$/g, '');
    this.fetcher = options.fetcher ?? defaultHttpsFetcher;
    this.cache = options.cache ?? new Map();
    this.token = options.token;
    this.id = `github:${this.owner}/${this.repo}@${this.ref}`;
  }

  resolveOriginUrl(srcRelativePath: string): string {
    const cleanRel = srcRelativePath.split('/').filter((seg) => seg.length > 0).join('/');
    const path = this.basePath ? `${this.basePath}/${cleanRel}` : cleanRel;
    return `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.ref}/${path}`;
  }

  async fetchBinary(srcRelativePath: string): Promise<Buffer | null> {
    const url = this.resolveOriginUrl(srcRelativePath);
    if (this.cache.has(url)) return this.cache.get(url) ?? null;
    const headers = this.token ? { Authorization: `Bearer ${this.token}` } : undefined;
    const buf = await this.fetcher(url, headers);
    this.cache.set(url, buf);
    return buf;
  }

  async fetchText(srcRelativePath: string): Promise<string | null> {
    const buf = await this.fetchBinary(srcRelativePath);
    return buf ? buf.toString('utf-8') : null;
  }
}

export function defaultHttpsFetcher(
  url: string,
  extraHeaders?: Record<string, string>
): Promise<Buffer | null> {
  return new Promise((resolve, reject) => {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch (err) {
      reject(err);
      return;
    }
    const headers: Record<string, string> = { 'User-Agent': 'fluxo-ui-cli' };
    if (extraHeaders) {
      for (const [k, v] of Object.entries(extraHeaders)) headers[k] = v;
    }
    const request = https.get(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        headers,
      },
      (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const location = res.headers.location;
          res.resume();
          if (!location) {
            resolve(null);
            return;
          }
          defaultHttpsFetcher(location, extraHeaders).then(resolve, reject);
          return;
        }
        if (res.statusCode === 404) {
          res.resume();
          resolve(null);
          return;
        }
        if (res.statusCode === undefined || res.statusCode >= 400) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }
    );
    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy(new Error(`Request timeout for ${url}`));
    });
  });
}

export interface InferGitHubProviderOptions {
  packageJson?: { repository?: { url?: string } | string };
  ref?: string;
  basePath?: string;
  token?: string;
}

export function inferGitHubProviderFromPackage(opts: InferGitHubProviderOptions): GitHubSourceProvider | null {
  const repo = opts.packageJson?.repository;
  let url: string | undefined;
  if (typeof repo === 'string') url = repo;
  else if (repo && typeof repo.url === 'string') url = repo.url;
  if (!url) return null;
  const match = url.match(/github\.com[:/]+([^/]+)\/([^/.]+)(?:\.git)?(?:[/?#].*)?$/i);
  if (!match) return null;
  const owner = match[1];
  const repoName = match[2];
  return new GitHubSourceProvider({
    owner,
    repo: repoName,
    ref: opts.ref ?? DEFAULT_GITHUB_REF,
    basePath: opts.basePath ?? DEFAULT_GITHUB_BASE_PATH,
    token: opts.token,
  });
}
