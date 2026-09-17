import https from 'https';

const premiumImages = [
  "photo-1611186871340-1b26bc6594b5", 
  "photo-1618366712010-f4ae9c647dcb", 
  "photo-1546868871-7041f2a55e12", 
  "photo-1605236453806-6fa3685824c0", 
  "photo-1600267175161-c47022e11f11", 
  "photo-1508614589041-8f56d56fc678", 
  "photo-1516035069371-29a1b244cc32", 
  "photo-1595225476474-8752175856f2", 
  "photo-1544244015-0422c541c888", 
  "photo-1606220588913-b3eea415a2ed", 
];

premiumImages.forEach(id => {
  https.get(`https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=800`, (res) => {
    console.log(`${id}: ${res.statusCode}`);
  }).on('error', (e) => {
    console.error(e);
  });
});
