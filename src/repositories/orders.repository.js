const orders = [];
let nextId = 1;

export function findAll() {
  return orders.map((order) => ({ ...order }));
}

export function findById(id) {
  const order = orders.find((item) => item.id === id);
  return order ? { ...order } : undefined;
}

export function save(orderData) {
  const order = {
    id: `order_${nextId++}`,
    reservation_id: orderData.reservation_id,
    product_id: orderData.product_id,
    fields: orderData.fields,
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  return { ...order };
}
