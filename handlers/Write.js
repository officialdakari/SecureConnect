const { decrypt } = require("../encryption");

module.exports = async (data, client) => {
    if (!client.sockets) client.sockets = [];
    const sock = client.sockets.find(socket => socket.id == data.socketId);
    const d = decrypt(data.data, config.aesKey);
    sock.write(d);
};