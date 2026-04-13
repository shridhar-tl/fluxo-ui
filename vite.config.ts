import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import svgr from 'vite-plugin-svgr';
import webfontDownload from 'vite-plugin-webfont-dl';

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
        rollupOptions: {
            output: {
                dir: 'build',
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
    ],
    server: {
        open: true,
    },
});
