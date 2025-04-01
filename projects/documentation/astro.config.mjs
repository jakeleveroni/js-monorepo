import starlight from '@astrojs/starlight';
// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://jakeleveroni.github.io',
  base: 'js-monorepo',
  integrations: [
    starlight({
      favicon: '/levdev-favicon.ico',
      title: 'Levdev Labs',
      social: {
        github: 'https://github.com/jakeleveroni/js-monorepo',
      },
      customCss: ['./styles.css'],
      sidebar: [
        {
          label: 'Repo',
          autogenerate: { directory: 'repo' },
        },
        {
          label: 'Projects',
          autogenerate: { directory: 'projects' },
        },
      ],
    }),
  ],
});
