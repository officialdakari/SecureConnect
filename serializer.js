const { generateID } = require("./generators");

function packServiceData(error, data) {
    return YAML.stringify({
        error,
        data,
        __g1: generateID(),
        __g2: generateID(),
        __g3: generateID(),
        __g4: generateID()
    });
}

module.exports = {
    packServiceData
};