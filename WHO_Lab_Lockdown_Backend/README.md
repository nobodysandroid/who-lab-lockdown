# WHO Lab Lockdown — Vibrant Ranking Edition

## What changed
- No entry PIN: team QR links go directly to the briefing page.
- The Level 5 four-digit exit code stays visible after all 12 answers. A modal prompts: **ENTER THE CODE TO SET YOURSELF FREE**.
- A **PREVIEW LEVEL 5 OPTIONS** control displays the four questions, options, and the team's selected correct choices.
- **Only successful final code submission counts as finishing.** Server awards places 1, 2, 3 in finish order and records elapsed time from the global START timestamp.
- Admin sees real-time team progress and ranked finishers.
- Winners see an animated podium page with their rank, elapsed time, and a quote. Other teams continue until the third finisher, then all remaining teams go to the final podium.
- Dark theme with saturated cyan, violet, coral, pink and gold accents. Level 5 turns red.

## Deployment — IMPORTANT: update the backend AND frontend
Your GitHub repo previously used `WHO_Lab_Lockdown_Backend/public/index.html` and `WHO_Lab_Lockdown_Backend/server.js`.

**Replace all three existing files** in that backend folder with the files in this package:

| File in this ZIP | GitHub destination |
| --- | --- |
| `public/index.html` | `WHO_Lab_Lockdown_Backend/public/index.html` |
| `server.js` | `WHO_Lab_Lockdown_Backend/server.js` |
| `package.json` | `WHO_Lab_Lockdown_Backend/package.json` |

**Also add** `bank.json` next to `server.js` at `WHO_Lab_Lockdown_Backend/bank.json`.

Do **not** upload the whole `WHO_Lab_Lockdown_Vibrant` directory as a new folder inside your repo. Keep your Render root directory set to `WHO_Lab_Lockdown_Backend`, Build Command `npm install`, Start Command `npm start`, and existing `ADMIN_PASSWORD` environment variable. Commit to the branch Render deploys. Keep the same Render URL; QR links are generated from the live origin.

## Event readiness
- Test QR joins for all 4 teams and admin login.
- Use admin RESET, then START before each real session.
- Finish Team 1 and verify #1, finish Team 2 and verify #2, finish Team 3 and verify everyone goes to podium.
- All connected team devices poll shared server state every 2.5 seconds. Multiple participants using the same team QR share team answer progress.
- The server uses memory by default. Restart/redeploy loses current scores. For durability on a host with persistent storage, set `GAME_STATE_FILE` to a writable persistent disk file path. **Render ephemeral filesystem is not persistent**; avoid redeploys or service restarts during play.
- For a live competition, deploy this as a **single server instance**; in-memory state will not synchronize between multiple instances.
- Answer keys and final codes are visible in the browser source. This is a classroom game, not a tamper-proof exam platform.
