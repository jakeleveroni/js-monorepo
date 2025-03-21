// For AutoRouter documentation refer to https://itty.dev/itty-router/routers/autorouter
import { AutoRouter, json } from "itty-router";
import type { IRequest, RequestHandler } from "itty-router";

const router = AutoRouter();

type FetchActiveGitRepoParams = IRequest & {
  params: {
    star_threshold?: number;
  };
};

type FetchActiveGitRepoResponnse = {
  items: [
    {
      html_url: string;
    }
  ];
};

const fetchActiveGitRepos: RequestHandler<FetchActiveGitRepoParams> = async (
  req
) => {
  const { star_threshold } = req.params;
  const stars_scalar = +(star_threshold ?? 5000);
  const cieled_thresh = stars_scalar > 1000 ? 1000 : stars_scalar;
  const url = `https://api.github.com/search/repositories?q=stars:>${cieled_thresh}&sort=updated&per_page=10`;

  const res = await fetch(url, {
    headers: req.headers,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }

  const json: FetchActiveGitRepoResponnse = await res.json();
  return json.items.map((x) => x.html_url);
};

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router.get("/fetch-active-git-repos", fetchActiveGitRepos);

//@ts-ignore
addEventListener("fetch", async (event: FetchEvent) => {
  event.respondWith(router.fetch(event.request).then(json));
});
