import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const backendUrl = process.env['BACKEND_URL'] || 'http://localhost:8080';
const authServiceUrl = process.env['AUTH_SERVICE_URL'] || 'http://localhost:8081';

const app = express();
const angularApp = new AngularNodeAppEngine();

function withTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

async function proxyRequest(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
  targetBaseUrl: string,
) {
  try {
    const targetUrl = new URL(req.originalUrl, withTrailingSlash(targetBaseUrl));
    const headers = new Headers();

    for (const [key, value] of Object.entries(req.headers)) {
      const lowerKey = key.toLowerCase();
      if (!value || lowerKey === 'host' || lowerKey === 'content-length') {
        continue;
      }

      if (Array.isArray(value)) {
        for (const headerValue of value) {
          headers.append(key, headerValue);
        }
      } else {
        headers.set(key, value);
      }
    }

    if (req.get('host')) {
      headers.set('x-forwarded-host', req.get('host')!);
    }
    headers.set('x-forwarded-proto', req.protocol);

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body:
        req.method === 'GET' || req.method === 'HEAD'
          ? undefined
          : (req.body ? new Uint8Array(req.body as Buffer) : undefined),
      redirect: 'manual',
    });

    res.status(response.status);

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'transfer-encoding') {
        return;
      }
      res.setHeader(key, value);
    });

    const responseBuffer = Buffer.from(await response.arrayBuffer());
    res.send(responseBuffer);
  } catch (error) {
    next(error);
  }
}

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */
app.use(/^\/api(\/.*)?$/, express.raw({ type: '*/*', limit: '2mb' }));
app.use(/^\/api(\/.*)?$/, (req, res, next) => proxyRequest(req, res, next, backendUrl));

app.use(
  /^\/(oauth2|login\/oauth2)(\/.*)?$/,
  express.raw({ type: '*/*', limit: '2mb' }),
);
app.use(
  /^\/(oauth2|login\/oauth2)(\/.*)?$/,
  (req, res, next) => proxyRequest(req, res, next, authServiceUrl),
);

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
