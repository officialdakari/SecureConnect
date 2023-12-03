const { packServiceData } = require("../serializer");

module.exports = async (data, client) => {
    const user = config.users.find(
        u =>
            u.username == data.username && 
            u.password == data.password
    );
    if (!user) {
        return client.send(
            packServiceData(
                true,
                [
                    {
                        handler: 'Authorization',
                        type: 'Failed',
                        message: 'Invalid username or password'
                    }
                ]
            )
        );
    }
    client.username = data.username;
    client.send(
        packServiceData(
            false,
            [
                {
                    handler: 'Authorization',
                    type: 'Success',
                    message: 'Successfully authorized'
                }
            ]
        )
    );
};