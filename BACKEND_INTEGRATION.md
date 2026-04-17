# Backend API Integration Guide

## Overview

Your Angular frontend communicates with backend APIs at these endpoints. This guide ensures proper configuration for production.

---

## API Endpoints Expected

### Authentication APIs

**POST `/api/v1/auth/login`**
```typescript
Request: {
  username: string,
  password: string
}

Response: {
  token: string  // JWT token for Bearer auth
}
```

**POST `/api/v1/auth/register`**
```typescript
Request: {
  username: string,
  password: string
}

Response: (text) - Success message
```

### Data APIs

**GET `/api/v1/quantities`**
- Requires: `Authorization: Bearer <token>`
- Returns: Array of quantity measurements

**GET `/api/v1/history`**
- Requires: `Authorization: Bearer <token>`
- Returns: User's history records

### OAuth

**GET `/oauth2/authorization/google`**
- Redirects to Google OAuth flow
- Returns token in query params

---

## CORS Configuration (REQUIRED for Frontend)

Your production frontend will be at: `https://your-site.netlify.app`

### Backend Must Return These Headers

For **all API endpoints** (/api/v1/*)

```
Access-Control-Allow-Origin: https://your-site.netlify.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

### Configuration Examples

**Spring Boot** (if backend is Java):
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("https://your-site.netlify.app", "http://localhost:4200")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
        };
    }
}
```

**Node.js/Express**:
```javascript
const cors = require('cors');

app.use(cors({
    origin: ['https://your-site.netlify.app', 'http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['*'],
    credentials: true,
    maxAge: 3600
}));
```

**Python/FastAPI**:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-site.netlify.app", "http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600
)
```

---

## JWT Token Handling

### Frontend Storage
- **Location**: Browser's `localStorage`
- **Key**: `token`
- **Format**: Stored as plain text (retrieve with `localStorage.getItem('token')`)

### Frontend Sending
- **Method**: Authorization header
- **Format**: `Authorization: Bearer <token>`
- **Applied to**: All requests except `/api/v1/auth/login` and `/api/v1/auth/register`

### Backend Validation
```typescript
// Expected in Authorization header
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

// Backend should:
1. Extract token from "Bearer <token>"
2. Verify JWT signature
3. Check token expiration
4. Return 401 if invalid/expired
```

---

## Testing API Integration

### 1. Local Development Test

```bash
# Terminal 1: Start backend (on port 8080)
# Backend should be accessible at http://localhost:8080

# Terminal 2: Start Angular dev server
npm start
# App will be at http://localhost:4200

# In browser at http://localhost:4200:
# 1. Go to login page
# 2. Open DevTools F12 → Network tab
# 3. Enter credentials and login
# 4. Check Network requests:
#    - POST /api/v1/auth/login should return 200
#    - Response should contain "token" field
#    - localStorage should contain the token
# 5. Dashboard should load
```

### 2. Production Test (After Deployment)

```
1. Go to https://your-site.netlify.app
2. Open DevTools F12
3. Go to Network tab
4. Attempt login
5. Check:
   - POST /api/v1/auth/login status (should be 200)
   - CORS headers present in response
   - Token received and stored
   - Subsequent requests include Authorization header
```

### 3. Debugging API Issues

**Network Tab Analysis**:
1. **OPTIONS request fails (preflight)**: CORS headers missing
2. **401 Unauthorized**: Token not sent or invalid
3. **403 Forbidden**: Token expired or insufficient permissions
4. **500 Error**: Backend server error

**Console Checking** (F12 → Console):
- Check for CORS errors
- Check for XHR/Fetch errors
- Check for authentication errors

---

## Environment-Specific API URLs

### For Local Development
```typescript
// Backend at localhost:8080
API_BASE_URL = "http://localhost:8080"
```

### For Production
```typescript
// Backend at your domain
API_BASE_URL = "https://api.yourdomain.com"
// OR same domain as frontend
API_BASE_URL = "https://your-site.netlify.app"
```

### Frontend Configuration

**Current Setup** (in `src/app/core/config/app-config.ts`):
```typescript
export const APP_PATHS = {
  authApi: '/api/v1/auth',           // Uses relative path
  quantityApi: '/api/v1/quantities',
  historyApi: '/api/v1/history',
  googleAuth: '/oauth2/authorization/google',
} as const;
```

**Why Relative Paths?**: 
- Works if backend is on same domain
- For separate domains, see `ENVIRONMENT_CONFIG.md`

---

## Google OAuth Integration

### Setup for Production

1. **Google Cloud Console**:
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - OAuth 2.0 → Authorized redirect URIs
   - Add: `https://your-site.netlify.app/dashboard`

2. **Backend OAuth Endpoint**:
   - GET `/oauth2/authorization/google`
   - Should handle OAuth flow
   - Return JWT token in URL: `?token=<jwt>`

3. **Frontend Handling**:
   ```typescript
   // Currently in dashboard.ts
   ngOnInit() {
     const urlParams = new URLSearchParams(window.location.search);
     const token = urlParams.get('token');
     if (token) {
       localStorage.setItem('token', token);
     }
   }
   ```

---

## Security Best Practices

### For Backend

- ✅ Always validate JWT token signature
- ✅ Check token expiration
- ✅ Use HTTPS in production
- ✅ Set secure CORS origins (not `*`)
- ✅ Implement rate limiting on auth endpoints
- ✅ Log failed authentication attempts
- ✅ Use strong JWT secret/key

### For Frontend

- ✅ Never expose API keys in code
- ✅ HTTPS only in production
- ✅ Don't store sensitive data in localStorage (only JWT token)
- ✅ Implement token refresh logic for expiration
- ✅ Always use Authorization header for protected endpoints

---

## Deployment Checklist

Before deploying to Netlify:

- [ ] Backend is running on production server
- [ ] API endpoints respond correctly
- [ ] CORS headers are configured properly
- [ ] JWT token validation works
- [ ] Google OAuth redirect URIs are updated
- [ ] HTTPS is enabled on backend
- [ ] API base URL is correct in app config (or use relative paths with same domain)
- [ ] Rate limiting is configured (optional but recommended)
- [ ] Error handling returns proper HTTP status codes

---

## Common Issues & Solutions

### Issue: CORS Error - "Access to XMLHttpRequest blocked"

**Cause**: Backend missing CORS headers or wrong origin

**Solution**:
1. Check backend CORS configuration
2. Verify frontend URL matches `Access-Control-Allow-Origin`
3. Ensure backend allows OPTIONS requests

### Issue: 401 Unauthorized on Protected Endpoints

**Cause**: Token not sent or invalid

**Solution**:
1. Check token exists in localStorage (F12 → Application → Storage)
2. Verify Authorization header is being sent (F12 → Network → Request Headers)
3. Check token hasn't expired
4. Backend should validate token correctly

### Issue: 403 Forbidden

**Cause**: Token valid but user lacks permissions

**Solution**:
1. Check user roles/permissions in backend
2. Verify user has correct permissions for accessing endpoints

### Issue: Backend Working Locally but Not on NetLify

**Cause**: API URL incorrect or server not accessible

**Solution**:
1. Use full URL: `https://api.yourdomain.com` instead of `http://localhost`
2. Ensure backend is deployed and accessible
3. Check backend server logs
4. Verify firewall/security group allows connections

---

## API Response Format

### Success Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "username": "testuser"
  }
}
```

### Error Response
```json
{
  "error": "Invalid credentials",
  "message": "Username or password is incorrect"
}
```

---

## Monitoring & Logging

### Frontend Logs
Check browser console for errors:
```
1. F12 → Console tab
2. Look for red error messages
3. Check Network tab for failed requests
```

### Backend Logs
Check server logs for:
- Failed authentication attempts
- CORS issues
- Database errors
- API response times

---

## Performance Tips

1. **Token Caching**: Frontend stores token, no need to fetch repeatedly
2. **Response Caching**: Backend can cache GET requests (Quantity, History)
3. **Compression**: Use gzip compression on API responses
4. **Rate Limiting**: Implement on login endpoint to prevent brute force

---

## Production Readiness

**Before going live, ensure:**

- ✅ All API endpoints return correct status codes
- ✅ CORS properly configured
- ✅ JWT tokens work correctly
- ✅ Error messages are user-friendly
- ✅ Backend has proper logging
- ✅ Backend is scaled for expected load
- ✅ Database backups are set up
- ✅ SSL/HTTPS is enabled
- ✅ Rate limiting is active

---

**Document Version**: 1.0  
**Last Updated**: 2026-04-17  
**For Backend Team**: Please ensure CORS is configured before frontend deployment
