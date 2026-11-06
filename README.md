# Château Fakra Wine API — Assignment 6


## Project structure

```
assignment 6/
├── server.js                  # Express app, connects to the database then listens
├── seed.js                    # Fills the database with the 7 Château Fakra wines
├── models/
│   └── Wine.js                # Mongoose schema and model
├── routes/
│   └── wines.js               # The 6 routes and the validation middleware
├── postman_collection.json    # Postman collection with a test on every request
├── .env.example               # Example of the .env file, with fake values
├── .gitignore
├── package.json
└── package-lock.json
```

## How to run the project

You need Node.js (check with `node -v`) and a MongoDB database. 

### Step 1: Install the dependencies

```bash
npm install
```




### Step 2: Create the .env file

```bash
cp .env.example .env
```

Open `.env` and replace the `MONGODB_URI` value with your own MongoDB connection string, from MongoDB Atlas or a local MongoDB.

### Step 3: Add the wines to the database

```bash
npm run seed
```

**Note:** this deletes the wines already in the collection before adding the 7 wines again.

### Step 4: Start the server

```bash
npm run dev
```

The terminal shows `connected to MongoDB` and `Listening on http://localhost:3000`. Use `npm start` to run it without the auto restart. To stop the server press `Ctrl + C`.

## Routes

Base URL: `http://localhost:3000`

| Method | Route | What it does | Success | Errors |
| --- | --- | --- | --- | --- |
| GET | `/api/wines` | List all wines | 200 | 400 |
| GET | `/api/wines/:id` | Get one wine | 200 | 400, 404 |
| POST | `/api/wines` | Create a wine | 201 | 400, 409 |
| PUT | `/api/wines/:id` | Replace a whole wine | 200 | 400, 404, 409 |
| PATCH | `/api/wines/:id` | Change only the fields sent | 200 | 400, 404, 409 |
| DELETE | `/api/wines/:id` | Delete a wine | 204 | 400, 404 |

`name`, `slug` and `color` are required on POST and PUT. `color` must be `rouge`, `blanc`, `rosé` or `doux`. In the examples, replace `WINE_ID` with an `_id` from the list route.

### GET /api/wines

Optional query strings: `color`, `search`, `sort` (`name`, `newest` or `oldest`) and `limit` (1 to 100).

```bash
curl "http://localhost:3000/api/wines?color=blanc&limit=1"
```

Response `200`:

```json
[
  {
    "_id": "6aed6ef50a2d7d9c5348366d",
    "name": "Blanc de Blancs",
    "slug": "blanc-de-blancs",
    "color": "blanc",
    "varietals": ["Viognier", "Muscat"],
    "format": "750 mL · 375 mL · 13.5° GL",
    "serveTemp": "Best tasted at 12°C",
    "description": "A rare Blanc de Blancs, astounding with its sublime finesse of honey aromas, acacia and cedar.",
    "imageUrl": "/wines/blanc-de-blancs-bottle.jpg",
    "__v": 0,
    "createdAt": "2026-11-06T06:08:53.861Z",
    "updatedAt": "2026-11-06T06:08:53.861Z"
  }
]
```

### GET /api/wines/:id

```bash
curl http://localhost:3000/api/wines/WINE_ID
```

Response `200`: one wine object, like the one above.

Response `404`:

```json
{ "error": "Wine not found" }
```

### POST /api/wines

```bash
curl -X POST http://localhost:3000/api/wines \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Rosé","slug":"test-rose","color":"rosé","format":"750 mL"}'
```

Response `201`: the new wine, with the `_id`, `createdAt` and `updatedAt` set by the server.

```json
{
  "name": "Test Rosé",
  "slug": "test-rose",
  "color": "rosé",
  "varietals": [],
  "format": "750 mL",
  "serveTemp": "",
  "description": "",
  "imageUrl": "",
  "_id": "6aed6eda938c795920f123f5",
  "createdAt": "2026-11-06T06:08:26.390Z",
  "updatedAt": "2026-11-06T06:08:26.390Z",
  "__v": 0
}
```

Response `400` when required fields are missing:

```json
{
  "error": "Validation failed",
  "details": ["name is required", "slug is required", "color is required"]
}
```

Response `409` when the slug is already used:

```json
{ "error": "A wine with this slug already exists" }
```

### PUT /api/wines/:id

Replaces the whole wine. Fields that are not sent go back to empty.

```bash
curl -X PUT http://localhost:3000/api/wines/WINE_ID \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Rosé Reserve","slug":"test-rose","color":"rosé"}'
```

Response `200`: the wine after the change.

```json
{
  "_id": "6aed6eda938c795920f123f5",
  "name": "Test Rosé Reserve",
  "slug": "test-rose",
  "color": "rosé",
  "varietals": [],
  "format": "",
  "serveTemp": "",
  "description": "",
  "imageUrl": "",
  "createdAt": "2026-11-06T06:08:26.390Z",
  "updatedAt": "2026-11-06T06:08:27.471Z",
  "__v": 0
}
```

### PATCH /api/wines/:id

Changes only the fields that are sent.

```bash
curl -X PATCH http://localhost:3000/api/wines/WINE_ID \
  -H "Content-Type: application/json" \
  -d '{"serveTemp":"Served at 8°C"}'
```

Response `200`: the same wine object as PUT, with `serveTemp` changed to `"Served at 8°C"`.

Response `400` with an empty body:

```json
{ "error": "Send at least one field to update" }
```

### DELETE /api/wines/:id

```bash
curl -i -X DELETE http://localhost:3000/api/wines/WINE_ID
```

Response `204` with no body. If the wine does not exist the response is `404`:

```json
{ "error": "Wine not found" }
```

### Other errors

All errors are JSON. A bad id returns `400` with `{ "error": "Invalid wine id" }`, malformed JSON returns `400` with `{ "error": "Request body is not valid JSON" }`, and a server or database problem returns `500` with `{ "error": "Something went wrong on the server" }`.

