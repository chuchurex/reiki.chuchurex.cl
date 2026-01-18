# Cloudflare Cache Management

## Setup

To use the Cloudflare cache purge script, add the following variables to your `.env` file:

```bash
# Cloudflare Configuration
CF_API_KEY=your_api_key_here
CF_EMAIL=your_email@example.com
CF_ZONE_ID=your_zone_id_here
```

### How to get credentials:

1. **API Key**: Go to https://dash.cloudflare.com/profile/api-tokens
   - Use your "Global API Key" or create a token with "Cache Purge" permissions

2. **Email**: Your Cloudflare account email

3. **Zone ID**:
   - Go to your domain's dashboard in Cloudflare
   - On the "Overview" page, look for "Zone ID" in the right sidebar
   - Copy the ID

## Usage

### Purge specific files (default)

```bash
node scripts/purge-cloudflare.js
```

This will purge:
- `/`
- `/revision.html`
- `/index.html`
- `/es/`
- `/es/index.html`

### Purge ALL cache

```bash
node scripts/purge-cloudflare.js --all
```

### Purge specific URLs

```bash
node scripts/purge-cloudflare.js /revision.html /ch1/index.html
```

Or with full URLs:

```bash
node scripts/purge-cloudflare.js https://lawofone.chuchurex.cl/revision.html
```

## Note

Cloudflare cache purges within seconds, but it may take up to 30 seconds to propagate globally to all edge servers.
