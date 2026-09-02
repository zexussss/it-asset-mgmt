/**
 * Whole days between a RepairRequest's createdDate and resolvedDate.
 * Single source of truth for this formula: used both when a repair is
 * closed via RepairService.completeRepair and when resolvedDate is set
 * directly (e.g. by an admin) via AdminService.RepairRequests.
 */
function calculateResolutionDays(createdDate, resolvedDate) {
  if (!createdDate || !resolvedDate) return null;
  return Math.max(0, Math.round((new Date(resolvedDate) - new Date(createdDate)) / 86400000));
}

module.exports = { calculateResolutionDays };
