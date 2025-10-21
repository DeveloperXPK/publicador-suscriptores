require('dotenv').config();
var amqp = require('amqplib/callback_api');

var amqpConn = null;
var pubChannel = null;
var offlinePubQueue = [];

function start() {
  amqp.connect(process.env.CLOUDAMQP_URL + "?heartbeat=60", function(err, conn) {
    if (err) {
      console.error("[AMQP]", err && err.message);
      return setTimeout(start, 1000);
    }
    conn.on("error", function(err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });
    conn.on("close", function() {
      console.error("[AMQP] reconnecting");
      return setTimeout(start, 1000);
    });
    console.log("[AMQP] connected");
    amqpConn = conn;
    whenConnected();
  });
}

function whenConnected() {
  startPublisher();
  startWorker();
}

function startPublisher() {
  amqpConn.createConfirmChannel(function(err, ch) {
    if (err) {
      console.error("[AMQP] createConfirmChannel", err);
      return;
    }
    ch.on("error", function(err) {
      console.error("[AMQP] channel error", err && err.message);
    });
    ch.on("close", function() {
      console.log("[AMQP] channel closed");
    });

    pubChannel = ch;
    while (true) {
      var m = offlinePubQueue.shift();
      if (!m) break;
      publish(m[0], m[1], m[2]);
    }
  });
}

function publish(exchange, routingKey, content) {
  try {
    if (!pubChannel) {
      // Encolar si el canal aún no está listo
      offlinePubQueue.push([exchange, routingKey, content]);
      return;
    }
    pubChannel.publish(exchange, routingKey, content, { persistent: true }, function(err) {
      if (err) {
        console.error("[AMQP] publish", err);
        offlinePubQueue.push([exchange, routingKey, content]);
        try { pubChannel.connection.close(); } catch(e){}
      }
    });
  } catch (e) {
    console.error("[AMQP] publish", e && e.message);
    offlinePubQueue.push([exchange, routingKey, content]);
  }
}

// Worker (lo dejamos para consumir los mensajes en la misma app)
function startWorker() {
  amqpConn.createChannel(function(err, ch) {
    if (err) { // Si hay un error al crear el canal
      console.error("[AMQP] createChannel", err);
      return;
    }
    ch.on("error", function(err) { // Si hay un error en el canal
      console.error("[AMQP] channel error", err && err.message);
    });
    ch.on("close", function() { // Si el canal se cierra
      console.log("[AMQP] channel closed");
    });

    ch.prefetch(10); // Limitar a 10 mensajes no confirmados

    // Asegurar la cola para los mensajes de la base de datos
    // Aqui definimos el funcionamiento de la cola con lo que recibe
    // ch.assertQueue("suscriptorbd", { durable: true }, function(err, _ok) {
    //   if (err) {
    //     console.error("[AMQP] assertQueue", err);
    //     return;
    //   }
    //   ch.consume("suscriptorbd", function(msg) {
    //     if (!msg) return;
    //     console.log("Worker got msg:", msg.content.toString());
    //     try {
    //       ch.ack(msg);
    //     } catch (e) {
    //       console.error("[AMQP] ack error", e);
    //     }
    //   }, { noAck: false });
    //   console.log("Worker started");
    // });
  });
}

module.exports = {
  start,
  publish
};