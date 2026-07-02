# Sistema UI — Propuesta brutalista

Librería de componentes de la propuesta de rediseño (`/propuesta`). Vive en
paralelo al sitio actual sin tocarlo. Todo se estiliza con tokens de
`src/styles/propuesta.css` y responde a dos ejes conmutables:

- **Tema:** `data-theme="light|dark"` en `<html>`.
- **Piel brutalista:** `data-brutalism="refined|raw|neo"` en `<html>` (ver `StyleSwitcher`).

Página viva con todos los componentes y sus estados: **`/propuesta/componentes`**.

## Filosofía

- **Composición sobre configuración:** los componentes exponen `<slot>` (a veces
  nombrados) en lugar de decenas de props.
- **Tokens, no valores fijos:** bordes, radios, sombras, tipografía y acento salen
  de variables CSS. Cambiar de piel transforma todo el sitio sin tocar componentes.
- **Accesible por defecto:** foco visible, roles/ARIA correctos, navegación por
  teclado y respeto por `prefers-reduced-motion`.
- **Passthrough de atributos:** los primitivos reenvían `...rest` (target, rel,
  aria-*, data-*) al elemento raíz, y aceptan `class` para override puntual.

## Componentes

### Primitivos

| Componente | Props principales | Notas |
|---|---|---|
| `Button` | `variant` `'primary'\|'secondary'\|'ghost'`, `size` `'sm'\|'md'\|'lg'`, `href`, `loading`, `disabled`, `block`, `type` | Polimórfico: con `href` → `<a>`, si no `<button>`. `loading` muestra spinner y bloquea; `disabled` usa atributo nativo en botón y `aria-disabled` en enlace. |
| `Tag` | `tone` `'default'\|'n1'\|'n2'\|'solid'`, `as` | Etiqueta/chip. `n1`=magenta, `n2`=cyan. |
| `Grid` | `cols`, `colsMd`, `colsSm`, `isEmpty`, `emptyText` | Columnas por breakpoint (900/560px). `isEmpty` renderiza empty-state (slot `empty` para custom). |
| `Section` | `eyebrow`, `title`, `lead`, `level`, `id`, `flush` | Envoltorio con header opcional y borde superior expuesto. `flush` quita el separador. Slot `header` para reemplazarlo. |

### Contenedores / compuestos

| Componente | Props principales | Notas |
|---|---|---|
| `Card` | `href`, `interactive` | Slots `media` / default / `footer`. Con `href` es enlace interactivo. |
| `Collapsible` | `summary`, `eyebrow`, `open`, `id` | Disclosure sobre `<details>/<summary>`: funciona sin JS y por teclado. Emite `toggle`. |
| `HalftoneLab` | `open`, `id` | Sección propia con el motor CMYK. Sólo anima mientras está abierta (pausa al colapsar) y respeta reduced-motion. Base: `Collapsible` + `src/scripts/halftone-lab.js`. |
| `StyleSwitcher` | — | `role="radiogroup"` con flechas. Setea `data-brutalism` y persiste en `localStorage` (`pz-brutalism`). |
| `Slideshow` | `images`, `interval`, `offset`, `ratio` | Crossfade con autoplay. <2 imágenes → estático; `[]` → placeholder. No cicla con reduced-motion. |

### De dominio

| Componente | Props | Notas |
|---|---|---|
| `NivelCard` | `nivel` `1\|2`, `title`, `desc`, `href`, `cta` | Tarjeta de nivel con color de marca. |
| `DocenteCard` | `docente` `{nombre, rol, nivel, foto?}` | Avatar con fallback a inicial si la foto falta (`onerror`), carga diferida y dimensiones para evitar layout shift. |
| `GaleriaItem` | `item` `{tipo, src, alt, categoria}`, `index` | Celda foto/video con `data-*` para filtro y lightbox. |
| `NivelDetalle` | `nivel`, `desc`, `mail`, `programa[]`, `cronograma[]` | Plantilla de página de nivel (programa + timeline). DRY para `nivel-1`/`nivel-2`. |
| `PropuestaHeader` / `PropuestaFooter` | — | Navegación (sin Trabajos ni Inscripciones) + toggle de tema y menú mobile. |

## Datos

El contenido se sirve desde `src/data/`:
`docentes.js` (`docentes`, `groupDocentes()`) y `galeria.js`
(`items`, `categorias`, `countByCategoria()`). Las páginas actuales del sitio no
se modificaron; estos módulos son la fuente única para la propuesta.

## Uso

```astro
---
import Section from '../../components/propuesta/Section.astro';
import Grid from '../../components/propuesta/Grid.astro';
import NivelCard from '../../components/propuesta/NivelCard.astro';
---
<Section eyebrow="Programa" title="Dos niveles">
  <Grid cols={2} colsMd={1}>
    <NivelCard nivel={1} title="Tecnología 1" href="/propuesta/nivel-1" desc="…" />
    <NivelCard nivel={2} title="Tecnología 2" href="/propuesta/nivel-2" desc="…" />
  </Grid>
</Section>
```

## Añadir una piel

En `propuesta.css`, duplicar un bloque `[data-brutalism="…"]` y remapear los
tokens (`--pz-font-display`, `--pz-border-width`, `--pz-radius`, `--pz-shadow`,
`--pz-accent`, etc.). Agregar el valor a `StyleSwitcher` y al array `VALUES` de su
script. Ningún componente necesita cambios.
