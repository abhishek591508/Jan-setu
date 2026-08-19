const THRESHOLDS = {
  radiusTiers: [
    { minUpvotes: 0, radiusKm: 1 },
    { minUpvotes: 5, radiusKm: 3 },
    { minUpvotes: 15, radiusKm: 8 },
    { minUpvotes: 40, radiusKm: 20 },
  ],
  escalation: {
    level1: { upvoteCount: 10, minAgeHours: 12, upvoteCountFast: 25 },
    level2: { upvoteCount: 40, minAgeHours: 48 },
  },
  ranking: {
    upvoteWeight: 2,
    velocityWeight: 10,
  },
  civicScore: {
    base: 5,
    upvoteDivisor: 2,
  },
  feedLimit: 50,
};

module.exports = THRESHOLDS;
