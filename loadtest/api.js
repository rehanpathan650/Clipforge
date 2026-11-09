// k6 load test for the read-heavy API paths.
//   k6 run -e API_URL=https://api.staging.example.com loadtest/api.js
// Run it against STAGING with RATE_LIMIT_GLOBAL set very high, otherwise the per-IP limiter will (correctly) answer 429.
import http from "k6/http";
import { check, group, sleep } from "k6";

const BASE = __ENV.API_URL || "http://localhost:4000";
const JSON_HEADERS = { "Content-Type": "application/json" };

export const options = {
  scenarios: {
    browse: {
      executor: "ramping-vus",
      stages: [
        { duration: "30s", target: 50 },
        { duration: "2m", target: 200 },
        { duration: "30s", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

// One account for the whole run: signing up per VU would trip the (intentional) auth rate limits.
export function setup() {
  const email = `k6-${Date.now()}@example.com`;
  const res = http.post(`${BASE}/api/auth/signup`, JSON.stringify({ email, password: "k6-load-test-password" }), {
    headers: JSON_HEADERS,
  });
  check(res, { "signup succeeded": (r) => r.status === 201 });
  return { cookie: res.cookies["cf_session"][0].value };
}

export default function (data) {
  const params = { headers: { Cookie: `cf_session=${data.cookie}` } };
  group("dashboard load", () => {
    const responses = http.batch([
      ["GET", `${BASE}/api/auth/me`, null, params],
      ["GET", `${BASE}/api/projects`, null, params],
      ["GET", `${BASE}/api/billing/balance`, null, params],
    ]);
    responses.forEach((r) => check(r, { "status 200": (x) => x.status === 200 }));
  });
  check(http.get(`${BASE}/api/billing/packs`), { "packs 200": (r) => r.status === 200 });
  check(http.get(`${BASE}/readyz`), { "ready 200": (r) => r.status === 200 });
  sleep(1);
}
