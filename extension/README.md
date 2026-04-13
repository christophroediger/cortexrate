# CortexRate Extension

Minimal Chrome extension scaffold for the CortexRate MVP.

## Current scope

- Runs on Cortex Cloud pages only
- Tries to scrape visible `title`, `creator`, and `type` conservatively
- Calls the existing `POST /api/v1/identity/resolve` backend endpoint
- Shows a small read-only CortexRate summary badge
- Remains read-only

## Local loading

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click `Load unpacked`.
4. Select the `extension/` folder from this workspace.
5. Open `extension/config.js`.
6. For local development, keep:
   - `environment: "development"`
   - `developmentBaseUrl: "http://localhost:3000"`
7. For a deployed build, switch to:
   - `environment: "production"`
   - `productionBaseUrl: "https://cortexrate.app"`
8. Reload the unpacked extension after changing `extension/config.js`.
9. For local development, make sure the CortexRate web app is running on `http://localhost:3000`.
10. Open a Cortex Cloud item page under `https://cloud.neuraldsp.com/`.
11. If the page exposes reliable visible fields, confirm the badge appears in the bottom-right corner.
12. Expected badge text:
   - linked item: average rating and review count
   - unresolved item: `No ratings yet`

## Notes

- The content script fails quietly if `title`, `creator`, or `type` cannot be scraped reliably.
- Requests are deduplicated by a simple item fingerprint, and badge injection is deduplicated by element id.
- The extension base URL is configured in `extension/config.js` with a simple development/production switch.
- If cross-origin request restrictions become a problem, the next step is to move the fetch into an extension service worker.
