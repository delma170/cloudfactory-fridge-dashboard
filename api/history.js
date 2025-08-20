export default async function handler(req, res) {
  const token = process.env.HA_TOKEN;
  const baseUrl = process.env.HA_URL;

  const { hours } = req.query;
  const duration = parseInt(hours) || 24;

  const since = new Date(Date.now() - duration * 60 * 60 * 1000).toISOString();

  const entities = [
    "sensor.0x00158d008b77ac1d_temperature",
    "sensor.0x00158d008b77ac1d_humidity",
    "sensor.0x00158d008b77ac1d_battery",
    "sensor.0x00158d008b77bf5e_temperature",
    "sensor.0x00158d008b77bf5e_humidity",
    "sensor.0x00158d008b77bf5e_battery",
    "sensor.0x00158d008b77ac43_temperature",
    "sensor.0x00158d008b77ac43_humidity",
    "sensor.0x00158d008b77ac43_battery"
  ];

  try {
    const response = await fetch(`${baseUrl}/api/history/period/${since}?filter_entity_id=${entities.join(",")}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load history data" });
  }
}
