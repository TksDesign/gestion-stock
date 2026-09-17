import https from 'https';

const candidates = [
  "photo-1496181133206-80ce9b88a853", // Desk
  "photo-1511707171634-5f8c7eece11d", // Phone
  "photo-1518770660439-4636190af475", // Circuit
  "photo-1523275335684-37898b6baf30", // Watch
  "photo-1550745165-9bc0b252726f", // Retro neon
  "photo-1583394838336-acd977736f90", // AirPods
  "photo-1525547719571-a2d4ac8945e2", // Laptop
  "photo-1498049794561-7780e7231661", // Desk tech
  "photo-1531297172864-80bb1e944754", // abstract tech
  "photo-1504610926078-a1611febcad3", // Apple setup
  "photo-1517336714731-489689fd1ca8", // MacBook dark
  "photo-1494173853739-c21f58b16055", // Keyboard
  "photo-1603302576837-37561b2e2302", // Laptop neon
  "photo-1550009158-9ebf69173e03", // Setup
  "photo-1585336261022-680e2948cebd", // Cyberpunk
];

const working = [];
let done = 0;

candidates.forEach(id => {
  https.get(`https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=400`, (res) => {
    if (res.statusCode === 200) {
      working.push(id);
    }
    done++;
    if (done === candidates.length) {
      console.log("WORKING:", working);
    }
  }).on('error', (e) => {
    done++;
  });
});
