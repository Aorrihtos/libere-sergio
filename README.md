# Lí Express — MVP

Catálogo de productos y órdenes para huéspedes de una cadena hotelera. Almacenamiento **en memoria**, sin base de datos ni servicios externos.

## Requisitos

- Node.js >= 18

## Instalación y arranque

```bash
npm install
npm start        # o: npm run dev (con --watch)
```

El servidor arranca en `http://localhost:3005` (configurable con `PORT`). Al arrancar se cargan 4 productos de ejemplo (Breakfast, Surf class, Bike rental, Pintxo tour). Los datos se pierden al reiniciar.

## Referencia de la API

Todas las rutas viven bajo `/api/v1`.

### `GET /api/v1/products?reservation_id=<id>`
Lista productos activos ordenados por relevancia (popularidad + antigüedad). `reservation_id` es obligatorio.

```bash
curl "http://localhost:3005/api/v1/products?reservation_id=res_123"
```
```json
{ "products": [ { "id": "prod_1", "name": "Breakfast", "description": "...", "dateAdded": "...", "price": 5 } ] }
```

### `GET /api/v1/products/:id`
Devuelve el producto completo, incluida su configuración `order_fields`, para construir el formulario dinámico.

```bash
curl "http://localhost:3005/api/v1/products/prod_1"
```

### `POST /api/v1/products`
Crea un producto.

```bash
curl -X POST http://localhost:3005/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Breakfast",
    "description": "Enjoy an amazing breakfast every morning.",
    "price": 5,
    "order_fields": [
      { "name": "consumption date", "type": "date" },
      { "name": "breakfast type", "type": "string" }
    ]
  }'
```

Tipos de campo soportados hoy: `date` (`YYYY-MM-DD`), `string`, `time` (`HH:MM`). Añadir un tipo nuevo solo requiere un archivo validador en `src/fieldTypes/` y una entrada en `src/fieldTypes/index.js`.

### `POST /api/v1/orders`
Crea una orden. Los valores de `fields` se validan contra la configuración `order_fields` del producto.

```bash
curl -X POST http://localhost:3005/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "reservation_id": "res_123",
    "product_id": "prod_1",
    "fields": {
      "consumption date": "2026-07-25",
      "breakfast type": "continental"
    }
  }'
```
```json
{ "order_id": "order_1" }
```

## Formato de errores

```json
{ "error": { "message": "Invalid order fields", "details": [ { "field": "consumption date", "message": "..." } ] } }
```
- `400` — payload inválido (`details` presente cuando aplica).
- `404` — producto no encontrado.
- `500` — error inesperado.

## Arquitectura

- **Capas:** `routes → controllers → services → repositories`. Los repositorios (`src/repositories/`) envuelven arrays en memoria detrás de una interfaz mínima (`findAll`, `findById`, `save`, ...) — cambiar a una base de datos real solo implica reemplazar esta capa.
- **Versionado de API:** las rutas están agregadas en `src/api/v1/index.js` y montadas en `/api/v1` desde `app.js`. Una v2 futura es un directorio `src/api/v2/` paralelo con su propio agregador, reutilizando los controllers/services que no cambien.
- **Relevance ranking pluggable:** `products.service.js` no calcula el orden inline; delega en `relevanceStrategy.rank(products, reservationId)`, vinculada en un único punto (`src/relevance/index.js`). El contrato es `async` desde el día uno porque un futuro servicio de recomendación implicará una llamada de red — sustituirlo no toca el service ni el controller.
- **Field type registry:** `src/fieldTypes/index.js` mapea `type → validador`, reutilizado tanto al crear productos (valida que los tipos declarados existan) como al crear órdenes (valida los valores enviados).

## Qué se recortó y por qué

- **Tests automatizados (Jest/supertest):** recortados deliberadamente para priorizar el diseño escalable en el timebox disponible. La separación en capas (services/repositories aislados de Express) está pensada para que añadir tests después tenga fricción baja — es lo primero a incorporar en la siguiente iteración.
- **Persistencia real:** solo arrays en memoria, sin base de datos.
- **Autenticación/autorización:** fuera de alcance para este MVP.
- **Paginación/filtrado:** solo se filtra por el flag `active`; no hay paginación ni otros filtros.
- **Actualización/borrado de productos u órdenes:** solo se soportan creación y lectura, según lo pedido.
- **Moneda/localización de `price`:** se asume un número plano en una única moneda.
