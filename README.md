# NodeQuote

Een lichte Node.js quote-service met:
- een REST API voor willekeurige quotes
- een status endpoint
- een eenvoudige web-UI op `/ui`
- tests met Jest + Supertest
- Docker support

## Features

- Leest quotes uit `quotes.csv` bij startup
- Geeft willekeurige quote terug via `GET /`
- Health/status endpoint via `GET /status`
- Statische frontend via `GET /ui`
- Foutafhandeling voor `404`, `500` en “quotes nog niet geladen” (`503`)

## Tech Stack

- Node.js (>= 18)
- Express
- fast-csv
- Jest + Supertest
- Nodemon (development)

## Projectstructuur

```text
.
├── Dockerfile
├── package.json
├── quotes.csv
├── server.js
├── server.test.js
└── public/
    ├── app.js
    ├── index.html
    └── style.css
```

## Installatie

```bash
npm install
```

## Lokaal draaien

### Production mode

```bash
npm start
```

### Development mode (auto-reload)

```bash
npm run dev
```

Standaard draait de server op poort `8080`.
Je kunt een andere poort kiezen via environment variable:

```bash
PORT=3000 npm start
```

> Op Windows PowerShell:
>
> ```powershell
> $env:PORT=3000; npm start
> ```

## API Endpoints

### `GET /status`

Geeft de laadtoestand van de service terug.

Voorbeeld response:

```json
{
  "status": "ready",
  "message": "Node quote service initialized with 521 quotes."
}
```

Mogelijke waarden voor `status`:
- `loading`: quotes nog niet geladen
- `ready`: quotes succesvol geladen

---

### `GET /`

Geeft een willekeurige quote terug.

Voorbeeld response:

```json
{
  "id": "42",
  "content": "Life is what happens while you are busy making other plans.",
  "author": "John Lennon",
  "version": "V4"
}
```

Wanneer quotes nog niet geladen zijn:

- Status: `503`
- Body:

```json
{
  "error": "Quotes not loaded yet"
}
```

---

### `GET /ui`

Opent de frontend die quotes ophaalt via de API.

## Testen

```bash
npm test
```

Wat er o.a. getest wordt:
- status endpoint
- random quote endpoint
- versieveld (`version: V4`)
- 404-afhandeling
- gedrag wanneer quotes nog niet geladen zijn
- CSV-load en veldvalidatie

## Docker

### Build image

```bash
docker build -t nodequote .
```

### Run container

```bash
docker run --rm -p 8080:8080 nodequote
```

Daarna bereikbaar op:
- API: `http://localhost:8080/`
- Status: `http://localhost:8080/status`
- UI: `http://localhost:8080/ui`

## Operational Notes

- Service laadt quotes eenmalig in memory bij startup.
- Bij opstartfouten in CSV-loading stopt het proces met exit code `1`.
- `SIGTERM` wordt afgehandeld voor nette shutdown.

## Licentie

MIT
