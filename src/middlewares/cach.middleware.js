export const cache = (keyGenerator, ttl = 3600) => async (req, res, next) => {
  next();
};