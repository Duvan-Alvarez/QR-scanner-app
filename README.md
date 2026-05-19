# QR Scanner App

Aplicación Next.js para registrar y verificar códigos QR con una base SQLite local.

## Desarrollo local

```bash
npm ci
npm run dev
```

Abre `http://localhost:3000`.

Para usar una base específica durante desarrollo:

```bash
DATABASE_PATH=./database.sqlite npm run dev
```

En Windows PowerShell:

```powershell
$env:DATABASE_PATH = "database.sqlite"
npm run dev
```

## Variables de entorno

Copia `.env.example` a `.env` para despliegues con Docker o producción:

```bash
cp .env.example .env
```

Variables disponibles:

- `PORT`: puerto publicado por Docker Compose. Por defecto `3000`.
- `DATABASE_PATH`: ruta del archivo SQLite. En Docker debe apuntar a `/app/data/database.sqlite`.
- `NEXT_TELEMETRY_DISABLED`: usa `1` para desactivar telemetría de Next.
- `DEFAULT_ADMIN_USERNAME` y `DEFAULT_ADMIN_PASSWORD`: usuario admin inicial.
- `DEFAULT_SCANNER_USERNAME` y `DEFAULT_SCANNER_PASSWORD`: usuario scanner inicial.

Los usuarios iniciales solo se crean si no existen en la base de datos.

## Docker

Construir y levantar:

```bash
docker compose up -d --build
```

Ver logs:

```bash
docker compose logs -f web
```

Detener:

```bash
docker compose down
```

La base SQLite se persiste en `./data/database.sqlite` mediante un volumen local.

## CI

El workflow `.github/workflows/ci.yml` ejecuta:

- `npm ci`
- `npm run lint`
- `npm run build`
- build de la imagen Docker

En pushes a la rama principal del repositorio, publica la imagen en GitHub Container Registry:

```text
ghcr.io/<owner>/qr-scanner-app:latest
ghcr.io/<owner>/qr-scanner-app:<commit-sha>
```

El workflow usa `GITHUB_TOKEN`, así que no requiere configurar un PAT para GHCR.

## Notas de despliegue

SQLite necesita almacenamiento persistente. Evita desplegar esta app en entornos serverless con filesystem efímero, salvo que migres la base a un servicio gestionado.

El contenedor usa Node.js 20 para coincidir con el módulo nativo `better-sqlite3`.
