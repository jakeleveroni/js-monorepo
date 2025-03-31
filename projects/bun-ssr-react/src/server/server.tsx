import path from 'path';
import { type ReactDOMServerReadableStream, renderToReadableStream } from 'react-dom/server';
import { fetchWeatherData, WeatherProvider } from '../client/server-components/weather-provider';
import App from '../client/components/app';
import { rootStyles } from './root-styles';

const isDev = import.meta.env.MODE === 'development';

const devRoutes = {
  routes: {
    '/app/*': {
      // development passthrough to the underlying vite server running the client
      GET: async (request) => {
        const url = new URL(request.url);
        const targetUrl = new URL(url.pathname + url.search, `http://localhost:${3000}`);

        try {
          const response = await fetch(targetUrl, {
            method: request.method,
            headers: request.headers,
            body: request.body,
            redirect: 'manual',
          });

          const clonedResponse = response.clone();
          return new Response(clonedResponse.body, {
            status: clonedResponse.status,
            statusText: clonedResponse.statusText,
            headers: new Headers(clonedResponse.headers as Headers),
          });
        } catch (error) {
          console.error('Error forwarding request:', error);
          return new Response('Internal Server Error', { status: 500 });
        }
      },
    },
  },
};

Bun.serve({
  port: 5177,
  ...(isDev ? { devRoutes } : {}),
  async fetch(request) {
    const url = new URL(request.url);

    // TODO this is not sophisticated at all come up with better build output
    // to match this setup or change the routing expectations
    const imgAssetPattern = /\.(ico|jpeg|jpg)$/i;
    const isImgAsset = imgAssetPattern.test(url.pathname);

    // Serve static assets from the public directory
    if (isImgAsset || url.pathname.startsWith('/assets/') || url.pathname === '/main.js') {
      const filePath = path.join(process.cwd(), 'dist/client', url.pathname);

      try {
        const file = Bun.file(filePath);
        const exists = await file.exists();

        if (exists) {
          const ext: string = path.extname(filePath);
          const contentType: string =
            {
              '.js': 'application/javascript',
              '.css': 'text/css',
              '.svg': 'image/svg+xml',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.ico': 'image/x-icon',
            }[ext] || 'application/octet-stream';

          return new Response(file, {
            headers: { 'Content-Type': contentType },
          });
        }
      } catch (err) {
        console.error(`Error serving static file ${filePath}:`, err);
      }
    }

    // TODO: split out app routing to a more scalable approach
    // Your main application route
    if (url.pathname === '/app/weather-info') {
      const location = url.searchParams.get('location') || 'California';
      const weatherData = await fetchWeatherData(location);

      const stream = await renderToReadableStream(
        <WeatherProvider initialData={weatherData}>
          <App />
        </WeatherProvider>,
      );

      const html = await getRootHtml(weatherData, stream);

      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // TODO: split out the api endpoint registration to make it more scalable and modular
    // Register API Endpoints
    if (url.pathname === '/api/weather-info') {
      const location = url.searchParams.get('location') || 'New York';
      const weatherData = await fetchWeatherData(location);
      return new Response(JSON.stringify(weatherData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
});

async function getRootHtml<T extends object>(initialData: T, stream: ReactDOMServerReadableStream) {
  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Bun SSR Weather App</title>
      <style>${rootStyles}</style>
    </head>
    <body>
      <div id="root">${await streamToString(stream)}</div>
      <script id="__INITIAL_DATA__" type="application/json">
        ${JSON.stringify(initialData)}
      </script>
      <script type="module" src="/main.js"></script>
    </body>
  </html>`;
}

async function streamToString(stream: ReactDOMServerReadableStream) {
  const reader = stream.getReader();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += new TextDecoder().decode(value);
  }

  return result;
}
