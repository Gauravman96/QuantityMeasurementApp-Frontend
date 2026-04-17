# Environment Configuration Guide

This guide explains how to configure your app for different environments (development, staging, production).

## Current Architecture

Your app uses:
- **Relative API paths** (`/api/v1/...`)
- **Browser localStorage** for JWT tokens
- **No environment files** (all hardcoded)

## Environment-Specific Configuration

### Option 1: Using Query Parameters (Recommended for Quick Setup)

Netlify can pass environment variables to your build:

1. **In `netlify.toml`, add environment detection:**

```toml
[build]
  command = "npm run build:netlify"
  publish = "dist/qm-frontend/browser"

[build.environment]
  NODE_VERSION = "20"
  NPM_VERSION = "10"
  VITE_API_BASE_URL = "https://api.yourdomain.com"
```

2. **Update `src/app/core/config/app-config.ts`:**

```typescript
// Detect environment
const getApiBaseUrl = (): string => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8080'; // Local development
  }
  
  if (hostname === 'staging.netlify.app' || hostname === 'staging.yourdomain.com') {
    return 'https://api-staging.yourdomain.com'; // Staging
  }
  
  // Production
  return 'https://api.yourdomain.com';
};

const API_BASE_URL = getApiBaseUrl();

export const APP_PATHS = {
  authApi: `${API_BASE_URL}/api/v1/auth`,
  quantityApi: `${API_BASE_URL}/api/v1/quantities`,
  historyApi: `${API_BASE_URL}/api/v1/history`,
  googleAuth: `${API_BASE_URL}/oauth2/authorization/google`,
} as const;
```

### Option 2: Using Environment Files (More Complex)

Create environment files:

**src/environments/environment.ts (Development)**
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080',
  apiVersion: 'v1'
};
```

**src/environments/environment.prod.ts (Production)**
```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.yourdomain.com',
  apiVersion: 'v1'
};
```

Then import in your services:
```typescript
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/${environment.apiVersion}/auth`;
  // ...
}
```

**Note:** This requires updating `angular.json` build configurations, which is more complex.

### Option 3: Using Netlify Environment Variables + Build Script

**1. Set in Netlify Dashboard:**
- Site settings → Environment variables
- Add: `VITE_API_BASE_URL = https://api.yourdomain.com`

**2. Create a build script that generates a config file:**

**scripts/generate-config.js**
```javascript
const fs = require('fs');

const apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:8080';

const configContent = `
export const environment = {
  production: true,
  apiBaseUrl: '${apiBaseUrl}'
};
`;

fs.writeFileSync(
  'src/environments/environment.generated.ts',
  configContent
);

console.log('✓ Config generated:', apiBaseUrl);
```

**3. Update package.json:**
```json
"scripts": {
  "prebuild:netlify": "node scripts/generate-config.js",
  "build:netlify": "ng build --output-mode static"
}
```

---

## Current Production Settings

Your app is configured for:
- **API Base**: Relative paths (`/api/v1/...`)
- **Auth**: JWT in localStorage
- **CORS**: Backend must allow requests from `https://your-site.netlify.app`
- **Google OAuth**: Must whitelist redirect URI

## Deployment Environment Variables Checklist

For **Netlify Deployment**, set these in Site Settings → Environment:

| Variable | Example Value | Purpose |
|----------|---------------|---------|
| `VITE_API_BASE_URL` | `https://api.yourdomain.com` | Backend API base URL |
| `NODE_VERSION` | `20` | Node.js version (already set) |
| `NPM_VERSION` | `10` | NPM version (already set) |

---

## Testing Environment-Specific Builds

```bash
# Development build
npm run build

# Production build with environment
VITE_API_BASE_URL=https://api.prod.com npm run build:netlify
```

---

## Recommended Production Setup

1. **Keep relative paths** (`/api/v1/...`) if frontend and backend are on same domain
2. **Or use hostname detection** (Option 1) for multi-environment support
3. **Use Netlify environment variables** for API URLs
4. **Enable CORS** on backend for your Netlify domain
5. **Test thoroughly** before deploying

---

## SSL/TLS Security

Netlify automatically provides:
- ✓ Free SSL certificates
- ✓ HTTPS enforcement
- ✓ Automatic renewal

Ensure your backend API also uses HTTPS in production.

---

## Example: Local to Production Flow

### Local Development
```bash
npm run start
# Connects to http://localhost:8080/api/v1/...
```

### Production on Netlify
```bash
npm run build:netlify
# With VITE_API_BASE_URL set to: https://api.yourdomain.com
# Connects to https://api.yourdomain.com/api/v1/...
```

---

**Recommended**: Start with **Option 1 (Hostname Detection)** for flexibility without code changes.
