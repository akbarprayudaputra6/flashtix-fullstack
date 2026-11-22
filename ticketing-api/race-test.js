// ticketing-api/test-race.js
const API_URL = "http://localhost:5000/api/orders/book";
const JWT_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ4Nzc4NDlmLWM5YzktNDAxYi05NWE5LWZkMTQ3YTlkYTI4OSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc5NTM0MzA3MCwiZXhwIjoxNzk1NDI5NDcwfQ.gsTZMM0k-3Es-93YvxoSRaJ_CpkzPBCtmsotdCzWd9E";
const EVENT_ID = "85cc648b-fc04-405f-8bef-da6ce692475e";
const TOTAL_REQUESTS = 5;

async function runRaceConditionTest() {
  console.log(
    `Mengirim ${TOTAL_REQUESTS} request pembelian (qty: 1) secara bersamaan...\n`,
  );

  const requests = Array.from({ length: TOTAL_REQUESTS }, (_, index) =>
    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JWT_TOKEN}`,
      },
      body: JSON.stringify({
        eventId: EVENT_ID,
        quantity: 1,
      }),
    }).then(async (res) => {
      const body = await res.json();
      return {
        requestKe: index + 1,
        status: res.status,
        message: body.message || (body.success ? "Berhasil Booking" : "Gagal"),
      };
    }),
  );

  // Eksekusi seluruh request secara paralel dalam milidetik yang sama
  const results = await Promise.all(requests);
  console.table(results);
}

runRaceConditionTest();
