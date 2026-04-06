
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Client  // Client not Prerender
  },
  {
    path: 'signup',
    renderMode: RenderMode.Client
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Client  // ← Most important — dashboard makes API calls
  },
  {
    path: '**',
    renderMode: RenderMode.Client  // ← Change Prerender to Client
  }
];
