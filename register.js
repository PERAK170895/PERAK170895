import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs/+esm';

const SUPABASE_URL = 'https://ciashuymvwhmfuxqgqlr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpYXNodXltdndobWZ1eHFncWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NTQyOTEsImV4cCI6MjA2MzAzMDI5MX0.CfmfbISXd_T941XE0j8pAMqrgCUFa9ocBhuQ3B6gUY8';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


const form = document.getElementById('registerForm');
const msg = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const kodeAkses = document.getElementById('kode_akses').value;

  if (password.length < 6 || password.length > 12) {
    msg.textContent = '❌ Password harus 6–12 karakter';
    return;
  }

  if (kodeAkses.length !== 6) {
    msg.textContent = '❌ Kode akses harus 6 karakter';
    return;
  }

  try {
    const passwordHash = bcrypt.hashSync(password, 10);

    const { data, error } = await supabase
      .from('pengguna')
      .insert([{ username, password_hash: passwordHash, kode_akses: kodeAkses }]);

    if (error) {
      msg.textContent = `❌ Gagal daftar: ${error.message}`;
    } else {
      msg.textContent = '✅ Pendaftaran berhasil!';
      form.reset();
    }
  } catch (err) {
    msg.textContent = '❌ Terjadi kesalahan.';
    console.error(err);
  }
});
