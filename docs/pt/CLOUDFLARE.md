# Gerenciamento de Cache do Cloudflare

## Configuração

Para usar o script de limpeza de cache do Cloudflare, adicione as seguintes variáveis ao seu arquivo `.env`:

```bash
# Configuração do Cloudflare
CF_API_KEY=sua_api_key_aqui
CF_EMAIL=seu_email@exemplo.com
CF_ZONE_ID=seu_zone_id_aqui
```

### Como obter as credenciais:

1. **API Key**: Vá para https://dash.cloudflare.com/profile/api-tokens
   - Use sua "Global API Key" ou crie um token com permissões de "Cache Purge"

2. **Email**: O email da sua conta do Cloudflare

3. **Zone ID**:
   - Vá para o painel do seu domínio no Cloudflare
   - Na página "Overview", procure "Zone ID" na barra lateral direita
   - Copie o ID

## Uso

### Limpar arquivos específicos (padrão)

```bash
node scripts/purge-cloudflare.js
```

Isso limpará:
- `/`
- `/revision.html`
- `/index.html`
- `/es/`
- `/es/index.html`

### Limpar TODO o cache

```bash
node scripts/purge-cloudflare.js --all
```

### Limpar URLs específicas

```bash
node scripts/purge-cloudflare.js /revision.html /ch1/index.html
```

Ou com URLs completas:

```bash
node scripts/purge-cloudflare.js https://lawofone.chuchurex.cl/revision.html
```

## Nota

O cache do Cloudflare é limpo em segundos, mas pode levar até 30 segundos para se propagar globalmente para todos os servidores edge.
