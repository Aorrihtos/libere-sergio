/**
 * Contract every relevance strategy must implement. Declared async from day
 * one: today's implementation is pure in-memory sorting, but a future
 * recommendation-service-backed strategy will need to make a network call,
 * and callers should never have to change to accommodate that.
 *
 * @typedef {Object} RelevanceStrategy
 * @property {(products: object[], reservationId: string) => Promise<object[]>} rank
 */
