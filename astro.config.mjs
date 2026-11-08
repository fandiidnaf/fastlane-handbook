// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

export default defineConfig({
  site: 'https://fandiidnaf.github.io',
  base: '/fastlane-handbook',
  integrations: [
    mermaid({
      autoTheme: true,
    }),
    starlight({
      title: 'Fastlane Handbook',
      description: 'The independent, high-density field guide and complete API reference for Fastlane automation',
      tagline: 'Bridging Fastlane internals and modern mobile engineering (Android, iOS, Flutter, React Native, Any Stack)',
      social: {
        github: 'https://github.com/fandiidnaf/fastlane-handbook',
      },
      head: [
        {
          tag: 'script',
          content: `
            function scrollActiveSidebarIntoView() {
              const activeLink = document.querySelector('#starlight__sidebar a[aria-current="page"]');
              if (activeLink) {
                let parent = activeLink.closest('details');
                while (parent) {
                  parent.open = true;
                  parent = parent.parentElement ? parent.parentElement.closest('details') : null;
                }
                activeLink.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
              }
            }

            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', () => setTimeout(scrollActiveSidebarIntoView, 80));
            } else {
              setTimeout(scrollActiveSidebarIntoView, 80);
            }

            document.addEventListener('astro:page-load', () => setTimeout(scrollActiveSidebarIntoView, 80));
          `,
        },
      ],
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Introduction & Mission', slug: '' },
            { label: 'Step-by-Step Learning Roadmap', slug: 'start/step-by-step-roadmap' },
            { label: 'Architecture & Mental Model', slug: 'start/architecture' },
          ],
        },
        {
          label: 'Mobile Platform Guides',
          items: [
            { label: 'Native Android (Kotlin / Gradle)', slug: 'platforms/android' },
            { label: 'Native iOS (Swift / Xcode)', slug: 'platforms/ios' },
            { label: 'Flutter (Dart / Hybrid)', slug: 'platforms/flutter' },
            { label: 'React Native (TypeScript / Hermes)', slug: 'platforms/react-native' },
            { label: 'Framework-Agnostic (Any Mobile Stack)', slug: 'platforms/agnostic' },
          ],
        },
        {
          label: 'Architecture & Build Variants',
          items: [
            { label: 'Standard Single-App Pipeline', slug: 'architecture/single-app-pipeline' },
            { label: 'Flavors & Schemes Guide', slug: 'architecture/flavors-and-schemes' },
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
          label: 'Production Recipes & Security',
          items: [
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
          collapsed: true,
          autogenerate: { directory: 'actions' },
        },
        {
          label: 'Deprecated Actions (Legacy)',
          collapsed: true,
          autogenerate: { directory: 'deprecated-actions' },
        },
      ],
    }),
  ],
});
