# Contexto de sesión — Lí Express MVP

Este documento resume toda la sesión de trabajo con Claude Code sobre este proyecto, para poder retomarla en otra máquina. Pégalo (o apúntale a este archivo) al iniciar una nueva sesión de Claude en el otro PC para que tenga contexto completo sin tener que re-derivarlo.

## 1. Origen y objetivo del proyecto

Ejercicio/prueba técnica para construir el MVP de **Lí Express**, una funcionalidad tipo e-commerce que una cadena hotelera quiere ofrecer a sus huéspedes durante la estancia (desayuno, tours de pintxos, alquiler de bicis, clases de surf, etc.).

Brief original (verbatim, en inglés, tal como se recibió):

> Lí Express is an early e-commerce-like feature we want to offer to guests during their stay — breakfast, pintxo tours, bike rentals, and more. We're starting small but expect the surface to grow, so it needs to be easy to evolve and shaped for production — not production-ready code today, but design choices that wouldn't need to be undone when we deploy this on our cloud platform.
>
> **What we want you to build** — Two features:
>
> 1. **Product catalog** — Each product has its own configuration for the data we need from the guest when they order it (surf classes want date/time/notes; breakfast wants date/breakfast type). The list of field types is small today but will grow — the solution should make that easy. Three endpoints: list active products sorted by relevance (input: reservation_id; returns id, name, description, date added, price; relevance starts with date added + popularity but should be pluggable into a recommendation service later, keyed on reservation); get product by id including order-field config; create product. Seed a handful of products in memory on startup.
> 2. **Order request** — single endpoint. Input: reservation_id, product_id, and the field values required by the product's config. Validates against config, stores in memory, returns order_id.
>
> **Constraints:** in-memory only, no DB/external services; production-shape not production-ready; any language/framework; ~35 min timebox (candidate is not expected to finish everything, must say what's cut).

El "candidato" en este ejercicio soy yo (Claude Code), sin el límite real de 35 minutos — pero el usuario pidió simular igualmente el criterio de "recortar algo a propósito y documentarlo", en vez de intentar cubrir todo sin restricciones.

## 2. Proceso seguido

1. `find-skills` — se buscaron skills de terceros para Express/Node/testing/API design. Ninguna tenía suficiente respaldo (solo una superó las 1K instalaciones: `aj-geddes/useful-ai-prompts@rest-api-design`, no instalada). Se decidió no instalar nada y trabajar con capacidades generales.
2. `brainstorming` (modo plan) — serie de preguntas una a una para fijar el diseño antes de tocar código. Decisiones resultantes en la sección 3.
3. Plan formal escrito y aprobado vía `ExitPlanMode` (guardado localmente en `~/.claude/plans/necesitamos-montar-un-mvp-eventual-river.md` de esta máquina — **no viaja con el repo**, por eso se resume aquí).
4. Implementación completa de los 4 endpoints, instalación de dependencias, arranque del servidor y verificación manual con `curl` de los 4 endpoints (éxito y casos de error).
5. Ajustes post-entrega pedidos por el usuario: cambio de puerto por defecto, generación de `.gitignore`, generación de `verification-results.md` con llamadas mockeadas a los 4 endpoints.

## 3. Decisiones de diseño acordadas (con el porqué)

| Decisión | Elegido | Alternativas descartadas / por qué |
|---|---|---|
| Lenguaje | JavaScript puro, ESM (`"type": "module"`) | TypeScript se ofreció como recomendado pero el usuario prefirió JS puro — menos fricción de arranque |
| Alcance | **Completo** en las 4 funcionalidades | Se consideró recortar un endpoint entero, pero se decidió recortar solo la suite de tests, no funcionalidad |
| Lo recortado a propósito | **Tests automatizados** (Jest/supertest) | Documentado en README como "qué se recortó y por qué" — primera cosa a añadir después |
| Validación de payloads | **Manual, sin librería**, vía registry de tipos de campo | Zod/Joi descartados explícitamente por el usuario |
| Framework HTTP | **Express** | Fastify/http nativo descartados |
| Capas | **Routes → Controllers → Services → Repositories** | Alternativa "routes→services con storage plano" descartada — se quiere que cambiar a una BD real solo toque repositories |
| Versionado de API | **`/api/v1`** montado como router agregador (middleware) en `app.js` | Pedido explícito del usuario tras la primera versión del diseño; pensado para que añadir `/api/v2` sea trivial (directorio paralelo reutilizando controllers/services) |
| Relevance ranking | **Interfaz/estrategia pluggable** (`relevanceStrategy.rank(products, reservationId)`, contrato async desde el día uno) vinculada en un único punto (`src/relevance/index.js`) | El usuario primero eligió la opción simple (sort inline), pero **reconsideró** tras ver el diseño y pidió explícitamente la interfaz intermediaria para abstraer al cliente de cambios futuros en el algoritmo de recomendación — esta es la decisión final vigente |
| Extensibilidad de tipos de campo | **Registry** `type → validador` (`src/fieldTypes/`), usado tanto al crear producto (valida tipos declarados) como al crear orden (valida valores enviados) | Contrato uniforme: cada validador devuelve `{valid, error?}` (no lanza), para poder acumular varios errores de una sola pasada en un array `details[]` |
| Body de `POST /orders` | **Anidado**: `{reservation_id, product_id, fields: {...}}` | Se descartó el body plano por riesgo de colisión de nombres de campo dinámico con `reservation_id`/`product_id` |
| `reservation_id` en `GET /products` | **Obligatorio**, 400 si falta | El brief dice que el ranking futuro va "keyed on reservation_id" |
| `order_fields` vacío en creación de producto | Permitido (`[]` válido) | Producto sin campos dinámicos es un caso válido |
| Campos declarados en orden | **Todos obligatorios** (no hay flag `required` por campo en esta versión) | Simplicidad MVP; extensible después sin romper el registry |
| Claves extra no declaradas en `fields` al crear orden | **Rechazadas** (400) | Detecta typos del cliente en vez de ignorarlos silenciosamente |
| Generación de IDs | Contadores incrementales por repositorio (`prod_1`, `order_1`, ...) | Simple y suficiente para MVP en memoria; aislado en cada repositorio |
| `price` | `number >= 0` obligatorio | — |
| Endpoint `/health` u otros fuera de los 4 pedidos | **No incluidos** | Scope estricto, evitar sobreingeniería |
| README | **Sí**, con instrucciones, ejemplos curl y sección "qué se recortó" | Pedido explícito del usuario |

## 4. Arquitectura y estructura de archivos

```
package.json                         (ESM, deps: solo express)
.gitignore
README.md
verification-results.md              (evidencia de pruebas manuales)
src/
  fieldTypes/
    date.js, string.js, time.js      validadores por tipo, contrato (value) => {valid, error?}
    index.js                         registry + isKnownFieldType() + validateFieldValue()
  repositories/
    products.repository.js           array en memoria; findAll, findById, save, incrementOrderCount
    orders.repository.js             array en memoria; findAll, findById, save
  relevance/
    relevanceStrategy.js             contrato JSDoc: rank(products, reservationId) => Promise<Product[]>
    defaultRelevanceStrategy.js      orderCount desc, dateAdded desc como tiebreaker
    index.js                         binding: exporta la estrategia activa (único punto a cambiar en el futuro)
  services/
    products.service.js              listActiveProducts, getProductById, createProduct
    orders.service.js                createOrder
  controllers/
    products.controller.js
    orders.controller.js
  middlewares/
    errorHandler.js                  + clases ValidationError, NotFoundError
  api/v1/
    products.routes.js, orders.routes.js
    index.js                         agregador montado en /api/v1 desde app.js
  seed/
    products.seed.js                 4 productos: Breakfast, Surf class, Bike rental, Pintxo tour
                                      (enrutado a través de productsService.createProduct para que
                                       un typo en el seed falle ruidosamente al boot)
  app.js                             express.json() + /api/v1 + errorHandler + seeding al boot
  server.js                          app.listen(PORT || <ver nota de estado abajo>)
```

## 5. Modelos de datos

**Product**
```js
{ id, name, description, price, active, dateAdded /* ISO */, orderCount,
  order_fields: [{ name, type }] }
```

**Order**
```js
{ id, reservation_id, product_id, fields: { [nombreCampo]: valor }, createdAt /* ISO */ }
```

## 6. Contratos de los 4 endpoints (bajo `/api/v1`)

1. `GET /products?reservation_id=...` → 200 `{products: [{id, name, description, dateAdded, price}]}`. 400 si falta `reservation_id`.
2. `GET /products/:id` → 200 producto completo incl. `order_fields`. 404 si no existe.
3. `POST /products` → body `{name, description, price, order_fields}` → 201 producto completo. 400 con `details[]` si hay tipos desconocidos o campos inválidos.
4. `POST /orders` → body `{reservation_id, product_id, fields}` → 201 `{order_id}`. 400 si falta `reservation_id`/`product_id` o `fields` no valida contra la config del producto (falta un campo, tipo inválido, o clave extra no declarada); 404 si `product_id` no existe.

Formato de error uniforme: `{ error: { message, details? } }`.

## 7. Verificación ya realizada

- `npm install` + `npm start` → arranque limpio, seed de 4 productos sin errores.
- Los 4 endpoints probados por `curl` con casos válidos **e inválidos** (400 por `reservation_id` ausente, 404 por producto inexistente, 400 por tipo de campo desconocido en creación de producto, 400 por campo faltante/tipo inválido/clave extra en creación de orden).
- Confirmado que `orderCount` sube tras crear una orden y que el ranking de `GET /products` refleja ese cambio (el producto con más pedidos sube de posición).
- Resultado completo (request + response de una segunda tanda de pruebas con datos mockeados) queda documentado en `verification-results.md`, en la raíz del repo.

## 8. Estado actual del repositorio (importante para retomar)

- **Git:** un único commit `aecde6e "feat: Results from interview"` en `main`, que ya incluye **todo** el código, `README.md`, `.gitignore` y `verification-results.md`. El working tree está limpio (`nada para hacer commit`).
- **Remoto:** `origin` → `git@github.com:Aorrihtos/libere-sergio.git`, la rama local está sincronizada con `origin/main` según `git status`. Esto significa que, salvo que quieras el historial de conversación, **la forma más simple de trasladar el proyecto a otro PC es un `git clone`/`git pull` del remoto** — este archivo (`SESSION-CONTEXT.md`) complementa eso con el *porqué* de las decisiones, que no vive en el código.
- **⚠️ Discrepancia detectada, sin resolver:** `src/server.js` tiene actualmente `const PORT = process.env.PORT || 9999;` (cambiado manualmente después de que se fijara en 3005 durante la sesión), pero `README.md` sigue documentando `http://localhost:3005` en todos sus ejemplos curl. Están desincronizados — hay que decidir el puerto definitivo y actualizar el que falte antes de considerar esto "terminado".
- `node_modules/` y `package-lock.json` existen localmente; `node_modules/` está en `.gitignore`, `package-lock.json` no (queda versionado, correcto).

## 9. Pendiente / próximos pasos sugeridos

1. Resolver la discrepancia de puerto (§8) entre `server.js` (9999) y `README.md` (3005).
2. Añadir la suite de tests automatizados (Jest/supertest) — es el recorte explícito documentado, pensado para añadirse con fricción baja gracias a la separación services/repositories.
3. Si el catálogo crece de verdad: implementar `/api/v2` como directorio paralelo bajo `src/api/v2/`, reutilizando controllers/services no afectados (patrón ya dejado preparado).
4. Si llega un servicio de recomendación real: implementar una nueva estrategia que cumpla el contrato `rank(products, reservationId) => Promise<Product[]>` y cambiar únicamente el binding en `src/relevance/index.js`.
