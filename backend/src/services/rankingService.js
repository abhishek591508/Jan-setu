const THRESHOLDS = require('../config/thresholds');

const hoursSince = (date) => {
  const t = date ? new Date(date).getTime() : Date.now();
  if (!Number.isFinite(t)) return 1;
  return Math.max((Date.now() - t) / 3600000, 1);
};

const visibilityRadiusKm = (upvoteCount) => {
  let radius = THRESHOLDS.radiusTiers[0].radiusKm;
  THRESHOLDS.radiusTiers.forEach((tier) => {
    if (upvoteCount >= tier.minUpvotes) radius = tier.radiusKm;
  });
  return radius;
};

const computeRankScore = (upvoteCount, upvoteVelocity) => {
  const { upvoteWeight, velocityWeight } = THRESHOLDS.ranking;
  return upvoteWeight * upvoteCount + velocityWeight * upvoteVelocity;
};

const computeEscalationLevel = (post) => {
  if (post.status === 'resolved') return post.escalationLevel || 0;

  const ageHours = hoursSince(post.createdAt);
  const { level1, level2 } = THRESHOLDS.escalation;
  let level = post.escalationLevel || 0;

  if (level < 1) {
    if (
      (post.upvoteCount >= level1.upvoteCount && ageHours >= level1.minAgeHours) ||
      post.upvoteCount >= level1.upvoteCountFast
    ) {
      level = 1;
    }
  }

  if (level >= 1 && level < 2) {
    if (post.upvoteCount >= level2.upvoteCount && ageHours >= level2.minAgeHours) {
      level = 2;
    }
  }

  return level;
};

const applyRanking = (post) => {
  const velocity = post.upvoteCount / hoursSince(post.createdAt);
  post.upvoteVelocity = Number(velocity.toFixed(4));
  post.rankScore = Number(computeRankScore(post.upvoteCount, post.upvoteVelocity).toFixed(4));
  post.visibilityRadiusKm = visibilityRadiusKm(post.upvoteCount);
  post.escalationLevel = computeEscalationLevel(post);
  return post;
};

const civicScoreForPost = (upvoteCount) => {
  const { base, upvoteDivisor } = THRESHOLDS.civicScore;
  return Math.floor(upvoteCount / upvoteDivisor) + base;
};

module.exports = {
  applyRanking,
  civicScoreForPost,
  visibilityRadiusKm,
  hoursSince,
};
