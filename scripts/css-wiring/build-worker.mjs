import { build as viteBuild } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import fs from 'node:fs';
import { runConsumerBuild, readAllCss } from './lib.mjs';

const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf-8'));
const { outDir } = await runConsumerBuild({
    consumerDir: cfg.consumerDir,
    input: cfg.input,
    outSub: cfg.outSub,
    single: cfg.single,
    viteBuild,
    reactPlugin,
});
fs.writeFileSync(cfg.cssOut, readAllCss(outDir), 'utf-8');
