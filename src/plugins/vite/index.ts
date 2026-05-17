import fs from 'fs';
import path from 'path';
import { loadEnv, type Plugin } from 'vite';

interface FluxoUiSourcePluginOptions {
    sourcePath?: string;
    useSource?: boolean;
}

const peerDepsWithSubpaths: string[] = ['react', 'react-dom', 'react/jsx-runtime'];

function resolveSourceDir(input: string): string | null {
    const resolved = path.resolve(input);
    if (!fs.existsSync(resolved)) return null;

    const stat = fs.statSync(resolved);
    if (!stat.isDirectory()) return null;

    if (fs.existsSync(path.join(resolved, 'components/index.ts'))) {
        return resolved;
    }

    const nestedSrc = path.join(resolved, 'src');
    if (fs.existsSync(path.join(nestedSrc, 'components/index.ts'))) {
        return nestedSrc;
    }

    return null;
}

function fluxoUiSource(options: FluxoUiSourcePluginOptions = {}): Plugin {
    return {
        name: 'fluxo-ui-source',
        config(_userConfig, env) {
            const projectRoot = process.cwd();
            const fileEnv = loadEnv(env.mode, projectRoot, ['EUI_']);

            const envUseSourcePath = fileEnv['EUI_USE_SOURCE'] ?? process.env['EUI_USE_SOURCE'];
            const useSource = (envUseSourcePath && envUseSourcePath !== 'false') || options.useSource !== false;
            if (!useSource) return;

            const rawSourcePath =
                fileEnv['EUI_SOURCE_PATH'] || process.env['EUI_SOURCE_PATH'] || options.sourcePath || '../fluxo-ui';

            const resolvedSourcePath = resolveSourceDir(rawSourcePath);

            if (!resolvedSourcePath) {
                console.warn(
                    `[fluxo-ui-source] Could not locate fluxo-ui source at "${path.resolve(rawSourcePath)}". ` +
                        `Provide a folder containing components/index.ts (or a project root containing src/).`,
                );
                return;
            }

            const aliases: Record<string, string> = {};

            aliases['fluxo-ui/icons'] = path.resolve(resolvedSourcePath, 'assets/icons.ts');
            aliases['fluxo-ui/hooks'] = path.resolve(resolvedSourcePath, 'hooks/index.ts');
            aliases['fluxo-ui/store/middlewares'] = path.resolve(resolvedSourcePath, 'store/middlewares/index.ts');
            aliases['fluxo-ui/store'] = path.resolve(resolvedSourcePath, 'store/index.ts');
            aliases['fluxo-ui/utils'] = path.resolve(resolvedSourcePath, 'utils/lib.ts');
            aliases['fluxo-ui/draw'] = path.resolve(resolvedSourcePath, 'components/canvas-draw/index.ts');
            aliases['fluxo-ui/services'] = path.resolve(resolvedSourcePath, 'services/index.ts');
            aliases['fluxo-ui/report-builder'] = path.resolve(resolvedSourcePath, 'components/report-builder/index.ts');
            aliases['fluxo-ui/chat'] = path.resolve(resolvedSourcePath, 'components/chat/index.ts');
            aliases['fluxo-ui/styles'] = path.resolve(resolvedSourcePath, '../dist/styles/components.css');
            aliases['fluxo-ui'] = path.resolve(resolvedSourcePath, 'components/index.ts');

            const localNodeModules = path.resolve(projectRoot, 'node_modules');

            for (const dep of peerDepsWithSubpaths) {
                const depDir = path.resolve(localNodeModules, dep);
                if (fs.existsSync(depDir)) {
                    aliases[dep] = depDir;
                }
            }

            return {
                resolve: {
                    alias: aliases,
                },
            };
        },
    };
}

export { fluxoUiSource };
export type { FluxoUiSourcePluginOptions };
