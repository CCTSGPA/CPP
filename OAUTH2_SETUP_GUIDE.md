# OAuth2 Multi-Provider Implementation - Setup & Testing Guide

## ✅ Implementation Complete!

Your CCTS project now has full OAuth2 support for Google, Facebook, Apple, and Microsoft. This guide will help you set up the OAuth applications and configure your environment.

---

## 📋 What Was Implemented

### Backend (Spring Boot)
✅ Added OAuth2 dependencies to `pom.xml`
✅ Updated User model with OAuth provider fields (googleId, facebookId, appleId, microsoftId)
✅ Created `OAuth2Service.java` - Handles OAuth logic, user creation, and account linking
✅ Created `OAuth2UserInfo.java` DTO - Stores user data from OAuth providers
✅ Created `OAuth2LoginRequest.java` DTO - Receives authorization codes from frontend
✅ Created `OAuth2Config.java` - Spring configuration for RestTemplate
✅ Created new endpoint: `POST /api/v1/auth/oauth2/login` - Main OAuth login endpoint
✅ Created endpoint: `GET /api/v1/auth/oauth2/callback/{provider}` - Reserved for future use
✅ Updated `application.yml` with OAuth provider configurations

### Frontend (React)
✅ Created `oauthService.js` - OAuth provider redirect & callback handling
✅ Updated `Login.jsx` - Integrated OAuth buttons with handler logic
✅ Created `OAuthCallback.jsx` - Handles OAuth provider redirects
✅ Updated `App.jsx` - Added OAuth callback routes for all 4 providers

---

## 🚀 Setup Instructions

### Step 1: Create OAuth Applications (Required Before Testing)

#### 🔵 Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth Client ID"
5. Choose "Web application"
6. Add Authorized Redirect URIs:
   ```
   http://localhost:3000/auth/google/callback
   https://yourdomain.com/auth/google/callback (for production)
   ```
7. Copy your **Client ID** and **Client Secret**

#### 🔵 Facebook OAuth Setup
1. Go to [Meta Developers](https://developers.facebook.com/)
2. Create a new app or use existing
3. Add "Facebook Login" product
4. Go to Settings → Basic and copy **App ID** and **App Secret**
5. Go to Facebook Login → Settings
6. Add Valid OAuth Redirect URIs:
   ```
   http://localhost:3000/auth/facebook/callback
   https://yourdomain.com/auth/facebook/callback (for production)
   ```

#### 🔵 Apple OAuth Setup (Most Complex)
1. Go to [Apple Developer Account](https://developer.apple.com/)
2. Register as individual developer (paid account required)
3. Go to "Certificates, Identifiers & Profiles"
4. Create "Services ID" for your app
5. Enable "Sign in with Apple" for that Services ID
6. Add Return URLs:
   ```
   http://localhost:3000/auth/apple/callback
   https://yourdomain.com/auth/apple/callback
   ```
7. Create a private key (.p8 file) for "Sign in with Apple"
8. Note your:
   - **Services ID** (Client ID)
   - **Team ID** (10 character alphanumeric)
   - **Key ID** (from the private key)
   - **Private Key** content (paste entire .p8 file content)

#### 🔵 Microsoft OAuth Setup
1. Go to [Azure Portal](https://portal.azure.com/)
2. Go to "App registrations" → "New registration"
3. Register your application
4. Go to "Certificates & secrets" → "New client secret"
5. Copy the secret **Value** (not ID)
6. Go to "Redirect URIs"
7. Add redirect URIs:
   ```
   http://localhost:3000/auth/microsoft/callback
   https://yourdomain.com/auth/microsoft/callback
   ```
8. Note your:
   - **Application (Client) ID**
   - **Client Secret Value**

---

### Step 2: Configure Environment Variables

#### Backend (Spring Boot)
Create a `.env` file in your project root or set these environment variables:

```bash
# Google OAuth
export GOOGLE_CLIENT_ID="your_google_client_id"
export GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Facebook OAuth
export FACEBOOK_APP_ID="your_facebook_app_id"
export FACEBOOK_APP_SECRET="your_facebook_app_secret"

# Apple OAuth
export APPLE_SERVICES_ID="your_apple_services_id"
export APPLE_TEAM_ID="your_apple_team_id"
export APPLE_KEY_ID="your_apple_key_id"
export APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Microsoft OAuth
export MICROSOFT_CLIENT_ID="your_microsoft_client_id"
export MICROSOFT_CLIENT_SECRET="your_microsoft_client_secret"
```

**In application.yml**, these are already placeholders using environment variables:
```yaml
oauth2:
  google:
    client-id: ${GOOGLE_CLIENT_ID:your_google_client_id}
    client-secret: ${GOOGLE_CLIENT_SECRET:your_google_client_secret}
    # ... etc
```

#### Frontend (React)
Create a `.env` file in `ccts-frontend` directory:

```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id
VITE_APPLE_CLIENT_ID=your_apple_services_id
```

Update `oauthService.js` to use environment variables if needed:
```js
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your_fallback_id";
```

---

### Step 3: Update Backend Redirect URIs

Edit `application.yml` to match your environment:

**For Local Development:**
```yaml
oauth2:
  google:
    redirect-uri: http://localhost:3000/auth/google/callback
  facebook:
    redirect-uri: http://localhost:3000/auth/facebook/callback
  # ... etc for all providers
```

**For Production:**
```yaml
oauth2:
  google:
    redirect-uri: https://yourdomain.com/auth/google/callback
  facebook:
    redirect-uri: https://yourdomain.com/auth/facebook/callback
  # ... etc
```

---

### Step 4: Update Frontend Redirect URIs

Edit `oauthService.js`:

```js
// For development
const GOOGLE_REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

// For production, you can use:
const GOOGLE_REDIRECT_URI = process.env.VITE_OAUTH_REDIRECT_URI || `${window.location.origin}/auth/google/callback`;
```

---

## 🧪 Testing OAuth Flow

### Local Development Testing

1. **Start Backend:**
   ```bash
   cd ccts-backend/civicwatch
   mvn spring-boot:run
   # Should run on http://localhost:8081
   ```

2. **Start Frontend:**
   ```bash
   cd ccts-frontend
   npm install  # if not done yet
   npm run dev
   # Should run on http://localhost:5173 or http://localhost:3000
   ```

3. **Check API Configuration:**
   - Backend expects frontend on `http://localhost:3000` (update if different)
   - Frontend expects backend on `http://localhost:8081` (check `src/services/api.js`)

4. **Update Redirect URIs if Different:**
   - Google, Facebook, Apple, Microsoft expect redirects to `http://localhost:3000/auth/{provider}/callback`
   - If your frontend is on different port (like 5173), update:
     - OAuth provider settings
     - `oauthService.js` redirect URIs
     - `application.yml` redirect URIs

### Testing Each Provider

#### Test Google Login
1. Go to `http://localhost:3000/login`
2. Click "Continue with Google"
3. You'll be redirected to Google login
4. Login with your Google account
5. You'll be redirected back to `/auth/google/callback`
6. If successful, redirected to `/file-complaint` with auth token

#### Test Facebook Login
1. Click "Continue with Facebook"
2. Login with Facebook account
3. Should redirect to `/auth/facebook/callback`
4. Then to `/file-complaint`

#### Test Apple Login
1. Click "Login with Apple"
2. Login with Apple ID
3. Redirects to `/auth/apple/callback`
4. Then to `/file-complaint`

#### Test Microsoft Login
1. Click "Continue with Microsoft"
2. Login with Microsoft account
3. Redirects to `/auth/microsoft/callback`
4. Then to `/file-complaint`

---

## 🐛 Troubleshooting

### Problem: "Invalid redirect URI"
**Solution:** Make sure the redirect URI in OAuth provider settings exactly matches:
- The domain (localhost vs production domain)
- The port (3000, 5173, etc.)
- The path (`/auth/{provider}/callback`)

### Problem: "CORS Error" when calling backend OAuth endpoint
**Solution:** Check CORS configuration in Spring Boot. Add to your SecurityConfig if needed:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowCredentials(true);
    configuration.setAllowedHeaders(Arrays.asList("*"));

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### Problem: "No authorization code received"
**Solution:** Check browser console for error from OAuth provider. Common issues:
- Invalid Client ID/Secret
- Redirect URI mismatch
- OAuth app not properly enabled

### Problem: User created but no subsequent logins work
**Solution:** This is expected. After first OAuth login, user is created in database. For next login with same provider:
- System finds existing user by email
- Links OAuth provider ID to user account
- Logs in successfully

---

## 📊 Database Changes

The User table now has these new columns:
```sql
ALTER TABLE users ADD COLUMN google_id VARCHAR(255);
ALTER TABLE users ADD COLUMN facebook_id VARCHAR(255);
ALTER TABLE users ADD COLUMN apple_id VARCHAR(255);
ALTER TABLE users ADD COLUMN microsoft_id VARCHAR(255);
ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(50);
ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;
```

When Hibernate DDL-auto is set to `update`, these should be created automatically. Otherwise, run above SQL manually.

---

## 🔐 Security Notes

✅ **What's Secure:**
- All OAuth tokens are handled on backend (not exposed to frontend)
- JWT tokens are stored in localStorage (can be upgraded to secure httpOnly cookies)
- Password is nullable only for OAuth users
- Account linking prevents duplicate accounts

⚠️ **Production Recommendations:**
1. Store JWT in httpOnly cookies instead of localStorage
2. Implement CSRF token validation
3. Add rate limiting to OAuth endpoint
4. Validate OAuth token signatures on backend
5. Log all OAuth login attempts for security audit
6. Use HTTPS for all links
7. Add email verification for OAuth users

---

## 📝 API Documentation

### OAuth Login Endpoint
```
POST /api/v1/auth/oauth2/login
Content-Type: application/json

{
  "provider": "google",  // google, facebook, apple, microsoft
  "code": "authorization_code_from_provider"
}

Response:
{
  "status": 200,
  "message": "OAuth login successful",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### User Model Changes
- Added: `googleId`, `facebookId`, `appleId`, `microsoftId`
- Added: `oauthProvider` (stores: google, facebook, apple, microsoft)
- Modified: `password` (now nullable for OAuth users)

---

## 🎯 Next Steps

1. ✅ Code implementation (DONE)
2. ⏳ Create OAuth applications on providers
3. ⏳ Configure environment variables
4. ⏳ Test each OAuth flow
5. ⏳ Deploy to production
6. ⏳ Monitor OAuth login metrics

---

## 📞 Support & Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Docs](https://developers.facebook.com/docs/facebook-login)
- [Apple Sign In Docs](https://developer.apple.com/sign-in-with-apple/)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Spring Security OAuth2 Docs](https://spring.io/projects/spring-security-oauth)

---

## 📂 Modified Files Summary

### Backend Files Created
- `ccts-backend/civicwatch/src/main/java/com/ccts/service/OAuth2Service.java`
- `ccts-backend/civicwatch/src/main/java/com/ccts/dto/OAuth2UserInfo.java`
- `ccts-backend/civicwatch/src/main/java/com/ccts/dto/OAuth2LoginRequest.java`
- `ccts-backend/civicwatch/src/main/java/com/ccts/config/OAuth2Config.java`

### Backend Files Modified
- `ccts-backend/civicwatch/pom.xml` - Added OAuth2 dependencies
- `ccts-backend/civicwatch/src/main/java/com/ccts/model/User.java` - Added OAuth fields
- `ccts-backend/civicwatch/src/main/java/com/ccts/controller/AuthController.java` - Added OAuth endpoints
- `ccts-backend/civicwatch/src/main/resources/application.yml` - Added OAuth configuration

### Frontend Files Created
- `ccts-frontend/src/services/oauthService.js`
- `ccts-frontend/src/components/OAuthCallback.jsx`

### Frontend Files Modified
- `ccts-frontend/src/pages/Login.jsx` - Integrated OAuth handlers
- `ccts-frontend/src/App.jsx` - Added OAuth callback routes

---

**Implementation Date:** 2026-02-26
**Status:** ✅ Code Complete - Ready for OAuth App Setup & Testing
