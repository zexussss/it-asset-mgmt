
function calculateResolutionDays(createdDate, resolvedDate) {
  if (!createdDate || !resolvedDate) return null;
  return Math.max(0, Math.round((new Date(resolvedDate) - new Date(createdDate)) / 86400000));
}

module.exports = { calculateResolutionDays };
