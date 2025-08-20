export default async function handler(req, res) {
  const token = process.env.HA_TOKEN;
  const baseUrl = process.env.HA_BASE_URL;

  const hours = parseInt(req.query.hours) || 24;
  const end = new Date();
  const start = new Date(end.getTime() - hours * 60 * 60 * 1000);

  const sensors = {
    temperature: "sensor.0x00158d008b77ac1d_temperature",
    humidity: "sensor.0x00158d008b77ac1d_humidity",
    battery: "sensor.0x00158d008b77ac1d_battery"
  };

  const result = {
    timestamps: [],
    temperature: [],
    humidity: [],
    battery: []
  };

  try {
    for (const [key, entity_id] of Object.entries(sensors)) {
      const historyRes = await fetch(`${baseUrl}/api/history/period/${start.toISOString()}?filter_entity_id=${entity_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const historyJson = await historyRes.json();
      const dataPoints = historyJson[0] || [];

      result[key] = dataPoints.map(d => parseFloat(d.state));
      if (result.timestamps.length === 0) {
        result.timestamps = dataPoints.map(d => d.last_changed);
      }
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
}
