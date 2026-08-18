// Shared types for the arcade

export type Locale = 'pt-BR' | 'en'

export type Difficulty = 1 | 2 | 3 | 4 | 5

export type GameStatus = 'intro' | 'playing' | 'won' | 'lost' | 'paused'

export interface GameManifest {
  /** Stable id, kebab-case */
  id: string
  /** Manual this game belongs to */
  manualId: ManualId
  /** Year the manual was published (per Usborne catalog) */
  year: number
  /** Difficulty 1-5 */
  difficulty: Difficulty
  /** Genre */
  genre: GameGenre
  /** Bilingual names + description + instructions */
  i18n: Record<Locale, GameI18n>
  /** Recommended controls */
  controls: ControlScheme
  /** Estimated duration of one play (seconds) */
  avgDurationSec: number
  /** True if the game is mostly text-based and shouldn't dominate the cabinet */
  isTextHeavy?: boolean
}

export interface GameI18n {
  title: string
  shortDesc: string
  instructions: string
  objective: string
  controlsHint?: string
}

export type ControlScheme = 'arrows' | 'wasd' | 'typing' | 'click' | 'azerty' | 'mouse' | 'none'

export type GameGenre =
  | 'adventure'      // text adventure
  | 'action'         // reflex / shooter
  | 'arcade'         // simple arcade
  | 'puzzle'         // logic / math
  | 'strategy'       // chess, checkers
  | 'simulation'     // landing, takeoff
  | 'horror'         // horror book games
  | 'fantasy'        // rpg/dungeon
  | 'creative'       // turtle graphics, generative art

export type ManualId =
  | 'adventure-1983'
  | 'space-1982'
  | 'fantasy-1983'
  | 'battle-1982'
  | 'weird-1984'
  | 'horror-pt'
  | 'msx-pt'
  | 'spy-pt'
  | 'apple-logo'

export interface Manual {
  id: ManualId
  /** File path under /public/pdfs */
  pdfPath: string
  /** Original cover svg path (we render covers from scratch in SVG) */
  year: number
  /** Display color for the cabinet (matches the manual's mood) */
  accent: 'green' | 'amber' | 'magenta' | 'cyan' | 'red' | 'blue' | 'yellow'
  /** Original publisher */
  publisher: string
  /** Author(s) */
  authors: string[]
  /** Bilingual manual titles + short description */
  i18n: Record<Locale, ManualI18n>
}

export interface ManualI18n {
  title: string
  subtitle: string
  blurb: string
}
