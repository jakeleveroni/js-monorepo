import { serve } from 'bun';
import index from './index.html';
import VolunteerRoutes from './backend/api/volunteer-routes';
import SubmissionRoutes from './backend/api/submission-routes';

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    '/*': index,

    '/api/volunteer': {
      async POST(req) {
        return VolunteerRoutes.createVolunteerRequest(req)
      },
    },

    '/api/submission': {
      async POST(req) {
        return SubmissionRoutes.createHelpRequest(req)
      },
    }
  },

  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
