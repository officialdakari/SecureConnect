const crypto = require('crypto');
const algorithm = 'aes-256-cbc';

const secret_iv = 'aideiZ3HuiTeigovno';
const iv = crypto
    .createHash('sha512')
    .update(secret_iv)
    .digest('hex')
    .substring(0, 16)

function encrypt(text, key) {
    const cipher = crypto.createCipheriv(algorithm, crypto
        .createHash('sha512')
        .update(key)
        .digest('hex')
        .substring(0, 32), iv);
    let encrypted = cipher.update(text, 'binary', 'binary');
    encrypted += cipher.final('binary');
    return Buffer.from(encrypted, 'binary');
}

function decrypt(text, key) {
    const decipher = crypto.createDecipheriv(algorithm, crypto
        .createHash('sha512')
        .update(key)
        .digest('hex')
        .substring(0, 32), iv);
    let decrypted = decipher.update(text, 'binary', 'binary');
    decrypted += decipher.final('binary');
    return Buffer.from(decrypted, 'binary');
}

module.exports = {
    encrypt, decrypt
};