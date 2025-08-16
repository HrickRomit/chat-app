## Auth setup

Environment variables required:

- PORT=5000
- FRONTEND_ORIGIN=http://localhost:5173
- JWT_SECRET=your_access_secret
- JWT_REFRESH_SECRET=your_refresh_secret
- DB_USER=...
- DB_HOST=...
- DB_NAME=...
- DB_PASSWORD=...

Notes:

- Refresh token is stored in an HttpOnly cookie named `refreshToken`.
- Access token is returned in JSON `{ token }` and should be stored client-side (here we use localStorage) and sent via `Authorization: Bearer <token>`.
- Use CORS with `credentials: true` and configure your frontend client with `withCredentials: true` so cookies are sent.
