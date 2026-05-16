const estimateTime = (position) => {
  const avgMinutesPerUser = 10;

  return position * avgMinutesPerUser;
};

module.exports = estimateTime;