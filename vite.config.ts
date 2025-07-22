/// <reference types="node" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from 'vite-plugin-pwa';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: { mode: string }) => ({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
       // globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallbackDenylist: [/auth-callback\.html$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.dicebear\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'dicebear-avatars',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/images\.pexels\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pexels-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/gmail\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gmail-api',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutes
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'JobTrail - Smart Job Application Tracker',
        short_name: 'JobTrail',
        description: 'Track, manage, and optimize your job application journey with intelligent automation and beautiful insights.',
        theme_color: '#667eea',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
        lang: 'en',
        icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: 'pwa-512x512-maskable.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
              }
        ],
        // Exclude auth-callback.html from caching
        globIgnores: ['**/auth-callback.html'],
        // Add runtime exclusions
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^\/$/],
        navigateFallbackDenylist: [/auth-callback\.html$/]
        categories: ['productivity', 'business', 'utilities'],
        screenshots: [
                {
                  src: 'screenshot.png',
                  sizes: '1280x720',
                  type: 'image/png',
                  form_factor: 'wide',
                  label: 'JobTrail Dashboard'
                }
              ],
        shortcuts: [
          {
            name: 'Add Job Application',
            short_name: 'Add Job',
            description: 'Quickly add a new job application',
            url: '/?action=add-job',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'View Analytics',
            short_name: 'Analytics',
            description: 'View your application analytics',
            url: '/analytics',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Gmail Inbox',
            short_name: 'Inbox',
            description: 'Check your Gmail inbox',
            url: '/inbox',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  define: {
    global: 'globalThis',
    process: {
      env: {}
    }
  },
}));
