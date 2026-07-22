import { defaultRelevanceStrategy } from './defaultRelevanceStrategy.js';

// Single binding point: swapping to a recommendation-service-backed strategy
// later means changing only this line, not products.service.js.
export const relevanceStrategy = defaultRelevanceStrategy;
