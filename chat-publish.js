var async = require('async');

var room = process.argv[2];
var username = process.argv[3];
var message = process.argv.slice(4).join(" ");

if (!room || !username || !message) {
    console.warn("Usage: node chat-publish.js <room> <username> <message...>");
    process.exit(1);
}

require('./connect')(function(amqp) {
    amqp.exchange('chat', {noDeclare: true}, exchangeReady);

    function exchangeReady(x) {
        console.warn("Messaging %s from %s: %s", room, username, message);

        x.publish(room, {name: username, message: message});
        amqp.end();
    }
})


