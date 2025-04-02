import type { IRequest, RequestHandler } from 'itty-router';

type FetchActiveGitRepoParams = IRequest & {
  params: {
    star_threshold?: number;
    sort?: string;
    per_page?: number;
  };
};

type FetchActiveGitRepoResponse = {
  items: [
    {
      html_url: string;
    },
  ];
};

const maxStars = 1000;
const sortOpts = ['stars', 'forks', 'help-wanted-issues', 'updated'];

export async function fetchActiveGitRepos(
  req: Parameters<RequestHandler<FetchActiveGitRepoParams>>[0],
  res: Parameters<RequestHandler<FetchActiveGitRepoParams>>[1],
  next: Parameters<RequestHandler<FetchActiveGitRepoParams>>[2],
) {
  const { star_threshold, per_page, sort } = req.params;
  const stars = +(star_threshold ?? 1000);
  const safeSort = sortOpts.find((x) => x === sort) ?? 'updated';
  const url = `https://api.github.com/search/repositories?q=stars:>${stars}&sort=${safeSort}&per_page=${+(per_page ?? 10)}`;

  const ghRes = await fetch(url, {
    headers: {
      ...req.headers,
      'Content-Type': 'application/json',
      'User-Agent': 'levdev-serverless',
    },
  });

  if (!ghRes.ok) {
    const text = await ghRes.text();
    throw new Error(text);
  }

  try {
    const json: FetchActiveGitRepoResponse = await ghRes.json();
    return json.items.map((x) => x.html_url);
  } catch (err) {
    return `An error has occured ${JSON.stringify(err ?? {})}`;
  }
}
