var async = require('async');

var key = process.argv[2] || '#';

require('./connect')(function(amqp) {
    amqp.queue('', {autoDelete: true, exclusive: true}, bindQueue);
    function bindQueue(q) {
        q.bind('logs', key);
        q.once('queueBindOk', function() { queueReady(q); });
    }
})

function queueReady(q) {
    console.warn("Bound to key %s", key);

    q.subscribe({ack: false}, onMessage);
    function onMessage(msg, headers, info) {
        console.log(JSON.stringify(msg));
    }
}
