import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        target: 'node22',
        ssr: true,
        outDir: 'dist',
        rollupOptions: {
            input: resolve(__dirname, 'index.ts'),
            output: {
                entryFileNames: 'server.js',
                format: 'esm',
            },
            external: [
                /^@prisma\/.*/,
                /^\.\.\/generated\/.*/,
                /^node:.*/,
                'dotenv',
                'dotenv/config',
                'express',
                'cors',
            ],
        },
    },
    resolve: {
        alias: {
            '@shared': resolve(__dirname, '../shared'),
        },
    },
});
