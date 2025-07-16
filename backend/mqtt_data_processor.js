const mysql = require("mysql2/promise");
const mqtt = require("mqtt");
const WebSocket = require("ws");
const express = require("express");
const cors = require("cors");

// Database connection
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "dashboard_apart",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Simpan 10 data realtime terakhir per room
const realtimeBuffer = {}; // { [roomId]: [angka, ...] }

// Buffer untuk akumulasi per jam
const hourlyBuffer = {}; // { [roomId]: { sum: 0, count: 0 } }

// WebSocket server untuk broadcast ke frontend
const wss = new WebSocket.Server({ port: 5001 });
function broadcastRealtime(roomId, value) {
  const msg = JSON.stringify({ roomId, value });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// Express REST API untuk ambil data realtime buffer
const app = express();
app.use(cors());
app.get("/api/realtime/:roomId", (req, res) => {
  const { roomId } = req.params;
  res.json(realtimeBuffer[roomId] || []);
});
app.get("/api/energy_hourly/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const { date } = req.query;
  const sql = `
    SELECT waktu, jumlah_wh 
    FROM energy_hourly 
    WHERE id_kamar = ? AND tanggal = ?
    ORDER BY waktu
  `;
  const data = await query(sql, [roomId, date]);
  res.json(data);
});
const REST_PORT = 5002;
app.listen(REST_PORT, () => {
  console.log(`Realtime REST API running on http://localhost:${REST_PORT}`);
});

// MQTT Client untuk menerima data dari perangkat
const mqttBrokerUrl = "203.175.11.155:1883";
const mqttOptions = {
  username: "wiwan",
  password: "35k4nu54",
  clientId: "mqtt_data_processor_" + Math.random().toString(16).substr(2, 8),
};
const mqttClient = mqtt.connect(mqttBrokerUrl, mqttOptions);

mqttClient.on("connect", () => {
  console.log("MQTT Data Processor: Connected to MQTT Broker.");
  mqttClient.subscribe(
    "controller/0AB03/sensor/pm_active_power/state",
    (err) => {
      if (!err) console.log("controller/0AB03/sensor/pm_active_power/state");
    }
  );
  mqttClient.subscribe(
    "controller/0AB03/sensor/pm_total_active_energy/state",
    (err) => {
      if (!err)
        console.log(
          "Subscribed to controller/0AB03/sensor/pm_total_active_energy/state"
        );
    }
  );
});

mqttClient.on("message", async (topic, message) => {
  try {
    if (topic.startsWith("controller/0AB03/sensor/pm_active_power/state")) {
      // Data realtime: simpan ke buffer & broadcast ke frontend
      const value = Number(message.toString());
      const roomId = topic.split("/").pop();
      if (!realtimeBuffer[roomId]) realtimeBuffer[roomId] = [];
      realtimeBuffer[roomId].push(value);
      realtimeBuffer[roomId] = realtimeBuffer[roomId].slice(-10); // simpan max 10 data terakhir
      broadcastRealtime(roomId, value);

      // Buffer untuk akumulasi per jam
      if (!hourlyBuffer[roomId]) hourlyBuffer[roomId] = { sum: 0, count: 0 };
      hourlyBuffer[roomId].sum += value; // value dalam watt
      hourlyBuffer[roomId].count += 1;
    } else if (
      topic.startsWith("controller/0AB03/sensor/pm_total_active_energy/state")
    ) {
      // Data harian: simpan delta ke database
      const payload = JSON.parse(message.toString());
      const roomId = payload.roomId;
      const totalToday = parseFloat(payload.total);
      const tanggal = payload.date; // format YYYY-MM-DD

      // Ambil data total hari sebelumnya dari database
      const [prev] = await query(
        "SELECT jumlah, tanggal FROM energy WHERE id_kamar = ? AND tanggal < ? ORDER BY tanggal DESC LIMIT 1",
        [roomId, tanggal]
      );
      let delta = totalToday;
      if (prev) {
        delta = totalToday - parseFloat(prev.jumlah);
        if (delta < 0) delta = 0; // Hindari delta negatif
      }

      // Simpan delta ke database
      await query(
        "INSERT INTO energy (id_kamar, jumlah, waktu, tanggal) VALUES (?, ?, ?, ?)",
        [roomId, delta, "23:59:59", tanggal]
      );
      console.log(
        `Saved daily delta energy for Room ${roomId} on ${tanggal}: ${delta} kWh (totalToday: ${totalToday}, prev: ${
          prev ? prev.jumlah : 0
        })`
      );
    }
  } catch (error) {
    console.error("MQTT Data Processor: Error processing message:", error);
  }
});

mqttClient.on("error", (error) => {
  console.error("MQTT Data Processor: MQTT Connection Error:", error);
});

mqttClient.on("close", () => {
  console.log("MQTT Data Processor: Disconnected from MQTT Broker.");
});

wss.on("listening", () => {
  console.log("WebSocket server running on ws://localhost:5001");
});

// Setiap jam, simpan data akumulasi per jam ke database
async function saveHourlyData() {
  const now = new Date();
  const jam = now.toTimeString().slice(0, 5) + ":00";
  const tanggal = now.toISOString().slice(0, 10);
  for (const roomId in hourlyBuffer) {
    const { sum, count } = hourlyBuffer[roomId];
    if (count > 0) {
      // Misal data dikirim tiap 6 menit (10x per jam), Wh = sum * 6/60
      // Atau, jika data dikirim tiap x detik: Wh = sum * (interval detik) / 3600
      // Contoh: data per 6 menit (360 detik): Wh = sum * 360 / 3600 = sum * 0.1
      const wh = sum * 0.1; // sesuaikan dengan interval pengiriman
      await query(
        "INSERT INTO energy_hourly (id_kamar, jumlah_wh, waktu, tanggal) VALUES (?, ?, ?, ?)",
        [roomId, wh, jam, tanggal]
      );
    }
    hourlyBuffer[roomId] = { sum: 0, count: 0 };
  }
}
setInterval(saveHourlyData, 60 * 60 * 1000); // setiap jam
