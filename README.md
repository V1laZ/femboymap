# FemboyMap

FemboyMap is a collaborative map web application that allows users to add their own markers anonymously. It is built using Cloudflare Pages, D1 (Cloudflare's SQLite-compatible database), and JavaScript API routes for backend logic.


## Project Structure
- `public/` — Static served frontend files
- `functions/api/` — API routes
- `migrations/` — SQL migration files for D1 database
- `wrangler.jsonc` — Wrangler configuration for Cloudflare Pages and D1

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
   npx wrangler pages dev ./public
   ```
   This will serve your site locally with the D1 database available to API routes.

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
  npx wrangler d1 migrations apply femboymap-db
  ```

## Deploying to Cloudflare Pages

### Production Deploy
To deploy the latest code to production:
```sh
npx wrangler pages deploy ./public
```
This will update your production site.

### Preview Deploy
To deploy a preview build (does not affect production):
```sh
npx wrangler pages deploy ./public --branch preview
```
This will create a preview deployment with a unique URL.

## License
MIT License.
