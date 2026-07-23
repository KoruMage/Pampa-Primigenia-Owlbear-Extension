---
title: Pampa Primigenia - Party Manager
description: Gestion de fichas de personaje, asignacion de jugadores e inventario de party para Pampa Primigenia (Pulp Austral)
author: Koru
image: https://pampa-primigenia-owlbear.pages.dev/banner.jpg
icon: https://pampa-primigenia-owlbear.pages.dev/icon.svg
tags:
  - character
  - party
  - tool
manifest: https://pampa-primigenia-owlbear.pages.dev/manifest.json
learn-more: https://github.com/KoruMage/Pampa-Primigenia-Owlbear-Extension
---

# Pampa Primigenia - Party Manager

Extension para gestionar el grupo de personajes de **Pampa Primigenia (Pulp Austral)** dentro de Owlbear Rodeo.

### Que hace

- El GM ve todas las fichas de los personajes en un listado, y puede asignar cada PJ a un jugador conectado a la sala. \
  Cada jugador ve y edita solo su(s) personaje(s) asignado(s).
- Inventario de party compartido: cualquiera puede agregar, editar o quitar items y todos lo ven en vivo (ahora en su
  propia pestana, junto a la ficha).
- Ficha completa con todos los campos de la hoja oficial: Nombre, Pertenencia particular, Rasgo caracteristico, Arreos
  y Aperos, Notas, Atributos (Mate / Viveza / Facon con su estado degradado -2 Lerdo / Aturdio / Cagao), Experiencias,
  Guapura, Salud y Estabilidad (estas ultimas dos como puntos, en la misma fila).
- Experiencias: todo personaje arranca con 4 (2 generales +1 a las tiradas, 1 de trasfondo, 1 del item
  caracteristico). Al terminar una sesion se elige 1: agregar una experiencia nueva, o marcar una existente (si ya
  estaba marcada, se borra la marca y su bono sube +1).
- Playbooks by Koru (opcional, lo activa el GM desde una pantalla de Opciones): agrega a la ficha un desplegable de
  playbook (Vaquero, Payador, Cebador, Soldado, Cura gaucho, El Viejo), con su habilidad, como se recarga y un
  contador de la meta currency propia de cada playbook (0 a 3).

Todo el estado se guarda en la metadata de la sala de Owlbear, asi que persiste mientras exista la sala y se
sincroniza en tiempo real entre GM y jugadores.

### Uso

1. Entra a una sala en Owlbear Rodeo.
2. Abri el menu de extensiones y elegi "Add Extension".
3. Pega la URL del manifest: `https://pampa-primigenia-owlbear.pages.dev/manifest.json`
4. Aparecera el boton "Pampa Primigenia" en la barra de acciones. Clickealo para abrir el panel.
5. El rol (GM o jugador) lo determina Owlbear automaticamente; no hay que configurarlo.

### Otro

- El codigo esta en [GitHub](https://github.com/KoruMage/Pampa-Primigenia-Owlbear-Extension).
- Podes reportar problemas o pedir features ahi mismo.
