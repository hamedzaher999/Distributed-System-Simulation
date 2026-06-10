const URL = 'http://localhost:3000/calculate';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const requests = [
  { a: 105, b: 53, op: 'add' },
  { a: 250, b: 42, op: 'sub' },
  { a: 350, b: 12, op: 'mul' },
  { a: 350, b: 12, op: 'mul' },
  { a: 165, b: 60, op: 'add' },
  { a: 560, b: 63, op: 'sub' },
  { a: 146, b: 91, op: 'mul' },
  { a: 265, b: 42, op: 'add' },
  { a: 480, b: 15, op: 'sub' },
  { a: 350, b: 52, op: 'mul' },
  { a: 305, b: 53, op: 'add' },
  { a: 460, b: 53, op: 'sub' },
];

async function run() {
  console.log('Sending requests every 1s (3s processing = overlapping load)\n');

  for (let i = 0; i < requests.length; i++) {
    console.log(`[${i + 1}] ➡️ ${requests[i].a} ${requests[i].op} ${requests[i].b}`);

    fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requests[i]),
    }).catch(() => {});

    await sleep(500);
  }

  console.log('\n All requests sent. Watch UI for active counts climbing to 1, 2, 3...');
}

run();
