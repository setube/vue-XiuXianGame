import path from 'path';
import vue from '@vitejs/plugin-vue';
import Icons from 'unplugin-icons/vite';
import { VitePWA } from 'vite-plugin-pwa';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import IconsResolver from 'unplugin-icons/resolver';
import { defineConfig } from 'vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import vitePluginBundleObfuscator from 'vite-plugin-bundle-obfuscator';


export default defineConfig({
    base: './',
    build: {
        minify: 'terser',
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules')) return 'vendor';
                },
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.ico')) return '[name].[ext]';
                    return 'assets/[ext]/[name]-[hash].[ext]';
                }
            }
        },
        terserOptions: {
            compress: {
                drop_console: false,
                drop_debugger: true
            }
        }
    },
    plugins: [
        vue(),
        Icons({
            autoInstall: true
        }),
        VitePWA({
            manifest: {
                name: '我的文字修仙全靠刷',
                icons: [
                    {
                        src: '/icons/icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ],
                short_name: '文字修仙',
                description: '文字游戏: 我的文字修仙全靠刷',
                theme_color: '#4d4d4d'
            },
            devOptions: {
                enabled: true
            },
            registerType: 'autoUpdate'
        }),
        AutoImport({
            resolvers: [
                IconsResolver({
                    prefix: 'Icon'
                }),
                ElementPlusResolver()
            ]
        }),
        Components({
            resolvers: [
                IconsResolver({
                    enabledCollections: ['ep']
                }),
                ElementPlusResolver()
            ]
        }),
        vitePluginBundleObfuscator({
            log: false,
            enable: true,
            options: {
                log: false,
                compact: true,
                stringArray: true,
                renameGlobals: false,
                selfDefending: false,
                debugProtection: false,
                rotateStringArray: true,
                deadCodeInjection: false,
                stringArrayEncoding: ['none'],
                disableConsoleOutput: true,
                stringArrayThreshold: 0.75,
                controlFlowFlattening: false,
                unicodeEscapeSequence: true,
                identifierNamesGenerator: 'hexadecimal'
            },
            excludes: ['router.js'],
            autoExcludeNodeModules: true
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    logLevel: 'error'
});

