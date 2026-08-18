<script setup lang="ts">
/**
 * BASIC code rain background — loops through classic 8-line Apple BASIC programs
 * from the Usborne books, with each character falling like the Matrix.
 * Disabled if user prefers reduced motion.
 */
import { onMounted, onUnmounted, ref } from 'vue'

const programs: string[] = [
  // Computer Space Games 1982 — Starship Takeoff
  `10 PRINT "STARSHIP TAKEOFF"
20 PRINT "WEIGHT (KG)";:INPUT W
30 IF W < 50000 THEN 60
40 PRINT "TOO HEAVY"
50 GOTO 100
60 PRINT "FUEL (LITERS)";:INPUT F
70 IF F > 500 THEN 100
80 PRINT "LIFTOFF!"
90 PRINT "T+"INT(RND(1)*100)
100 PRINT "MISSION END"
`,
  // Computer Battle Games 1982 — Robot Missile
  `10 HOME
20 PRINT "ROBOT MISSILE"
30 PRINT "CODE?";:INPUT C$
40 IF C$ = "DESTRUCT" THEN 60
50 PRINT "WRONG":GOTO 30
60 PRINT "DEFUSED"
70 END
`,
  // Weird Computer Games 1984 — Tower of Terror
  `10 HOME
20 PRINT "TOWER OF TERROR"
30 FOR I = 1 TO 24
40 PRINT "FLOOR ";I
50 NEXT I
60 PRINT "MIDNIGHT"
70 PRINT "GAME OVER"
80 END
`,
  // Computer Spy Games 1984 — Code Generator
  `10 HOME
20 PRINT "MESSAGE:";:INPUT A$
30 FOR I = 1 TO LEN(A$)
40 PRINT MID$(A$,I,1)
50 NEXT I
60 PRINT "ENCRYPTED"
70 GOTO 10
`,
  // Fantasy Games 1983 — Dungeon of Doom
  `10 HOME
20 PRINT "DUNGEON OF DOOM"
30 PRINT "1) NORTH  2) SOUTH"
40 PRINT "3) EAST   4) WEST"
50 INPUT "CHOICE";C
60 ON C GOTO 100,200,300,400
70 GOTO 10
100 PRINT "YOU SEE A TROLL"
110 GOTO 10
200 PRINT "YOU FOUND GOLD"
210 GOTO 10
300 PRINT "PIT OF DOOM"
310 GOTO 10
400 PRINT "EXIT THE CASTLE"
410 END
`,
  // Haunted House 1983
  `10 HOME
20 PRINT "HAUNTED HOUSE"
30 PRINT "YOU ARE IN HALL"
40 PRINT "EXITS: N S E W"
50 INPUT "COMMAND";C$
60 IF C$ = "N" THEN 100
70 IF C$ = "S" THEN 200
80 IF C$ = "E" THEN 300
90 GOTO 10
100 PRINT "GHOSTS ATTACK"
110 GOTO 10
200 PRINT "YOU FOUND KEY"
210 GOTO 10
300 PRINT "ESCAPED!"
310 END
`,
  // MSX 1985
  `10 HOME
20 PRINT "MSX GAMES BOOK"
30 FOR I = 1 TO 10
40 PRINT "LEVEL";I
50 FOR J = 1 TO 100
60 NEXT J
70 NEXT I
80 PRINT "GAME COMPLETE"
90 END
`,
  // Horror-PT 1983
  `10 HOME
20 PRINT "PESADELO"
30 PRINT "1) ENTRAR"
40 PRINT "2) FUGIR"
50 INPUT "OPCAO";O
60 IF O = 1 THEN 100
70 IF O = 2 THEN 200
80 GOTO 10
100 PRINT "VOCE ENTROU"
110 GOTO 10
200 PRINT "VOCE FUGIU"
210 END
`,
]

const root = ref<HTMLDivElement | null>(null)
const reduceMotion = ref(false)

function buildRain() {
  if (!root.value) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  reduceMotion.value = reduce
  if (reduce) {
    // Just static text, no animation
    const layer = document.createElement('div')
    layer.className = 'absolute inset-0 p-4 font-mono text-[10px] leading-relaxed overflow-hidden opacity-30'
    layer.style.color = 'var(--phosphor)'
    layer.style.textShadow = '0 0 4px var(--phosphor-glow)'
    layer.style.whiteSpace = 'pre'
    layer.textContent = programs.join('\n\n')
    root.value.appendChild(layer)
    return
  }
  // Animated: ~80 columns of falling characters
  const cols = Math.max(40, Math.floor(window.innerWidth / 14))
  for (let c = 0; c < cols; c++) {
    const col = document.createElement('div')
    col.className = 'col'
    col.style.left = `${(c / cols) * 100}%`
    col.style.animationDuration = `${8 + Math.random() * 14}s`
    col.style.animationDelay = `${-Math.random() * 18}s`
    col.style.opacity = `${0.4 + Math.random() * 0.6}`
    // pick a random program snippet
    const program = programs[Math.floor(Math.random() * programs.length)]
    const lines = program.split('\n')
    col.textContent = lines.join('\n')
    root.value.appendChild(col)
  }
}

onMounted(() => {
  buildRain()
})

onUnmounted(() => {
  if (root.value) root.value.innerHTML = ''
})
</script>

<template>
  <div ref="root" class="basic-rain" aria-hidden="true" />
</template>
