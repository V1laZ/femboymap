# FemboyMap

FemboyMap is a community map web application that displays markers shared by the femboy community. It is built using Cloudflare Workers and D1 (Cloudflare's SQLite-compatible database).

The site is hosted on https://femboymap.com/

## Project Structure
- `public/` — Static frontend files
  - `index.html` — Main map page
  - `styles.css` — Application styling
  - `script.js` — Map functionality
  - `privacy.html` — Privacy policy page
- `worker/`
  - `index.js` — Cloudflare Worker backend
- `migrations/` — SQL migration files for D1 database
- `wrangler.jsonc` — Wrangler configuration for Cloudflare Workers and D1

## Development Setup
1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Set up your D1 database:**
   - Log in to Cloudflare:
     ```sh
     npx wrangler login
     ```
   - Create d1 database
     ```sh
     npx wrangler d1 create <YOUR_DATABASE_NAME>
     ```
   - (Optional) Run migrations:
     ```sh
     npx wrangler d1 migrations apply <YOUR_DATABASE_NAME>
     ```
3. **Start the development server:**
   ```sh
   npx wrangler dev
   ```
   This will serve your worker locally with the D1 database available.

## Environment Variables
For local development Cloudflare environment variables can be defined in **.dev.vars**:
```
// .dev.vars
IP_HASH_SALT=<your_hash_salt>
```

Set `IP_HASH_SALT` in your Cloudflare Secrets Store
```sh
npx wrangler secret put IP_HASH_SALT
```

## Wrangler
Please refer to Cloudflare docs on how to setup **Wrangler** to your liking. I've placed an example configuration file in **wrangler-example.jsonc**

## Database Migrations
- Place migration files in `migrations/`.
- Apply migrations with:
  ```sh
  npx wrangler d1 migrations apply <YOUR_DATABASE_NAME>
  ```

## Deploying to Cloudflare Workers

### Production Deploy
To deploy the latest code to production:
```sh
npx wrangler deploy
```
This will update your production worker.

### Development Deploy
To test your worker before production:
```sh
npx wrangler dev
```
This will run the worker locally for testing.

## Contact
For data removal requests or questions about the privacy policy, contact: dhpene3h9@mozmail.com

## License
MIT License.
