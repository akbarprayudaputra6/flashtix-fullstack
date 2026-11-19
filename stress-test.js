const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxNjQ0ZTBkLTk4MzItNGM4Yy1hMTNiLTlkZTY5MmFmODlhYSIsInJvbGUiOiJDVVNUT01FUiIsImlhdCI6MTc5NTAwNzM4MCwiZXhwIjoxNzk1MDkzNzgwfQ.ubYZLvQj-xaP36t6V5wSKZkhuxu11HShdJtBRZtkvaI";
const EVENT_ID = "5e559120-f1de-404b-824c-04167c61f085";
const TOTAL_REQUESTS = 10;

async function runConcurrencyTest() {
  console.log(
    `🚀 Menembakkan ${TOTAL_REQUESTS} request pembelian bersamaan...\n`,
  );

  const requests = Array.from({ length: TOTAL_REQUESTS }, (_, i) =>
    fetch("http://localhost:5000/api/orders/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ eventId: EVENT_ID, quantity: 1 }),
    }).then(async (res) => {
      const body = await res.json();
      return {
        requestKe: i + 1,
        httpStatus: res.status,
        hasil: body.status,
        pesan: body.message,
      };
    }),
  );

  const results = await Promise.all(requests);
  console.table(results);
}

runConcurrencyTest();
