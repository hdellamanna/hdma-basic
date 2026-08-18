import type { Locale } from '../types'

export const SUPPORTED_LOCALES: Locale[] = ['pt-BR', 'en']
export const DEFAULT_LOCALE: Locale = 'pt-BR'

export const LOCALE_LABELS: Record<Locale, string> = {
  'pt-BR': 'PT-BR',
  en: 'EN',
}

export const LOCALE_FLAGS: Record<Locale, string> = {
  'pt-BR': '🇧🇷',
  en: '🇺🇸',
}

// UI strings shared across the app
export const UI_STRINGS: Record<string, Record<Locale, string>> = {
  appName: {
    'pt-BR': 'msx.dellamanna.org',
    en: 'msx.dellamanna.org',
  },
  appTagline: {
    'pt-BR': 'HDMA MLogo Era · O arcade dos manuais Usborne (1982–1985)',
    en: 'HDMA MLogo Era · The Usborne manuals arcade (1982–1985)',
  },
  chooseCabinet: {
    'pt-BR': 'ESCOLHA UM ARCADE',
    en: 'PICK A CABINET',
  },
  chooseCabinetSub: {
    'pt-BR': 'Cada máquina guarda um manual. Clique para abrir a seleção de jogos.',
    en: 'Each cabinet holds a manual. Click to open the game picker.',
  },
  backToFloor: {
    'pt-BR': 'Voltar ao salão',
    en: 'Back to the floor',
  },
  downloadManuals: {
    'pt-BR': 'Baixar manuais (PDF)',
    en: 'Download manuals (PDF)',
  },
  playGame: {
    'pt-BR': 'JOGAR',
    en: 'PLAY',
  },
  howToPlay: {
    'pt-BR': 'Como jogar',
    en: 'How to play',
  },
  objective: {
    'pt-BR': 'Objetivo',
    en: 'Objective',
  },
  controls: {
    'pt-BR': 'Controles',
    en: 'Controls',
  },
  restart: {
    'pt-BR': 'Reiniciar',
    en: 'Restart',
  },
  quit: {
    'pt-BR': 'Sair',
    en: 'Quit',
  },
  gameOver: {
    'pt-BR': 'FIM DE JOGO',
    en: 'GAME OVER',
  },
  youWin: {
    'pt-BR': 'VOCÊ VENCEU',
    en: 'YOU WIN',
  },
  score: {
    'pt-BR': 'PONTOS',
    en: 'SCORE',
  },
  lives: {
    'pt-BR': 'VIDAS',
    en: 'LIVES',
  },
  pressStart: {
    'pt-BR': 'PRESSIONE QUALQUER TECLA PARA COMEÇAR',
    en: 'PRESS ANY KEY TO START',
  },
  coinInserted: {
    'pt-BR': 'MOEDA INSERIDA',
    en: 'COIN INSERTED',
  },
  insertCoin: {
    'pt-BR': 'INSERIR MOEDA',
    en: 'INSERT COIN',
  },
  freePlay: {
    'pt-BR': 'JOGO LIVRE',
    en: 'FREE PLAY',
  },
  gamesAvailable: {
    'pt-BR': 'jogos disponíveis',
    en: 'games available',
  },
  difficulty: {
    'pt-BR': 'Dificuldade',
    en: 'Difficulty',
  },
  year: {
    'pt-BR': 'Ano',
    en: 'Year',
  },
  publisher: {
    'pt-BR': 'Editora',
    en: 'Publisher',
  },
  authors: {
    'pt-BR': 'Autores',
    en: 'Authors',
  },
  gameSelect: {
    'pt-BR': 'SELECIONE UM JOGO',
    en: 'PICK A GAME',
  },
  youScored: {
    'pt-BR': 'Você fez',
    en: 'You scored',
  },
  points: {
    'pt-BR': 'pontos',
    en: 'points',
  },
  anotherGo: {
    'pt-BR': 'Jogar de novo? (S/N)',
    en: 'Another go? (Y/N)',
  },
  yes: {
    'pt-BR': 'S',
    en: 'Y',
  },
  no: {
    'pt-BR': 'N',
    en: 'N',
  },
  fromTheManual: {
    'pt-BR': 'Do manual',
    en: 'From the manual',
  },
  history: {
    'pt-BR': 'História',
    en: 'History',
  },
  repoLink: {
    'pt-BR': 'Código-fonte no GitHub',
    en: 'Source on GitHub',
  },
  builtWith: {
    'pt-BR': 'Construído com IA · Mavis',
    en: 'Built with AI · Mavis',
  },
  language: {
    'pt-BR': 'Idioma',
    en: 'Language',
  },
  copyright: {
    'pt-BR': 'Os manuais Usborne são propriedade de Usborne Publishing. Códigos reconstruídos a partir dos listings originais BASIC.',
    en: 'Usborne manuals are property of Usborne Publishing. Code reconstructed from the original BASIC listings.',
  },
  downloadAll: {
    'pt-BR': 'Baixar tudo (.zip)',
    en: 'Download all (.zip)',
  },
  totalGames: {
    'pt-BR': 'TOTAL DE JOGOS',
    en: 'TOTAL GAMES',
  },
  totalManuals: {
    'pt-BR': 'MANUAIS',
    en: 'MANUALS',
  },
  yearSpan: {
    'pt-BR': 'ANOS',
    en: 'YEARS',
  },
  controls_typing: {
    'pt-BR': 'TECLADO',
    en: 'TYPING',
  },
  controls_arrows: {
    'pt-BR': 'SETAS',
    en: 'ARROWS',
  },
  controls_wasd: {
    'pt-BR': 'WASD',
    en: 'WASD',
  },
  controls_azerty: {
    'pt-BR': 'A/Z/N/M',
    en: 'A/Z/N/M',
  },
  controls_mouse: {
    'pt-BR': 'MOUSE',
    en: 'MOUSE',
  },
  controls_click: {
    'pt-BR': 'CLIQUE',
    en: 'CLICK',
  },
  hint: {
    'pt-BR': 'Dica',
    en: 'Hint',
  },
}

export function t(key: string, locale: Locale): string {
  const entry = UI_STRINGS[key]
  if (!entry) return key
  return entry[locale] ?? entry[DEFAULT_LOCALE] ?? key
}
