const cors = require('cors');
const mongoose = require('mongoose');
const express = require('express');
const URI_MONGO = process.env

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(
  'mongodb://mongo:R5CLhFjgW7n1jphQjjBr@containers-us-west-154.railway.app:6399', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB Atlas:'));
db.once('open', () => {
  console.log('Conexión exitosa a MongoDB Atlas');
});

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, 
};
app.use(cors(corsOptions));

app.use(express.json());

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

app.delete('/upload/:imageId', async (req, res) => {
  const imageId = req.params.imageId;  
  try {
    const image = await Image.findById(imageId);
    if (!image) {
      res.status(404).json({ success: false, message: 'Image not found' });
      return;
    }

    await Image.findByIdAndDelete(imageId);
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ success: false, message: 'Error deleting image' });
  }
});

app.post('/upload', async (req, res) => {
  const {ruta} = req.body;
  try {
    await Image.create({ ruta: ruta });
    res.json({ success: true, message: 'Image uploaded and saved successfully' });
  } catch (err) {
    console.error('Error inserting image path into the database:', err);
    res.status(500).json({ success: false, message: 'Error inserting image' });
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
