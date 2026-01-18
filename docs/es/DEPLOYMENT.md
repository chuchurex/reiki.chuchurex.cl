# Guía de Despliegue

## Resumen

Esta guía cubre el despliegue de tu sitio web estático a un servidor de producción usando SSH/rsync.

## Requisitos Previos

- Node.js v20+ instalado
- Acceso SSH a tu servidor de hosting
- Dominio configurado con DNS apuntando a tu servidor

## Configuración

### 1. Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
# Configuración de Dominio
DOMAIN=tu-sitio.com

# Despliegue SSH/RSYNC
UPLOAD_HOST=tu-servidor.com          # IP o hostname del servidor
UPLOAD_PORT=22                        # Puerto SSH (a menudo 65002 para Hostinger)
UPLOAD_USER=tu-usuario                # Usuario SSH
UPLOAD_PASS=tu-contraseña             # Contraseña SSH
UPLOAD_DIR=/ruta/a/public_html/       # Ruta del directorio remoto

# Cloudflare (opcional)
CF_API_KEY=tu-api-key
CF_EMAIL=tu-email
CF_ZONE_ID=tu-zone-id
```

> ⚠️ **Importante**: El archivo `.env` contiene credenciales sensibles y **nunca debe ser commitado a git**. Este archivo ya está protegido en `.gitignore`.

### 2. Instalar sshpass (si usas autenticación por contraseña)

**macOS:**
```bash
brew install hudochenkov/sshpass/sshpass
```

**Linux:**
```bash
sudo apt-get install sshpass
```

### 3. Probar Conexión SSH

```bash
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST}
```

## Proceso de Despliegue

### Opción 1: Despliegue Automatizado (Recomendado)

```bash
npm run publish
```

Esto hará:
1. Build del sitio estático (`npm run build`)
2. Despliegue vía rsync (`node scripts/deploy.js`)
3. (Opcional) Purgar caché de Cloudflare si está configurado

### Opción 2: Pasos Manuales

```bash
# 1. Build
npm run build

# 2. Deploy
node scripts/deploy.js

# 3. Purgar caché (opcional)
node scripts/purge-cloudflare.js --all
```

## Métodos de Despliegue

### SSH/RSYNC (Predeterminado Actual)

El `scripts/deploy.js` usa rsync sobre SSH para transferencias eficientes de archivos:

```javascript
const rsyncCmd = `sshpass -p "${password}" rsync -avz --delete -e "ssh -p ${port} -o StrictHostKeyChecking=no" ${localDir} ${user}@${host}:${remoteDir}`;
```

**Ventajas:**
- Solo sube archivos modificados
- Preserva permisos de archivos
- Rápido y eficiente
- Funciona con la mayoría de proveedores de hosting

### Alternativa: Claves SSH (Más Seguro)

1. Generar clave SSH:
```bash
ssh-keygen -t ed25519 -C "tu@email.com"
```

2. Copiar al servidor:
```bash
ssh-copy-id -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST}
```

3. Modificar `scripts/deploy.js` para usar claves en lugar de contraseña

## Estructura del Servidor

### Estructura Típica de Hosting

```
domains/
└── tu-sitio.com/
    └── public_html/          ← UPLOAD_DIR
        ├── index.html
        ├── ch1/
        ├── ch2/
        ├── css/
        └── fonts/
```

### Para Subdominios

```bash
# Subdominio
UPLOAD_DIR=/domains/subdominio.tu-sitio.com/public_html/

# Subdirectorio
UPLOAD_DIR=/domains/tu-sitio.com/public_html/libro/
```

## Verificación

### 1. Verificar Archivos Desplegados

```bash
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST}
ls -la ${UPLOAD_DIR}
```

### 2. Probar Acceso al Sitio

```bash
curl https://tu-sitio.com
```

### 3. Verificar DNS

```bash
dig tu-sitio.com
# o
nslookup tu-sitio.com
```

## Problemas Comunes

### Error: Connection Refused

**Causa**: Puerto SSH incorrecto o firewall bloqueando

**Solución**:
```bash
# Probar con telnet
telnet ${UPLOAD_HOST} ${UPLOAD_PORT}

# Verificar puerto en panel de hosting
```

### Error: Permission Denied

**Causa**: Credenciales o ruta incorrectas

**Solución**:
```bash
# Probar login SSH manualmente
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST}

# Verificar que el directorio remoto existe
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST} "ls -la ${UPLOAD_DIR}"
```

### Los Archivos No Se Actualizan

**Causa**: Ruta del directorio remoto incorrecta

**Solución**:
```bash
# Verificar ruta real en el servidor
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST} "pwd"

# Verificar timestamps de archivos
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST} "ls -lt ${UPLOAD_DIR} | head -20"
```

### El Caché de Cloudflare No Se Limpia

**Causa**: Necesitas purgar el caché después del deploy

**Solución**:
```bash
# Purgar todo el caché
node scripts/purge-cloudflare.js --all

# O esperar 5 minutos para que Cloudflare detecte los cambios
```

## Mejores Prácticas de Seguridad

### 1. Autenticación SSH

**Recomendado**: Usa claves SSH en lugar de contraseñas para mayor seguridad.

```bash
# Generar clave (si no tienes una)
ssh-keygen -t ed25519 -C "tu@email.com"

# Copiar al servidor
ssh-copy-id -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST}
```

Luego modifica `scripts/deploy.js` para usar claves en lugar de `sshpass`.

### 2. Permisos de Archivos

Establece permisos apropiados en el servidor:

```bash
# Archivos: lectura/escritura para propietario, solo lectura para otros
find ${UPLOAD_DIR} -type f -exec chmod 644 {} \;

# Directorios: lectura/escritura/ejecución para propietario, lectura/ejecución para otros
find ${UPLOAD_DIR} -type d -exec chmod 755 {} \;
```

### 3. Variables de Entorno en CI/CD

Para despliegue automatizado, usa gestores de secretos:
- **GitHub Actions**: GitHub Secrets
- **GitLab CI**: CI/CD Variables
- **Local**: Archivo `.env` (nunca commitear)

## Despliegue Continuo (CI/CD)

### Ejemplo con GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        env:
          UPLOAD_HOST: ${{ secrets.UPLOAD_HOST }}
          UPLOAD_PORT: ${{ secrets.UPLOAD_PORT }}
          UPLOAD_USER: ${{ secrets.UPLOAD_USER }}
          UPLOAD_PASS: ${{ secrets.UPLOAD_PASS }}
          UPLOAD_DIR: ${{ secrets.UPLOAD_DIR }}
        run: |
          sudo apt-get install -y sshpass
          node scripts/deploy.js
```

Configura los secrets en la configuración del repositorio de GitHub.

## Próximos Pasos

- [Gestión de Caché de Cloudflare](./CLOUDFLARE.md)
- [Documentación Principal](./README.md)

---

Para problemas o preguntas, abre un issue en GitHub.
