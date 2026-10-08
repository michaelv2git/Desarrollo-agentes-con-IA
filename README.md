# 🟡 Pacmac — Juego estilo Pac-Man

Un pequeño juego de laberinto inspirado en Pac-Man, hecho con HTML, CSS y JavaScript puro (sin librerías).

## Estructura del proyecto

| Archivo        | Descripción                                        |
| -------------- | -------------------------------------------------- |
| `index.html`   | Estructura de la página y elementos del juego.     |
| `style.css`    | Estilos visuales de la página y el canvas.         |
| `game.js`      | Toda la lógica del juego (movimiento, colisiones). |
| `README.md`    | Esta documentación.                                |

## Cómo jugar

1. Abre `index.html` en tu navegador (doble clic o arrastrarlo al navegador).
2. Usa las **flechas del teclado** para mover a Pacmac.
3. Come todos los puntos `.` para avanzar de nivel.
4. Los puntos grandes `o` te permiten comer fantasmas durante unos segundos.
5. Evita a los fantasmas de colores... ¡o serás tú quien los coma!
6. Tienes **3 vidas**. Si las pierdes, es Game Over.

## Controles y botones

- ⬆️ ⬇️ ⬅️ ➡️ — Mover a Pacmac
- **Espacio** — Pausa / continuar
- **Pausa** — Alterna la pausa
- **Reiniciar** — Vuelve a empezar desde el nivel 1

## Reglas y puntuación

| Acción                  | Puntos |
| ----------------------- | ------ |
| Punto pequeño `.`       | 10     |
| Punto grande `o`        | 50     |
| Fantasma asustado       | 200    |

Al completar todos los puntos del laberinto subes de nivel y el mapa se reinicia.

## Personalización

- **Mapa:** edita la matriz `mapaBase` en `game.js`. Caracteres disponibles:
  - `#` pared
  - `.` punto pequeño
  - `o` punto grande
  - espacio vacío
- **Velocidad:** cambia `pacman.velocidad` en `game.js` (y `1.5` en `moverFantasma`).
- **Colores:** edita `style.css` o el array `colores` en `game.js`.

## Tecnologías

- HTML5 (elemento `<canvas>`)
- CSS3
- JavaScript (Vanilla, sin dependencias)
