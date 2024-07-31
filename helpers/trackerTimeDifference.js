const timeDiff = (date1, date2) => {
  const a = new Date(date1)
  const b = new Date(date2)
  const diff = b.getTime() - a.getTime();

  let msec = diff;
  const hour = Math.floor(msec / 1000 / 60 / 60);
  msec -= hour * 1000 * 60 * 60;
  const minute = Math.floor(msec / 1000 / 60);
  msec -= minute * 1000 * 60;
  const second = Math.floor(msec / 1000);
  msec -= second * 1000;
  return `${hour > 9 ? hour : hour < 0 ? hour : "0" + hour}: ${minute > 9 ? minute : minute < 0 ? minute : "0" + minute
    }: ${second > 9 ? second : second < 0 ? second : "0" + second}`;
};

module.exports = { timeDiff }