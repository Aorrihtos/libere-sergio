const seedPayloads = [
  {
    name: 'Breakfast',
    description: 'Enjoy an amazing breakfast every morning.',
    price: 5,
    order_fields: [
      { name: 'consumption date', type: 'date' },
      { name: 'breakfast type', type: 'string' },
    ],
  },
  {
    name: 'Surf class',
    description: 'Learn to surf with a local instructor.',
    price: 40,
    order_fields: [
      { name: 'class date', type: 'date' },
      { name: 'class time', type: 'time' },
      { name: 'notes', type: 'string' },
    ],
  },
  {
    name: 'Bike rental',
    description: 'Explore the city on two wheels.',
    price: 15,
    order_fields: [
      { name: 'rental date', type: 'date' },
      { name: 'pickup time', type: 'time' },
    ],
  },
  {
    name: 'Pintxo tour',
    description: 'A guided tour through the best pintxo bars in town.',
    price: 30,
    order_fields: [
      { name: 'tour date', type: 'date' },
      { name: 'start time', type: 'time' },
    ],
  },
];

// Routed through productsService.createProduct (not the repository directly)
// so a typo'd field type in seed data fails loudly at boot instead of silently.
export function seedProducts(createProduct) {
  seedPayloads.forEach((payload) => createProduct(payload));
}
