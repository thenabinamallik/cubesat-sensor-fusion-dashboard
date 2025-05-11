const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const port = 5000;

// MongoDB connection URI
const MONGO_URI = 'mongodb://127.0.0.1:27017/LEODB';

// Middleware setup
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Sensor data schema and model
const sensorSchema = new mongoose.Schema({
  accX: Number,
  accY: Number,
  accZ: Number,
  gyroX: Number,
  gyroY: Number,
  gyroZ: Number,
  temp: Number,
  hum: Number,
  lat: Number,
  lon: Number,
  current: Number,
  timestamp: { type: Date, default: Date.now }
});

const SensorReading = mongoose.model('LEODB', sensorSchema, 'SensorData');

// API endpoint - get latest 32 sensor readings
app.get('/api/sensor-data', async (req, res) => {
  try {
    const data = await SensorReading.find().sort({ timestamp: -1 }).limit(32);
    res.status(200).json(data);
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ message: "Server error retrieving sensor data" });
  }
});

// Create HTTP server and bind to app
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Real-time communication
io.on('connection', (socket) => {
  console.log('🔌 New client connected');

  const sendLatestData = async () => {
    try {
      const latest = await SensorReading.findOne().sort({ timestamp: -1 });
      if (latest) {
        socket.emit('newData', latest);
      }
    } catch (err) {
      console.error("Socket DB fetch error:", err);
    }
  };

  const interval = setInterval(sendLatestData, 1000);

  socket.on('disconnect', () => {
    console.log('❎ Client disconnected');
    clearInterval(interval);
  });
});

// Start server
server.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
