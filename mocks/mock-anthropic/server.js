/**
 * Mock Anthropic Messages API Server
 *
 * Two modes (MOCK_MODE env var):
 *   "replay" (default) — serve from fixtures or generic response
 *   "record"           — proxy to real API, save fixture, return response
 *
 * Port: MOCK_ANTHROPIC_PORT (default 3100)
 */

const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const https = require("https");

const app = express();
const PORT = parseInt(process.env.MOCK_ANTHROPIC_PORT || "3100", 10);
const MODE = process.env.MOCK_MODE || "replay";
const REAL_API_KEY = process.env.REAL_ANTHROPIC_API_KEY || "";
const FIXTURES_DIR = path.join(__dirname, "fixtures");
const FIXTURE_MAP_PATH = path.join(FIXTURES_DIR, "fixture-map.json");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeHash(model, messages) {
  const canonical = JSON.stringify({
    model,
    messages: (messages || []).map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

function loadFixtureMap() {
  try {
    return JSON.parse(fs.readFileSync(FIXTURE_MAP_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function saveFixtureMap(map) {
  fs.writeFileSync(FIXTURE_MAP_PATH, JSON.stringify(map, null, 2) + "\n");
}

function loadFixture(filename) {
  const fp = path.join(FIXTURES_DIR, filename);
  try {
    return JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch {
    return null;
  }
}

function genericResponse(model) {
  return {
    id: `msg_mock_${crypto.randomBytes(12).toString("hex")}`,
    type: "message",
    role: "assistant",
    model: model || "claude-sonnet-4-20250514",
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            recommended_spec: {
              title: "General Purpose Structural Epoxy",
              chemistry: "Two-part epoxy adhesive",
              example_products: [
                "3M Scotch-Weld DP420",
                "Henkel Loctite EA E-20HP",
              ],
              rationale:
                "A versatile structural epoxy suitable for a wide range of substrates and environmental conditions. Provides strong lap shear strength and good gap-filling capability.",
            },
            product_characteristics: {
              viscosity: "Thixotropic paste",
              work_life: "30 minutes at 25°C",
              fixture_time: "4–6 hours at 25°C",
              full_cure: "24 hours at 25°C or 1 hour at 80°C",
              service_temp_range: "-55°C to 120°C",
            },
            application_guidance:
              "Ensure substrates are clean and free of oils. Lightly abrade bonding surfaces with 180-grit sandpaper. Apply adhesive to both surfaces and clamp with uniform pressure (0.05–0.1 MPa). Maintain fixture until handling strength is achieved.",
            alternatives: [
              {
                title: "Acrylic Structural Adhesive",
                chemistry: "Methyl methacrylate (MMA)",
                example_products: [
                  "Plexus MA310",
                  "Lord 406/19 with Activator 19",
                ],
                rationale:
                  "Faster fixture time and more tolerant of oily or poorly prepared surfaces. Consider if rapid throughput is a priority.",
              },
            ],
            confidence: 78,
          },
          null,
          2
        ),
      },
    ],
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: {
      input_tokens: 1247,
      output_tokens: 683,
    },
  };
}

// ---------------------------------------------------------------------------
// SSE streaming helpers
// ---------------------------------------------------------------------------

function streamResponse(res, message) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const textContent =
    message.content && message.content[0] ? message.content[0].text : "";
  const CHUNK_SIZE = 40;

  // message_start
  const msgStart = {
    type: "message_start",
    message: {
      id: message.id,
      type: "message",
      role: "assistant",
      model: message.model,
      content: [],
      stop_reason: null,
      stop_sequence: null,
      usage: { input_tokens: message.usage.input_tokens, output_tokens: 0 },
    },
  };
  res.write(`event: message_start\ndata: ${JSON.stringify(msgStart)}\n\n`);

  // content_block_start
  res.write(
    `event: content_block_start\ndata: ${JSON.stringify({
      type: "content_block_start",
      index: 0,
      content_block: { type: "text", text: "" },
    })}\n\n`
  );

  // content_block_delta — split text into chunks
  const chunks = [];
  for (let i = 0; i < textContent.length; i += CHUNK_SIZE) {
    chunks.push(textContent.slice(i, i + CHUNK_SIZE));
  }
  if (chunks.length === 0) chunks.push("");

  let chunkIdx = 0;
  const interval = setInterval(() => {
    if (chunkIdx < chunks.length) {
      const delta = {
        type: "content_block_delta",
        index: 0,
        delta: { type: "text_delta", text: chunks[chunkIdx] },
      };
      res.write(`event: content_block_delta\ndata: ${JSON.stringify(delta)}\n\n`);
      chunkIdx++;
    } else {
      clearInterval(interval);

      // content_block_stop
      res.write(
        `event: content_block_stop\ndata: ${JSON.stringify({
          type: "content_block_stop",
          index: 0,
        })}\n\n`
      );

      // message_delta
      res.write(
        `event: message_delta\ndata: ${JSON.stringify({
          type: "message_delta",
          delta: {
            stop_reason: message.stop_reason || "end_turn",
            stop_sequence: null,
          },
          usage: { output_tokens: message.usage.output_tokens },
        })}\n\n`
      );

      // message_stop
      res.write(
        `event: message_stop\ndata: ${JSON.stringify({
          type: "message_stop",
        })}\n\n`
      );

      res.end();
    }
  }, 5);
}

// ---------------------------------------------------------------------------
// Record mode — proxy to real Anthropic API
// ---------------------------------------------------------------------------

function proxyToAnthropic(body, headers) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname: "api.anthropic.com",
      port: 443,
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": REAL_API_KEY,
        "anthropic-version": headers["anthropic-version"] || "2023-06-01",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (upstream) => {
      let data = "";
      upstream.on("data", (chunk) => (data += chunk));
      upstream.on("end", () => {
        try {
          resolve({ status: upstream.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: upstream.statusCode, body: data });
        }
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function proxyStreamToAnthropic(body, headers, clientRes) {
  return new Promise((resolve, reject) => {
    // Force stream: true on the proxied request
    const payload = JSON.stringify({ ...body, stream: true });
    const options = {
      hostname: "api.anthropic.com",
      port: 443,
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": REAL_API_KEY,
        "anthropic-version": headers["anthropic-version"] || "2023-06-01",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    clientRes.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const req = https.request(options, (upstream) => {
      let fullData = "";
      upstream.on("data", (chunk) => {
        const text = chunk.toString();
        fullData += text;
        clientRes.write(text);
      });
      upstream.on("end", () => {
        clientRes.end();
        resolve(fullData);
      });
    });

    req.on("error", (err) => {
      clientRes.end();
      reject(err);
    });
    req.write(payload);
    req.end();
  });
}

function reconstructMessageFromSSE(sseText) {
  // Parse SSE events to reconstruct a full message object for fixture storage
  let message = null;
  let textContent = "";
  let outputTokens = 0;

  const lines = sseText.split("\n");
  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    const dataStr = line.slice(6).trim();
    if (dataStr === "[DONE]") continue;
    try {
      const evt = JSON.parse(dataStr);
      if (evt.type === "message_start" && evt.message) {
        message = evt.message;
      } else if (evt.type === "content_block_delta" && evt.delta) {
        textContent += evt.delta.text || "";
      } else if (evt.type === "message_delta") {
        if (evt.delta) {
          if (message) message.stop_reason = evt.delta.stop_reason;
        }
        if (evt.usage) outputTokens = evt.usage.output_tokens;
      }
    } catch {
      // skip unparseable lines
    }
  }

  if (message) {
    message.content = [{ type: "text", text: textContent }];
    message.usage = message.usage || {};
    message.usage.output_tokens = outputTokens;
  }
  return message;
}

// ---------------------------------------------------------------------------
// Main endpoint
// ---------------------------------------------------------------------------

app.use(express.json({ limit: "10mb" }));

app.post("/v1/messages", async (req, res) => {
  const body = req.body || {};
  const { model, messages, stream } = body;
  const hash = computeHash(model, messages);

  console.log(
    `[${MODE}] POST /v1/messages  model=${model}  stream=${!!stream}  hash=${hash.slice(0, 12)}…`
  );

  // ---- REPLAY MODE ----
  if (MODE === "replay") {
    const fixtureMap = loadFixtureMap();
    const fixtureFile = fixtureMap[hash];
    let fixture = fixtureFile ? loadFixture(fixtureFile) : null;

    // Check if this is an error fixture
    if (fixture && fixture.type === "error") {
      const status = fixture.status || 429;
      return res.status(status).json(fixture);
    }

    if (!fixture) {
      fixture = genericResponse(model);
    }

    if (stream) {
      return streamResponse(res, fixture);
    }
    return res.json(fixture);
  }

  // ---- RECORD MODE ----
  if (MODE === "record") {
    if (!REAL_API_KEY) {
      return res.status(500).json({
        type: "error",
        error: {
          type: "configuration_error",
          message:
            "REAL_ANTHROPIC_API_KEY not set. Required for record mode.",
        },
      });
    }

    try {
      if (stream) {
        const sseText = await proxyStreamToAnthropic(body, req.headers, res);
        // Reconstruct message for fixture storage
        const message = reconstructMessageFromSSE(sseText);
        if (message) {
          const filename = `recorded-${hash.slice(0, 16)}.json`;
          fs.writeFileSync(
            path.join(FIXTURES_DIR, filename),
            JSON.stringify(message, null, 2) + "\n"
          );
          const map = loadFixtureMap();
          map[hash] = filename;
          saveFixtureMap(map);
          console.log(`  → Saved streaming fixture: ${filename}`);
        }
        // Response already sent via proxyStreamToAnthropic
        return;
      }

      // Non-streaming record
      const nonStreamBody = { ...body, stream: false };
      const upstream = await proxyToAnthropic(nonStreamBody, req.headers);
      const filename = `recorded-${hash.slice(0, 16)}.json`;
      fs.writeFileSync(
        path.join(FIXTURES_DIR, filename),
        JSON.stringify(upstream.body, null, 2) + "\n"
      );
      const map = loadFixtureMap();
      map[hash] = filename;
      saveFixtureMap(map);
      console.log(`  → Saved fixture: ${filename}`);
      return res.status(upstream.status).json(upstream.body);
    } catch (err) {
      console.error("  → Proxy error:", err.message);
      return res.status(502).json({
        type: "error",
        error: {
          type: "proxy_error",
          message: `Failed to proxy to Anthropic API: ${err.message}`,
        },
      });
    }
  }

  return res.status(400).json({
    type: "error",
    error: {
      type: "invalid_request_error",
      message: `Unknown MOCK_MODE: ${MODE}`,
    },
  });
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", mode: MODE });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Mock Anthropic API running on http://localhost:${PORT}`);
  console.log(`  Mode: ${MODE}`);
  console.log(`  Fixtures: ${FIXTURES_DIR}`);
  if (MODE === "record" && !REAL_API_KEY) {
    console.warn(
      "  ⚠  REAL_ANTHROPIC_API_KEY not set — record mode will fail"
    );
  }
});
