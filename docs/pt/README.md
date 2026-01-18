# 📖 Os Ensinamentos da Lei do Uno - Documentação

> Gerador de site estático para apresentar os ensinamentos da Lei do Uno

## Resumo

Este projeto é um gerador de sites estáticos projetado especificamente para apresentar textos espirituais e filosóficos em um formato acessível e bonito. Construído para "Os Ensinamentos da Lei do Uno", uma interpretação pessoal do material de Ra.

**Site ao vivo**: https://lawofone.chuchurex.cl

## Características

- 📖 **Geração de HTML estático** a partir de conteúdo JSON
- 🌍 **Suporte multilíngue** (Espanhol, Inglês, Português)
- 📄 **Geração automática de PDFs** com Puppeteer
- 📝 **Sistema de glossário e referências** com tooltips ao passar o mouse
- 🎨 **Design responsivo** otimizado para leitura
- 🚀 **Implantação automatizada** via rsync/SSH
- 🔊 **Suporte para geração de audiolivros** (opcional)
- 🤖 **Amigável para SEO** com metadados apropriados

## Início Rápido

```bash
# Clonar o repositório
git clone https://github.com/chuchurex/lawofone.chuchurex.cl.git
cd lawofone.chuchurex.cl

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Iniciar servidor de desenvolvimento
npm run dev
# Site disponível em http://127.0.0.1:3002
```

## Estrutura do Projeto

```
lawofone.chuchurex.cl/
├── i18n/                     # Conteúdo multilíngue
│   ├── es/                   # Espanhol
│   ├── en/                   # Inglês
│   └── pt/                   # Português (se disponível)
│       ├── ui.json           # Traduções de UI
│       ├── chapters/         # Capítulos do livro
│       ├── about.json        # Página "Sobre"
│       ├── glossary.json     # Termos do glossário
│       └── references.json   # Referências
├── scripts/                  # Scripts de build e deploy
│   ├── build.js              # Script principal de build
│   ├── build-pdf.js          # Geração de PDFs
│   └── deploy.js             # Script de implantação
├── scss/                     # Estilos
├── templates/                # Templates HTML
├── fonts/                    # Fontes auto-hospedadas
└── docs/                     # Documentação (esta pasta)
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Iniciar servidor de desenvolvimento com recarga ao vivo |
| `npm run build` | Gerar site estático em `/dist` |
| `npm run build:pdf <cap> <lang>` | Gerar PDF para capítulo específico |
| `npm run build:pdf all <lang>` | Gerar todos os PDFs para um idioma |
| `npm run publish` | Build + Deploy para produção |

## Formato do Conteúdo

O conteúdo é armazenado em arquivos JSON com a seguinte estrutura:

```json
{
  "id": "ch1",
  "number": 1,
  "numberText": "Capítulo Um",
  "title": "Introdução",
  "sections": [
    {
      "id": "ch1-intro",
      "title": "Título da Seção",
      "content": [
        {
          "type": "paragraph",
          "text": "Texto com **negrito** e *itálico*."
        },
        {
          "type": "quote",
          "text": "Uma citação destacada."
        }
      ]
    }
  ]
}
```

### Características do Texto

- **Negrito**: `**texto**`
- **Itálico**: `*texto*`
- **Termos do glossário**: `{term:id}` ou `{term:id|Texto Personalizado}`
- **Referências**: `{ref:categoria:id}`

## Configuração

Configuração principal em `.env`:

```bash
# Domínio
DOMAIN=seu-site.com

# Implantação (SSH/RSYNC)
UPLOAD_HOST=seu-servidor.com
UPLOAD_PORT=65002
UPLOAD_USER=seu-usuario
UPLOAD_PASS=sua-senha
UPLOAD_DIR=/caminho/para/public_html/

# Cloudflare (opcional - para cache)
CF_API_KEY=sua-api-key
CF_EMAIL=seu-email
CF_ZONE_ID=seu-zone-id

# Audio TTS (opcional)
FISH_API_KEY=sua-fish-api-key
FISH_VOICE_ID=seu-voice-id
```

## Leitura Adicional

- [Guia de Implantação](./DEPLOYMENT.md) - Como implantar em produção
- [Configuração do Cloudflare](./CLOUDFLARE.md) - Gerenciamento de cache e CDN

## Atribuições

Baseado em **The Ra Material / The Law of One** © L/L Research
- Canalizado por Don Elkins, Carla Rueckert e Jim McCarty
- Tradução original para o espanhol por Dhyana C. e equipe do llresearch.org

**Importante**: Este projeto é uma interpretação pessoal. Para o material original, visite:
- Site oficial: https://llresearch.org
- Em espanhol: https://www.lawofone.info/es

## Licença

- **Código**: Licença MIT
- **Conteúdo**: Interpretação pessoal do material da Lei do Uno (© L/L Research)

Compartilhado sem fins lucrativos para propósitos educacionais e espirituais.

---

*"Tudo é um, e esse um é amor/luz, luz/amor, o Criador Infinito."*
