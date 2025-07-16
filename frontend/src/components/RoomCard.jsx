import React, { useState, useEffect } from "react";
import EnergyChart from "./EnergyChart";
import FilterControls from "./FilterControls";
import DatePicker from "./DatePicker";
import { getEnergyData, downloadReport } from "../services/api";

const RoomCard = ({ room }) => {
  const [energyData, setEnergyData] = useState([]);
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [filter, setFilter] = useState("daily");
  const [dateParam, setDateParam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil buffer realtime saat filter daily
  useEffect(() => {
    let ws;
    const today = new Date().toISOString().split("T")[0];
    if (filter === "daily" && (!dateParam || dateParam === today)) {
      setLoading(true);
      // Fetch buffer realtime dari backend
      fetch(`http://localhost:5002/api/realtime/${room.id_kamar}`)
        .then((res) => res.json())
        .then((data) => {
          setEnergyData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));

      // Listen WebSocket untuk update realtime
      ws = new window.WebSocket("ws://localhost:5001");
      ws.onopen = () => {
        console.log("WebSocket connected (frontend)");
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (String(data.roomId) === String(room.id_kamar)) {
            setEnergyData((prev) => {
              const arr = [...prev, data.value];
              return arr.slice(-10);
            });
          }
        } catch (err) {
          console.error("WebSocket message error:", err);
        }
      };
      ws.onerror = (err) => {
        console.error("WebSocket error (frontend):", err);
      };
    } else if (filter === "daily" && dateParam && dateParam !== today) {
      // Bukan hari ini: fetch data per jam dari database
      setLoading(true);
      fetch(
        `http://localhost:5002/api/energy_hourly/${room.id_kamar}?date=${dateParam}`
      )
        .then((res) => res.json())
        .then((data) => {
          setEnergyData(data.map((d) => parseFloat(d.jumlah_wh)));
          setLoading(false);
        })
        .catch(() => setLoading(false));
      // Jangan listen websocket
      return;
    }

    // Cleanup function SELALU di luar if
    return () => {
      if (ws) ws.close();
    };
  }, [room.id_kamar, filter, dateParam]);

  // Fetch totalEnergy dari database (harian)
  useEffect(() => {
    if (filter === "daily") {
      const fetchTotal = async () => {
        try {
          // GUNAKAN dateParam JIKA ADA, JIKA TIDAK GUNAKAN HARI INI
          const targetDate =
            dateParam || new Date().toISOString().split("T")[0];

          const data = await getEnergyData(room.id_kamar, "daily", {
            date: targetDate, // <-- PERBAIKAN: Gunakan tanggal yang benar
          });

          // Ambil total dari database (jumlah harian)
          const total = data.reduce(
            (sum, item) => sum + parseFloat(item.jumlah || 0),
            0
          );
          setTotalEnergy(total.toFixed(2));
        } catch (error) {
          setTotalEnergy(0);
        }
      };
      fetchTotal();
    }
  }, [room.id_kamar, filter, dateParam]);

  // Fetch data untuk weekly/monthly
  useEffect(() => {
    if (filter !== "daily") {
      const fetchEnergyData = async () => {
        try {
          setLoading(true);
          let params = {};
          if (dateParam) {
            if (filter === "weekly") {
              params.startDate = dateParam.startDate;
              params.endDate = dateParam.endDate;
            } else if (filter === "monthly") {
              params.month = dateParam;
            }
          }
          const data = await getEnergyData(room.id_kamar, filter, params);
          setEnergyData(data);
          const total = data.reduce((sum, item) => {
            return sum + parseFloat(item.jumlah || item.total || 0);
          }, 0);
          setTotalEnergy(total.toFixed(2));
        } catch (error) {
          setTotalEnergy(0);
        } finally {
          setLoading(false);
        }
      };
      fetchEnergyData();
    }
  }, [room.id_kamar, filter, dateParam]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setDateParam(null);
  };

  const handleDownloadReport = async () => {
    try {
      let params = {};
      if (dateParam) {
        if (filter === "daily") {
          params.date = dateParam;
        } else if (filter === "weekly") {
          params.startDate = dateParam.startDate;
          params.endDate = dateParam.endDate;
        } else if (filter === "monthly") {
          params.month = dateParam;
        }
      }
      await downloadReport(room.id_kamar, filter, params);
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] ${
        room.status_kamar
          ? "border-l-4 border-green-500"
          : "border-l-4 border-gray-400"
      }`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Room {room.nomer_kamar}
            </h3>
            <div className="flex items-center mt-1">
              <span
                className={`inline-block w-3 h-3 rounded-full mr-2 ${
                  room.status_kamar ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
              <span className="text-sm text-gray-600">
                {room.status_kamar ? "Occupied" : "Vacant"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {totalEnergy} kWh
            </div>
            <div className="text-xs text-gray-500">Total Energy</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
          <FilterControls
            currentFilter={filter}
            onFilterChange={handleFilterChange}
          />
          <DatePicker
            value={dateParam}
            onChange={setDateParam}
            filter={filter}
          />
        </div>

        <div className="mt-4 h-48">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : energyData.length > 0 ? (
            <EnergyChart
              data={energyData}
              filter={filter}
              dateParam={dateParam}
            />
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500">
              No energy data available
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleDownloadReport}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
