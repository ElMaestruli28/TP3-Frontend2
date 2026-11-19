# IMB-BOX

Aplicación web de seguimiento, calificación y reseña de series de televisión desarrollada con **React**, **Vite** y **Firebase**, consumiendo el catálogo y la información episódica desde la **API de TVMaze**.

Permite explorar el catálogo libremente, evaluar series con escala del **1 al 100** (puntaje general y por episodio), escribir reseñas, descubrir recomendaciones por contexto/tópico y persistir los datos de cada usuario en **Cloud Firestore** (incluyendo acceso como invitado anónimo).

---

## Requisitos previos

Antes de empezar, asegúrate de tener instalado en tu equipo:

* **Node.js** (versión 18 o superior recomendada).
* **Git** (para clonar el repositorio).
* Una cuenta de **Firebase** ([console.firebase.google.com](https://console.firebase.google.com/)).

---

## 1. Clonar el repositorio e instalar dependencias

Abre una terminal y ejecuta:

```bash
git clone <URL_DE_TU_REPOSITORIO_EN_GITHUB>
cd <CARPETA_DEL_PROYECTO>
npm install