# 🐾 PetLink

App mobile-first para donos de animais — conecta cuidadores, gere perfis de pets e activa alertas comunitários para animais perdidos.

## Stack
- React 18 + Vite
- CSS-in-JS (inline styles, sem dependências extra)
- Totalmente responsivo — mobile bottom nav / desktop sidebar

## Funcionalidades
- **Dashboard** — resumo de pets, reservas activas e actividade recente
- **Os meus animais** — perfil completo com vacinas e historial médico
- **Cuidadores** — pesquisa, filtros por serviço e reserva
- **Alertas / SOS Pet** — feed de animais perdidos/encontrados e formulário de alerta
- **Reservas** — gestão de serviços com estados (a decorrer, confirmado, pendente)

## Correr localmente

```bash
npm install
npm run dev
```

## Deploy (Vercel)

```bash
npm install -g vercel
vercel
```

Ou arrasta a pasta para [vercel.com](https://vercel.com) — dá deploy automático.

## Estrutura

```
petlink/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── index.jsx
    ├── index.css
    └── App.jsx        ← toda a app aqui
```
