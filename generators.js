function randomInt(max, min) {
    if (!min) min = 0;
    return Math.floor(Math.random() * (max - min)) + min;
}

function generateID() {
    const alphabet = 'qwertyuiopasdfghjklzxcvbnm';
    var password = '';
    for (let i = 0; i < 32; i++) {
        password += alphabet[randomInt(alphabet.length)];
    }
    return password;
}

module.exports = {
    generateID,
    randomInt
};