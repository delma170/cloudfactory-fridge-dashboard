export default async function handler(req, res) {
  const token = process.env.HA_TOKEN; // Set this in Vercel dashboard
  const baseUrl = process.env.HA_BASE_URL; // Also set this in Vercel

  const sensors = {
    kitchen: "sensor.0x00158d008b77ac1d_temperature",
    pizza1: "sensor.0x00158d008b77bf5e_temperature",
    pizza2: "sensor.0x00158d008b77ac43_temperature"
  };

  const results = {};

  for (const [key, entityId] of Object.entries(sensors)) {
    try {
      const response = await fetch(`${baseUrl}/api/states/${entityId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      results[key] = {
        name: data.attributes.friendly_name,
        state: data.state
      };
    } catch (err) {
      results[key] = { error: true };
    }
  }

  res.status(200).json(results);
}
