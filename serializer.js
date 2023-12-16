const { generateID, generateGarbage } = require("./generators");

function packServiceData(error, data) {
    return YAML.stringify({
        error,
        data,
        garbage: generateGarbage(),
        timestamp: Date.now()
    });
}

module.exports = {
    packServiceData
};