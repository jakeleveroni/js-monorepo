import { AutoRouter } from 'itty-router';
import { fetchActiveGitRepos } from './functions/git-trending-repos';

const router = AutoRouter();

// Route ordering matters, the first route that matches will be used
// Any route that does not return will be treated as a middleware
// Any unmatched route will return a 404
router
  .get('/', () => new Response('hello universe'))
  .get('/api/git-trending-repos', fetchActiveGitRepos);

addEventListener('fetch', async (event: FetchEvent) => {
  event.respondWith(router.fetch(event.request));
});
