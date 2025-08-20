// /api/fridge-data.js

export default async function handler(req, res) {
  const { HASS_TOKEN, HASS_URL } = process.env;

  const apiUrl = `${HASS_URL}/api/states`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${HASS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch from Home Assistant" });
    }

    const data = await response.json();
    const fridgeData = data.filter((entity) =>
      ["sensor.fridge_kitchen_temperature", "sensor.fridge_pizza_1_temperature", "sensor.fridge_pizza_2_temperature"].includes(entity.entity_id)
    );

    res.status(200).json(fridgeData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
