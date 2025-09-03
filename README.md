## Instalación del Proyecto

### 1. Clonar el Repositorio

Ejecuta el siguiente comando en tu terminal:

```sh
git clone <URL_DEL_REPO>
```

Luego, accede al directorio del proyecto:

```sh
cd nombre-del-proyecto
```

### 2. Instalar Dependencias

Ejecuta el siguiente comando para instalar todas las dependencias necesarias:

```sh
npm install
```

## Comandos Disponibles

### `npm run build`

- Genera una versión optimizada del proyecto para producción.
- **Compila y minifica el código** para mejorar el rendimiento.
- Es obligatorio ejecutarlo antes de un despliegue en producción.

### `npm run lint`

- Ejecuta EsLint para revision de test clean code, errores, warnings y formato segun las reglas detalladas en .eslintrc.json

### `npm run start`

- Inicia el servidor en **modo producción** utilizando la versión construida con `npm run build`.
- **No** incluye hot-reloading.

### `npm run dev`

- Inicia el servidor en **modo desarrollo** con hot-reloading (actualización en vivo).

### `npm run devwin`

- Inicia el servidor en **modo desarrollo** con hot-reloading (actualización en vivo).
- Es una variante del comando `npm run dev` optimizada para entornos Windows.
- Utiliza las variables de entorno de development o local.

### `npm run prod`

- Inicia el servidor en **modo desarrollo** con hot-reloading (actualización en vivo).
- Utiliza las variables de entorno de production.
