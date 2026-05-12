const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permite peticiones de otros orígenes (tu frontend)
app.use(express.json()); // Permite recibir datos en formato JSON en el body de las peticiones

// Ruta de prueba
app.get('/api/status', (req, res) => {
  res.json({ message: '¡El backend con Express está funcionando correctamente!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});