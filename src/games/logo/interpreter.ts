/**
 * Logo Language interpreter — turtle graphics.
 * Implements a subset of Apple Logo II / LogoWriter circa 1985.
 * Supported commands:
 *   Movement: FD n, BK n, RT n, LT n
 *   Pen:      PU, PD
 *   State:    HOME, CS, ST, HT
 *   Position: SETXY x y, SETHEADING n, SETH n
 *   Color:    SETCOLOR n, SETPENSIZE n
 *   Loop:     REPEAT n [ ... ]
 *   Proc:     TO name :arg1 :arg2 ... END
 *   Vars:     MAKE "name value, :name (read)
 *   Output:   PRINT expr, LABEL "text
 *   Misc:     WAIT n
 * Coordinates: 0,0 = canvas center, x right, y down (canvas convention).
 * Heading: 0 = up, 90 = right, 180 = down, 270 = left (degrees).
 */

export type LogoValue = number | string | boolean

export interface Procedure {
  name: string
  params: string[]
  body: Node[]
}

export type Node =
  | { kind: 'word'; value: string }
  | { kind: 'num'; value: number }
  | { kind: 'str'; value: string }
  | { kind: 'var'; name: string }   // :name
  | { kind: 'quoted'; name: string } // "name (treated as variable NAME for MAKE)
  | { kind: 'list'; items: Node[] }
  | { kind: 'call'; name: string; args: Node[] }

export interface TurtleState {
  x: number
  y: number
  heading: number  // degrees, 0 = up
  penDown: boolean
  visible: boolean
  color: string
  width: number
}

export interface ExecOptions {
  /** Called when a line is drawn. */
  onDraw?: (from: { x: number; y: number }, to: { x: number; y: number }, color: string, width: number) => void
  /** Called to render a printable string (PRINT). */
  onPrint?: (text: string) => void
  /** Called to draw a text label (LABEL). */
  onLabel?: (text: string, x: number, y: number) => void
  /** Called to clear screen. */
  onClear?: () => void
  /** Called to update turtle position/visibility (after each step). */
  onTurtle?: (s: TurtleState) => void
  /** Async wait helper. */
  wait?: (ms: number) => Promise<void>
  /** Initial position (canvas coords, 0,0 = center). */
  init?: { x: number; y: number }
}

export interface ExecResult {
  errors: string[]
  warnings: string[]
  procedures: Procedure[]
}

const COLORS = [
  '#7CFC00', // phosphor green
  '#FFFFFF', // white
  '#FFD700', // gold
  '#FF6B6B', // coral
  '#4FC3F7', // sky blue
  '#BA68C8', // orchid
]

export class LogoInterpreter {
  state: TurtleState
  procedures: Map<string, Procedure> = new Map()
  variables: Map<string, LogoValue> = new Map()
  errors: string[] = []
  warnings: string[] = []
  private opts: ExecOptions
  private stepping = false

  constructor(opts: ExecOptions = {}) {
    this.opts = opts
    this.state = {
      x: opts.init?.x ?? 0,
      y: opts.init?.y ?? 0,
      heading: 0,
      penDown: true,
      visible: true,
      color: COLORS[0],
      width: 2,
    }
  }

  reset(opts?: { x?: number; y?: number }) {
    this.state = {
      x: opts?.x ?? this.opts.init?.x ?? 0,
      y: opts?.y ?? this.opts.init?.y ?? 0,
      heading: 0,
      penDown: true,
      visible: true,
      color: COLORS[0],
      width: 2,
    }
    this.variables.clear()
    this.procedures.clear()
    this.errors = []
    this.warnings = []
    this.opts.onClear?.()
    this.opts.onTurtle?.(this.state)
  }

  // ---- Tokenizer ----
  tokenize(input: string): string[] {
    const out: string[] = []
    let i = 0
    while (i < input.length) {
      const c = input[i]
      if (/\s/.test(c)) { i++; continue }
      if (c === '[' || c === ']' || c === '(' || c === ')' || c === '+' || c === '-' || c === '*' || c === '/') {
        out.push(c); i++; continue
      }
      if (c === '"') {
        // quoted name
        let j = i + 1
        while (j < input.length && /[A-Za-z0-9_:\-]/.test(input[j])) j++
        out.push('"' + input.slice(i + 1, j))
        i = j
        continue
      }
      if (c === ':') {
        let j = i + 1
        while (j < input.length && /[A-Za-z0-9_]/.test(input[j])) j++
        out.push(input.slice(i, j))
        i = j
        continue
      }
      // word/number
      let j = i
      while (j < input.length && /[A-Za-z0-9_.\-]/.test(input[j])) j++
      if (j > i) {
        out.push(input.slice(i, j))
        i = j
      } else {
        // unknown char, skip
        i++
      }
    }
    return out
  }

  // ---- Parser ----
  parse(input: string): Node[] {
    const tokens = this.tokenize(input)
    return this.parseListMultiLine(tokens)
  }

  private parseListMultiLine(tokens: string[]): Node[] {
    let pos = 0
    const parseList = (stopOnRightBracket: boolean): Node[] => {
      const items: Node[] = []
      while (pos < tokens.length) {
        const t = tokens[pos]
        if (t === undefined) break
        if (t === ']') {
          if (stopOnRightBracket) break
          pos++  // skip stray ']'
          continue
        }
        if (t === '[') {
          pos++
          items.push({ kind: 'list', items: parseList(true) })
          continue
        }
        items.push(parseAtom())
      }
      return items
    }
    const parseAtom = (): Node => {
      const t = tokens[pos]
      if (t === undefined) return { kind: 'word', value: '' }
      if (t.startsWith(':')) { pos++; return { kind: 'var', name: t.slice(1).toUpperCase() } }
      if (t.startsWith('"')) { pos++; return { kind: 'quoted', name: t.slice(1).toUpperCase() } }
      if (/^-?\d+(\.\d+)?$/.test(t)) { pos++; return { kind: 'num', value: parseFloat(t) } }
      pos++
      return { kind: 'word', value: t.toUpperCase() }
    }
    // Parse at top level (no right-bracket stop)
    const topItems: Node[] = []
    while (pos < tokens.length) {
      if (tokens[pos] === 'TO') {
        pos++
        const name = (tokens[pos++] ?? '').toUpperCase()
        const params: string[] = []
        while (pos < tokens.length && tokens[pos].startsWith(':')) {
          params.push(tokens[pos++].slice(1).toUpperCase())
        }
        const body: Node[] = []
        while (pos < tokens.length && tokens[pos] !== 'END') {
          if (tokens[pos] === '[') {
            pos++
            body.push({ kind: 'list', items: parseList(true) })
            continue
          }
          if (tokens[pos] === ']') { pos++; continue }
          body.push(parseAtom())
        }
        if (tokens[pos] === 'END') pos++
        this.procedures.set(name, { name, params, body })
        continue
      }
      // Use parseList which handles [ ] correctly
      const remaining = parseList(false)
      topItems.push(...remaining)
    }
    return topItems
  }

  // ---- Evaluator ----
  async run(input: string): Promise<ExecResult> {
    this.errors = []
    this.warnings = []
    let ast: Node[]
    try {
      ast = this.parse(input)
    } catch (e: any) {
      this.errors.push(`Parse error: ${e.message}`)
      return { errors: this.errors, warnings: this.warnings, procedures: [...this.procedures.values()] }
    }
    await this.execList(ast, new Map())
    this.opts.onTurtle?.(this.state)
    return { errors: this.errors, warnings: this.warnings, procedures: [...this.procedures.values()] }
  }

  private async execList(nodes: Node[], locals: Map<string, LogoValue>) {
    let i = 0
    while (i < nodes.length) {
      const node = nodes[i]
      if (this.errors.length > 20) return
      const consumed = await this.execOne(node, nodes, i, locals)
      if (consumed > 0) i += consumed
      else i++
    }
  }

  private async execOne(node: Node, nodes: Node[], i: number, locals: Map<string, LogoValue>): Promise<number> {
    if (node.kind !== 'word') {
      this.errors.push(`Expected command, got ${node.kind}`)
      return 1
    }
    const cmd = node.value
    // 0-arg
    if (cmd === 'PU' || cmd === 'PENUP') { this.state.penDown = false; return 1 }
    if (cmd === 'PD' || cmd === 'PENDOWN') { this.state.penDown = true; return 1 }
    if (cmd === 'ST' || cmd === 'SHOWTURTLE') { this.state.visible = true; this.opts.onTurtle?.(this.state); return 1 }
    if (cmd === 'HT' || cmd === 'HIDETURTLE') { this.state.visible = false; this.opts.onTurtle?.(this.state); return 1 }
    if (cmd === 'CS' || cmd === 'CLEARSCREEN') {
      this.state.x = this.opts.init?.x ?? 0
      this.state.y = this.opts.init?.y ?? 0
      this.state.heading = 0
      this.opts.onClear?.()
      this.opts.onTurtle?.(this.state)
      return 1
    }
    if (cmd === 'HOME') {
      this.state.x = this.opts.init?.x ?? 0
      this.state.y = this.opts.init?.y ?? 0
      this.state.heading = 0
      if (this.state.penDown) {
        this.opts.onDraw?.(
          { x: this.state.x, y: this.state.y },
          { x: this.opts.init?.x ?? 0, y: this.opts.init?.y ?? 0 },
          this.state.color, this.state.width
        )
      }
      this.opts.onTurtle?.(this.state)
      return 1
    }
    if (cmd === 'END') return 1

    // 1-arg
    if (cmd === 'FD' || cmd === 'FORWARD') {
      const v = await this.evalNum(nodes[i + 1], locals)
      if (v === null) { this.errors.push('FD needs a number'); return 2 }
      await this.move(v)
      return 2
    }
    if (cmd === 'BK' || cmd === 'BACK') {
      const v = await this.evalNum(nodes[i + 1], locals)
      if (v === null) { this.errors.push('BK needs a number'); return 2 }
      await this.move(-v)
      return 2
    }
    if (cmd === 'RT' || cmd === 'RIGHT') {
      const v = await this.evalNum(nodes[i + 1], locals)
      if (v === null) { this.errors.push('RT needs a number'); return 2 }
      this.state.heading = (this.state.heading + v + 360) % 360
      this.opts.onTurtle?.(this.state)
      return 2
    }
    if (cmd === 'LT' || cmd === 'LEFT') {
      const v = await this.evalNum(nodes[i + 1], locals)
      if (v === null) { this.errors.push('LT needs a number'); return 2 }
      this.state.heading = (this.state.heading - v + 360) % 360
      this.opts.onTurtle?.(this.state)
      return 2
    }
    if (cmd === 'SETH' || cmd === 'SETHEADING') {
      const v = await this.evalNum(nodes[i + 1], locals)
      if (v === null) { this.errors.push('SETH needs a number'); return 2 }
      this.state.heading = ((v % 360) + 360) % 360
      this.opts.onTurtle?.(this.state)
      return 2
    }
    if (cmd === 'SETCOLOR' || cmd === 'SETPC') {
      const v = await this.evalNum(nodes[i + 1], locals)
      if (v === null) { this.errors.push('SETCOLOR needs a number'); return 2 }
      const c = COLORS[Math.floor(v) % COLORS.length]
      this.state.color = c
      return 2
    }
    if (cmd === 'SETPENSIZE' || cmd === 'SETPS') {
      const v = await this.evalNum(nodes[i + 1], locals)
      if (v === null) { this.errors.push('SETPENSIZE needs a number'); return 2 }
      this.state.width = Math.max(1, v)
      return 2
    }
    if (cmd === 'WAIT') {
      const v = await this.evalNum(nodes[i + 1], locals)
      if (v === null) { this.errors.push('WAIT needs a number'); return 2 }
      if (this.opts.wait) await this.opts.wait(v)
      return 2
    }
    if (cmd === 'PRINT' || cmd === 'PR') {
      const v = await this.evalAny(nodes[i + 1], locals)
      this.opts.onPrint?.(this.toStr(v))
      return 2
    }
    if (cmd === 'LABEL') {
      // LABEL "text
      const arg = nodes[i + 1]
      let text = ''
      if (arg?.kind === 'str') text = arg.value
      else if (arg?.kind === 'quoted') text = arg.name
      else if (arg?.kind === 'word') text = arg.value
      else if (arg?.kind === 'num') text = String(arg.value)
      else if (arg?.kind === 'var') text = this.toStr(this.lookupVar(arg.name, locals))
      this.opts.onLabel?.(text, this.state.x, this.state.y)
      return 2
    }
    if (cmd === 'SETXY') {
      const vx = await this.evalNum(nodes[i + 1], locals)
      const vy = await this.evalNum(nodes[i + 2], locals)
      if (vx === null || vy === null) { this.errors.push('SETXY needs x y'); return 3 }
      await this.goto(vx, vy)
      return 3
    }
    if (cmd === 'REPEAT') {
      const n = await this.evalNum(nodes[i + 1], locals)
      const list = nodes[i + 2]
      if (n === null || !list || list.kind !== 'list') {
        this.errors.push('REPEAT needs n [list]'); return 3
      }
      const count = Math.max(0, Math.floor(n))
      for (let k = 0; k < count; k++) {
        if (this.errors.length > 20) break
        await this.execList(list.items, locals)
        this.opts.onTurtle?.(this.state)
      }
      return 3
    }
    if (cmd === 'IF') {
      const cond = await this.evalAny(nodes[i + 1], locals)
      const list = nodes[i + 2]
      if (!list || list.kind !== 'list') { this.errors.push('IF needs cond [list]'); return 3 }
      if (this.isTruthy(cond)) {
        await this.execList(list.items, locals)
      }
      return 3
    }
    if (cmd === 'MAKE') {
      // MAKE "name value
      const name = nodes[i + 1]
      const val = await this.evalAny(nodes[i + 2], locals)
      if (name?.kind !== 'quoted' && name?.kind !== 'word') {
        this.errors.push('MAKE needs a name and value'); return 3
      }
      const vname = (name.kind === 'quoted' ? name.name : name.value).toUpperCase()
      this.variables.set(vname, val)
      locals.set(vname, val)
      return 3
    }
    if (cmd === 'STOP') return 9999
    if (cmd === 'TO') {
      // Already handled in parse; skip in exec
      let depth = 1
      let j = i + 1
      while (j < nodes.length && depth > 0) {
        if (nodes[j].kind === 'word' && (nodes[j] as any).value === 'TO') depth++
        if (nodes[j].kind === 'word' && (nodes[j] as any).value === 'END') depth--
        j++
      }
      return j - i
    }
    // User-defined procedure
    const proc = this.procedures.get(cmd)
    if (proc) {
      const newLocals = new Map(locals)
      for (let p = 0; p < proc.params.length; p++) {
        const v = await this.evalAny(nodes[i + 1 + p], locals)
        newLocals.set(proc.params[p], v)
      }
      await this.execList(proc.body, newLocals)
      return 1 + proc.params.length
    }
    // Number literal = noop
    if (/^-?\d+(\.\d+)?$/.test(cmd)) return 1
    this.errors.push(`I don't know how to ${cmd}`)
    return 1
  }

  private async move(distance: number) {
    const rad = (this.state.heading - 90) * Math.PI / 180
    const dx = Math.cos(rad) * distance
    const dy = Math.sin(rad) * distance
    const nx = this.state.x + dx
    const ny = this.state.y + dy
    if (this.state.penDown) {
      this.opts.onDraw?.(
        { x: this.state.x, y: this.state.y },
        { x: nx, y: ny },
        this.state.color, this.state.width
      )
    }
    this.state.x = nx
    this.state.y = ny
    this.opts.onTurtle?.(this.state)
    if (this.opts.wait) await this.opts.wait(Math.min(20, Math.abs(distance) * 2))
  }

  private async goto(x: number, y: number) {
    if (this.state.penDown) {
      this.opts.onDraw?.(
        { x: this.state.x, y: this.state.y },
        { x, y },
        this.state.color, this.state.width
      )
    }
    this.state.x = x
    this.state.y = y
    this.opts.onTurtle?.(this.state)
  }

  private async evalNum(node: Node | undefined, locals: Map<string, LogoValue>): Promise<number | null> {
    if (!node) return null
    if (node.kind === 'num') return node.value
    if (node.kind === 'word' && /^-?\d+(\.\d+)?$/.test(node.value)) return parseFloat(node.value)
    if (node.kind === 'var') {
      const v = this.lookupVar(node.name, locals)
      const n = typeof v === 'number' ? v : parseFloat(String(v))
      return isNaN(n) ? null : n
    }
    if (node.kind === 'word' && (node.value === 'TRUE' || node.value === 'FALSE')) {
      return node.value === 'TRUE' ? 1 : 0
    }
    return null
  }

  private async evalAny(node: Node | undefined, locals: Map<string, LogoValue>): Promise<LogoValue> {
    if (!node) return ''
    if (node.kind === 'num') return node.value
    if (node.kind === 'str') return node.value
    if (node.kind === 'quoted') return node.name
    if (node.kind === 'var') return this.lookupVar(node.name, locals)
    if (node.kind === 'word') {
      if (/^-?\d+(\.\d+)?$/.test(node.value)) return parseFloat(node.value)
      if (node.value === 'TRUE') return true
      if (node.value === 'FALSE') return false
      return node.value
    }
    return ''
  }

  private lookupVar(name: string, locals: Map<string, LogoValue>): LogoValue {
    if (locals.has(name)) return locals.get(name)!
    if (this.variables.has(name)) return this.variables.get(name)!
    return 0
  }

  private toStr(v: LogoValue): string {
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
    return String(v)
  }

  private isTruthy(v: LogoValue): boolean {
    if (typeof v === 'boolean') return v
    if (typeof v === 'number') return v !== 0
    return !!v && v.toUpperCase() !== 'FALSE'
  }
}
