const express = require('express');
const path = require('path');
const rabbit = require('./rabbitmqUpload');
const cors = require('cors')

const app = express();

// Middleware para habilitar CORS 
app.use(cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Inicia conexión a RabbitMQ
rabbit.start();

app.post('/submit', (req, res) => {
  const body = req.body;
  if (!body || Object.keys(body).length === 0) return res.status(400).json({ error: 'empty body' });

  try {
    const buf = Buffer.from(JSON.stringify(body));
    rabbit.publish('preinscripcion.universidad', 'registro.bd', buf);
    rabbit.publish('preinscripcion.universidad', 'registro.email', buf);
    return res.status(200).json({ status: 'enqueued' });
  } catch (err) {
    console.error('Publish error', err);
    return res.status(500).json({ error: 'publish failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HTTP server listening on http://localhost:${PORT}`));