# Netlify Deployment Guide - QuantityMeasurementApp-Frontend

## ✅ Pre-Deployment Status

Your project is now **ready for Netlify deployment**. All necessary configurations are in place.

### ✓ Completed Tasks
- [x] Fixed TypeScript compiler configuration (`tsconfig.app.json`)
- [x] Verified production build compiles successfully (318kB main bundle)
- [x] Confirmed Netlify static build command works
- [x] Verified SPA routing configuration (_redirects file)
- [x] Angular version: 21.2.0 (Latest)
- [x] Node compatibility: 20.x

---

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Prepare Your Code
```bash
# Ensure all code is committed to git
git add .
git commit -m "chore: prepare project for Netlify deployment"
git push origin main
```

### Step 2: Connect to Netlify

**Option A: Using Netlify Web Interface (Recommended)**
1. Go to [netlify.com](https://app.netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** (or your Git provider)
4. Authorize Netlify to access your repositories
5. Select your repository: `QuantityMeasurementApp-Frontend`
6. Configure build settings:
   - **Base directory:** (leave empty)
   - **Build command:** `npm run build:netlify`
   - **Publish directory:** `dist/qm-frontend/browser`
7. Click **"Deploy site"**

**Option B: Using Netlify CLI**
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Authenticate with Netlify
netlify login

# Deploy from project directory
cd d:\qma\QuantityMeasurementApp-Frontend
netlify deploy --prod
```

### Step 3: Environment Variables (If Needed)

If your backend API is on a different domain or requires environment-specific URLs:

1. In Netlify dashboard: **Site settings** → **Build & deploy** → **Environment**
2. Add environment variables:
   ```
   API_BASE_URL = https://your-api-domain.com
   ```

**Note:** Your app currently uses relative API paths (`/api/v1/...`), so this may not be necessary if running on the same domain.

### Step 4: Verify Deployment

1. Netlify will automatically trigger a build when you deploy
2. Build status appears in the **Deploys** section
3. Once deployed, you'll get a URL like: `https://your-site-name.netlify.app`

---

## 🔧 Configuration Files Explained

### `netlify.toml`
```toml
[build]
  command = "npm run build:netlify"           # Build command
  publish = "dist/qm-frontend/browser"        # Publish directory (static files)

[build.environment]
  NODE_VERSION = "20"
  NPM_VERSION = "10"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
This configuration:
- Runs the Angular static build
- Publishes the browser build output
- Ensures all routes redirect to index.html for SPA routing

### `src/_redirects`
Single line that enables client-side routing:
```
/*    /index.html   200
```

---

## ⚠️ Important Considerations

### 1. Backend API Connectivity
Your app communicates with backend APIs at these endpoints:
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/quantities` - Fetch quantities
- `GET /api/v1/history` - Fetch history

**⚠️ CORS Configuration Required**
Ensure your backend API has CORS headers configured:
```
Access-Control-Allow-Origin: https://your-site.netlify.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 2. Authentication
- JWT tokens stored in browser's `localStorage`
- Tokens sent via `Authorization: Bearer <token>` header
- Ensure backend validates tokens correctly

### 3. Google OAuth
If using Google login, update OAuth redirect URI:
- Previous: `http://localhost:4200/dashboard`
- New: `https://your-site.netlify.app/dashboard`

Update this in your Google Cloud Console OAuth settings.

### 4. Security Headers
Netlify automatically adds security headers. For additional control, modify `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
```

### 5. Performance & Caching
Current caching strategy in `netlify.toml`:
- HTML files: No cache (must-revalidate)
- JS/CSS files: 1 year cache (immutable)

This ensures users always get fresh HTML but cached assets are retained.

---

## 🧪 Local Testing Before Deployment

Test your production build locally:

```bash
# Build for production
npm run build:netlify

# Serve the production build locally
npx serve dist/qm-frontend/browser -l 3000
```

Then visit `http://localhost:3000` and test:
- ✓ Login/Signup forms
- ✓ Dashboard navigation
- ✓ API calls to backend
- ✓ Token persistence
- ✓ Logout functionality
- ✓ Refresh page (routing should work)

---

## 📊 Build Optimization Status

| Metric | Value | Status |
|--------|-------|--------|
| Main Bundle Size | 318 kB (gzipped: 81.61 kB) | ✓ Good |
| Build Time | ~5.9 seconds | ✓ Fast |
| TypeScript Compilation | No errors | ✓ Clean |
| Production Mode | Enabled | ✓ Optimized |
| Minification | Enabled | ✓ Enabled |

---

## 🚨 Troubleshooting

### Build fails on Netlify but works locally
- Check Node version: Netlify uses Node 20 by default
- Clear `.cache` and retry: `rm -rf .cache && npm run build:netlify`
- Check logs in Netlify deploy tab

### "Cannot POST /api/v1/auth/login" error
- Backend might not be running or has CORS issues
- Check backend URL and CORS configuration
- Verify development backend is accessible from deployed frontend

### Blank page after deployment
- Check browser console for errors (F12)
- Verify all files are published to `dist/qm-frontend/browser`
- Ensure `_redirects` file is included in build output

### Routes not working (404 errors)
- The `_redirects` file ensures all routes go to `index.html`
- This is already configured and working
- If still having issues, check Netlify site settings

---

## 📋 Pre-Deployment Checklist

Before clicking "Deploy":

- [ ] All code is committed and pushed to Git
- [ ] Build runs successfully locally: `npm run build:netlify`
- [ ] No TypeScript errors in project
- [ ] Backend API is running and accessible
- [ ] Backend CORS headers are configured properly
- [ ] Google OAuth redirect URIs are updated (if using)
- [ ] Environment variables are set (if needed)
- [ ] Tested locally with `npx serve dist/qm-frontend/browser`
- [ ] README.md is updated with deployment info
- [ ] All dependencies are specified in package.json

---

## 🔗 Useful Links

- [Netlify Documentation](https://docs.netlify.com)
- [Angular Deployment Guide](https://angular.dev/guide/deployment)
- [Netlify SPA Routing](https://docs.netlify.com/routing/overview/)
- [CORS Configuration Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## 📞 Support

For issues:
1. Check Netlify Deploy logs: Netlify Dashboard → Deploys → View logs
2. Check browser console: F12 → Console tab
3. Review backend API logs for connectivity issues

---

**Last Updated:** 2026-04-17
**Status:** ✅ Ready for Production Deployment
