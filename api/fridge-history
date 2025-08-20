export default async function handler(req, res) {
  const token = process.env.HA_TOKEN;
  const baseUrl = process.env.HA_BASE_URL;
  const hours = parseInt(req.query.hours || "24", 10);

  const sensors = {
    kitchen: {
      temp: "sensor.0x00158d008b77ac1d_temperature",
      hum: "sensor.0x00158d008b77ac1d_humidity",
      batt: "sensor.0x00158d008b77ac1d_battery"
    },
    pizza1: {
      temp: "sensor.0x00158d008b77bf5e_temperature",
      hum: "sensor.0x00158d008b77bf5e_humidity",
      batt: "sensor.0x00158d008b77bf5e_battery"
    },
    pizza2: {
      temp: "sensor.0x00158d008b77ac43_temperature",
      hum: "sensor.0x00158d008b77ac43_humidity",
      batt: "sensor.0x00158d008b77ac43_battery"
    }
  };

  const end = new Date();
  const start = new Date(end.getTime() - hours * 60 * 60 * 1000);

  const params = new URLSearchParams({
    start_time: start.toISOString(),
    end_time: end.toISOString()
  });

  const results = {};

  for (const [fridge, sensorSet] of Object.entries(sensors)) {
    results[fridge] = {
      temperature: [],
      humidity: [],
      battery: []
    };

    for (const [type, entity_id] of Object.entries(sensorSet)) {
      const url = `${baseUrl}/api/history/period/${entity_id}?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const json = await response.json();
      if (json && json[0]) {
        results[fridge][type] = json[0].map(point => ({
          x: point.last_changed,
          y: parseFloat(point.state)
        }));
      }
    }
  }

  res.status(200).json(results);
}
