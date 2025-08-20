export default async function handler(req, res) {
  const token = process.env.HA_TOKEN;           // from Vercel Environment Variables
  const baseUrl = process.env.HA_BASE_URL;      // e.g., https://your-home-assistant-url

  const hours = parseInt(req.query.hours) || 24;

  // Define all sensor IDs for each fridge and metric
  const sensorMap = {
    kitchen: {
      temperature: "sensor.0x00158d008b77ac1d_temperature",
      humidity: "sensor.0x00158d008b77ac1d_humidity",
      battery: "sensor.0x00158d008b77ac1d_battery"
    },
    pizza1: {
      temperature: "sensor.0x00158d008b77bf5e_temperature",
      humidity: "sensor.0x00158d008b77bf5e_humidity",
      battery: "sensor.0x00158d008b77bf5e_battery"
    },
    pizza2: {
      temperature: "sensor.0x00158d008b77ac43_temperature",
      humidity: "sensor.0x00158d008b77ac43_humidity",
      battery: "sensor.0x00158d008b77ac43_battery"
    }
  };

  // Time range
  const endTime = new Date().toISOString();
  const startTime = new Date(Date.now() - hours * 3600 * 1000).toISOString();

  const results = {};

  for (const [fridge, sensors] of Object.entries(sensorMap)) {
    results[fridge] = {};

    for (const [metric, entityId] of Object.entries(sensors)) {
      const url = `${baseUrl}/api/history/period/${startTime}?end_time=${endTime}&filter_entity_id=${entityId}&minimal_response=true`;

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          console.error(`Error fetching ${entityId}: ${response.statusText}`);
          throw new Error(`Failed to fetch ${entityId}`);
        }

        const json = await response.json();

        const points = (json[0] || []).map(entry => ({
          x: entry.last_changed,
          y: parseFloat(entry.state)
        })).filter(p => !isNaN(p.y));

        results[fridge][metric] = points;
      } catch (err) {
        console.error(`Fetch error for ${entityId}`, err);
        results[fridge][metric] = [];
      }
    }
  }

  res.status(200).json(results);
}
