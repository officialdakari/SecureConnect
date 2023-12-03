module.exports = async (data, client) => {
    if (!client.sockets) client.sockets = [];
    const sock = client.sockets.find(socket => socket.id == data.socketId);
    if (sock) {
        sock.destroy();
    }
    client.sockets = client.sockets.filter(sock => sock.id != data.socketId);
};