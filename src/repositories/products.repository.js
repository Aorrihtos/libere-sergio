const products = [];
let nextId = 1;

export function findAll() {
  return products.map((product) => ({ ...product }));
}

export function findById(id) {
  const product = products.find((item) => item.id === id);
  return product ? { ...product } : undefined;
}

// Takes a creation payload ({name, description, price, order_fields}) and
// stamps in the fields owned by the repository: id, dateAdded, orderCount, active.
export function save(productData) {
  const product = {
    id: `prod_${nextId++}`,
    name: productData.name,
    description: productData.description,
    price: productData.price,
    order_fields: productData.order_fields,
    active: true,
    dateAdded: new Date().toISOString(),
    orderCount: 0,
  };
  products.push(product);
  return { ...product };
}

export function incrementOrderCount(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return undefined;
  product.orderCount += 1;
  return { ...product };
}
