# Pampa Primigenia - Party Manager (extension de Owlbear Rodeo)

Extension para gestionar el grupo de personajes de **Pampa Primigenia (Pulp Austral)** dentro de [Owlbear Rodeo](https://www.owlbear.rodeo/).

## Que hace

- **El GM ve todas las fichas** de los personajes en un listado.
- **El GM asigna cada PJ a un jugador** conectado a la sala (dropdown).
- **Cada jugador ve y edita solo su(s) personaje(s)** asignado(s).
- **Inventario de party compartido**: cualquiera puede agregar/editar/quitar items y todos lo ven en vivo.
- Ficha completa con todos los campos de la hoja oficial: Nombre, Pertenencia particular, Rasgo caracteristico, Arreos y Aperos, Notas, Atributos (Mate / Viveza / Facon con su estado degradado -2 Lerdo / Aturdio / Cagao), Experiencias, Guapura, Salud y Estabilidad.
- **Experiencias**: todo personaje arranca con 4 (2 generales +1 a las tiradas, 1 de trasfondo, 1 del item caracteristico). Al terminar una sesion se elige 1: agregar una experiencia nueva, o marcar una existente (si ya estaba marcada, se borra la marca y su bono sube +1).
- **Playbooks by Koru** (opcional, lo activa el GM desde el listado de Personajes): agrega a la ficha un desplegable de playbook (Vaquero, Payador, Cebador, Soldado, Cura gaucho, El Viejo), con su habilidad, como se recarga y un contador de la meta currency propia de cada playbook (0 a 3).

Todo el estado se guarda en la **metadata de la sala** de Owlbear (`com.pampa-primigenia/state`), asi que persiste mientras exista la sala y se sincroniza en tiempo real entre GM y jugadores.

## Requisitos

- Node.js 18+ y npm.

## Uso en desarrollo (local)

```bash
npm install
npm run dev
```

Vite sirve la extension en `http://localhost:5173`.

### Cargar la extension en Owlbear

1. Entra a una sala en https://www.owlbear.rodeo/
2. Abri el menu de extensiones (icono de puzzle, arriba a la derecha) y elegi **Add Extension**.
3. Pega la URL del manifest local:

   ```
   http://localhost:5173/manifest.json
   ```

4. Aparecera el boton **Pampa Primigenia** arriba a la izquierda. Clickealo para abrir el panel.

> Nota: Owlbear puede requerir que el manifest se sirva por HTTPS segun tu navegador/config. Para uso local suele funcionar `http://localhost`. Para uso real (con tus jugadores) necesitas **hostear el build en una URL publica con HTTPS** (por ejemplo GitHub Pages, Netlify o Vercel) y cargar `https://tu-dominio/manifest.json`.

## Build de produccion

```bash
npm run build      # genera dist/
npm run preview    # sirve el build localmente para probar
```

Luego subi el contenido de `dist/` a tu hosting estatico y usa `https://tu-dominio/manifest.json` en Owlbear.

## Roles

- **GM**: ve todo el roster, crea/borra personajes, asigna jugadores y gestiona el inventario.
- **Jugador (PLAYER)**: ve y edita el/los personaje(s) que el GM le asigno, mas el inventario de party.

El rol lo determina Owlbear (`OBR.player.getRole()`); no hay que configurarlo aca.

## Store listing (static_root/)

La carpeta `static_root/` tiene los assets para publicar la extension en el listado/store de Owlbear Rodeo (banner,
icono, favicon y la descripcion en `store.md` con el formato que pide Owlbear). No forma parte del bundle de Vite:
`npm run deploy` los copia a `dist/` antes de subir, para que queden servidos en la raiz del sitio (por ejemplo
`https://pampa-primigenia-owlbear.pages.dev/store.md`).

```
static_root/
  banner.jpg         # imagen del listado (usada en store.md)
  favicon.ico
  icon.svg
  store.md           # metadata + descripcion para el store de Owlbear
```

## Estructura

```
public/
  manifest.json      # descripcion de la extension (accion/popover)
  icon.svg
src/
  types.ts           # modelo de datos (Character, PartyItem, PampaState, PLAYBOOKS)
  obr/
    useRole.ts       # rol e id del jugador actual
    useParty.ts      # jugadores conectados (para asignar)
    useRoster.ts     # sync del estado via room metadata
  utils/
    download.ts      # exportar ficha a JSON
  components/
    CharacterCard.tsx
    CharacterSheet.tsx
    ConditionTrack.tsx
    Experiences.tsx
    GuapuraTrack.tsx
    PipTrack.tsx
    PlayerAssign.tsx
    PartyInventory.tsx
  App.tsx            # vistas GM / jugador
  main.tsx
  styles.css
```
