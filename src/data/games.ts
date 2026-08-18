import type { GameManifest } from '../types'

/**
 * All 51 games reconstructed from the 7 Usborne / Editora Lutécia manuals.
 * Each game ships a bilingual title, description, objective and instructions.
 * The actual game logic lives in src/games/<Id>.vue
 */
export const GAMES: GameManifest[] = [
  // =================== ADVENTURE 1983 ===================
  {
    id: 'haunted-house',
    manualId: 'adventure-1983',
    year: 1983,
    difficulty: 3,
    genre: 'adventure',
    controls: 'typing',
    avgDurationSec: 600,
    isTextHeavy: true,
    i18n: {
      'pt-BR': {
        title: 'Haunted House',
        shortDesc: 'Aventura em texto · 26 salas, 11 objetos, 7 puzzles, dois finais.',
        objective: 'Encontrar os 7 tesouros e sair vivo da casa mal-assombrada.',
        instructions:
          'Digite comandos com até duas palavras. Comandos: IR [direção], PEGAR [objeto], LARGAR, EXAMINAR, INVENTARIO, SCORE/PONTOS, AJUDA, SAIR. Direções: NORTE, SUL, LESTE, OESTE, CIMA, BAIXO (ou N, S, L, O, C, B).',
        controlsHint: '↑↓←→ nas escolhas · ENTER para confirmar',
      },
      en: {
        title: 'Haunted House',
        shortDesc: 'Text adventure · 26 rooms, 11 objects, 7 puzzles, two endings.',
        objective: 'Find the 7 treasures and escape the haunted house alive.',
        instructions:
          'Type up to two-word commands. Verbs: GO [dir], GET, DROP, EXAMINE, INVENTORY, SCORE, HELP, QUIT. Directions: NORTH, SOUTH, EAST, WEST, UP, DOWN (or N, S, E, W, U, D).',
        controlsHint: '↑↓←→ on choices · ENTER to confirm',
      },
    },
  },

  // =================== SPACE 1982 (14) ===================
  {
    id: 'starship-takeoff',
    manualId: 'space-1982',
    year: 1982,
    difficulty: 1,
    genre: 'simulation',
    controls: 'typing',
    avgDurationSec: 90,
    i18n: {
      'pt-BR': {
        title: 'Starship Takeoff',
        shortDesc: 'Você é o capitão. A nave alienígena tem que decolar antes dos aliens te capturarem.',
        objective: 'Acertar a força de decolagem (G × W) em até 10 tentativas.',
        instructions:
          'O computador informa a gravidade. Você precisa adivinhar a força de decolagem. Se for baixa demais, a nave não levanta. Se for alta demais, o fail-safe impede a queima.',
        controlsHint: 'Digite o número e pressione ENTER',
      },
      en: {
        title: 'Starship Takeoff',
        shortDesc: 'You are the captain. The alien ship must take off before the aliens capture you.',
        objective: 'Guess the takeoff thrust (G × W) within 10 tries.',
        instructions:
          'The computer tells you the gravity. You must guess the thrust. Too low and the ship won\'t lift. Too high and the fail-safe stops the burn.',
        controlsHint: 'Type the number and press ENTER',
      },
    },
  },
  {
    id: 'intergalactic-games',
    manualId: 'space-1982',
    year: 1982,
    difficulty: 3,
    genre: 'simulation',
    controls: 'typing',
    avgDurationSec: 120,
    i18n: {
      'pt-BR': {
        title: 'Jogos Intergalácticos',
        shortDesc: 'Você é o engenheiro-chefe da NCTV. Coloque o satélite na órbita certa.',
        objective: 'Acertar o ângulo (±2°) e a velocidade (±100) em 8 tentativas.',
        instructions:
          'Cada turno, entre com o ângulo (0–70°) e a velocidade (0–40000). O computador calcula a margem de erro em ambos.',
      },
      en: {
        title: 'Intergalactic Games',
        shortDesc: 'You\'re the lead engineer at NCTV. Put the satellite in the right orbit.',
        objective: 'Match the angle (±2°) and speed (±100) within 8 tries.',
        instructions:
          'Each turn, enter the angle (0–70°) and speed (0–40000). The computer calculates the margin of error for both.',
      },
    },
  },
  {
    id: 'evil-alien',
    manualId: 'space-1982',
    year: 1982,
    difficulty: 3,
    genre: 'strategy',
    controls: 'typing',
    avgDurationSec: 180,
    i18n: {
      'pt-BR': {
        title: 'Elron, o Alien Mal',
        shortDesc: 'Elron está em um grid 3D. Você tem 4 bombas. Mate-o antes que ele te capture.',
        objective: 'Acertar X, Y e D antes das 4 bombas acabarem.',
        instructions:
          'Cada turno informe 3 coordenadas (X, Y, D) entre 0–9. O computador indica se Elron está ao norte/sul/leste/oeste, longe demais ou perto demais.',
      },
      en: {
        title: 'Evil Alien Elron',
        shortDesc: 'Elron is hidden in a 3D grid. You have 4 bombs. Kill him before he captures you.',
        objective: 'Match X, Y and D before your 4 bombs run out.',
        instructions:
          'Each turn enter 3 coordinates (X, Y, D) between 0–9. The computer tells you if Elron is north/south/east/west, too far or not far enough.',
      },
    },
  },
  {
    id: 'beat-the-bug-eyes',
    manualId: 'space-1982',
    year: 1982,
    difficulty: 2,
    genre: 'action',
    controls: 'click',
    avgDurationSec: 60,
    i18n: {
      'pt-BR': {
        title: 'Mate os Bug Eyes',
        shortDesc: 'Reflexo rápido. Os olhos dos bugs piscam em 4 posições. Aperte a tecla certa antes deles sumirem.',
        objective: 'Estourar 10 olhos de bug.',
        instructions:
          'Os olhos aparecem em 4 cantos. Pressione 1, 2, 3 ou 4 conforme o quadrante. Janela de reação: aleatória.',
      },
      en: {
        title: 'Beat the Bug Eyes',
        shortDesc: 'Quick reflexes. Bug eyes flash in 4 spots. Press the right key before they vanish.',
        objective: 'Blast 10 bug eyes.',
        instructions:
          'Eyes appear in 4 quadrants. Press 1, 2, 3 or 4 to match. Reaction window is random.',
      },
    },
  },
  {
    id: 'moonlander',
    manualId: 'space-1982',
    year: 1982,
    difficulty: 3,
    genre: 'simulation',
    controls: 'typing',
    avgDurationSec: 120,
    i18n: {
      'pt-BR': {
        title: 'Moonlander',
        shortDesc: 'Pouse a nave lunar sem destruir. Gerenciamento de combustível e empuxo.',
        objective: 'Pousar com velocidade ≤ 5 m/s e combustível > 0.',
        instructions:
          'Cada turno entre com a queima de combustível (em unidades por segundo). Cuidado com a gravidade.',
      },
      en: {
        title: 'Moonlander',
        shortDesc: 'Land the lunar module without crashing. Manage fuel and thrust.',
        objective: 'Touch down at ≤ 5 m/s with fuel > 0.',
        instructions:
          'Each turn, enter the fuel burn (units per second). Mind the gravity.',
      },
    },
  },
  {
    id: 'monsters-of-galacticon',
    manualId: 'space-1982',
    year: 1982,
    difficulty: 3,
    genre: 'arcade',
    controls: 'typing',
    avgDurationSec: 90,
    i18n: {
      'pt-BR': {
        title: 'Monstros de Galacticon',
        shortDesc: 'Ataque os monstros antes que te destruam.',
        objective: 'Sobreviver a 3 ondas de monstros.',
        instructions:
          'A cada turno, você pode atirar (T) ou manobrar (W/A/S/D). Cada monstro tem padrão diferente.',
      },
      en: {
        title: 'Monsters of Galacticon',
        shortDesc: 'Attack the monsters before they destroy you.',
        objective: 'Survive 3 waves of monsters.',
        instructions:
          'Each turn you can shoot (T) or maneuver (W/A/S/D). Each monster has its own pattern.',
      },
    },
  },
  {
    id: 'alien-snipers',
    manualId: 'space-1982',
    year: 1982,
    difficulty: 4,
    genre: 'action',
    controls: 'click',
    avgDurationSec: 60,
    i18n: {
      'pt-BR': {
        title: 'Snipers Alienígenas',
        shortDesc: 'Os aliens estão escondidos. Mire rápido.',
        objective: 'Acertar 15 alvos em 60 segundos.',
        instructions:
          'Alvos aparecem aleatoriamente na tela. Clique para atirar. Cada acerto vale 10 pontos, cada erro -1.',
      },
      en: {
        title: 'Alien Snipers',
        shortDesc: 'The aliens are hidden. Take the shot fast.',
        objective: 'Hit 15 targets in 60 seconds.',
        instructions:
          'Targets pop up randomly. Click to shoot. Each hit is 10 points, each miss is -1.',
      },
    },
  },
  {
    id: 'asteroid-belt',
    manualId: 'space-1982',
    year: 1982,
    difficulty: 3,
    genre: 'arcade',
    controls: 'arrows',
    avgDurationSec: 90,
    i18n: {
      'pt-BR': {
        title: 'Cinturão de Asteroides',
        shortDesc: 'Desvie dos asteroides. A nave responde devagar — antecipe.',
        objective: 'Sobreviver 60 segundos no cinturão.',
        instructions:
          'Setas movem a nave. O cenário rola para baixo. Asteroides grandes valem mais pontos mas custam mais tempo.',
      },
      en: {
        title: 'Asteroid Belt',
        shortDesc: 'Dodge the asteroids. The ship responds slowly — anticipate.',
        objective: 'Survive 60 seconds in the belt.',
        instructions:
          'Arrow keys move the ship. The scene scrolls down. Big asteroids are worth more but cost more time.',
      },
    },
  },
  {
    id: 'trip-into-the-future',
    manualId: 'space-1982',
    year: 1982,
    difficulty: 2,
    genre: 'puzzle',
    controls: 'typing',
    avgDurationSec: 60,
    i18n: {
      'pt-BR': {
        title: 'Viagem ao Futuro',
        shortDesc: 'Resolva enigmas lógicos para avançar no tempo.',
        objective: 'Chegar ao ano 3000 resolvendo 5 enigmas.',
        instructions:
          'Cada enigma tem uma resposta em uma palavra. Digite a resposta e pressione ENTER.',
      },
      en: {
        title: 'Trip into the Future',
        shortDesc: 'Solve logic puzzles to advance through time.',
        objective: 'Reach the year 3000 by solving 5 puzzles.',
        instructions:
          'Each puzzle has a one-word answer. Type the answer and press ENTER.',
      },
    },
  },
  {
    id: 'death-valley',
    manualId: 'space-1982',
    year: 1982,
    difficulty: 3,
    genre: 'arcade',
    controls: 'arrows',
    avgDurationSec: 90,
    i18n: {
      'pt-BR': {
        title: 'Vale da Morte',
        shortDesc: 'Sobreviva no deserto. Sem água, sem armas.',
        objective: 'Atravessar o vale em 10 rodadas.',
        instructions:
          'Cada turno escolha entre 3 ações. Recursos são limitados.',
      },
      en: {
        title: 'Death Valley',
        shortDesc: 'Survive the desert. No water, no weapons.',
        objective: 'Cross the valley in 10 rounds.',
        instructions:
          'Each turn pick one of 3 actions. Resources are scarce.',
      },
    },
  },
  {
    id: 'space-mines',
    manualId: 'space-1982',
    year: 1982,
    difficulty: 3,
    genre: 'arcade',
    controls: 'arrows',
    avgDurationSec: 90,
    i18n: {
      'pt-BR': {
        title: 'Minas Espaciais',
        shortDesc: 'Desarme minas no campo minado. Cada segundo conta.',
        objective: 'Desarmar 10 minas antes do tempo acabar.',
        instructions:
          'Use as setas para mover e ESPAÇO para desarmar a mina na sua posição.',
      },
      en: {
        title: 'Space Mines',
        shortDesc: 'Defuse mines in the field. Every second counts.',
        objective: 'Defuse 10 mines before time runs out.',
        instructions:
          'Arrow keys to move, SPACE to defuse the mine at your position.',
      },
    },
  },
  {
    id: 'space-rescue',
    manualId: 'space-1982',
    year: 1982,
    difficulty: 3,
    genre: 'arcade',
    controls: 'arrows',
    avgDurationSec: 120,
    i18n: {
      'pt-BR': {
        title: 'Resgate Espacial',
        shortDesc: 'Encontre e resgate os astronautas perdidos.',
        objective: 'Resgatar todos os 5 astronautas.',
        instructions:
          'Cada astronauta aparece em coordenada aleatória. Use as setas para pilotar até ele.',
      },
      en: {
        title: 'Space Rescue',
        shortDesc: 'Find and rescue the stranded astronauts.',
        objective: 'Rescue all 5 astronauts.',
        instructions:
          'Each astronaut appears at a random coordinate. Use arrow keys to fly to them.',
      },
    },
  },
  {
    id: 'touchdown',
    manualId: 'space-1982',
    year: 1982,
    difficulty: 3,
    genre: 'simulation',
    controls: 'typing',
    avgDurationSec: 120,
    i18n: {
      'pt-BR': {
        title: 'Touchdown',
        shortDesc: 'Versão do Moonlander expandida, com múltiplas variantes para diferentes micros.',
        objective: 'Pousar com sucesso em 5 altitudes diferentes.',
        instructions:
          'Cada rodada tem gravidade e vento diferentes. Gerencie velocidade vertical e horizontal.',
      },
      en: {
        title: 'Touchdown',
        shortDesc: 'Expanded Moonlander with multiple variants for different micros.',
        objective: 'Land successfully at 5 different altitudes.',
        instructions:
          'Each round has different gravity and wind. Manage vertical and horizontal speed.',
      },
    },
  },

  // =================== FANTASY 1983 (1) ===================
  {
    id: 'dungeon-of-doom',
    manualId: 'fantasy-1983',
    year: 1983,
    difficulty: 4,
    genre: 'fantasy',
    controls: 'typing',
    avgDurationSec: 900,
    isTextHeavy: true,
    i18n: {
      'pt-BR': {
        title: 'Dungeon of Doom',
        shortDesc: 'RPG procedural completo. Gere seu herói, explore a masmorra, derrote Klimm.',
        objective: 'Recuperar o Ídolo Mágico do feiticeiro Klimm.',
        instructions:
          'Crie seu personagem (4 atributos aleatórios). Explore masmorras geradas proceduralmente. Compre itens na Trading Post. Comandos: IR, LUTAR, FUGIR, PEGAR, USAR, INVENTARIO.',
      },
      en: {
        title: 'Dungeon of Doom',
        shortDesc: 'Full procedural RPG. Generate your hero, explore the dungeon, defeat Klimm.',
        objective: 'Recover the Magic Idol from the sorcerer Klimm.',
        instructions:
          'Create your character (4 random stats). Explore procedurally generated dungeons. Buy items at the Trading Post. Commands: GO, FIGHT, FLEE, GET, USE, INVENTORY.',
      },
    },
  },

  // =================== BATTLE 1982 (13) ===================
  {
    id: 'robot-missile',
    manualId: 'battle-1982',
    year: 1982,
    difficulty: 2,
    genre: 'puzzle',
    controls: 'typing',
    avgDurationSec: 60,
    i18n: {
      'pt-BR': {
        title: 'Míssil Robô',
        shortDesc: 'Encontre a letra-código que desativa o míssil antes que ele exploda a Terra.',
        objective: 'Adivinhar a letra em 4 tentativas.',
        instructions:
          'O computador diz se a letra é anterior ou posterior no alfabeto. Use o feedback para estreitar o intervalo.',
      },
      en: {
        title: 'Robot Missile',
        shortDesc: 'Find the code letter that defuses the missile before it blows up Earth HQ.',
        objective: 'Guess the letter in 4 tries.',
        instructions:
          'The computer tells you if the letter is earlier or later in the alphabet. Use the feedback to narrow the range.',
      },
    },
  },
  {
    id: 'the-vital-message',
    manualId: 'battle-1982',
    year: 1982,
    difficulty: 3,
    genre: 'puzzle',
    controls: 'typing',
    avgDurationSec: 60,
    i18n: {
      'pt-BR': {
        title: 'A Mensagem Vital',
        shortDesc: 'Memorize a sequência de letras e retransmita sem erro.',
        objective: 'Repetir a mensagem de 4 a 10 letras.',
        instructions:
          'Escolha a dificuldade (4–10). A mensagem pisca rapidamente na tela. Decore e digite de volta.',
      },
      en: {
        title: 'The Vital Message',
        shortDesc: 'Memorize the letter sequence and relay it without error.',
        objective: 'Repeat the 4–10 letter message.',
        instructions:
          'Pick a difficulty (4–10). The message flashes on screen. Memorize and type it back.',
      },
    },
  },
  {
    id: 'shootout',
    manualId: 'battle-1982',
    year: 1982,
    difficulty: 1,
    genre: 'action',
    controls: 'click',
    avgDurationSec: 30,
    i18n: {
      'pt-BR': {
        title: 'Shootout',
        shortDesc: 'Dê 10 passos, vire e atire antes do seu oponente.',
        objective: 'Sacar a arma antes do adversário.',
        instructions:
          'Espere a mensagem "HE DRAWS". Aperte qualquer tecla assim que aparecer. Cedo demais é trapaça.',
      },
      en: {
        title: 'Shootout',
        shortDesc: 'Take 10 paces, turn and shoot before your opponent.',
        objective: 'Draw your gun first.',
        instructions:
          'Wait for "HE DRAWS". Press any key as soon as it appears. Too early is cheating.',
      },
    },
  },
  {
    id: 'desert-tank-battle',
    manualId: 'battle-1982',
    year: 1982,
    difficulty: 3,
    genre: 'arcade',
    controls: 'typing',
    avgDurationSec: 90,
    i18n: {
      'pt-BR': {
        title: 'Batalha no Deserto',
        shortDesc: 'Comande o tanque. Mire e atire com 5 mísseis.',
        objective: 'Acertar a fortaleza com 3 dos 5 mísseis.',
        instructions:
          'Cada tiro: entre com direção (-90 a +90°) e elevação (0–90°). A elevação determina a distância.',
      },
      en: {
        title: 'Desert Tank Battle',
        shortDesc: 'Command the tank. Aim and fire 5 missiles.',
        objective: 'Hit the stronghold with 3 of 5 missiles.',
        instructions:
          'Each shot: enter direction (-90 to +90°) and elevation (0–90°). Elevation determines range.',
      },
    },
  },
  {
    id: 'battle-at-traitors-castle',
    manualId: 'battle-1982',
    year: 1982,
    difficulty: 3,
    genre: 'strategy',
    controls: 'typing',
    avgDurationSec: 120,
    i18n: {
      'pt-BR': {
        title: 'Batalha no Castelo do Traidor',
        shortDesc: 'Tome a fortaleza do traidor. Posicione suas tropas.',
        objective: 'Tomar o castelo em 8 turnos.',
        instructions:
          'Cada turno mova uma tropa ou ataque. O castelo tem 4 alas.',
      },
      en: {
        title: 'Battle at Traitor\'s Castle',
        shortDesc: 'Take the traitor\'s fortress. Position your troops.',
        objective: 'Take the castle in 8 turns.',
        instructions:
          'Each turn move one troop or attack. The castle has 4 wings.',
      },
    },
  },
  {
    id: 'robot-invaders',
    manualId: 'battle-1982',
    year: 1982,
    difficulty: 3,
    genre: 'arcade',
    controls: 'arrows',
    avgDurationSec: 90,
    i18n: {
      'pt-BR': {
        title: 'Invasores Robôs',
        shortDesc: 'Defenda a Terra. Atire nos invasores antes de ser atingido.',
        objective: 'Eliminar 30 invasores.',
        instructions:
          'Setas movem a nave. ESPAÇO atira. Invasores descem em formação.',
      },
      en: {
        title: 'Robot Invaders',
        shortDesc: 'Defend Earth. Shoot the invaders before being hit.',
        objective: 'Eliminate 30 invaders.',
        instructions:
          'Arrow keys move the ship. SPACE fires. Invaders descend in formation.',
      },
    },
  },
  {
    id: 'secret-weapon',
    manualId: 'battle-1982',
    year: 1982,
    difficulty: 3,
    genre: 'puzzle',
    controls: 'typing',
    avgDurationSec: 90,
    i18n: {
      'pt-BR': {
        title: 'Arma Secreta',
        shortDesc: 'Descubra a arma escondida.',
        objective: 'Encontrar a combinação em 6 tentativas.',
        instructions:
          'Cada tentativa é uma sequência de 4 dígitos. O computador indica quantos estão corretos e na posição certa.',
      },
      en: {
        title: 'Secret Weapon',
        shortDesc: 'Find the hidden weapon.',
        objective: 'Crack the 4-digit code in 6 tries.',
        instructions:
          'Each guess is a 4-digit sequence. The computer tells you how many are right and in the right position.',
      },
    },
  },
  {
    id: 'escape',
    manualId: 'battle-1982',
    year: 1982,
    difficulty: 3,
    genre: 'arcade',
    controls: 'arrows',
    avgDurationSec: 90,
    i18n: {
      'pt-BR': {
        title: 'Escape!',
        shortDesc: 'Fuja da prisão. Cada segundo conta.',
        objective: 'Chegar à saída antes que os guardas te peguem.',
        instructions:
          'Setas movem. ESPAÇO interage com objetos (chaves, ferramentas).',
      },
      en: {
        title: 'Escape!',
        shortDesc: 'Break out of prison. Every second counts.',
        objective: 'Reach the exit before the guards catch you.',
        instructions:
          'Arrow keys move. SPACE interacts with objects (keys, tools).',
      },
    },
  },
  {
    id: 'pirate-dogfight',
    manualId: 'battle-1982',
    year: 1982,
    difficulty: 3,
    genre: 'arcade',
    controls: 'arrows',
    avgDurationSec: 90,
    i18n: {
      'pt-BR': {
        title: 'Combate Aéreo Pirata',
        shortDesc: 'Dogfight contra piratas do ar.',
        objective: 'Abater 5 aviões piratas.',
        instructions:
          'Setas controlam o avião. ESPAÇO atira.',
      },
      en: {
        title: 'Pirate Dogfight',
        shortDesc: 'Dogfight against sky pirates.',
        objective: 'Shoot down 5 pirate planes.',
        instructions:
          'Arrow keys control the plane. SPACE fires.',
      },
    },
  },
  {
    id: 'supersonic-bomber',
    manualId: 'battle-1982',
    year: 1982,
    difficulty: 4,
    genre: 'arcade',
    controls: 'arrows',
    avgDurationSec: 120,
    i18n: {
      'pt-BR': {
        title: 'Bombardeiro Supersônico',
        shortDesc: 'Mire, solte a bomba, escape da explosão.',
        objective: 'Destruir 3 alvos sem ser pego.',
        instructions:
          'Setas controlam. ESPAÇO solta a bomba. Você precisa estar perto do alvo.',
      },
      en: {
        title: 'Supersonic Bomber',
        shortDesc: 'Aim, drop the bomb, escape the blast.',
        objective: 'Destroy 3 targets without being caught.',
        instructions:
          'Arrow keys control. SPACE drops the bomb. You need to be near the target.',
      },
    },
  },
  {
    id: 'iceberg',
    manualId: 'battle-1982',
    year: 1982,
    difficulty: 2,
    genre: 'puzzle',
    controls: 'typing',
    avgDurationSec: 60,
    i18n: {
      'pt-BR': {
        title: 'Iceberg',
        shortDesc: 'Direcione o navio para evitar o iceberg.',
        objective: 'Navegar 10 turnos sem bater no iceberg.',
        instructions:
          'Cada turno informe o rumo. O iceberg se move com correntes.',
      },
      en: {
        title: 'Iceberg',
        shortDesc: 'Steer the ship to avoid the iceberg.',
        objective: 'Survive 10 turns without hitting the iceberg.',
        instructions:
          'Each turn enter the heading. The iceberg drifts with currents.',
      },
    },
  },
  {
    id: 'the-wall',
    manualId: 'battle-1982',
    year: 1982,
    difficulty: 3,
    genre: 'strategy',
    controls: 'typing',
    avgDurationSec: 120,
    i18n: {
      'pt-BR': {
        title: 'O Muro',
        shortDesc: 'Construa o muro antes do ataque.',
        objective: 'Defender a posição em 12 turnos.',
        instructions:
          'Cada turno mova soldados ou construa. Gerencie recursos.',
      },
      en: {
        title: 'The Wall',
        shortDesc: 'Build the wall before the attack.',
        objective: 'Defend the position in 12 turns.',
        instructions:
          'Each turn move soldiers or build. Manage resources.',
      },
    },
  },
  {
    id: 'missile',
    manualId: 'battle-1982',
    year: 1982,
    difficulty: 2,
    genre: 'arcade',
    controls: 'arrows',
    avgDurationSec: 60,
    i18n: {
      'pt-BR': {
        title: 'Míssil!',
        shortDesc: 'Defenda a base. Mísseis inimigos se aproximam.',
        objective: 'Interceptar 10 mísseis.',
        instructions:
          'Setas movem o canhão. ESPAÇO atira.',
      },
      en: {
        title: 'Missile!',
        shortDesc: 'Defend the base. Enemy missiles incoming.',
        objective: 'Intercept 10 missiles.',
        instructions:
          'Arrow keys move the cannon. SPACE fires.',
      },
    },
  },

  // =================== WEIRD 1984 (6) ===================
  {
    id: 'tower-of-terror',
    manualId: 'weird-1984',
    year: 1984,
    difficulty: 2,
    genre: 'horror',
    controls: 'click',
    avgDurationSec: 90,
    i18n: {
      'pt-BR': {
        title: 'Torre do Terror',
        shortDesc: 'Suba os andares antes da meia-noite. Cuidado com o pulso.',
        objective: 'Chegar ao topo da torre com pulso abaixo de 150.',
        instructions:
          'Aperte G para avançar. Aperte R para recuar. Você só tem até a meia-noite.',
      },
      en: {
        title: 'Tower of Terror',
        shortDesc: 'Climb the floors before midnight. Watch your pulse.',
        objective: 'Reach the top with pulse under 150.',
        instructions:
          'Press G to advance. Press R to retreat. You have until midnight.',
      },
    },
  },
  {
    id: 'skulls-of-the-pyramid',
    manualId: 'weird-1984',
    year: 1984,
    difficulty: 3,
    genre: 'puzzle',
    controls: 'click',
    avgDurationSec: 120,
    i18n: {
      'pt-BR': {
        title: 'Caveiras da Pirâmide',
        shortDesc: 'Role 5 caveiras e acerte exatamente o número alvo.',
        objective: 'Acertar o número-alvo usando exatamente 5 caveiras.',
        instructions:
          'O computador escolhe um número entre 10 e 40. Use 5 caveiras. Cada uma cai em uma das 4 colunas (1, 2, 3, 4).',
      },
      en: {
        title: 'Skulls of the Pyramid',
        shortDesc: 'Drop 5 skulls and hit exactly the target number.',
        objective: 'Hit the target number using exactly 5 skulls.',
        instructions:
          'The computer picks a number between 10 and 40. Use 5 skulls. Each falls in one of 4 columns (1, 2, 3, 4).',
      },
    },
  },
  {
    id: 'monster-wrestling',
    manualId: 'weird-1984',
    year: 1984,
    difficulty: 3,
    genre: 'horror',
    controls: 'typing',
    avgDurationSec: 180,
    i18n: {
      'pt-BR': {
        title: 'Luta de Monstros',
        shortDesc: 'Você é o cérebro do monstro. Cálculos rápidos ou morra.',
        objective: 'Sobreviver 12 rounds de cálculos.',
        instructions:
          'A cada round: monstro aparece com TAMANHO e DISTÂNCIA. Multiplique os dois para defender. Aperte P (PÂNICO) se travar — mas cuidado, 4 pânicos = blackout.',
      },
      en: {
        title: 'Monster Wrestling',
        shortDesc: 'You\'re the monster\'s brain. Quick math or die.',
        objective: 'Survive 12 rounds of math.',
        instructions:
          'Each round: monster appears with SIZE and DISTANCE. Multiply them to defend. Press P (PANIC) if stuck — but 4 panics = blackout.',
      },
    },
  },
  {
    id: 'jaws',
    manualId: 'weird-1984',
    year: 1984,
    difficulty: 3,
    genre: 'arcade',
    controls: 'azerty',
    avgDurationSec: 120,
    i18n: {
      'pt-BR': {
        title: 'Jaws',
        shortDesc: 'Você é a tubarão. Coma pessoas sem ser pego pelo caçador.',
        objective: 'Comer o maior número possível de pessoas.',
        instructions:
          'Mova com A/Z/N/M (cima, esquerda, baixo, direita). Cuidado: cada vez que come alguém, os controles trocam aleatoriamente!',
      },
      en: {
        title: 'Jaws',
        shortDesc: 'You\'re the shark. Eat people without being caught by the hunter.',
        objective: 'Eat as many people as possible.',
        instructions:
          'Move with A/Z/N/M (up, left, down, right). Beware: every time you eat someone, the controls shuffle!',
      },
    },
  },
  {
    id: 'flying-witches',
    manualId: 'weird-1984',
    year: 1984,
    difficulty: 3,
    genre: 'arcade',
    controls: 'click',
    avgDurationSec: 120,
    i18n: {
      'pt-BR': {
        title: 'Bruxas Voadoras',
        shortDesc: 'Colete ingredientes para a Superwitch. Cuidado com a Broomstick Snatcher.',
        objective: 'Coletar todos os ingredientes da receita.',
        instructions:
          'Aperte ESPAÇO para mergulhar e pegar o ingrediente. Mas alguns são a Broomstick Snatcher em disfarce!',
      },
      en: {
        title: 'Flying Witches',
        shortDesc: 'Collect ingredients for Superwitch. Beware the Broomstick Snatcher.',
        objective: 'Collect every recipe ingredient.',
        instructions:
          'Press SPACE to dive and grab the ingredient. But some are the Broomstick Snatcher in disguise!',
      },
    },
  },
  {
    id: 'micropuzzle',
    manualId: 'weird-1984',
    year: 1984,
    difficulty: 4,
    genre: 'puzzle',
    controls: 'typing',
    avgDurationSec: 120,
    i18n: {
      'pt-BR': {
        title: 'Micropuzzle',
        shortDesc: 'Uma série de mini-puzzles lógicos.',
        objective: 'Resolver 8 mini-puzzles.',
        instructions:
          'Cada puzzle tem instruções próprias. Resposta em uma ou duas palavras.',
      },
      en: {
        title: 'Micropuzzle',
        shortDesc: 'A series of mini logic puzzles.',
        objective: 'Solve 8 mini-puzzles.',
        instructions:
          'Each puzzle has its own instructions. One or two word answer.',
      },
    },
  },

  // =================== HORROR PT (7) ===================
  {
    id: 'pesadelo',
    manualId: 'horror-pt',
    year: 1983,
    difficulty: 2,
    genre: 'horror',
    controls: 'typing',
    avgDurationSec: 120,
    i18n: {
      'pt-BR': {
        title: 'Pesadelo',
        shortDesc: 'O computador te insulta e mostra números. Repita antes de virar escravo.',
        objective: 'Chegar a 500 pontos sem deixar cair a 0.',
        instructions:
          'Aparece um número na tela. Digite o mesmo número. Acerto: +10–20. Erro: -10.',
      },
      en: {
        title: 'Nightmare',
        shortDesc: 'The computer insults you and shows numbers. Repeat before becoming its slave.',
        objective: 'Reach 500 points without dropping to 0.',
        instructions:
          'A number appears. Type the same number. Hit: +10–20. Miss: -10.',
      },
    },
  },
  {
    id: 'mago-dos-numeros',
    manualId: 'horror-pt',
    year: 1983,
    difficulty: 3,
    genre: 'puzzle',
    controls: 'typing',
    avgDurationSec: 180,
    i18n: {
      'pt-BR': {
        title: 'O Mago dos Números',
        shortDesc: 'O Mago joga dois dados. Você precisa somar com números da tela.',
        objective: 'Limpar todos os números em 8 tentativas.',
        instructions:
          'O mago joga dois dados. Encontre dois números na tela cuja soma seja igual à dos dados. Dobradinha = +1 tentativa.',
      },
      en: {
        title: 'The Number Wizard',
        shortDesc: 'The Wizard rolls two dice. You must sum with numbers on the screen.',
        objective: 'Clear all numbers in 8 tries.',
        instructions:
          'The wizard rolls two dice. Find two numbers on screen whose sum matches. Doubles = +1 try.',
      },
    },
  },
  {
    id: 'aspirador-de-fantasmas',
    manualId: 'horror-pt',
    year: 1983,
    difficulty: 2,
    genre: 'arcade',
    controls: 'click',
    avgDurationSec: 90,
    i18n: {
      'pt-BR': {
        title: 'Aspirador de Fantasmas',
        shortDesc: 'Capture fantasmas com o número certo do aspirador.',
        objective: 'Aspirar 30 fantasmas com 3 vidas.',
        instructions:
          'Fantasmas com números passam. Aperte M para mudar o número do aspirador (0–9). Aperte X para aspirar — só funciona se bater o número.',
      },
      en: {
        title: 'Ghost Vacuum',
        shortDesc: 'Capture ghosts with the right vacuum number.',
        objective: 'Vacuum 30 ghosts with 3 lives.',
        instructions:
          'Ghosts with numbers pass by. Press M to change the vacuum number (0–9). Press X to vacuum — only works if the numbers match.',
      },
    },
  },
  {
    id: 'mulher-aranha',
    manualId: 'horror-pt',
    year: 1983,
    difficulty: 2,
    genre: 'puzzle',
    controls: 'typing',
    avgDurationSec: 120,
    i18n: {
      'pt-BR': {
        title: 'Mulher-Aranha',
        shortDesc: 'Ela escolheu uma letra. Dê palavras com essa letra ou adivinhe.',
        objective: 'Acertar a letra em 15 tentativas.',
        instructions:
          'Dê uma palavra (4 a 8 letras). Se a palavra contiver a letra, você ganha um palpite. Se errar, perde 5 tentativas.',
      },
      en: {
        title: 'Spider-Woman',
        shortDesc: 'She picked a letter. Give words with that letter or guess.',
        objective: 'Guess the letter in 15 tries.',
        instructions:
          'Give a word (4 to 8 letters). If the word contains the letter, you get a guess. If wrong, lose 5 tries.',
      },
    },
  },
  {
    id: 'cemiterio',
    manualId: 'horror-pt',
    year: 1983,
    difficulty: 3,
    genre: 'horror',
    controls: 'wasd',
    avgDurationSec: 240,
    isTextHeavy: true,
    i18n: {
      'pt-BR': {
        title: 'Cemitério',
        shortDesc: 'Escape do cemitério antes da meia-noite. Esqueletos caçam você.',
        objective: 'Sair do cemitério em 40 turnos.',
        instructions:
          'WASD para mover. Você pode cavar buracos (C) para afastar esqueletos — mas cuidado para não cair neles!',
      },
      en: {
        title: 'Cemetery',
        shortDesc: 'Escape the cemetery before midnight. Skeletons hunt you.',
        objective: 'Get out in 40 turns.',
        instructions:
          'WASD to move. You can dig holes (C) to keep skeletons away — but don\'t fall in them!',
      },
    },
  },
  {
    id: 'casa-maluca',
    manualId: 'horror-pt',
    year: 1983,
    difficulty: 2,
    genre: 'horror',
    controls: 'click',
    avgDurationSec: 90,
    i18n: {
      'pt-BR': {
        title: 'Casa Maluca',
        shortDesc: 'As portas mudam sozinhas. Alinhe todas para escapar.',
        objective: 'Alinhar as 3 portas antes do fantasma te pegar.',
        instructions:
          'Cada turno, as portas se movem aleatoriamente. Você pode inverter uma porta por vez. Cuidado com o fantasma que se aproxima!',
      },
      en: {
        title: 'Crazy House',
        shortDesc: 'The doors move on their own. Align them all to escape.',
        objective: 'Align the 3 doors before the ghost catches you.',
        instructions:
          'Each turn, the doors move randomly. You can flip one door at a time. Beware the approaching ghost!',
      },
    },
  },
  {
    id: 'labirinto-assombrado',
    manualId: 'horror-pt',
    year: 1983,
    difficulty: 4,
    genre: 'horror',
    controls: 'click',
    avgDurationSec: 180,
    isTextHeavy: true,
    i18n: {
      'pt-BR': {
        title: 'Labirinto Assombrado',
        shortDesc: 'Você só vê o que está à frente. Fantasmas te teleportam.',
        objective: 'Encontrar a cruz (+) no labirinto.',
        instructions:
          'Você só vê 3 células à frente. N para virar à esquerda. M para virar à direita. ESPAÇO para ir em frente. Fantasmas te jogam em outro lugar!',
      },
      en: {
        title: 'Haunted Labyrinth',
        shortDesc: 'You only see what\'s ahead. Ghosts teleport you.',
        objective: 'Find the cross (+) in the maze.',
        instructions:
          'You only see 3 cells ahead. N turns left. M turns right. SPACE goes forward. Ghosts throw you somewhere else!',
      },
    },
  },
  {
    id: 'sessao-espirita',
    manualId: 'horror-pt',
    year: 1983,
    difficulty: 3,
    genre: 'horror',
    controls: 'typing',
    avgDurationSec: 120,
    i18n: {
      'pt-BR': {
        title: 'Sessão Espírita',
        shortDesc: 'Faça contato com o além. Identifique o espírito em 7 perguntas.',
        objective: 'Identificar o espírito.',
        instructions:
          'O espírito responde sim/não. Faça perguntas estratégicas para descobrir quem é.',
      },
      en: {
        title: 'Séance',
        shortDesc: 'Make contact with the beyond. Identify the spirit in 7 questions.',
        objective: 'Identify the spirit.',
        instructions:
          'The spirit answers yes/no. Ask strategic questions to find out who it is.',
      },
    },
  },

  // =================== MSX PT (9) ===================
  {
    id: 'marie-celeste',
    manualId: 'msx-pt',
    year: 1985,
    difficulty: 3,
    genre: 'adventure',
    controls: 'typing',
    avgDurationSec: 600,
    isTextHeavy: true,
    i18n: {
      'pt-BR': {
        title: 'Marie Celeste',
        shortDesc: 'Aventura no navio fantasma. Encontre os sobreviventes.',
        objective: 'Resolver o mistério do Marie Celeste.',
        instructions:
          'Comandos de 2 palavras. Verbos: PEGAR, LEVAR, LARGAR, EXAMINAR, ABRIR, FECHAR, SUBIR, DESCER, AMARRAR, CORTAR, VESTIR, ENXUGAR. Direções: PRO, POP, BOR, BOM.',
      },
      en: {
        title: 'Marie Celeste',
        shortDesc: 'Adventure on the ghost ship. Find the survivors.',
        objective: 'Solve the mystery of the Marie Celeste.',
        instructions:
          '2-word commands. Verbs: GET, CARRY, DROP, EXAMINE, OPEN, CLOSE, CLIMB, DESCEND, TIE, CUT, WEAR, WIPE. Directions: FWD, BACK, PORT, STBD.',
      },
    },
  },
  {
    id: 'diga-mestre',
    manualId: 'msx-pt',
    year: 1985,
    difficulty: 3,
    genre: 'puzzle',
    controls: 'typing',
    avgDurationSec: 180,
    i18n: {
      'pt-BR': {
        title: 'Diga, Mestre',
        shortDesc: 'O Mestre escolhe um assunto. Você descobre a regra.',
        objective: 'Acertar 3 respostas "sim" seguidas.',
        instructions:
          'O Mestre escolhe um tema (filmes, animais, etc.). Você sugere exemplos. Ele responde sim/não. Descubra a regra.',
      },
      en: {
        title: 'Say, Master',
        shortDesc: 'The Master picks a subject. You find the rule.',
        objective: 'Get 3 "yes" answers in a row.',
        instructions:
          'The Master picks a theme (movies, animals, etc.). You suggest examples. He answers yes/no. Find the rule.',
      },
    },
  },
  {
    id: 'eu-acuso',
    manualId: 'msx-pt',
    year: 1985,
    difficulty: 3,
    genre: 'puzzle',
    controls: 'typing',
    avgDurationSec: 240,
    isTextHeavy: true,
    i18n: {
      'pt-BR': {
        title: 'Eu Acuso!',
        shortDesc: 'Detetive. Interrogue suspeitos. Acuse o culpado.',
        objective: 'Identificar o assassino e a arma.',
        instructions:
          'Interrogue os suspeitos. Cada um reage diferente. Encontre contradições. Acuse quando tiver provas.',
      },
      en: {
        title: 'I Accuse!',
        shortDesc: 'Detective. Interrogate suspects. Accuse the culprit.',
        objective: 'Identify the killer and the weapon.',
        instructions:
          'Interrogate suspects. Each reacts differently. Find contradictions. Accuse when you have proof.',
      },
    },
  },
  {
    id: 'star-trek',
    manualId: 'msx-pt',
    year: 1985,
    difficulty: 4,
    genre: 'strategy',
    controls: 'typing',
    avgDurationSec: 300,
    i18n: {
      'pt-BR': {
        title: 'Star Trek',
        shortDesc: 'A Enterprise contra os Klingons. Enfrente a Quadrante.',
        objective: 'Destruir todos os Klingons antes do tempo acabar.',
        instructions:
          'Setores do quadrante 8x8. Use torpédos e fótons. Gerencie energia e escudos.',
      },
      en: {
        title: 'Star Trek',
        shortDesc: 'The Enterprise vs the Klingons. Take on the Quadrant.',
        objective: 'Destroy all Klingons before time runs out.',
        instructions:
          '8x8 quadrant sectors. Use photon torpedoes and phasers. Manage energy and shields.',
      },
    },
  },
  {
    id: 'super-breakout',
    manualId: 'msx-pt',
    year: 1985,
    difficulty: 2,
    genre: 'arcade',
    controls: 'arrows',
    avgDurationSec: 180,
    i18n: {
      'pt-BR': {
        title: 'Super Breakout',
        shortDesc: 'Quebre todos os tijolos sem deixar a bola cair.',
        objective: 'Limpar 3 fases de tijolos.',
        instructions:
          'Setas movem a raquete. A bola rebate nos tijolos. Escolha o tamanho da raquete (1–9).',
      },
      en: {
        title: 'Super Breakout',
        shortDesc: 'Break all the bricks without losing the ball.',
        objective: 'Clear 3 stages of bricks.',
        instructions:
          'Arrows move the paddle. The ball bounces off bricks. Pick paddle size (1–9).',
      },
    },
  },
  {
    id: 'labirinto-3d',
    manualId: 'msx-pt',
    year: 1985,
    difficulty: 3,
    genre: 'horror',
    controls: 'typing',
    avgDurationSec: 240,
    isTextHeavy: true,
    i18n: {
      'pt-BR': {
        title: 'Labirinto 3D',
        shortDesc: 'Vista em primeira pessoa. O touro te caça.',
        objective: 'Encontrar a saída antes do touro te pegar.',
        instructions:
          'Você só vê o que está à sua frente. N/M para virar. X para ir em frente. O touro fica mais perto a cada turno.',
      },
      en: {
        title: '3D Labyrinth',
        shortDesc: 'First person view. The bull hunts you.',
        objective: 'Find the exit before the bull catches you.',
        instructions:
          'You only see what\'s in front. N/M to turn. X to go forward. The bull gets closer each turn.',
      },
    },
  },
  {
    id: 'damas',
    manualId: 'msx-pt',
    year: 1985,
    difficulty: 4,
    genre: 'strategy',
    controls: 'click',
    avgDurationSec: 900,
    isTextHeavy: false,
    i18n: {
      'pt-BR': {
        title: 'Damas',
        shortDesc: 'Jogo de damas completo com verificação de lances.',
        objective: 'Capturar todas as peças do adversário ou bloqueá-lo.',
        instructions:
          'Clique na peça para selecioná-la, depois clique no destino. Capturas são obrigatórias. Damas andam para trás.',
      },
      en: {
        title: 'Checkers',
        shortDesc: 'Full checkers with move validation.',
        objective: 'Capture all opponent pieces or block them.',
        instructions:
          'Click a piece to select, then click the destination. Captures are mandatory. Kings move backward.',
      },
    },
  },
  {
    id: 'xadrez',
    manualId: 'msx-pt',
    year: 1985,
    difficulty: 5,
    genre: 'strategy',
    controls: 'click',
    avgDurationSec: 1800,
    isTextHeavy: false,
    i18n: {
      'pt-BR': {
        title: 'Xadrez',
        shortDesc: 'Xadrez completo com save em fita (localStorage).',
        objective: 'Dar xeque-mate no rei adversário.',
        instructions:
          'Movimento padrão de xadrez. Save/Load via botão. Sem engine — jogue contra outro humano.',
      },
      en: {
        title: 'Chess',
        shortDesc: 'Full chess with save to tape (localStorage).',
        objective: 'Checkmate the opponent king.',
        instructions:
          'Standard chess rules. Save/Load via button. No engine — play against another human.',
      },
    },
  },
  {
    id: 'gustavus',
    manualId: 'msx-pt',
    year: 1985,
    difficulty: 3,
    genre: 'strategy',
    controls: 'click',
    avgDurationSec: 300,
    isTextHeavy: false,
    i18n: {
      'pt-BR': {
        title: 'Gustavus',
        shortDesc: 'Jogo tradicional de lápis e papel adaptado para o computador.',
        objective: 'Forçar o adversário a completar um quadrado.',
        instructions:
          'Jogo de pontos e linhas em um grid 5×5. Conecte pontos adjacentes sem fechar quadrados.',
      },
      en: {
        title: 'Gustavus',
        shortDesc: 'Traditional pencil and paper game adapted for the computer.',
        objective: 'Force the opponent to complete a square.',
        instructions:
          'Dots and lines game on a 5×5 grid. Connect adjacent dots without closing squares.',
      },
    },
  },
]

export function getGame(id: string): GameManifest | undefined {
  return GAMES.find((g) => g.id === id)
}
