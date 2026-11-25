// One-based PDF pages. The two book-length adventures link to the main listing or program overview.
export const originals: Record<
  string,
  { page: number; pt: string; en: string }
> = {
  'haunted-house': {
    page: 35,
    pt: 'Explore a mansão por comandos de texto, encontre os tesouros escondidos e volte à saída com eles.',
    en: 'Explore the mansion with text commands, recover its hidden treasures and bring them back to the exit.',
  },
  'starship-takeoff': {
    page: 6,
    pt: 'Use a gravidade informada para descobrir a força de decolagem da nave alienígena em até dez tentativas.',
    en: 'Use the planet’s gravity reading to find the alien ship’s takeoff force within ten guesses.',
  },
  'intergalactic-games': {
    page: 8,
    pt: 'Escolha o ângulo e a velocidade de lançamento que põem o satélite de televisão na altura pedida.',
    en: 'Choose a launch angle and speed that put the television satellite at the requested height.',
  },
  'evil-alien': {
    page: 10,
    pt: 'Localize a nave invisível de Elron numa grade tridimensional usando as pistas de até quatro tentativas.',
    en: 'Find Elron’s invisible ship on a three-dimensional grid using the clues from up to four attempts.',
  },
  'beat-the-bug-eyes': {
    page: 12,
    pt: 'Quando os olhos surgirem numa das quatro posições, aperte a tecla correspondente antes que desapareçam.',
    en: 'When eyes appear in one of four positions, press the matching key before they disappear.',
  },
  moonlander: {
    page: 14,
    pt: 'Dose o combustível a cada etapa da descida para pousar o módulo lunar com velocidade próxima de zero.',
    en: 'Choose how much fuel to burn on each descent step so the lunar module touches down at nearly zero speed.',
  },
  'monsters-of-galacticon': {
    page: 16,
    pt: 'Descubra qual das três armas funciona contra cada espécie de monstro e mantenha sua expedição viva.',
    en: 'Work out which of three weapons affects each monster species and keep your expedition alive.',
  },
  'alien-snipers': {
    page: 18,
    pt: 'Corrija a leitura falsa do radar avançando no alfabeto pelo número indicado e digite a letra a tempo.',
    en: 'Decode the jammed radar by shifting its letter forward by the given number, then enter the result before the ship moves.',
  },
  'asteroid-belt': {
    page: 20,
    pt: 'Conte os asteriscos de cada asteroide e pressione a tecla desse número antes da colisão.',
    en: 'Count the stars in each asteroid and press the matching number key before impact.',
  },
  'trip-into-the-future': {
    page: 22,
    pt: 'Escolha a distância e a velocidade relativística para voltar à Terra no ano pedido sem envelhecer demais a bordo.',
    en: 'Choose a distance and a speed near light speed to reach the requested future year on Earth within your own lifetime.',
  },
  'death-valley': {
    page: 24,
    pt: 'Pilote a SpeedDart para a esquerda e para a direita entre as paredes irregulares de um desfiladeiro.',
    en: 'Steer the SpeedDart left and right through a twisting ravine without hitting its walls.',
  },
  'space-mines': {
    page: 26,
    pt: 'Governe Astron por dez anos, negociando minério e minas e comprando comida para a população.',
    en: 'Govern Astron for ten years by trading ore and mines and buying food for the colony.',
  },
  'space-rescue': {
    page: 28,
    pt: 'Distribua a energia entre os sistemas da nave na viagem e no pouso para entregar suprimentos médicos.',
    en: 'Allocate energy for the voyage and the landing to deliver medical supplies to a distant planet.',
  },
  touchdown: {
    page: 32,
    pt: 'Aumente ou diminua o empuxo enquanto observa o módulo e faça um pouso lunar suave no exame de pilotagem.',
    en: 'Adjust thrust as you watch the landing craft descend and make a soft lunar landing in your pilot exam.',
  },
  'dungeon-of-doom': {
    page: 12,
    pt: 'Crie e equipe um herói, explore masmorras de dificuldade crescente e recupere o Ídolo Perdido.',
    en: 'Create and equip a hero, explore increasingly difficult dungeons and recover the Lost Idol.',
  },
  'robot-missile': {
    page: 6,
    pt: 'Descubra a letra que desativa o míssil dos robôs usando as pistas de ordem alfabética.',
    en: 'Find the letter that deactivates the robot missile using the alphabetical clues.',
  },
  'the-vital-message': {
    page: 8,
    pt: 'Memorize a mensagem enquanto aparece e redigite a sequência exata depois que ela sumir.',
    en: 'Memorize the briefly displayed message and type its exact letters after it disappears.',
  },
  shootout: {
    page: 10,
    pt: 'Espere o sinal depois dos dez passos e reaja antes do adversário no duelo.',
    en: 'Wait for the draw signal after ten paces and react before your opponent.',
  },
  'desert-tank-battle': {
    page: 12,
    pt: 'Encontre a direção e a elevação que atingem a fortaleza dos robôs antes de acabar os cinco mísseis.',
    en: 'Find the direction and elevation that reach the robot stronghold before your five missiles run out.',
  },
  'battle-at-traitors-castle': {
    page: 14,
    pt: 'Identifique em qual das nove posições da muralha aparece o alvo e aperte a tecla a tempo.',
    en: 'Spot which of nine battlement positions shows the target and press its number before it disappears.',
  },
  'robot-invaders': {
    page: 16,
    pt: 'Reconheça o símbolo de cada invasor e pressione a tecla correspondente antes que ele desapareça.',
    en: 'Read each invader’s code symbol and press the matching key before it vanishes.',
  },
  'secret-weapon': {
    page: 18,
    pt: 'Estime as coordenadas do depósito subterrâneo de peças dos robôs e refine os palpites usando as pistas.',
    en: 'Guess the coordinates of the robots’ underground parts store and refine your guesses using the clues.',
  },
  escape: {
    page: 20,
    pt: 'Experimente as frequências do relógio sônico até descobrir a que permite escapar dos guardas robôs.',
    en: 'Try frequencies on the sonic wristwatch to find the one that lets you escape the robot guards.',
  },
  'pirate-dogfight': {
    page: 22,
    pt: 'Acelere ou freie para emparelhar com o Pirata do Céu e vencer o duelo antes de perdê-lo de vista.',
    en: 'Speed up or slow down to draw level with the Sky Pirate and win the duel before losing sight of him.',
  },
  'supersonic-bomber': {
    page: 24,
    pt: 'Compare cinco gráficos de população robótica e escolha depressa o de maior valor.',
    en: 'Compare five robot-population graphs and quickly select the one with the highest value.',
  },
  iceberg: {
    page: 26,
    pt: 'Conduza o navio pela grade e atraia o perseguidor para um iceberg, evitando colisão e captura.',
    en: 'Steer through the grid and lure the pursuing ship into an iceberg while avoiding collision and capture.',
  },
  'the-wall': {
    page: 28,
    pt: 'Abra uma brecha no muro móvel do feiticeiro para libertar as pessoas transformadas em pedra.',
    en: 'Breach the wizard’s moving wall to free the people he turned to stone.',
  },
  missile: {
    page: 32,
    pt: 'Observe o avião passar e acione em sequência as três bases para interceptá-lo.',
    en: 'Watch the plane cross the screen and time the launches from three successive bases to intercept it.',
  },
  'tower-of-terror': {
    page: 4,
    pt: 'Suba ao último andar em busca do tesouro e decida quando recuar para acalmar o pulso antes da meia-noite.',
    en: 'Climb to the top-floor treasure, choosing when to retreat to lower your pulse before midnight.',
  },
  'skulls-of-the-pyramid': {
    page: 5,
    pt: 'Solte exatamente cinco caveiras sobre as pedras numeradas para somar o valor exigido pelo espírito.',
    en: 'Drop exactly five skulls onto numbered stones to reach the spirit’s target total.',
  },
  'monster-wrestling': {
    page: 7,
    pt: 'Calcule o esforço muscular e, nas crises, a adrenalina necessária para sobreviver a doze rodadas.',
    en: 'Calculate muscular effort and, in a crisis, the required adrenaline to survive twelve rounds.',
  },
  jaws: {
    page: 9,
    pt: 'Como tubarão, alcance o maior número possível de nadadores antes que o caçador alcance você.',
    en: 'As the shark, catch as many swimmers as possible before the hunter catches you.',
  },
  'flying-witches': {
    page: 11,
    pt: 'Voe de vassoura e recolha os ingredientes pedidos na receita da Superwitch, evitando os ladrões de vassouras.',
    en: 'Fly your broom to collect the ingredients in Superwitch’s recipe while avoiding broom snatchers.',
  },
  micropuzzle: {
    page: 13,
    pt: 'Explore o ambiente desconhecido com comandos de duas palavras e descubra o que aconteceu com você.',
    en: 'Explore your unfamiliar surroundings with two-word commands and work out what happened to you.',
  },
  pesadelo: {
    page: 5,
    pt: 'Repita os números do computador para elevar a pontuação inicial de 300 a 500 antes que ela chegue a zero.',
    en: 'Echo the computer’s numbers to raise your starting score of 300 to 500 before it falls to zero.',
  },
  'mago-dos-numeros': {
    page: 6,
    pt: 'Elimine os números de 1 a 9 formando pares que somem o total dos dados. O zero pode ser reutilizado.',
    en: 'Clear the digits 1 to 9 by choosing pairs that match the dice total. Zero can be reused.',
  },
  'aspirador-de-fantasmas': {
    page: 8,
    pt: 'Ajuste o número do aspirador ao do fantasma que atravessa a tela e capture-o antes de perder uma vida.',
    en: 'Match the vacuum’s number to each passing ghost and catch it before it costs you a life.',
  },
  'mulher-aranha': {
    page: 10,
    pt: 'Ofereça palavras à Mulher-Aranha e use as respostas para deduzir sua letra secreta.',
    en: 'Offer words to Spider-Woman and use her answers to deduce her secret letter.',
  },
  cemiterio: {
    page: 12,
    pt: 'Encontre a saída antes da meia-noite, evite os túmulos e use até cinco buracos para afastar os esqueletos.',
    en: 'Find the exit before midnight, avoid the graves and dig up to five holes to keep skeletons away.',
  },
  'casa-maluca': {
    page: 14,
    pt: 'Controle as portas externas para alinhá-las com a porta do meio e fugir antes que os passos se aproximem.',
    en: 'Control the outer doors to line them up with the middle door and escape before the footsteps reach you.',
  },
  'labirinto-assombrado': {
    page: 16,
    pt: 'Oriente-se pelo corredor à frente e encontre a cruz da saída, evitando os fantasmas que mudam sua posição.',
    en: 'Navigate by the corridor ahead and reach the exit cross while avoiding ghosts that send you elsewhere in the maze.',
  },
  // The chapter heading is unreadable in the OCR. Page 18 describes the star and the spirit-message listing.
  'sessao-espirita': {
    page: 18,
    pt: 'Siga a estrela e digite, na ordem correta, as letras que formam a mensagem dos espíritos.',
    en: 'Follow the star and enter the letters of the spirits’ message in the order shown.',
  },
  'marie-celeste': {
    page: 18,
    pt: 'Explore o navio-fantasma com comandos de texto e desvende o desaparecimento de sua tripulação.',
    en: 'Explore the ghost ship using text commands and solve the mystery of its missing crew.',
  },
  'diga-mestre': {
    page: 32,
    pt: 'Deduza a regra oculta do mestre e proponha três exemplos seguidos que ele aceite.',
    en: 'Infer the master’s hidden rule and give three examples in a row that he accepts.',
  },
  'eu-acuso': {
    page: 39,
    pt: 'Interrogue a testemunha sobre seis características e use as respostas para identificar o criminoso.',
    en: 'Ask the witness about six identifying features and use the answers to identify the criminal.',
  },
  'star-trek': {
    page: 44,
    pt: 'Comande a nave estelar, use seus sensores e elimine os klingons antes que eles destruam sua nave.',
    en: 'Command the starship, use its sensors and defeat the Klingons before they destroy your ship.',
  },
  'super-breakout': {
    page: 55,
    pt: 'Rebata a bola com a raquete para eliminar todos os blocos coloridos da tela.',
    en: 'Use the paddle to return the ball and clear every coloured brick from the screen.',
  },
  'labirinto-3d': {
    page: 59,
    pt: 'Encontre rapidamente a saída usando a vista em perspectiva antes que o perseguidor do labirinto alcance você.',
    en: 'Use the perspective view to find the exit before the maze’s pursuer catches you.',
  },
  damas: {
    page: 66,
    pt: 'Capture as peças adversárias com saltos diagonais. Quando houver captura disponível, ela é obrigatória.',
    en: 'Capture the opposing pieces with diagonal jumps. A capture is compulsory whenever one is available.',
  },
  xadrez: {
    page: 76,
    pt: 'Dispute uma partida com outra pessoa no tabuleiro eletrônico e salve a posição para retomá-la depois.',
    en: 'Play another person on the electronic chessboard and save the position to resume later.',
  },
  gustavus: {
    page: 96,
    pt: 'Ligue pares de pontos e force o adversário a ser o primeiro a formar um triângulo da própria cor.',
    en: 'Connect pairs of dots and force your opponent to complete a triangle in their own colour first.',
  },
  'olhos-espiao': {
    page: 5,
    pt: 'Memorize as posições dos números de 1 a 9 e identifique o único que mudou de lugar.',
    en: 'Memorize the positions of the digits 1 to 9 and identify the one that moved.',
  },
  holofote: {
    page: 6,
    pt: 'Atravesse o território e volte, usando árvores e pedras como abrigo quando o holofote acender.',
    en: 'Cross the territory and return, taking cover behind trees and rocks when the searchlight comes on.',
  },
  espiobot: {
    page: 8,
    pt: 'Memorize as viradas à esquerda e à direita do agente e transmita a sequência ao robô que o segue.',
    en: 'Memorize the agent’s left and right turns and relay the sequence to the robot following them.',
  },
  'teste-espioes': {
    page: 10,
    pt: 'Preencha dez posições com números em ordem crescente e passe nos testes para subir de patente.',
    en: 'Fill ten slots with numbers in ascending order and pass successive tests to earn promotions.',
  },
  'gerador-mensagens': {
    page: 12,
    pt: 'Codifique uma mensagem para um amigo e use o mesmo programa para decifrar a resposta.',
    en: 'Encode a message for a friend and use the same program to decode the reply.',
  },
  'encontro-marcado': {
    page: 14,
    pt: 'Retire a maleta na estação, combine a entrega com o contato e volte ao aeroporto antes do último voo.',
    en: 'Collect the briefcase at the station, arrange its handover to your contact and return to the airport before the last flight.',
  },
  'codigo-morse': {
    page: 18,
    pt: 'Reconheça a letra representada por uma sequência de sinais Morse e confira sua resposta.',
    en: 'Identify the letter represented by a sequence of Morse signals and check your answer.',
  },
}
