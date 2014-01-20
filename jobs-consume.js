var markdown = require('markdown').markdown;
var request = require('request');

require('./connect')(function(amqp) {
    amqp.queue('documents.ready', {noDeclare: true}, queueReady);
})

function queueReady(q) {
    q.subscribe({ack: true, prefetchCount: 1}, onMessage);
    function onMessage(msg, headers, info, m) {
        var html = markdown.toHTML(msg.markdown);
        var requestSetup = {
            url: msg.destination,
            body: html,
            headers: { 'Author': process.env.USER }
        };
        request.post(requestSetup, onResponse);
        function onResponse(err, res, body) {
            console.warn("Message delivered to %s: %s", msg.destination, body);
            m.acknowledge();
        }
    }
}
