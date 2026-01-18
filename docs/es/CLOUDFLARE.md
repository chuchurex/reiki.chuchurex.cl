# Gestión de Caché de Cloudflare

## Configuración

Para usar el script de purga de caché de Cloudflare, agrega las siguientes variables a tu archivo `.env`:

```bash
# Configuración de Cloudflare
CF_API_KEY=tu_api_key_aqui
CF_EMAIL=tu_email@ejemplo.com
CF_ZONE_ID=tu_zone_id_aqui
```

### Cómo obtener las credenciales:

1. **API Key**: Ve a https://dash.cloudflare.com/profile/api-tokens
   - Usa tu "Global API Key" o crea un token con permisos de "Cache Purge"

2. **Email**: El email de tu cuenta de Cloudflare

3. **Zone ID**:
   - Ve al dashboard de tu dominio en Cloudflare
   - En la página de "Overview", busca "Zone ID" en la barra lateral derecha
   - Copia el ID

## Uso

### Purgar archivos específicos (por defecto)

```bash
node scripts/purge-cloudflare.js
```

Esto purgará:
- `/`
- `/revision.html`
- `/index.html`
- `/es/`
- `/es/index.html`

### Purgar TODO el caché

```bash
node scripts/purge-cloudflare.js --all
```

### Purgar URLs específicas

```bash
node scripts/purge-cloudflare.js /revision.html /ch1/index.html
```

O con URLs completas:

```bash
node scripts/purge-cloudflare.js https://lawofone.chuchurex.cl/revision.html
```

## Nota

El caché de Cloudflare se purga en segundos, pero puede tomar hasta 30 segundos para propagarse globalmente a todos los servidores edge.
