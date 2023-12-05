const net = require('net');
const { packServiceData } = require('../serializer');
const { encrypt } = require('../encryption');
const { generateID } = require('../generators');

module.exports = async (data, client) => {
    if (!client.sockets) client.sockets = [];
    if (data.host == '10.0.0.1') data.host = '127.0.0.1';
    if (!config.allow_localhost_connections && ['127.0.0.1', 'localhost', '::1'].includes(data.host)) {
        client.send(
            packServiceData(
                false,
                [
                    {
                        handler: 'Connection',
                        type: 'Closed',
                        socketId,
                        message: `Connection to ${data.host}:${data.port} closed`
                    }
                ]
            )
        );
        return;
    }
    if (tunnels[`${data.host}:${data.port}`]) {
        const socketId = data.socketId ?? generateID();
        const targetSocketId = generateID();
        const target = tunnels[`${data.host}:${data.port}`];
        if (!target.sockets) target.sockets = [];
        target.send(
            packServiceData(
                false,
                [
                    {
                        handler: 'IncomingConnection',
                        type: 'Open',
                        port: data.port,
                        source: client.username,
                        socketId: targetSocketId,
                        message: `New incoming connection from ${client.username} on port ${data.port}`
                    }
                ]
            )
        );
        client.send(
            packServiceData(
                false,
                [
                    {
                        handler: 'Connection',
                        type: 'Open',
                        socketId,
                        message: `Connection to ${data.host}:${data.port} open`
                    }
                ]
            )
        );
        client.sockets.push({
            write(data) {
                target.send(
                    packServiceData(
                        false,
                        [
                            {
                                handler: 'IncomingConnection',
                                type: 'Data',
                                port: data.port,
                                socketId: targetSocketId,
                                data: encrypt(data, config.aesKey).toString('binary'),
                                source: client.username
                            }
                        ]
                    )
                );
            },
            destroy() {
                client.send(
                    packServiceData(
                        false,
                        [
                            {
                                handler: 'Connection',
                                type: 'Closed',
                                socketId,
                                message: `Connection to ${data.host}:${data.port} closed`
                            }
                        ]
                    )
                );
                target.send(
                    packServiceData(
                        false,
                        [
                            {
                                handler: 'IncomingConnection',
                                type: 'Closed',
                                socketId: targetSocketId,
                                message: `Incoming connection from ${client.username} to ${data.host}:${data.port} closed`
                            }
                        ]
                    )
                );
                client.sockets = client.sockets.filter(x => x.id != socketId);
                target.sockets = target.sockets.filter(x => x.id != targetSocketId);
            },
            id: socketId
        });
        target.sockets.push({
            write(data) {
                client.send(
                    packServiceData(
                        false,
                        [
                            {
                                handler: 'Connection',
                                type: 'Data',
                                port: data.port,
                                socketId,
                                data: encrypt(data, config.aesKey).toString('binary')
                            }
                        ]
                    )
                );
            },
            destroy() {
                client.send(
                    packServiceData(
                        false,
                        [
                            {
                                handler: 'Connection',
                                type: 'Closed',
                                socketId,
                                message: `Connection to ${data.host}:${data.port} closed`
                            }
                        ]
                    )
                );
                target.send(
                    packServiceData(
                        false,
                        [
                            {
                                handler: 'IncomingConnection',
                                type: 'Closed',
                                socketId: targetSocketId,
                                message: `Incoming connection from ${client.username} to ${data.host}:${data.port} closed`
                            }
                        ]
                    )
                );
                client.sockets = client.sockets.filter(x => x.id != socketId);
                target.sockets = target.sockets.filter(x => x.id != targetSocketId);
            },
            id: targetSocketId
        });
        return;
    }
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