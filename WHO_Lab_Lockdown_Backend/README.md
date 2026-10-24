# WHO Lab Lockdown — deployment package

## Run locally
1. Install Node.js 18+.
2. In this folder, run `npm install`.
3. Set `ADMIN_PASSWORD=absm` in the hosting environment to match the requested admin password. For a public event, choose a stronger password and set it only in the host environment.
4. Run `npm start` and open `http://localhost:3000`.

## Deploy
Deploy this folder to a Node.js host that supports long-running Express apps (for example, Render, Railway, or a VPS). Set `ADMIN_PASSWORD` in the host's environment variables. Set `ALLOWED_ORIGIN` to the deployed origin if you want to restrict Socket.IO origins. Put `WHO_Lab_Lockdown_Three_Page.html` in the `public` folder and rename it `index.html`. The host's final HTTPS URL is the URL encoded into team QR links automatically.

## Important limitations
- The current API provides a server-wide start/reset signal. Team phones poll `/api/state` and automatically enter Page 3 after start.
- To enforce team-by-team progress persistence across reconnects, add a database-backed progress endpoint before a high-stakes public event.
- No website can truly prevent a participant from closing a tab, switching apps, or opening another site. This implementation can keep users inside the app's flow and auto-redirect after launch, but browser-level exits cannot be blocked.
- For production, set a strong `ADMIN_PASSWORD`; never rely on a password embedded in front-end code. Admin authentication is checked server-side; do not add a client-side password check.
