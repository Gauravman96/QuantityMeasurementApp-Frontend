
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'login',
    renderMode: RenderMode.Client  // Client not Prerender CSR (Client Side Rendering)
  },
  {
    path: 'signup',
    renderMode: RenderMode.Client
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Client 
   },                                       // dashboard makes API calls
    { path: 'history',
    renderMode: RenderMode.Client 
    },
  {
    path: '**',
    renderMode: RenderMode.Client  // Change Prerender to Client
  },


];
