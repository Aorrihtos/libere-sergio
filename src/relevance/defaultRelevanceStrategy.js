/** @typedef {import('./relevanceStrategy.js').RelevanceStrategy} RelevanceStrategy */

// Today's naive scoring: popularity first, recency as tiebreaker. Isolated
// here specifically so it can be swapped for a recommendation-service call
// later without touching products.service.js.
// eslint-disable-next-line no-unused-vars
async function rank(products, reservationId) {
  return [...products].sort((a, b) => {
    if (b.orderCount !== a.orderCount) return b.orderCount - a.orderCount;
    return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
  });
}

/** @type {RelevanceStrategy} */
export const defaultRelevanceStrategy = { rank };
