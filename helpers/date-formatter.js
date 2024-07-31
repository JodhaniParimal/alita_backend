function dateAndTimeFormat(dateString, timeZone) {
  try {
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString("default", {
      timeZone: timeZone,
      month: "long",
    });
    const year = dateObj.getFullYear();
    const hour = dateObj.getHours();
    const minute = dateObj.getMinutes();
    return `${day > 9 ? day : "0" + day} ${month} ${year} ${(hour % 12 || 12) > 9 ? (hour % 12 || 12) : "0" + (hour % 12 || 12)
      }:${minute > 9 ? minute : "0" + minute} ${hour >= 12 ? "PM" : "AM"}`;
  } catch (error) {
    return `-----`;
  }
}

function dateFormateAsDMY(dateString, deliminator = "-") {
  try {
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const month = dateObj.getMonth();
    const year = dateObj.getFullYear();

    return `${day >= 9 ? day : "0" + day}${deliminator}${month >= 9 ? month + 1 : "0" + (month + 1)
      }${deliminator}${year}`;
  } catch (error) {
    return `-----`;
  }
}

module.exports = { dateAndTimeFormat, dateFormateAsDMY };