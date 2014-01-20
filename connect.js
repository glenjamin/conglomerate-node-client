var amqp = require('amqp');

module.exports = function(callback/*(connection)*/) {
    var url = process.env.AMQP_URL;
    console.warn("Connecting to %s", url);
    var connection = amqp.createConnection({ url: url }, { reconnect: false });

    connection.on('error', function(err) {
        // This is dumb.
        if (!(err instanceof Error)) {
            err = new Error(err.message)
        }
        // Intentionally handling this badly, just blow up
        throw err;
    });
    connection.on('ready', callback.bind(null, connection));
}

