Admin frontend is already running at http://127.0.0.1:3001/ (open this in browser).
Backend API is listening on http://localhost:8080 (required because frontend proxies /api there).
Open http://127.0.0.1:3001/login first, then sign in (root redirects to protected routes).
If you still see blank/old state, open DevTools Console and run: localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); location.reload();
If you need to restart manually:
Frontend: cd ccts-admin_Panel && npm run dev
Backend: cd ccts-backend/civicwatch && .\mvnw.cmd spring-boot:run


cd "c:/Users/dhruv/Documents/CPP/civicwatch/ccts-backend/civicwatch" && .\mvnw.cmd spring-boot:run
curl -i -X OPTIONS "http://localhost:8080/api/v1/auth/login" -H "Origin: http://127.0.0.1:3001" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type,authorization"

curl -i -X POST "http://localhost:8080/api/v1/auth/login" -H "Content-Type: application/json" -H "Origin: http://127.0.0.1:3001" -d "{\"username\":\"admin\",\"password\":\"admin\"}"

cd "c:/Users/dhruv/Documents/CPP/civicwatch/ccts-admin_Panel" && npm run build


cd "c:/Users/dhruv/Documents/CPP/civicwatch/ccts-backend/civicwatch" && .\mvnw.cmd spring-boot:run





I’ll trace this from backend CORS and auth config first, then patch both sides so CORS is allowed and non‑JSON error responses don’t crash parsing.

I found two issues: your backend CORS allowlist misses port 3001, and your login error handler assumes every failed response is JSON. I’ll patch both so this exact error disappears.

I’ve confirmed the API path mismatch too (/api/auth/login vs backend /api/v1/auth/login), so I’m patching login URL plus safer response parsing to avoid the “Unexpected token 'I'” crash.

Edited
AdminAuthContext.jsx+15-4
Next I’m widening backend dev CORS origins to include your current frontend host/port (127.0.0.1:3001 / localhost:3001) so preflight won’t be rejected.

I’ve patched both root causes in code; now I’ll restart backend and run a quick preflight check to confirm CORS headers are returned correctly.

taskkill /PID 4984 /F
 Enable shell integration to improve command detection

cd "c:/Users/dhruv/Documents/CPP/civicwatch/ccts-backend/civicwatch" && .\mvnw.cmd spring-boot:run
curl -i -X OPTIONS "http://localhost:8080/api/v1/auth/login" -H "Origin: http://127.0.0.1:3001" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type,authorization"
 Enable shell integration to improve command detection

cd "c:/Users/dhruv/Documents/CPP/civicwatch/ccts-admin_Panel" && npm run build
 Enable shell integration to improve command detection

That error is fixed from both ends.

Updated login API path in AdminAuthContext.jsx from /api/auth/login to /api/v1/auth/login (matches backend routes).
Added safe response parsing in AdminAuthContext.jsx so plain-text backend errors no longer crash JSON parsing.
Updated CORS allowlist in CorsConfig.java to allow localhost/127.0.0.1 on any dev port (including 3001).
Verified preflight now succeeds (HTTP 200 with Access-Control-Allow-Origin: http://127.0.0.1:3001).
Run it now:

Frontend: cd ccts-admin_Panel && npm run dev
Backend: cd ccts-backend/civicwatch && .\mvnw.cmd spring-boot:run
Open: http://127.0.0.1:3001/login
If it still shows old behavior, hard refresh (Ctrl+F5) once.















cd ccts-backend\civicwatch
.\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--debug"

.\mvnw.cmd -e -X spring-boot:run

.\mvnw.cmd clean compile




Port 8081 is already occupied. Do one of these:

Option 1 (recommended): stop process on 8081
netstat -ano | findstr :8081

Copy the PID from last column, then:

taskkill /PID <PID> /F


Then start backend again:
cd c:\Users\dhruv\Documents\CPP\civicwatch\ccts-backend\civicwatch
.\mvnw.cmd spring-boot:run

Option 2: run backend on another port (temporary)
If you use 8082, also update frontend proxy target in vite.config.js to http://localhost:8082.

cd c:\Users\dhruv\Documents\CPP\civicwatch\ccts-backend\civicwatch
.\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments=--server.port=8082

If you use 8082, also update frontend proxy target in vite.config.js to <http://localhost:8082>.




# CivicWatch - Run Guide (Windows)

## Services and Ports
- **Backend (Spring Boot):** `http://localhost:8081`
- **Admin Frontend (Vite):** `http://127.0.0.1:3001` (or `3002` if `3001` is busy)

> Ensure frontend proxy points to backend port `8081` in `ccts-admin_Panel/vite.config.js`.

---

## 1) Start Backend

```powershell
cd c:\Users\dhruv\Documents\CPP\civicwatch\ccts-backend\civicwatch
.\mvnw.cmd clean spring-boot:run
```

Wait for:
- `Started CctsApplication`
- `ReadinessState changed to ACCEPTING_TRAFFIC`

---

## 2) Start Admin Frontend (new terminal)

```powershell
cd c:\Users\dhruv\Documents\CPP\civicwatch\ccts-admin_Panel
npm install
npm run dev
```

Open the URL shown by Vite:
- `http://127.0.0.1:3001/login`  
  (or `3002` if port `3001` is occupied)

---

## 3) Admin Login
- Email: `adminccts2026@gmail.com`
- Password: `admin@2026`

---

## Quick Fixes

### A) Port 8081 already in use
```powershell
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

Then restart backend.

### B) Browser shows old/blank state
Open browser dev console and run:
```js
localStorage.removeItem('adminToken');
localStorage.removeItem('adminUser');
location.reload();
```
Then press `Ctrl + F5`.

### C) CORS / JSON parse errors
- Confirm backend is running on `8081`.
- Confirm frontend proxy target is `http://localhost:8081`.
- Restart both backend and frontend after config changes.

---

## Optional API Test

### Preflight (CORS)
```powershell
curl -i -X OPTIONS "http://localhost:8081/api/v1/auth/login" `
  -H "Origin: http://127.0.0.1:3001" `
  -H "Access-Control-Request-Method: POST" `
  -H "Access-Control-Request-Headers: content-type,authorization"
```

### Login API
```powershell
curl -i -X POST "http://localhost:8081/api/v1/auth/login" `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"adminccts2026@gmail.com\",\"password\":\"admin@2026\"}"
```






cd "c:/Users/dhruv/Documents/CPP/civicwatch/ccts-frontend" && npm install react-icons
