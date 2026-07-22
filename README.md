# Pampa Primigenia - Party Manager (extension de Owlbear Rodeo)

Extension para gestionar el grupo de personajes de **Pampa Primigenia (Pulp Austral)** dentro de [Owlbear Rodeo](https://www.owlbear.rodeo/).

## Que hace

- **El GM ve todas las fichas** de los personajes en un listado.
- **El GM asigna cada PJ a un jugador** conectado a la sala (dropdown).
- **Cada jugador ve y edita solo su(s) personaje(s)** asignado(s).
- **Inventario de party compartido**: cualquiera puede agregar/editar/quitar items y todos lo ven en vivo.
- Ficha completa con todos los campos de la hoja oficial: Nombre, Pertenencia particular, Rasgo caracteristico, Arreos y Aperos, Notas, Atributos (Mate / Viveza / Facon con su estado degradado -2 Lerdo / Aturdio / Cagao), Guapura, Salud y Estabilidad.

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

## Estructura

```
public/
  manifest.json      # descripcion de la extension (accion/popover)
  icon.svg
src/
  types.ts           # modelo de datos (Character, PartyItem, PampaState)
  obr/
    useRole.ts       # rol e id del jugador actual
    useParty.ts      # jugadores conectados (para asignar)
    useRoster.ts     # sync del estado via room metadata
  components/
    CharacterCard.tsx
    CharacterSheet.tsx
    ConditionTrack.tsx
    GuapuraTrack.tsx
    PlayerAssign.tsx
    PartyInventory.tsx
  App.tsx            # vistas GM / jugador
  main.tsx
  styles.css
```
