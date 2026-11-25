export type Text = readonly [string, string]
export type Mission = {
  kind: 'flight' | 'expedition' | 'console' | 'table'
  rule: Text
}
const flight = (pt: string, en: string): Mission => ({
  kind: 'flight',
  rule: [pt, en],
})
const expedition = (pt: string, en: string): Mission => ({
  kind: 'expedition',
  rule: [pt, en],
})
const consoleGame = (pt: string, en: string): Mission => ({
  kind: 'console',
  rule: [pt, en],
})
const table = (pt: string, en: string): Mission => ({
  kind: 'table',
  rule: [pt, en],
})
export const missions: Record<string, Mission> = {
  'haunted-house': expedition(
    'Recupere as relíquias e volte ao portão sem cruzar com a aparição.',
    'Recover the relics and reach the gate while evading the apparition.',
  ),
  'starship-takeoff': consoleGame(
    'Calibre os motores de três cargueiros. Compense a gravidade e a massa antes da ignição.',
    'Calibrate three freighters. Balance gravity and mass before ignition.',
  ),
  'intergalactic-games': consoleGame(
    'Acerte a órbita dos satélites com correções de altitude.',
    'Put the satellites into orbit with altitude corrections.',
  ),
  'evil-alien': consoleGame(
    'Triangule o sinal alienígena em três eixos usando os ecos do radar.',
    'Triangulate the alien signal on three axes using radar echoes.',
  ),
  'beat-the-bug-eyes': consoleGame(
    'Observe os olhos que acendem e reproduza a sequência de posições.',
    'Watch the eyes light up and repeat the sequence of positions.',
  ),
  moonlander: consoleGame(
    'Escolha a queima a cada segundo. Toque o solo a no máximo 3 m/s.',
    'Choose a burn each second. Touch down at no more than 3 m/s.',
  ),
  'monsters-of-galacticon': flight(
    'Atravesse a formação e elimine seis monstros com o pulso de proa.',
    'Break the formation and eliminate six monsters with the forward pulse.',
  ),
  'alien-snipers': flight(
    'Alinhe a mira com os atiradores e dispare antes que cruzem a linha de defesa.',
    'Line up with the snipers and fire before they cross the defensive line.',
  ),
  'asteroid-belt': flight(
    'Encontre as brechas entre as rochas. Atravesse o cinturão com o casco intacto.',
    'Find gaps between the rocks and survive the belt.',
  ),
  'trip-into-the-future': consoleGame(
    'Reconstrua os intervalos entre datas para atravessar três portais.',
    'Reconstruct the intervals between dates to cross three portals.',
  ),
  'death-valley': expedition(
    'Recolha cantis nos oásis e chegue à caravana antes que falte água.',
    'Collect water at the oases and reach the caravan before your supply runs out.',
  ),
  'space-mines': expedition(
    'Desarme os transmissores de minas e retorne à eclusa.',
    'Disarm the mine transmitters and return to the airlock.',
  ),
  'space-rescue': expedition(
    'Localize os astronautas e leve toda a equipe à nave de resgate.',
    'Locate the astronauts and bring the whole crew to the rescue ship.',
  ),
  touchdown: consoleGame(
    'Pouse em uma pista de alta gravidade. Reserve combustível para a frenagem final.',
    'Land on a high-gravity strip. Save fuel for the final braking burn.',
  ),
  'dungeon-of-doom': expedition(
    'Reúna as runas da masmorra e alcance a escadaria sem cair na guarda de Klimm.',
    'Collect the dungeon runes and reach the stairway while avoiding Klimm’s guard.',
  ),
  'robot-missile': consoleGame(
    'Descubra a letra da trava. Cada tentativa revela de que lado do alfabeto está a chave.',
    'Find the lock letter. Each guess reveals which side of the alphabet holds the key.',
  ),
  'the-vital-message': consoleGame(
    'Memorize o telegrama e retransmita os sinais na ordem exata.',
    'Memorize the telegram and retransmit its signals in order.',
  ),
  shootout: consoleGame(
    'Espere o sinal do duelo e toque no alvo. Uma saída falsa custa uma vida.',
    'Wait for the duel signal and tap the target. A false start costs a life.',
  ),
  'desert-tank-battle': consoleGame(
    'Ajuste a mira do tanque pelo alcance e pelo desvio lateral do vento.',
    'Adjust the tank sights for range and crosswind.',
  ),
  'battle-at-traitors-castle': expedition(
    'Ocupe os postos avançados antes de entrar na fortaleza do traidor.',
    'Secure the outposts before entering the traitor’s fortress.',
  ),
  'robot-invaders': flight(
    'Proteja a base dos invasores. Intercepte seis robôs antes que passem.',
    'Protect the base. Intercept six robots before they break through.',
  ),
  'secret-weapon': consoleGame(
    'Descubra a combinação de três dígitos da arma. O painel conta os encaixes exatos.',
    'Crack the weapon’s three-digit combination. The panel counts exact matches.',
  ),
  escape: expedition(
    'Recolha as chaves nos corredores e abra a porta da prisão.',
    'Collect the corridor keys and open the prison door.',
  ),
  'pirate-dogfight': flight(
    'Alterne corredores e abata os aviões piratas em aproximação.',
    'Change lanes and shoot down the approaching pirate aircraft.',
  ),
  'supersonic-bomber': flight(
    'Sobrevoe as balizas e solte a carga quando o alvo estiver ao alcance.',
    'Overfly the beacons and release the payload when the target is in range.',
  ),
  iceberg: flight(
    'Conduza o navio por canais de gelo até a água aberta.',
    'Steer the ship through ice channels into open water.',
  ),
  'the-wall': consoleGame(
    'Distribua trabalhadores entre pedreira e canteiro para concluir a muralha a tempo.',
    'Send workers to the quarry or building site to finish the wall in time.',
  ),
  missile: flight(
    'Intercepte os mísseis antes que cheguem à cidade.',
    'Intercept the missiles before they reach the city.',
  ),
  'tower-of-terror': expedition(
    'Encontre os selos dos andares e corra até a escada antes da meia-noite.',
    'Find the floor seals and race to the stairs before midnight.',
  ),
  'skulls-of-the-pyramid': consoleGame(
    'Escolha o valor de cada caveira e complete o total do altar em três oferendas.',
    'Choose each skull value and match the altar total with three offerings.',
  ),
  'monster-wrestling': consoleGame(
    'Calcule a força do contragolpe a partir do peso e da alavanca do rival.',
    'Calculate counterattack strength from your rival’s weight and leverage.',
  ),
  jaws: expedition(
    'Cace no recife e volte às águas profundas enquanto o barco patrulha.',
    'Hunt on the reef and return to deep water while the boat patrols.',
  ),
  'flying-witches': expedition(
    'Busque os ingredientes do feitiço e leve-os ao caldeirão.',
    'Gather spell ingredients and bring them to the cauldron.',
  ),
  micropuzzle: consoleGame(
    'Descubra a regra de cada sequência na bancada de lógica.',
    'Discover each sequence rule at the logic bench.',
  ),
  pesadelo: consoleGame(
    'Reconstrua os números vistos no escuro antes que o pesadelo se repita.',
    'Reconstruct the digits seen in the dark before the nightmare repeats.',
  ),
  'mago-dos-numeros': consoleGame(
    'Feche a soma dos dados escolhendo três pedras numeradas.',
    'Match the dice total by choosing three numbered stones.',
  ),
  'aspirador-de-fantasmas': consoleGame(
    'Espere a aparição e acione o bocal iluminado para capturá-la.',
    'Wait for the apparition and activate the lit nozzle to catch it.',
  ),
  'mulher-aranha': consoleGame(
    'Decifre a letra presa na teia usando as pistas alfabéticas.',
    'Decipher the letter caught in the web using alphabetic clues.',
  ),
  cemiterio: expedition(
    'Acenda as lanternas e alcance o portão antes que o esqueleto volte.',
    'Light the lanterns and reach the gate before the skeleton returns.',
  ),
  'casa-maluca': consoleGame(
    'Alinhe as cinco portas. Cada interruptor também inverte as portas vizinhas.',
    'Align the five doors. Each switch also flips its neighbors.',
  ),
  'labirinto-assombrado': expedition(
    'Mapeie os cristais de orientação e encontre a saída do labirinto.',
    'Map the guiding crystals and find the maze exit.',
  ),
  'sessao-espirita': consoleGame(
    'Identifique o espírito pelas marcas reveladas na mesa.',
    'Identify the spirit from the marks revealed on the table.',
  ),
  'marie-celeste': expedition(
    'Procure sobreviventes nos compartimentos e volte ao bote.',
    'Search the compartments for survivors and return to the lifeboat.',
  ),
  'diga-mestre': consoleGame(
    'Observe os exemplos do Mestre e escolha o número que obedece à regra.',
    'Study the Master’s examples and select the number that obeys the rule.',
  ),
  'eu-acuso': consoleGame(
    'Cruze local e objeto no arquivo e identifique o único suspeito compatível.',
    'Cross-reference location and accessory to find the only matching suspect.',
  ),
  'star-trek': flight(
    'Abra caminho entre os cruzadores e intercepte seis naves com os fasores.',
    'Navigate the cruisers and intercept six ships with the phasers.',
  ),
  'super-breakout': table(
    'Quebre os vitrais com a bola. Mova a raquete para controlar o ângulo de retorno.',
    'Break the stained glass with the ball. Move the paddle to control the return angle.',
  ),
  'labirinto-3d': expedition(
    'Recolha os marcos do labirinto e fuja da patrulha do touro.',
    'Gather the maze markers and escape the bull patrol.',
  ),
  damas: table(
    'Resolva um final de damas contra o autômato do salão.',
    'Play a draughts endgame against the pavilion automaton.',
  ),
  xadrez: table(
    'Conduza o final de torre e rei contra o autômato.',
    'Play the rook and king endgame against the automaton.',
  ),
  gustavus: table(
    'Dispute os quadrados de um tabuleiro que começa parcialmente traçado.',
    'Compete for boxes on a board with some edges already drawn.',
  ),
  'olhos-espiao': consoleGame(
    'Observe o quadro de sinais e reproduza as posições de memória.',
    'Study the signal board and repeat the positions from memory.',
  ),
  holofote: expedition(
    'Recolha os documentos e atravesse o perímetro evitando o facho móvel.',
    'Collect the documents and cross the perimeter while avoiding the moving beam.',
  ),
  espiobot: consoleGame(
    'Grave as curvas do robô e repita o trajeto de cada transmissão.',
    'Memorize the robot’s turns and repeat the route of each transmission.',
  ),
  'teste-espioes': consoleGame(
    'Classifique os códigos recebidos. Escolha sempre o menor restante.',
    'Sort the incoming codes. Always choose the smallest remaining code.',
  ),
  'gerador-mensagens': consoleGame(
    'Intercepte os telegramas e reverta a rotação da cifra de César.',
    'Intercept the telegrams and reverse the Caesar cipher rotation.',
  ),
  'encontro-marcado': expedition(
    'Busque a chave e os despachos antes de encontrar o contato na estação.',
    'Find the key and dispatches before meeting your contact at the station.',
  ),
  'codigo-morse': consoleGame(
    'Leia o sinal de cada letra e escolha a transcrição correta.',
    'Read each letter’s signal and select its correct transcription.',
  ),
  'apple-logo': table(
    'Experimente a rosácea programável e edite seus ângulos na oficina.',
    'Explore the programmable rosette and edit its angles in the workshop.',
  ),
}
