import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs-extra';
import { defineConfig, type Plugin } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import svgr from 'vite-plugin-svgr';
import webfontDownload from 'vite-plugin-webfont-dl';
import vitePluginPrerender from './vite-plugin-prerender';

const isProdMode = process.env.NODE_ENV === 'production';

const htmlPlugin = createHtmlPlugin({
    minify: isProdMode && {
        collapseWhitespace: true,
        keepClosingSlash: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyJS: true,
        minifyCSS: true,
    },
});

export default defineConfig({
    build: {
        sourcemap: true,
        outDir: 'build',
        rollupOptions: {
            output: {
                entryFileNames: () => '[name].[hash].js',
                assetFileNames: 'assets/[name].[ext]',
            },
        },
    },
    plugins: [
        react(),
        webfontDownload(
            ['https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap'],
            {
                injectAsStyleTag: false,
                async: false,
                assetsSubfolder: 'fonts',
                minifyCss: true,
                embedFonts: false,
                cache: true,
            },
        ),
        tailwindcss(),
        svgr({
            svgrOptions: {
                //typescript: true,
            },
            include: '**/*.svg?react',
        }),
        htmlPlugin as any,
        create404(),
        vitePluginPrerender({
            outDir: 'build',
            timeoutMs: 10000,
            port: 5000,
            maxDepth: 8,
            domain: 'https://fluxo-ui.utilsware.com',
            generateSitemap: true,
            sitemapPath: 'sitemap.xml',
        }),
    ],
    server: {
        open: !isProdMode,
    },
});

function create404(): Plugin {
    return {
        name: 'create-404',
        apply: 'build',
        closeBundle() {
            const indexPath = 'build/index.html';
            const notFoundPath = 'build/404.html';

            if (fs.existsSync(indexPath)) {
                fs.copyFileSync(indexPath, notFoundPath);
                console.log('404.html has been created from index.html');
            }
        },
    };
}
