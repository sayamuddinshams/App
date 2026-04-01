const express = require("express");
const app = express();
const axios = require("axios");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Fullstack with PostgreSQL</title>
        <style>
          body {
            margin: 0;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: linear-gradient(135deg, #070a3b 0%, #1f525d 100%);
            color: #f7f9fc;
            min-height: 100vh;
            display: grid;
            place-items: center;
          }
          .card {
            background: rgba(255, 255, 255, 0.10);
            border: 1px solid rgba(255, 255, 255, 0.20);
            border-radius: 20px;
            box-shadow: 0 20px 70px rgba(0, 0, 0, 0.35);
            backdrop-filter: blur(14px);
            padding: 28px 32px;
            width: min(680px, 95vw);
            text-align: center;
          }
          h1 {
            margin: 0 0 12px;
            font-size: 2rem;
          }
          .controls,
          .storage {
            margin-top: 20px;
            text-align: left;
          }
          .controls input,
          .controls button {
            width: 100%;
            padding: 12px 14px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            font-size: 1rem;
            margin-bottom: 12px;
          }
          .controls input {
            margin-bottom: 12px;
          }
          button {
            background: linear-gradient(90deg, #71e1f7 0%, #44d9b7 100%);
            color: #0f1420;
            font-weight: 700;
            border: none;
            cursor: pointer;
            transition: transform .2s ease, box-shadow .2s ease;
          }
          button:hover:not([disabled]) {
            transform: translateY(-1px);
            box-shadow: 0 10px 24px rgba(12, 142, 223, .45);
          }
          button:disabled {
            opacity: .6;
            cursor: not-allowed;
          }
          #message {
            margin-top: 8px;
            min-height: 1.2em;
            color: #d5f8ff;
          }
          .items-list {
            margin-top: 16px;
            max-height: 260px;
            overflow-y: auto;
            background: rgba(12, 24, 50, 0.45);
            border-radius: 12px;
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.15);
          }
          .item {
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
            padding: 8px 0;
            color: #e7f7ff;
          }
          .item:last-child {
            border-bottom: none;
          }
          .item .meta {
            font-size: 0.82rem;
            opacity: 0.75;
          }
          .delete-btn {
            margin-top: 8px;
            width: 100%;
            padding: 8px 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            background: #ff5f6d;
            color: #fff;
            font-weight: 700;
            cursor: pointer;
            transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
          }
          .delete-btn:hover {
            background: #ff394d;
            transform: translateY(-1px);
            box-shadow: 0 8px 20px rgba(255, 43, 67, 0.36);
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>PostgreSQL persistence demo</h1>
          <p>Create an item, store in DB, and display in UI list.</p>
          <div class="controls">
            <input id="item-text" type="text" placeholder="Enter text to save" />
            <button id="save-item">Save item</button>
            <button id="load-items">Load items</button>
            <p id="message">Backend endpoint: <code>/api/items</code></p>
          </div>
          <div class="storage">
            <h2>Stored Items</h2>
            <div id="items" class="items-list"></div>
          </div>
        </div>

        <script>
          const itemText = document.getElementById("item-text");
          const saveItem = document.getElementById("save-item");
          const loadItems = document.getElementById("load-items");
          const messageEl = document.getElementById("message");
          const itemsEl = document.getElementById("items");

          async function refreshItems() {
            try {
              const res = await fetch("/api/items");
              if (!res.ok) throw new Error("HTTP " + res.status);
              const data = await res.json();
              itemsEl.innerHTML = data.items
                .map(i => '<div class="item"><div>' + i.text + '</div><div class="meta">#' + i.id + ' | ' + new Date(i.created_at).toLocaleString() + '</div>' +
                  '<button class="delete-btn" data-id="' + i.id + '">Delete</button></div>')
                .join("");
              messageEl.textContent = "Loaded " + data.items.length + " items.";

              document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                  const id = btn.dataset.id;
                  try {
                    const delRes = await fetch('/api/items/' + id, { method: 'DELETE' });
                    if (!delRes.ok) {
                      const errData = await delRes.json();
                      throw new Error(errData.error || 'Delete failed');
                    }
                    messageEl.textContent = 'Item deleted successfully.';
                    await refreshItems();
                  } catch (err) {
                    messageEl.textContent = 'Error deleting item: ' + err.message;
                  }
                });
              });
            } catch (err) {
              messageEl.textContent = "Error loading items: " + err.message;
            }
          }

          saveItem.addEventListener("click", async () => {
            const text = itemText.value.trim();
            if (!text) {
              messageEl.textContent = "Please enter a value first.";
              return;
            }
            saveItem.disabled = true;
            saveItem.textContent = "Saving...";
            try {
              const res = await fetch("/api/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
              });
              if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to save");
              }
              itemText.value = "";
              messageEl.textContent = "Saved successfully.";
              await refreshItems();
            } catch (err) {
              messageEl.textContent = "Error saving item: " + err.message;
            } finally {
              saveItem.disabled = false;
              saveItem.textContent = "Save item";
            }
          });

          loadItems.addEventListener("click", () => refreshItems());

          refreshItems();
        </script>
      </body>
    </html>
  `);
});

// In Docker Compose internal networking, use the service name `backend`.
// For local host mode, set BACKEND_URL=http://localhost:5000 (optional)
const backendUrl = process.env.BACKEND_URL || "http://backend:5000";

app.get("/api/backend", async (req, res) => {
  try {
    const backendResponse = await axios.get(`${backendUrl}/api`);
    res.json(backendResponse.data);
  } catch (err) {
    console.error("Error calling backend API", err.message);
    res.status(502).json({ error: "Failed to reach backend API" });
  }
});

app.get("/api/items", async (req, res) => {
  try {
    const backendResponse = await axios.get(`${backendUrl}/api/items`);
    res.json(backendResponse.data);
  } catch (err) {
    console.error("Error fetching items", err.message);
    res.status(502).json({ error: "Failed to fetch items" });
  }
});

app.post("/api/items", async (req, res) => {
  console.log("proxy POST /api/items req.body", req.body);
  try {
    const backendResponse = await axios.post(`${backendUrl}/api/items`, req.body, {
      headers: { "Content-Type": "application/json" },
    });
    res.status(backendResponse.status).json(backendResponse.data);
  } catch (err) {
    console.error("Error saving item", err.response?.data || err.message);
    const status = err.response?.status || 502;
    res.status(status).json({ error: "Failed to save item" });
  }
});

app.delete("/api/items/:id", async (req, res) => {
  try {
    const backendResponse = await axios.delete(`${backendUrl}/api/items/${req.params.id}`);
    res.status(backendResponse.status).json(backendResponse.data);
  } catch (err) {
    console.error("Error deleting item", err.response?.data || err.message);
    const status = err.response?.status || 502;
    res.status(status).json({ error: "Failed to delete item" });
  }
});

app.listen(3000, () => console.log("Frontend running on port 3000"));
