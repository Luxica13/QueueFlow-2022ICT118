const AVG_MINUTES_PER_CUSTOMER = 10;

/** Estimated wait from position in line (0 = next to serve among reserved) */
function estimateWaitMinutes(position) {
  return Math.max(0, position) * AVG_MINUTES_PER_CUSTOMER;
}

module.exports = estimateWaitMinutes;
