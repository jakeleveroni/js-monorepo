// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Levdev Labs",
      social: {
        github: "https://github.com/jakeleveroni/js-monorepo",
      },
      customCss: ["./styles.css"],
      sidebar: [
        {
          label: "Repo",
          autogenerate: { directory: "repo" },
        },
        {
          label: "Projects",
          autogenerate: { directory: "projects" },
        },
      ],
    }),
  ],
});
