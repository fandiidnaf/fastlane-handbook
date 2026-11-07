// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://fastlane-community.github.io',
  base: '/fastlane-handbook',
  integrations: [
    starlight({
      title: 'Fastlane Handbook',
      description: 'The independent, high-density field guide and complete API reference for Fastlane automation',
      tagline: 'Bridging Fastlane internals and modern mobile engineering (Flutter, React Native, Swift, Kotlin)',
      social: {
        github: 'https://github.com/fastlane/fastlane',
      },
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Introduction & Mission', slug: '' },
            { label: 'Architecture & Mental Model', slug: 'start/architecture' },
          ],
        },
        {
          label: 'Ruby Rosetta Stone (Non-Rubyists)',
          items: [
            { label: 'Fastlane Ruby Essentials', slug: 'rosetta-stone/ruby-for-mobile-devs' },
            { label: 'CLI & Bundler vs System Gem', slug: 'rosetta-stone/cli-and-bundler' },
          ],
        },
        {
          label: 'Production Recipes & Patterns',
          items: [
            { label: 'White-Label Multi-Brand Pipeline', slug: 'recipes/white-label-multi-brand' },
            { label: 'Zero-Rebuild Track Promotion', slug: 'recipes/zero-rebuild-promotion' },
            { label: 'Keystore Decryption & Pre-Flight Guards', slug: 'recipes/signing-and-keystore-security' },
            { label: 'App Store Connect API (.p8)', slug: 'recipes/app-store-connect-api' },
          ],
        },
        {
          label: 'Fastlane Internals Deep Dive',
          items: [
            { label: 'Lane Context & Shared Values', slug: 'internals/lane-context-and-shared-values' },
            { label: 'Spaceship API Reference', slug: 'internals/spaceship-deep-dive' },
            { label: 'Custom Actions & Plugins', slug: 'internals/custom-actions' },
          ],
        },
        {
          label: 'Core Action Reference',
          autogenerate: { directory: 'actions' },
        },
      ],
    }),
  ],
});
