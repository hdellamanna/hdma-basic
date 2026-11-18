# HDMA BASIC · Fliperama 2000

Fliperama de navegador com 58 jogos recriados a partir de oito manuais publicados entre 1982 e 1985, uma oficina de Logo e uma edição Remastered. O salão imagina o ano 2000 a partir da Paris da Belle Époque e dos fliperamas dos anos 1970 e 1980. A interface está disponível em português e inglês.

- **Clássicos.** Os jogos dos manuais foram adaptados de BASIC para TypeScript. Os endereços `/play/:manualId/:gameId` abrem a edição clássica. O código de cada jogo é carregado ao iniciar a partida.
- **Remastered.** Correio Lunar (`/remastered`) é um quebra-cabeça original de navegação e recarga inspirado no tema lunar de Moonlander. Funciona com teclado, mouse e toque. A edição textual do mesmo jogo está disponível em BASIC com linhas numeradas em `public/basic/correio-lunar.bas`. Para executá-la, use `bwbasic public/basic/correio-lunar.bas`.
- **Oficina de Logo.** Interpretador de Logo e desenho com a tartaruga em `/play/apple-logo/apple-logo`.
- **Manuais.** Oito PDFs para consulta em `/downloads`.

## Acervo clássico

| Manual | Ano | Jogos |
| --- | --- | ---: |
| Write Your Own Adventure Programs | 1983 | 1 |
| Computer Space Games | 1982 | 13 |
| Fantasy Games | 1983 | 1 |
| Computer Battle Games | 1982 | 13 |
| Weird Computer Games | 1984 | 6 |
| Programas de Jogos de Horror | 1983 | 8 |
| Livro de Jogos em MSX | 1985 | 9 |
| Programas de Jogos de Espionagem | 1984 | 7 |

## Desenvolvimento

Vue 3, TypeScript, Vite, Pinia, Vue Router e Tailwind CSS. Use Node 22.12 ou superior.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

O build gera `dist/`. O workflow do GitHub publica no projeto Cloudflare Pages `hdma-basic` quando há push para `main`.

## Créditos

Projeto de Henrique Della Manna, com a primeira implementação feita com Mavis (MiniMax Code). Manuais originais da Usborne Publishing e da Editora Lutécia. A ilustração do salão foi gerada para este projeto. As fontes seguem as licenças OFL incluídas em `public/fonts/`.
