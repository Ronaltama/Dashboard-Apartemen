const mysql = require("mysql2/promise");
const mqtt = require("mqtt");

// Database connection (sama seperti di server.js Anda)
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

// MQTT Client untuk menerima data dari perangkat
const mqttBrokerUrl = "mqtt://broker.mqtt-dashboard.com:1883"; // Gunakan ws:// untuk koneksi WebSocket jika broker Anda mendukungnya (disarankan untuk browser)
const mqttOptions = {
  username: "ronal", // Ganti dengan username MQTT Anda
  password: "ronaltama12345", // Ganti dengan password MQTT Anda
  clientId: "mqtt_data_processor_" + Math.random().toString(16).substr(2, 8),
};
const mqttClient = mqtt.connect(mqttBrokerUrl, mqttOptions);

// Objek untuk menyimpan pembacaan kumulatif terakhir per kamar (untuk perhitungan selisih)
const lastCumulativeReadings = {};

// Objek untuk menyimpan akumulasi konsumsi per kamar dalam interval 1 jam
const hourlyAccumulatedConsumption = {};

mqttClient.on("connect", () => {
  console.log("MQTT Data Processor: Connected to MQTT Broker.");
  mqttClient.subscribe("device/energy/raw_reading/#", (err) => {
    // Subscribed to 'device/energy/raw_reading/#'
    if (!err) {
      console.log(
        "MQTT Data Processor: Subscribed to 'device/energy/raw_reading/#'"
      );
    } else {
      console.error("MQTT Data Processor: Failed to subscribe:", err); // Failed to subscribe
    }
  });
});

mqttClient.on("message", async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString()); // Parse payload
    const roomId = payload.roomId; // Get roomId
    const currentCumulativeWattage = parseFloat(payload.cumulative_wattage); // Get currentCumulativeWattage

    let consumptionThisPeriod = 0;

    // Perhitungan konsumsi untuk periode kecil ini
    if (lastCumulativeReadings[roomId]) {
      // Check lastCumulativeReadings
      const previousReading = lastCumulativeReadings[roomId].cumulative_wattage; // Get previousReading
      consumptionThisPeriod = currentCumulativeWattage - previousReading; // Calculate consumptionThisPeriod
      if (consumptionThisPeriod < 0) {
        // Handle negative consumption
        console.warn(
          `Negative consumption detected for Room ${roomId}. Resetting. Value: ${consumptionThisPeriod}`
        );
        consumptionThisPeriod = 0;
      }
    } else {
      console.log(
        `First reading for Room ${roomId}. Assuming initial consumption is ${currentCumulativeWattage}.`
      );
      // Untuk pembacaan pertama, konsumsi periode ini adalah total pembacaan kumulatif.
      // Namun, ini hanya berlaku jika tidak ada pembacaan sebelumnya sama sekali.
      // Jika Anda hanya ingin menyimpan delta, untuk pembacaan pertama bisa 0 atau diabaikan,
      // tergantung kebutuhan Anda untuk data awal.
      // Untuk tujuan akumulasi, kita akan anggap 0 atau biarkan saja karena nanti akan direset per jam.
      consumptionThisPeriod = currentCumulativeWattage; // Assuming initial consumption is currentCumulativeWattage
    }

    // Perbarui pembacaan kumulatif terakhir
    lastCumulativeReadings[roomId] = {
      cumulative_wattage: currentCumulativeWattage,
    };

    // Akumulasikan konsumsi ke dalam buffer per jam
    if (!hourlyAccumulatedConsumption[roomId]) {
      hourlyAccumulatedConsumption[roomId] = 0;
    }
    hourlyAccumulatedConsumption[roomId] += consumptionThisPeriod;

    console.log(
      `Room ${roomId}: Accumulated ${hourlyAccumulatedConsumption[
        roomId
      ].toFixed(2)}W in current hour buffer.`
    );
  } catch (error) {
    console.error("MQTT Data Processor: Error processing message:", error); // Error processing message
  }
});

mqttClient.on("error", (error) => {
  console.error("MQTT Data Processor: MQTT Connection Error:", error); // MQTT Connection Error
});

mqttClient.on("close", () => {
  console.log("MQTT Data Processor: Disconnected from MQTT Broker."); // Disconnected from MQTT Broker
});

// --- Logika Penyimpanan Data ke Database Setiap Jam ---

// Fungsi untuk menyimpan data yang terakumulasi ke database
const saveHourlyDataToDatabase = async () => {
  const now = new Date(); // Dapatkan waktu saat ini di server
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const date = `${year}-${month}-${day}`; // Tanggal sesuai lokal server

  // Untuk waktu, kita bisa menyimpan jam yang baru saja berlalu
  // Contoh: jika sekarang 14:05, kita akan menyimpan data untuk jam 13:00 - 13:59.
  // Jadi, ambil jam saat ini, lalu kurangi 1 untuk mendapatkan jam yang selesai.
  let hourToSave = now.getHours();
  // Jika ini menit 00-59 dari jam 00, maka jam yang selesai adalah jam 23 kemarin.
  // Atau lebih sederhana, jika sekarang 14:05, kita ingin menyimpan data untuk jam 14.
  // Jika Anda ingin data yang selesai *sepenuhnya* per jam, Anda perlu waktu yang akurat.
  // Lebih baik menggunakan jam saat ini untuk pencatatan per jam
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0"); // Ini akan selalu 00 karena disetel di `scheduleHourlySave`
  const seconds = String(now.getSeconds()).padStart(2, "0"); // Ini akan selalu 00 karena disetel di `scheduleHourlySave`
  const time = `${hours}:${minutes}:${seconds}`;

  for (const roomId in hourlyAccumulatedConsumption) {
    if (hourlyAccumulatedConsumption.hasOwnProperty(roomId)) {
      const accumulatedWattage = hourlyAccumulatedConsumption[roomId];

      if (accumulatedWattage > 0) {
        // Hanya simpan jika ada konsumsi
        try {
          const insertSql = `
            INSERT INTO energy (id_kamar, jumlah, waktu, tanggal)
            VALUES (?, ?, ?, ?)
          `;
          await query(insertSql, [
            roomId,
            accumulatedWattage.toFixed(2),
            time, // Ini adalah waktu saat data disimpan (misal 14:00:00 jika disetel jam 2 siang)
            date, // Ini adalah tanggal saat data disimpan
          ]);
          console.log(
            `Hourly Save: Saved ${accumulatedWattage.toFixed(
              2
            )} kWh for Room ${roomId} at ${date} ${time}`
          );
        } catch (error) {
          console.error(
            `Hourly Save: Error saving data for Room ${roomId}:`,
            error
          );
        }
      }
      // Reset akumulator untuk jam berikutnya
      hourlyAccumulatedConsumption[roomId] = 0;
    }
  }
};

// Jadwalkan fungsi saveHourlyDataToDatabase untuk berjalan setiap jam tepat
const scheduleHourlySave = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();

  // Hitung berapa milidetik lagi sampai awal jam berikutnya
  // Misal sekarang 12:09:17
  // Menit = 9, Detik = 17
  // Waktu sampai jam berikutnya (13:00:00) adalah:
  // (60 - 9) menit = 51 menit
  // (60 - 17) detik = 43 detik (jika menitnya 00, maka ini 0)
  // Kalau mau tepat awal jam (xx:00:00), berarti:
  // (60 - minutes) * 60 * 1000 - (seconds * 1000) - milliseconds
  // Kalau menit dan detik saat ini sudah 00:00, berarti langsung jalankan.
  // Kalau tidak, tunggu sampai awal jam berikutnya.

  let delay;
  if (minutes === 0 && seconds === 0 && milliseconds === 0) {
    delay = 0; // Sudah tepat di awal jam, langsung jalankan
  } else {
    delay = (60 - minutes) * 60 * 1000 - seconds * 1000 - milliseconds;
    if (delay < 0) {
      // Pastikan delay positif jika sudah lewat awal jam
      delay += 60 * 60 * 1000; // Tambahkan 1 jam
    }
  }

  console.log(`Scheduling first hourly save in ${delay / 1000} seconds.`);

  setTimeout(() => {
    saveHourlyDataToDatabase();
    // Setelah dijalankan pertama kali, set interval untuk setiap jam
    setInterval(saveHourlyDataToDatabase, 60 * 60 * 1000); // 1 jam
    console.log("Hourly save interval started.");
  }, delay);
};

// Panggil fungsi untuk menjadwalkan penyimpanan jam pertama
scheduleHourlySave();
