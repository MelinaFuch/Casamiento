const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect('mongodb://mongo:R5CLhFjgW7n1jphQjjBr@containers-us-west-154.railway.app:6399', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB Atlas:'));
db.once('open', () => {
  console.log('Conexión exitosa a MongoDB Atlas');
});

// Configurar multer para el manejo de archivos
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Cors de prueba

var corsOptions = {
  origin: "*", // Reemplazar con dominio
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

// Definir rutas y manejadores
// app.use(cors())
app.use(express.json());

// Definir el esquema para la colección de imágenes
const imageSchema = new mongoose.Schema({
  ruta: String,
});

const Image = mongoose.model('Image', imageSchema);

app.get('/upload', async (req, res) => {
  try {
    const images = await Image.find();
    res.json({ success: true, images });
  } catch (err) {
    console.error('Error fetching images from the database:', err);
    res.status(500).json({ success: false, message: 'Error fetching images' });
  }
});

app.delete('/upload', async (req, res) => {
  // const imageId = req.params.imageId;
  const imageId = req.body;
  console.log("console log del upload",imageId)
  
  try {
    const image = await Image.findById(imageId);
    if (!image) {
      res.status(404).json({ success: false, message: 'Image not found' });
      return;
    }

    await Image.findByIdAndDelete(imageId);
    fs.unlink(image.ruta, (err) => {
      if (err) {
        console.error('Error deleting image file:', err);
      }
    });
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ success: false, message: 'Error deleting image' });
  }
});

app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No image file provided' });
    return;
  }

  const imagePath = req.file.path;
  try {
    await Image.create({ ruta: imagePath });
    res.json({ success: true, message: 'Image uploaded and saved successfully' });
  } catch (err) {
    console.error('Error inserting image path into the database:', err);
    res.status(500).json({ success: false, message: 'Error inserting image' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
