const { packServiceData } = require("../serializer");
var sockets = {};
module.exports = async (data, client) => {
    const user = config.users.find(
        u =>
            u.username == data.username &&
            u.password == data.password
    );
    if (!user) {
        return client.queue(
            {
                handler: 'Authorization',
                type: 'Failed',
                message: 'Invalid username or password'
            }
        );
    }
    if (!sockets[data.username]) {
        sockets[data.username] = [];
    }
    client.sockets = sockets[data.username];
    client.username = data.username;
    client.tunnels = data.tunnels;
    if (user.ip && client.tunnels) {
        for (const port in client.tunnels) {
            tunnels[`${user.ip}:${port}`] = client;
        }
    }
    client.queue(
        {
            handler: 'Authorization',
            type: 'Success',
            message: 'Successfully authorized'
        }
    );
};