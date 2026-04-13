import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

interface EtherUiSourcePluginOptions {
    sourcePath?: string;
    useSource?: boolean;
}

const peerDepsWithSubpaths: string[] = ['react', 'react-dom', 'react/jsx-runtime', 'react-dnd', 'react-dnd-html5-backend'];

function etherUiSource(options: EtherUiSourcePluginOptions = {}): Plugin {
    return {
        name: 'fluxo-ui-source',
        config() {
            const envUseSourcePath = process.env['EUI_USE_SOURCE'];
            const useSource = (envUseSourcePath && envUseSourcePath !== 'false') || options.useSource !== false;
            if (!useSource) return;

            const projectRoot = process.cwd();
            const sourcePath = process.env['EUI_SOURCE_PATH'] || options.sourcePath || '../fluxo-ui/src';
            const resolvedSourcePath = path.resolve(sourcePath);

            if (!fs.existsSync(resolvedSourcePath)) return;

            const aliases: Record<string, string> = {};

            aliases['fluxo-ui/icons'] = path.resolve(resolvedSourcePath, 'assets/icons.ts');
            aliases['fluxo-ui/hooks'] = path.resolve(resolvedSourcePath, 'hooks/index.ts');
            aliases['fluxo-ui/store'] = path.resolve(resolvedSourcePath, 'store/index.ts');
            aliases['fluxo-ui/utils'] = path.resolve(resolvedSourcePath, 'utils/lib.ts');
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

export { etherUiSource };
export type { EtherUiSourcePluginOptions };
