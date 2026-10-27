# Instrucciones para editar la página de Bruma Scent

Este repositorio es la página web de **Bruma Scent** (brumascent.com), una marca de perfumes inspirados en fragancias de alta gama. Se publica con GitHub Pages: cualquier cambio que se guarde en la rama `main` aparece en brumascent.com en uno o dos minutos.

La dueña pide los cambios en lenguaje normal (por ejemplo: "agrega un perfume", "cambia el precio", "pon mi WhatsApp"). Haz el cambio, guárdalo directamente en `main` con un mensaje claro en español y no le pidas que revise código.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `productos.js` | **Casi todos los cambios van aquí.** Contacto, precios, preguntas frecuentes y la lista de perfumes. |
| `index.html` | Textos fijos de la página (portada, "Cómo pedir", sección de calidad, pie). |
| `estilos.css` | Colores, tipografías y diseño. Los colores están al inicio como variables (`--papel`, `--tinta`, `--rosa`...). |
| `app.js` | Funcionamiento (filtros, buscador, ventana de cada perfume). Normalmente no se toca. |
| `img/botella.webp` | Foto de la botella original (portada). |
| `img/logo.png` | Logo. |
| `notas.js` | La foto de cada nota olfativa (fotos libres de Unsplash). Cada nota del catálogo debe tener aquí su foto con el nombre escrito exactamente igual. |
| `img/botella-neutra.webp`, `img/botella-neutra-sm.webp`, `img/liquido.png` | Botella con el líquido en gris y la forma del líquido; la página la tiñe con el `tono` de cada perfume. |
| `CNAME` | Contiene `brumascent.com`. **No borrar ni cambiar**, o el dominio deja de funcionar. |

## Cambios comunes

**Poner o cambiar el WhatsApp:** en `productos.js`, dentro de `window.CONFIG`, llena `whatsapp` solo con números y lada de país. México: `"52"` + 10 dígitos, por ejemplo `"524421234567"`. Mientras esté vacío, los botones llevan al Instagram.

**Precios:** `precioGeneral` en `CONFIG` se muestra en todos los perfumes (ej. `"$350 · 100 ml"`). Para un precio distinto en un perfume, llena su campo `precio`.

**Agregar un perfume:** copia un bloque `{ ... }` completo dentro de `window.PERFUMES`, ponlo al final, cambia `num` al siguiente número libre y llena todos los campos. Reglas:
- `familia` debe ser exactamente una de: `Floral`, `Floral frutal`, `Dulce`, `Oriental`, `Amaderado`, `Fresco`, `Chipre`.
- `destacadas`: 4 notas tomadas de su pirámide.
- `tono`: color del perfume original (ver "Color del frasco").
- `salida`, `corazon`, `fondo`: listas de notas en español con mayúscula inicial, usando los mismos nombres que ya existen cuando sea la misma nota (revisa `notas.js`).
- `descripcion`: 1 o 2 frases originales describiendo cómo huele. No copiar textos de otras páginas.
- Las notas se pueden consultar en fragrantica.es.
- Si una nota nueva no tiene foto en `notas.js`, agrégala (ver "Fotos de notas").

**Quitar un perfume:** borra su bloque completo `{ ... }` (incluida la coma que lo separa del siguiente). Para dejarlo visible pero agotado, cambia `disponible: true` por `disponible: false`.

**Color del frasco:** cada perfume tiene `tono` con el color del perfume original en formato `#rrggbb` (ej. `"#f0a7b8"` para un rosa). La página lo aclara sola para que el líquido siempre se vea pastel, así que se puede poner el color real aunque sea oscuro.

**Fotos de notas:** en `notas.js`, cada nota es `"Nombre": { url: "https://images.unsplash.com/photo-...", encuadre: "centro" }`. Para una nota nueva, busca una foto con licencia gratuita "Unsplash License" (no Unsplash+), copia la dirección de la imagen que empieza con `https://images.unsplash.com/photo-` sin lo que va después del `?`, y agrégala con el nombre exacto de la nota. `encuadre` puede ser `centro`, `arriba`, `abajo`, `izquierda` o `derecha` (hacia dónde está el objeto en la foto). Si una nota no tiene foto, se muestra la foto `_generica`.

**Etiquetas:** `nuevo: true` muestra "Nuevo" y `masPedido: true` muestra "Más pedido" en su tarjeta.

**Preguntas frecuentes:** edita la lista `window.PREGUNTAS` en `productos.js`.

## Reglas para no romper la página

1. `productos.js` es JavaScript: cada texto va entre comillas dobles, los bloques se separan con comas y no debe quedar una coma suelta antes de `]`. Si un texto lleva comillas dobles, usa comillas tipográficas “así”.
2. No cambies los nombres de los campos (`num`, `nombre`, `familia`, etc.) ni los `id` del HTML.
3. No borres `CNAME`.
4. Para la marca original usa siempre la frase "Inspirado en". No agregues logos, fotos de botellas ni imágenes de otras marcas.
5. La página no usa ningún sistema de compilación: los archivos se publican tal cual.
6. Cada vez que cambies `estilos.css`, `app.js`, `productos.js` o `notas.js`, sube en 1 el número `?v=` de ese archivo en `index.html` (ej. `productos.js?v=3` → `productos.js?v=4`). Así los visitantes ven el cambio de inmediato y no una versión guardada.
