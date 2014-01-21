var async = require('async');

var question = process.argv.slice(2).join(" ");

if (!question) {
    console.warn("Usage: node 8ball.js <question...>");
    process.exit(1);
}

var question2 = 'Wat?';

require('./connect')(function(amqp) {
    amqp.exchange('8ball', {noDeclare: true}, function(x) {
        makeRequestor(amqp, x, requestorReady);
    });

    function requestorReady(requestor) {

        console.warn("Asking your question: %s", question);
        console.warn("Asking my question: %s", question2);

        async.parallel({
            user: requestor(question),
            computer: requestor(question2)
        }, function(err, answers) {
            if (err) throw err;

            console.warn(
                "Your question: %s\nanswer: %s", question, answers.user
            );
            console.warn(
                "My question: %s\nanswer: %s", question2, answers.computer
            );
            amqp.end();
        });
    }
});

/**
 * Build a reply queue and hide implementation details from callers
 *
 * @param {AMQPConnection} amqp the amqp connection
 * @param {AMQPExchange} x the exchange to publish on
 * @param {function} readyCallback(requestor) called after init completed
 *
 * Requestor is a factory function to create async-friendly task functions:
 * eg.
 *     var task = requestor("Why?");
 *     task(function(err, answer) {
 *         // Will be called when answer is ready
 *     })
 */
function makeRequestor(amqp, x, readyCallback) {
    var queuename = null;
    var counter = 0;
    var pending = {};

    amqp.queue('', {autoDelete: true, exclusive: true}, queueReady);

    // Prepare the reply queue and return requestor
    function queueReady(q) {
        console.warn("Reply queue %s created", q.name);
        q.subscribe({ack: false}, messageReceived);

        queuename = q.name;

        readyCallback(requestor);
    }

    // Factory function to generate async-friendly task functions
    function requestor(question) {
        return function doRequest(answerCallback) {
            var correlation = counter++;
            // Record this callback against the correlation ID
            pending[correlation] = answerCallback;
            console.warn(
                "Publishing message %s to %s with correlationId %d",
                question, queuename, correlation
            );
            x.publish('8ball', question, {
                replyTo: queuename, correlationId: '' + correlation
            });
        };
    }

    function messageReceived(body, headers, info) {
        var correlation = info.correlationId;
        console.warn("Received message with correlationId %s", correlation);
        if (correlation in pending) {
            pending[correlation](null, body.answer);
            delete pending[correlation];
        }
    }
}
