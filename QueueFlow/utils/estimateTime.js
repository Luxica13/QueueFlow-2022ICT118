const estimateTime = (position) => {
  const avgTimePerPerson = 5;

  return position * avgTimePerPerson;
};

module.exports = estimateTime;