# msx.dellamanna.org

> Um arcade virtual com **51 jogos** clássicos reconstruídos em JavaScript a partir dos **7 manuais Usborne** (1982–1985), incluindo as edições brasileiras da Editora Lutécia. Tudo jogável no navegador, com **i18n PT-BR + EN** completo.

**Live:** [msx.dellamanna.org](https://msx.dellamanna.org/) · [hdma-mlogo-era.pages.dev](https://hdma-mlogo-era.pages.dev/) (mirror)

![msx.dellamanna.org](https://img.shields.io/badge/games-51-39ff14?style=for-the-badge)
![msx.dellamanna.org](https://img.shields.io/badge/manuals-7-ffb000?style=for-the-badge)
![msx.dellamanna.org](https://img.shields.io/badge/years-1982--1985-ff00ff?style=for-the-badge)
![msx.dellamanna.org](https://img.shields.io/badge/i18n-PT--BR%20%2B%20EN-00f0ff?style=for-the-badge)

## 🎮 What is this

The Usborne Publishing manuals (`Computer Space Games`, `Computer Battle Games`, `Weird Computer Games`, `Write Your Own Adventure Programs`, `Fantasy Games`, plus the Brazilian `Programas de Jogos de Horror` and `Livro de Jogos em MSX`) taught a whole generation to program BASIC on micros like the ZX81, BBC Micro, ZX Spectrum, TRS-80, MSX, VIC-20 and Apple II.

**HDMA MLogo Era** (published at `msx.dellamanna.org`) brings them all to the browser with:

- **51 playable games** in the browser
- **7 manuals** available for download (PDF)
- **Full i18n** in Brazilian Portuguese and English, with instant toggle
- **Hand-drawn arcade aesthetic** — real black, neon phosphor glow, CRT scanlines, marquee, animated boot
- **8-bit sound** generated in real time with the Web Audio API
- **Mobile-friendly** — touch controls on the play screen

## 🕹 The arcade

Visit [msx.dellamanna.org](https://msx.dellamanna.org/). You'll see 7 arcade cabinets lined up like a 1980s game room. Click any one to open its game picker. Each cabinet has a unique cover SVG drawn from scratch — no AI art, no stock photos.

## 📚 The manuals

| Manual | Year | Locale | # Games |
|---|---|---|---|
| **Write Your Own Adventure Programs** — *Haunted House* | 1983 | EN | 1 |
| **Computer Space Games** | 1982 | EN | 14 |
| **Fantasy Games** — *Dungeon of Doom* | 1983 | EN | 1 |
| **Computer Battle Games** | 1982 | EN | 13 |
| **Weird Computer Games** | 1984 | EN | 6 |
| **Programas de Jogos de Horror** (BR edition of *Creepy Computer Games*) | 1983 | PT-BR | 8 |
| **Livro de Jogos em MSX** (BR edition of *The MSX Games Book*) | 1985 | PT-BR | 9 |

All seven PDFs are bundled in `/public/pdfs/` and can be downloaded from the site's `/downloads` page.

## 🛠 Stack

- **Vue 3** + **TypeScript** + **Vite** + **Pinia** + **Vue Router**
- **Tailwind CSS** for the design tokens
- No pre-built UI dependencies — every scanline, phosphor glow, cabinet bezel and 8-bit blip is hand-drawn
- Web Audio API for the sounds (no audio files shipped)

## 🚀 Local development

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>.

## 🏗 Production build

```bash
npm run build
npm run preview
```

## 🌐 Deploy

Cloudflare Pages, project `hdma-mlogo-era`, custom domain `msx.dellamanna.org`.
GitHub Actions workflow at `.github/workflows/deploy.yml` triggers on push to `main`.
DNS for `msx.dellamanna.org` is a CNAME → `hdma-mlogo-era.pages.dev` (DNS-only, no proxy — Cloudflare Pages validates via CNAME).

## 🎯 The name

`HDMA` = Henrique Della Manna Arcade. `MLogo Era` = the era of the educational Logo/MSX/BBC micro computers of the early 80s. `msx.dellamanna.org` is the published hostname under `dellamanna.org`.

## ⚖ Credits

- Manuals © Usborne Publishing (UK) and Editora Lutécia (Brazil). PDFs are reproduced for educational comparison purposes.
- All game code reconstructed from the original BASIC listings, then ported to TypeScript and Vue 3.
- Built by Henrique Della Manna with Mavis (MiniMax Code), August 2026.
