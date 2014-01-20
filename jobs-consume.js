var markdown = require('markdown').markdown;
var request = require('request');

require('./connect')(function(amqp) {
    amqp.queue('documents.ready', {noDeclare: true}, queueReady);
})

function queueReady(q) {
    q.subscribe({ack: true}, onMessage);
    function onMessage(msg, headers, info) {
        var html = markdown.toHTML(msg.markdown);
        request.post({url: msg.destination, body: html}, onResponse);
        function onResponse(err, res, body) {
            console.warn("Message delivered to %s: %s", msg.destination, body);
            q.shift();
        }
    }
}
