# Verificación manual de endpoints — Lí Express

Ejecutado contra el servidor levantado en `http://localhost:3005`.

## 1. `GET /api/v1/products?reservation_id=res_manual_check_001`

**Request**
```bash
curl "http://localhost:3005/api/v1/products?reservation_id=res_manual_check_001"
```

**Response — 200**
```json
{
  "products": [
    { "id": "prod_1", "name": "Breakfast", "description": "Enjoy an amazing breakfast every morning.", "dateAdded": "2026-07-22T08:59:58.297Z", "price": 5 },
    { "id": "prod_2", "name": "Surf class", "description": "Learn to surf with a local instructor.", "dateAdded": "2026-07-22T08:59:58.297Z", "price": 40 },
    { "id": "prod_3", "name": "Bike rental", "description": "Explore the city on two wheels.", "dateAdded": "2026-07-22T08:59:58.297Z", "price": 15 },
    { "id": "prod_4", "name": "Pintxo tour", "description": "A guided tour through the best pintxo bars in town.", "dateAdded": "2026-07-22T08:59:58.297Z", "price": 30 }
  ]
}
```

## 2. `GET /api/v1/products/prod_2`

**Request**
```bash
curl "http://localhost:3005/api/v1/products/prod_2"
```

**Response — 200**
```json
{
  "id": "prod_2",
  "name": "Surf class",
  "description": "Learn to surf with a local instructor.",
  "price": 40,
  "order_fields": [
    { "name": "class date", "type": "date" },
    { "name": "class time", "type": "time" },
    { "name": "notes", "type": "string" }
  ],
  "active": true,
  "dateAdded": "2026-07-22T08:59:58.297Z",
  "orderCount": 0
}
```

## 3. `POST /api/v1/products`

**Request**
```bash
curl -X POST "http://localhost:3005/api/v1/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City walking tour",
    "description": "A relaxed 90-minute walk through the old town.",
    "price": 12,
    "order_fields": [
      { "name": "tour date", "type": "date" },
      { "name": "start time", "type": "time" },
      { "name": "group size", "type": "string" }
    ]
  }'
```

**Response — 201**
```json
{
  "id": "prod_5",
  "name": "City walking tour",
  "description": "A relaxed 90-minute walk through the old town.",
  "price": 12,
  "order_fields": [
    { "name": "tour date", "type": "date" },
    { "name": "start time", "type": "time" },
    { "name": "group size", "type": "string" }
  ],
  "active": true,
  "dateAdded": "2026-07-22T09:02:54.368Z",
  "orderCount": 0
}
```

## 4. `POST /api/v1/orders`

**Request**
```bash
curl -X POST "http://localhost:3005/api/v1/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "reservation_id": "res_manual_check_001",
    "product_id": "prod_1",
    "fields": {
      "consumption date": "2026-08-01",
      "breakfast type": "vegan"
    }
  }'
```

**Response — 201**
```json
{ "order_id": "order_1" }
```

## Resumen

| # | Endpoint | Método | Status | Resultado |
|---|----------|--------|--------|-----------|
| 1 | `/api/v1/products` | GET | 200 | Lista de 4 productos seed, campos proyectados correctamente |
| 2 | `/api/v1/products/:id` | GET | 200 | Producto completo con `order_fields` |
| 3 | `/api/v1/products` | POST | 201 | Producto `prod_5` creado con `active:true`, `orderCount:0` |
| 4 | `/api/v1/orders` | POST | 201 | Orden `order_1` creada, valores validados contra `order_fields` de `prod_1` |

Los 4 endpoints responden con el status code y la forma de payload esperados.
