// For AutoRouter documentation refer to https://itty.dev/itty-router/routers/autorouter
import { AutoRouter } from 'itty-router';
import { fetchActiveGitRepos } from './functions/git-trending-repos';

const router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
    .get("/", () => new Response("hello universe"))
    .get('/hello/:name', ({ name }) => `Hello, ${name}!`)
    .get('/git-trending-repos', fetchActiveGitRepos)

//@ts-ignore
addEventListener('fetch', async (event: FetchEvent) => {
    event.respondWith(router.fetch(event.request));
});
