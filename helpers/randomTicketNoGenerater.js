const Tech_support = require("../models/tech_support/tech_support.model");

function generateRandomNumbers(min = 1, max = 9999999999999999) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateTicketCode() {
  let forceStop = 10;
  let ticketCount = 0;
  let code = null;
  do {
    const _code = await generateRandomNumbers(1000000, 9999999);
    ticketCount = await Tech_support.count({
      ticket_code: _code,
      ticket_status: "close",
    });
    if (ticketCount <= 0) {
      code = _code;
    }
    forceStop--;
  } while (ticketCount > 0 && forceStop > 0);
  return code;
}

const codeGenerator = { generateTicketCode };

module.exports = { codeGenerator };
