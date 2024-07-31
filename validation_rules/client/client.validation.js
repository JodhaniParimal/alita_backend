const { checkSchema } = require("express-validator");
const { CLIENT_MESSAGES } = require("../../controller-messages/client-messages/client-messages");

const addClientValidation = () => {
    return checkSchema({
        client_name: {
            exists: {
                errorMessage: CLIENT_MESSAGES.CLIENT_NAME_MISSING,
            },
            notEmpty: {
                errorMessage: CLIENT_MESSAGES.CLIENT_NAME_EMPTY,
            },
        },
    });
};


module.exports = {
    addClientValidation,
};
