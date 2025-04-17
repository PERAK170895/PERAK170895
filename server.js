// Import modul dotenv dan express
// Baris paling atas
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
global.fetch = fetch;
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = 3000;

// Bikin koneksi Supabase pakai env
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Endpoint test: ambil data dari tabel "pengguna" (atau ubah sesuai tabel kamu)
app.get('/test', async (req, res) => {
    const { data, error } = await supabase.from('pengguna').select('*');
    console.log('Data:', data);
    console.log('Error:', error);
    res.json({ data, error });
  });

// Jalankan server
app.get('/', (req, res) => {
    res.send('🚀 Server Supabase siap jalan!');
  });
  
app.listen(port, () => {
  console.log(`✅ Server berjalan di http://localhost:${port}`);
});
