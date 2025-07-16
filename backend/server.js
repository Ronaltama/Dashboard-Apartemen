const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const pdf = require("pdfkit");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

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

// Helper function to query database
async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Get all floors
app.get("/api/floors", async (req, res) => {
  try {
    const floors = await query("SELECT * FROM lantai");
    res.json(floors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get rooms by floor
app.get("/api/rooms/:floorId", async (req, res) => {
  try {
    const { floorId } = req.params;
    const rooms = await query("SELECT * FROM kamar WHERE id_lantai = ?", [
      floorId,
    ]);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get energy data (daily/weekly/monthly)
app.get("/api/energy/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { period = "daily", date, startDate, endDate, month } = req.query;

    let sql;
    let params = [roomId];

    switch (period) {
      case "daily":
        const dailyDate = date || new Date().toISOString().split("T")[0];
        sql = `
          SELECT waktu, jumlah 
          FROM energy 
          WHERE id_kamar = ? AND tanggal = ?
          ORDER BY waktu
        `;
        params.push(dailyDate);
        break;

      case "weekly":
        let weekStart, weekEnd;
        if (startDate && endDate) {
          weekStart = startDate;
          weekEnd = endDate;
        } else {
          const baseDate = new Date();
          weekStart = new Date(baseDate);
          weekStart.setDate(baseDate.getDate() - baseDate.getDay());
          weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekStart = weekStart.toISOString().split("T")[0];
          weekEnd = weekEnd.toISOString().split("T")[0];
        }
        sql = `
          SELECT DATE(tanggal) as date, SUM(jumlah) as total
          FROM energy
          WHERE id_kamar = ? 
            AND tanggal BETWEEN ? AND ?
          GROUP BY DATE(tanggal)
          ORDER BY DATE(tanggal)
        `;
        params.push(weekStart, weekEnd);
        break;

      case "monthly":
        let monthStart, monthEnd;
        if (month) {
          const [year, monthNum] = month.split("-").map(Number);
          monthStart = new Date(year, monthNum - 1, 1);
          monthEnd = new Date(year, monthNum, 0);
        } else {
          const today = new Date();
          monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        }
        monthStart = monthStart.toISOString().split("T")[0];
        monthEnd = monthEnd.toISOString().split("T")[0];
        sql = `
          SELECT 
            DATE(tanggal) as date,
            SUM(jumlah) as total
          FROM energy
          WHERE id_kamar = ? 
            AND tanggal BETWEEN ? AND ?
          GROUP BY DATE(tanggal)
          ORDER BY DATE(tanggal)
        `;
        params.push(monthStart, monthEnd);
        break;

      default:
        return res.status(400).json({ error: "Invalid period parameter" });
    }

    const data = await query(sql, params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate PDF report (tidak diubah)
app.get("/api/energy/:roomId/report", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { period = "daily", date, startDate, endDate, month } = req.query;

    // Get room details
    const [room] = await query("SELECT * FROM kamar WHERE id_kamar = ?", [
      roomId,
    ]);

    // Determine date range based on period and parameters
    let dateRange = "";
    let whereClause = "";
    let queryParams = [roomId];

    switch (period) {
      case "daily":
        const dailyDate = date || new Date().toISOString().split("T")[0];
        whereClause = "AND tanggal = ?";
        queryParams.push(dailyDate);
        dateRange = `Date: ${dailyDate}`;
        break;

      case "weekly":
        let weekStart, weekEnd;
        if (startDate && endDate) {
          weekStart = startDate;
          weekEnd = endDate;
        } else {
          const baseDate = new Date();
          weekStart = new Date(baseDate);
          weekStart.setDate(baseDate.getDate() - baseDate.getDay());
          weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekStart = weekStart.toISOString().split("T")[0];
          weekEnd = weekEnd.toISOString().split("T")[0];
        }
        whereClause = "AND tanggal BETWEEN ? AND ?";
        queryParams.push(weekStart, weekEnd);
        dateRange = `From ${weekStart} to ${weekEnd}`;
        break;

      case "monthly":
        let monthStart, monthEnd;
        if (month) {
          const [year, monthNum] = month.split("-").map(Number);
          monthStart = new Date(year, monthNum - 1, 1);
          monthEnd = new Date(year, monthNum, 0);
        } else {
          const today = new Date();
          monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        }
        monthStart = monthStart.toISOString().split("T")[0];
        monthEnd = monthEnd.toISOString().split("T")[0];
        whereClause = "AND tanggal BETWEEN ? AND ?";
        queryParams.push(monthStart, monthEnd);
        dateRange = `Month: ${new Date(monthStart).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}`;
        break;
    }

    // Get energy data
    const data = await query(
      `
      SELECT 
        DATE(tanggal) as date,
        SUM(jumlah) as total
      FROM energy 
      WHERE id_kamar = ?
        ${whereClause}
      GROUP BY DATE(tanggal)
      ORDER BY DATE(tanggal)
    `,
      queryParams
    );

    // Calculate totals
    const totalEnergy = data
      .reduce((sum, item) => sum + parseFloat(item.total), 0)
      .toFixed(2);

    // Create PDF
    const doc = new pdf();
    const fileName = `energy-report-room-${room.nomer_kamar}-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text("Energy Consumption Report", { align: "center" });
    doc.moveDown();

    // Room details
    doc.fontSize(14).text(`Room: ${room.nomer_kamar}`);
    doc
      .fontSize(14)
      .text(`Period: ${period.charAt(0).toUpperCase() + period.slice(1)}`);
    doc.fontSize(14).text(dateRange);
    doc.fontSize(14).text(`Total Consumption: ${totalEnergy} kWh`);
    doc.moveDown();

    // Table header
    doc.font("Helvetica-Bold");
    doc.fontSize(12);
    doc.text("Date", 50, doc.y);
    doc.text("Total Consumption (kWh)", 250, doc.y);
    doc.moveDown();

    // Table rows
    doc.font("Helvetica");
    data.forEach((item) => {
      doc.fontSize(10);
      doc.text(item.date, 50, doc.y);
      doc.text(item.total.toString(), 250, doc.y);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
