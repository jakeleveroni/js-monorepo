// For AutoRouter documentation refer to https://itty.dev/itty-router/routers/autorouter
import type { IRequest, RequestHandler } from "itty-router";

type FetchActiveGitRepoParams = IRequest & {
  params: {
    star_threshold?: number;
  };
};

type FetchActiveGitRepoResponse = {
  items: [
    {
      html_url: string;
    }
  ];
};

export async function fetchActiveGitRepos(
  req: Parameters<RequestHandler<FetchActiveGitRepoParams>>[0],
  res: Parameters<RequestHandler<FetchActiveGitRepoParams>>[1],
  next: Parameters<RequestHandler<FetchActiveGitRepoParams>>[2]
) {
  const { star_threshold } = req.params;
  const stars_scalar = +(star_threshold ?? 5000);
  const cieled_thresh = stars_scalar > 1000 ? 1000 : stars_scalar;
  const url = `https://api.github.com/search/repositories?q=stars:>${cieled_thresh}&sort=updated&per_page=10`;

  const ghRes = await fetch(url, {
    headers: { ...req.headers, 'Content-Type': 'application/json', 'User-Agent': 'levdev-serverless' },
    
  });

  if (!ghRes.ok) {
    const text = await ghRes.text();
    throw new Error(text);
  }

  try {
    const json: FetchActiveGitRepoResponse = await ghRes.json();
    return json.items.map((x) => x.html_url);
  } catch (err) {
    console.log(err)
    return 'An error has occrred'
  }
  
}
