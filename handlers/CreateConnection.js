const net = require('net');
const { packServiceData } = require('../serializer');
const { encrypt } = require('../encryption');
const { generateID } = require('../generators');

module.exports = async (data, client) => {
    if (!client.sockets) client.sockets = [];
    if (data.host == '10.0.0.1') data.host = '127.0.0.1';
    const socket = net.createConnection({
        host: data.host,
        port: data.port
    }, async () => {
        socket.on('data', async (buffer) => {
            client.send(
                packServiceData(
                    false,
                    [
                        {
                            handler: 'Connection',
                            type: 'Data',
                            data: encrypt(buffer, config.aesKey).toString('binary'),
                            socketId: socket.id
                        }
                    ]
                )
            );
        });
        client.send(
            packServiceData(
                false,
                [
                    {
                        handler: 'Connection',
                        type: 'Open',
                        socketId: socket.id,
                        message: `Connection to ${data.host}:${data.port} open`
                    }
                ]
            )
        );
        client.sockets.push(socket);
    });

    socket.id = data.socketId ?? generateID();
    socket.on('close', async () => {
        client.send(
            packServiceData(
                false,
                [
                    {
                        handler: 'Connection',
                        type: 'Closed',
                        socketId: socket.id,
                        message: `Connection to ${data.host}:${data.port} closed`
                    }
                ]
            )
        );
        client.sockets = client.sockets.filter(s => s != socket);
    });

    client.on('close', async () => {
        for (const sock of client.sockets) {
            sock.destroy();
        }
    });

    client.on('error', async () => {
        for (const sock of client.sockets) {
            sock.destroy();
        }
    });
};