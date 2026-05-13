import PartyTown from '@astrojs/partytown'
import React from '@astrojs/react'
import Sitemap from '@astrojs/sitemap'
import { defineConfig, fontProviders, svgoOptimizer } from 'astro/config'
import UnoCSS from 'unocss/astro'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
    integrations: [UnoCSS(), React(), Sitemap(), PartyTown()],

    site: 'https://ca.tobynguyen.net',
    output: 'static',

    fonts: [{
        provider: fontProviders.fontsource(),
        name: 'Geist',
        cssVariable: '--font-geist',
        fallbacks: ['system-ui'],
    }, {
        provider: fontProviders.fontsource(),
        name: 'Geist Mono',
        cssVariable: '--font-geist-mono',
        fallbacks: ['monospace'],
    }, {
        provider: fontProviders.local(),
        name: 'Geist Pixel',
        cssVariable: '--font-geist-pixel',
        fallbacks: ['monospace'],
        options: {
            variants: [{
                src: ['./src/assets/font/GeistPixel-Square.woff2'],
            }],
        },
    }],

    experimental: {
        rustCompiler: true,
        svgOptimizer: svgoOptimizer({
            multipass: true,
            plugins: [
                {
                    name: 'preset-default',
                },
            ],
        }),
    },
    vite: {
        plugins: [glsl()],
        optimizeDeps: {
            exclude: ['@takumi-rs/core'],
        },
        ssr: {
            external: ['@takumi-rs/core'],
        },
    },
})
