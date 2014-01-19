conglomerate-node-client
========================

Sample Node.js client for conglomerate

## Usage

Setup your environment with the location of the AMQP broker

    export AMQP_URL=amqp://un:pw@host:port/vhost

You can now use the scripts below

### Jobs

Comes in two flavours:

`./jobs-get.js`

Reads one message, converts the markdown and acknowledges.

`./jobs-consume.js`

Continually reads one message at a time, converts markdown and acknowledges.

### Logs

`./logs-consume.js [<routing-key>]`

Creates a temporary queue on the logs exchange, and begins streaming JSON to
stdout. Try piping through the command-line tool from [`node-bunyan`][1] to
format nicely.

You can pass an optional routing-key to limit which log messages are received.

[1]: https://github.com/trentm/node-bunyan

### Chat

`./chat-publish.js <room> <name> <message ...>`

Send a message to the chat exchange with the specified room and your name.

### 8ball

`./8ball.js <question ...>`

Sends your question, and a question of the computer's choice to the server.
The responses will be correlated back to the original question via the
correlation id.
