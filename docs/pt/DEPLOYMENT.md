# Guia de Implantação

## Resumo

Este guia cobre a implantação do seu site estático em um servidor de produção usando SSH/rsync.

## Pré-requisitos

- Node.js v20+ instalado
- Acesso SSH ao seu servidor de hospedagem
- Domínio configurado com DNS apontando para seu servidor

## Configuração

### 1. Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
# Configuração de Domínio
DOMAIN=seu-site.com

# Implantação SSH/RSYNC
UPLOAD_HOST=seu-servidor.com          # IP ou hostname do servidor
UPLOAD_PORT=22                         # Porta SSH (geralmente 65002 para Hostinger)
UPLOAD_USER=seu-usuario                # Usuário SSH
UPLOAD_PASS=sua-senha                  # Senha SSH
UPLOAD_DIR=/caminho/para/public_html/  # Caminho do diretório remoto

# Cloudflare (opcional)
CF_API_KEY=sua-api-key
CF_EMAIL=seu-email
CF_ZONE_ID=seu-zone-id
```

> ⚠️ **Importante**: O arquivo `.env` contém credenciais sensíveis e **nunca deve ser commitado no git**. Este arquivo já está protegido no `.gitignore`.

### 2. Instalar sshpass (se usar autenticação por senha)

**macOS:**
```bash
brew install hudochenkov/sshpass/sshpass
```

**Linux:**
```bash
sudo apt-get install sshpass
```

### 3. Testar Conexão SSH

```bash
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST}
```

## Processo de Implantação

### Opção 1: Implantação Automatizada (Recomendado)

```bash
npm run publish
```

Isso irá:
1. Build do site estático (`npm run build`)
2. Implantação via rsync (`node scripts/deploy.js`)
3. (Opcional) Limpar cache do Cloudflare se configurado

### Opção 2: Passos Manuais

```bash
# 1. Build
npm run build

# 2. Deploy
node scripts/deploy.js

# 3. Limpar cache (opcional)
node scripts/purge-cloudflare.js --all
```

## Métodos de Implantação

### SSH/RSYNC (Padrão Atual)

O `scripts/deploy.js` usa rsync sobre SSH para transferências eficientes de arquivos:

```javascript
const rsyncCmd = `sshpass -p "${password}" rsync -avz --delete -e "ssh -p ${port} -o StrictHostKeyChecking=no" ${localDir} ${user}@${host}:${remoteDir}`;
```

**Vantagens:**
- Envia apenas arquivos modificados
- Preserva permissões de arquivos
- Rápido e eficiente
- Funciona com a maioria dos provedores de hospedagem

### Alternativa: Chaves SSH (Mais Seguro)

1. Gerar chave SSH:
```bash
ssh-keygen -t ed25519 -C "seu@email.com"
```

2. Copiar para o servidor:
```bash
ssh-copy-id -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST}
```

3. Modificar `scripts/deploy.js` para usar chaves em vez de senha

## Estrutura do Servidor

### Estrutura Típica de Hospedagem

```
domains/
└── seu-site.com/
    └── public_html/          ← UPLOAD_DIR
        ├── index.html
        ├── ch1/
        ├── ch2/
        ├── css/
        └── fonts/
```

### Para Subdomínios

```bash
# Subdomínio
UPLOAD_DIR=/domains/subdominio.seu-site.com/public_html/

# Subdiretório
UPLOAD_DIR=/domains/seu-site.com/public_html/livro/
```

## Verificação

### 1. Verificar Arquivos Implantados

```bash
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST}
ls -la ${UPLOAD_DIR}
```

### 2. Testar Acesso ao Site

```bash
curl https://seu-site.com
```

### 3. Verificar DNS

```bash
dig seu-site.com
# ou
nslookup seu-site.com
```

## Problemas Comuns

### Erro: Connection Refused

**Causa**: Porta SSH incorreta ou firewall bloqueando

**Solução**:
```bash
# Testar com telnet
telnet ${UPLOAD_HOST} ${UPLOAD_PORT}

# Verificar porta no painel de hospedagem
```

### Erro: Permission Denied

**Causa**: Credenciais ou caminho incorretos

**Solução**:
```bash
# Testar login SSH manualmente
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST}

# Verificar se o diretório remoto existe
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST} "ls -la ${UPLOAD_DIR}"
```

### Os Arquivos Não Atualizam

**Causa**: Caminho do diretório remoto incorreto

**Solução**:
```bash
# Verificar caminho real no servidor
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST} "pwd"

# Verificar timestamps dos arquivos
ssh -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST} "ls -lt ${UPLOAD_DIR} | head -20"
```

### O Cache do Cloudflare Não Limpa

**Causa**: Precisa limpar o cache após o deploy

**Solução**:
```bash
# Limpar todo o cache
node scripts/purge-cloudflare.js --all

# Ou esperar 5 minutos para o Cloudflare detectar as mudanças
```

## Melhores Práticas de Segurança

### 1. Autenticação SSH

**Recomendado**: Use chaves SSH em vez de senhas para maior segurança.

```bash
# Gerar chave (se você não tiver uma)
ssh-keygen -t ed25519 -C "seu@email.com"

# Copiar para o servidor
ssh-copy-id -p ${UPLOAD_PORT} ${UPLOAD_USER}@${UPLOAD_HOST}
```

Depois modifique `scripts/deploy.js` para usar chaves em vez de `sshpass`.

### 2. Permissões de Arquivos

Defina permissões apropriadas no servidor:

```bash
# Arquivos: leitura/escrita para proprietário, somente leitura para outros
find ${UPLOAD_DIR} -type f -exec chmod 644 {} \;

# Diretórios: leitura/escrita/execução para proprietário, leitura/execução para outros
find ${UPLOAD_DIR} -type d -exec chmod 755 {} \;
```

### 3. Variáveis de Ambiente em CI/CD

Para implantação automatizada, use gerenciadores de segredos:
- **GitHub Actions**: GitHub Secrets
- **GitLab CI**: CI/CD Variables
- **Local**: Arquivo `.env` (nunca commitар)

## Implantação Contínua (CI/CD)

### Exemplo com GitHub Actions

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

Configure os secrets nas configurações do repositório do GitHub.

## Próximos Passos

- [Gerenciamento de Cache do Cloudflare](./CLOUDFLARE.md)
- [Documentação Principal](./README.md)

---

Para problemas ou questões, abra uma issue no GitHub.
