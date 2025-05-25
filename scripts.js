const SUPABASE_URL = 'https://ciashuymvwhmfuxqgqlr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpYXNodXltdndobWZ1eHFncWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NTQyOTEsImV4cCI6MjA2MzAzMDI5MX0.CfmfbISXd_T941XE0j8pAMqrgCUFa9ocBhuQ3B6gUY8';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let selectedWebsite = null;

async function loadWebsiteList() {
  const { data, error } = await client
    .from('websites')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Gagal memuat website:', error);
    return;
  }

  const list = document.getElementById('website-list');
  list.innerHTML = '';

  data.forEach(site => {
    const btn = document.createElement('button');
    btn.textContent = site.name;
    btn.onclick = () => promptAccess(site);
    list.appendChild(btn);
  });

  loadNominalTable(); // Panggil table setelah website list
}

function promptAccess(site) {
  selectedWebsite = site;
  document.getElementById('form-section').style.display = 'block';
  document.getElementById('selected-website-name').textContent = site.name;
}


async function submitNominal() {
  const telkomsel = document.getElementById('telkomsel').value;
  const xl = document.getElementById('xl').value;

  if (!selectedWebsite) {
    alert('Pilih website dulu!');
    return;
  }

  const waktuInput = new Date().toISOString();

  const { error } = await client
    .from('nominal')
    .insert([{
      website_id: selectedWebsite.id,
      telkomsel: parseInt(telkomsel),
      xl: parseInt(xl),
      created_at: waktuInput
    }]);

  if (error) {
    alert('Gagal menyimpan nominal!');
    console.error(error);
  } else {
    alert('Nominal disimpan!');
    document.getElementById('telkomsel').value = '';
    document.getElementById('xl').value = '';
    loadNominalTable();
  }
}

async function skipNominal() {
  if (!selectedWebsite) return;

  const waktuInput = new Date().toISOString();

  const { error } = await client
    .from('nominal')
    .insert([{
      website_id: selectedWebsite.id,
      telkomsel: null,
      xl: null,
      created_at: waktuInput,
      status: 'SKIP'
    }]);

  if (error) {
    alert('Gagal menyimpan status skip!');
    console.error(error);
  } else {
    alert('Website ditandai SKIP.');
    document.getElementById('form-section').style.display = 'none';
    document.getElementById('telkomsel').value = '';
    document.getElementById('xl').value = '';
    selectedWebsite = null;
    loadNominalTable();
  }
}

async function loadNominalTable() {
  const { data, error } = await client
    .from('nominal')
    .select(`
      website_id,
      telkomsel,
      xl,
      created_at,
      status,
      websites (name)
    `)
    .order('created_at', { ascending: false }); // Urutkan terbaru di atas

  if (error) {
    console.error('Gagal memuat data nominal:', error);
    return;
  }

  // Ambil hanya data terbaru untuk setiap website_id
  const latestByWebsite = {};
  data.forEach(row => {
    if (!latestByWebsite[row.website_id]) {
      latestByWebsite[row.website_id] = row;
    }
  });

  // Hitung total Telkomsel dan XL
  let totalTelkomsel = 0;
  let totalXL = 0;
  Object.values(latestByWebsite).forEach(row => {
    if (row.status !== 'SKIP') {
      if (row.telkomsel) totalTelkomsel += row.telkomsel;
      if (row.xl) totalXL += row.xl;
    }
  });

  const container = document.getElementById('nominal-list');
  container.innerHTML = '';

  // Tambahkan total di atas tabel
  const totalDiv = document.createElement('div');
  totalDiv.className = 'total-summary';
  totalDiv.innerHTML = `
    <h3>Total</h3>
    <p>Telkomsel: <strong>${formatNominal(totalTelkomsel)}</strong></p>
    <p>XL: <strong>${formatNominal(totalXL)}</strong></p>
  `;
  container.appendChild(totalDiv);

  // Buat tabel
  const table = document.createElement('table');
  table.className = 'data-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Waktu</th>
        <th>Website</th>
        <th>Telkomsel</th>
        <th>XL</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody');

  Object.values(latestByWebsite).forEach(row => {
    const tr = document.createElement('tr');
    tr.classList.add(row.status === 'SKIP' ? 'skip-row' : 'filled-row');
    tr.innerHTML = `
      <td>${new Date(row.created_at).toLocaleString('id-ID')}</td>
      <td>${row.websites.name}</td>
      <td>${row.status === 'SKIP' ? 'SKIP' : formatNominal(row.telkomsel)}</td>
      <td>${row.status === 'SKIP' ? 'SKIP' : formatNominal(row.xl)}</td>
    `;
    
    tbody.appendChild(tr);
  });

  container.appendChild(table);
}


function formatNominal(nominal) {
  if (nominal == null) return '-';
  return parseInt(nominal).toLocaleString('id-ID');
}

window.addEventListener('DOMContentLoaded', loadWebsiteList);
