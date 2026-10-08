// ============================================================
// PACMAC - Juego estilo Pac-Man
// ============================================================
// El mapa se define con una matriz de caracteres:
//   '#' = pared
//   '.' = punto
//   'o' = punto grande (power pellet)
//   ' ' = espacio vacío
// ============================================================

const canvas = document.getElementById('juego');
const ctx = canvas.getContext('2d');
const elPuntos = document.getElementById('puntuacion');
const elVidas = document.getElementById('vidas');
const elNivel = document.getElementById('nivel');
const elMensaje = document.getElementById('mensaje');
const btnReiniciar = document.getElementById('btnReiniciar');
const btnPausa = document.getElementById('btnPausa');

const TAM = 32; // tamaño de cada celda en píxeles

const mapaBase = [
  "##############",
  "#............#",
  "#.##.####.##.#",
  "#o##.####.##o#",
  "#............#",
  "#.##.#....#.##",
  "#....#....#..#",
  "####.####.####",
  "    #      #  ",
  "####.####.####",
  "#............#",
  "#.##.####.##.#",
  "#o.#......#..o",
  "###.#.##.#.###",
  "#............#",
  "##############"
];

let mapa = [];
let puntuacion = 0;
let vidas = 3;
let nivel = 1;
let pausa = false;
let juegoTerminado = false;

// ----- Jugador -----
const pacman = {
  x: TAM, y: TAM,      // posición en celdas
  px: TAM, py: TAM,    // posición en píxeles
  dir: { x: 0, y: 0 }, // dirección actual
  sigDir: { x: 0, y: 0 }, // dirección deseada
  velocidad: 2
};

// ----- Fantasmas -----
const colores = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'];
let fantasmas = [];

function crearFantasmas() {
  fantasmas = colores.map((color, i) => ({
    x: 6 + (i % 2), y: 6 + Math.floor(i / 2) * 2,
    px: (6 + (i % 2)) * TAM, py: (6 + Math.floor(i / 2) * 2) * TAM,
    dir: { x: 0, y: Math.random() < 0.5 ? 1 : -1 },
    color,
    asustado: false
  }));
}

// ----- Utilidades -----
function esPared(x, y) {
  if (y < 0 || y >= mapa.length) return true;
  if (x < 0 || x >= mapa[y].length) return false; // túneles horizontales
  return mapa[y][x] === '#';
}

function celdaLibre(x, y) {
  return !esPared(x, y);
}

function puedeMoverse(px, py, dir) {
  // comprobar en la próxima celda que ocupará
  const cx = Math.round(px / TAM) + dir.x;
  const cy = Math.round(py / TAM) + dir.y;
  return celdaLibre(cx, cy);
}

function alineado(px, py) {
  return px % TAM === 0 && py % TAM === 0;
}

// ----- Inicialización -----
function iniciarNivel() {
  mapa = mapaBase.map(fila => fila.split(''));
  pacman.x = 1; pacman.y = 1;
  pacman.px = pacman.x * TAM; pacman.py = pacman.y * TAM;
  pacman.dir = { x: 0, y: 0 };
  pacman.sigDir = { x: 0, y: 0 };
  crearFantasmas();
  juegoTerminado = false;
  pausa = false;
}

// ----- Entrada de teclado -----
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':    pacman.sigDir = { x: 0, y: -1 }; break;
    case 'ArrowDown':  pacman.sigDir = { x: 0, y: 1 };  break;
    case 'ArrowLeft':  pacman.sigDir = { x: -1, y: 0 }; break;
    case 'ArrowRight': pacman.sigDir = { x: 1, y: 0 };  break;
    case ' ':          alternarPausa(); break;
  }
});

btnPausa.addEventListener('click', alternarPausa);
btnReiniciar.addEventListener('click', () => {
  puntuacion = 0; vidas = 3; nivel = 1;
  iniciarNivel();
  actualizarHUD();
  elMensaje.textContent = '¡Juego reiniciado!';
});

function alternarPausa() {
  if (juegoTerminado) return;
  pausa = !pausa;
  elMensaje.textContent = pausa ? '⏸ Pausa' : '¡Sigue comiendo puntos!';
}

// ----- Lógica de movimiento -----
function moverEntidad(e) {
  if (alineado(e.px, e.py)) {
    e.x = e.px / TAM;
    e.y = e.py / TAM;
  }

  // intentar dirección deseada (pacman)
  if (e.sigDir && alineado(e.px, e.py) && puedeMoverse(e.px, e.py, e.sigDir)) {
    e.dir = { ...e.sigDir };
  }

  // moverse si la dirección actual es válida
  if ((e.dir.x !== 0 || e.dir.y !== 0) && alineado(e.px, e.py) && !puedeMoverse(e.px, e.py, e.dir)) {
    e.dir = { x: 0, y: 0 };
  }

  e.px += e.dir.x * e.velocidad;
  e.py += e.dir.y * e.velocidad;

  // túneles horizontales
  if (e.px < -TAM) e.px = canvas.width;
  if (e.px > canvas.width) e.px = -TAM;
}

function moverFantasma(f) {
  if (alineado(f.px, f.py)) {
    f.x = f.px / TAM;
    f.y = f.py / TAM;
    // elegir dirección al azar entre las válidas (sin retroceder)
    const opciones = [
      { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
    ].filter(d =>
      !(d.x === -f.dir.x && d.y === -f.dir.y) &&
      puedeMoverse(f.px, f.py, d)
    );
    if (opciones.length > 0) {
      f.dir = opciones[Math.floor(Math.random() * opciones.length)];
    } else {
      f.dir = { x: -f.dir.x, y: -f.dir.y }; // retroceder si no hay salida
    }
  }
  f.px += f.dir.x * 1.5;
  f.py += f.dir.y * 1.5;
}

// ----- Colisiones y comidas -----
function comerPuntos() {
  if (!alineado(pacman.px, pacman.py)) return;
  const cx = pacman.px / TAM, cy = pacman.py / TAM;
  const celda = mapa[cy][cx];
  if (celda === '.') {
    mapa[cy][cx] = ' ';
    puntuacion += 10;
  } else if (celda === 'o') {
    mapa[cy][cx] = ' ';
    puntuacion += 50;
    fantasmas.forEach(f => f.asustado = true);
    setTimeout(() => fantasmas.forEach(f => f.asustado = false), 6000);
  }
  actualizarHUD();

  // comprobar victoria
  const quedan = mapa.some(fila => fila.includes('.') || fila.includes('o'));
  if (!quedan) {
    nivel++;
    elMensaje.textContent = `🎉 ¡Nivel ${nivel}!`;
    iniciarNivel();
    actualizarHUD();
  }
}

function colisionFantasmas() {
  for (const f of fantasmas) {
    const dx = f.px - pacman.px;
    const dy = f.py - pacman.py;
    if (Math.abs(dx) < TAM / 2 && Math.abs(dy) < TAM / 2) {
      if (f.asustado) {
        // fantasma comido
        puntuacion += 200;
        f.px = 7 * TAM; f.py = 8 * TAM;
        f.asustado = false;
        actualizarHUD();
      } else {
        vidas--;
        actualizarHUD();
        if (vidas <= 0) {
          juegoTerminado = true;
          elMensaje.textContent = '💀 Game Over. Pulsa Reiniciar.';
        } else {
          elMensaje.textContent = `¡Ay! Vidas restantes: ${vidas}`;
          pacman.px = pacman.x = 1; pacman.y = 1;
          pacman.px = TAM; pacman.py = TAM;
          pacman.dir = { x: 0, y: 0 };
        }
      }
    }
  }
}

// ----- Dibujo -----
function dibujar() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // mapa
  for (let y = 0; y < mapa.length; y++) {
    for (let x = 0; x < mapa[y].length; x++) {
      const celda = mapa[y][x];
      if (celda === '#') {
        ctx.fillStyle = '#2b2bff';
        ctx.fillRect(x * TAM, y * TAM, TAM, TAM);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x * TAM, y * TAM, TAM, TAM);
      } else if (celda === '.') {
        ctx.fillStyle = '#ffd';
        ctx.beginPath();
        ctx.arc(x * TAM + TAM / 2, y * TAM + TAM / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (celda === 'o') {
        ctx.fillStyle = '#ffd';
        ctx.beginPath();
        ctx.arc(x * TAM + TAM / 2, y * TAM + TAM / 2, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // fantasmas
  for (const f of fantasmas) {
    ctx.fillStyle = f.asustado ? '#2222ff' : f.color;
    ctx.beginPath();
    ctx.arc(f.px + TAM / 2, f.py + TAM / 2, TAM / 2 - 2, Math.PI, 0);
    ctx.lineTo(f.px + TAM - 2, f.py + TAM - 2);
    ctx.lineTo(f.px + 2, f.py + TAM - 2);
    ctx.closePath();
    ctx.fill();
  }

  // pacman
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(pacman.px + TAM / 2, pacman.py + TAM / 2, TAM / 2 - 2, 0.2 * Math.PI, 1.8 * Math.PI);
  ctx.lineTo(pacman.px + TAM / 2, pacman.py + TAM / 2);
  ctx.closePath();
  ctx.fill();
}

function actualizarHUD() {
  elPuntos.textContent = puntuacion;
  elVidas.textContent = vidas;
  elNivel.textContent = nivel;
}

// ----- Bucle principal -----
function bucle() {
  if (!pausa && !juegoTerminado) {
    moverEntidad(pacman);
    fantasmas.forEach(moverFantasma);
    comerPuntos();
    colisionFantasmas();
  }
  dibujar();
  requestAnimationFrame(bucle);
}

// ----- Arranque -----
iniciarNivel();
actualizarHUD();
bucle();
