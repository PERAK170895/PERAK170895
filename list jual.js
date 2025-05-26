const SUPABASE_URL = 'https://ciashuymvwhmfuxqgqlr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpYXNodXltdndobWZ1eHFncWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NTQyOTEsImV4cCI6MjA2MzAzMDI5MX0.CfmfbISXd_T941XE0j8pAMqrgCUFa9ocBhuQ3B6gUY8';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let latestPerWebsite = {};

async function loadJualList() {
  const { data, error } = await client
    .from('nominal')
    .select(`
      website_id,
      telkomsel,
      xl,
      status,
      created_at,
      websites (name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Gagal memuat data:', error);
    return;
  }

  latestPerWebsite = {};
  data.forEach(row => {
    if (!latestPerWebsite[row.website_id]) {
      latestPerWebsite[row.website_id] = row;
    }
  });

  const tbody = document.querySelector('#jual-list tbody');
  tbody.innerHTML = '';

  const rows = Object.values(latestPerWebsite).map(row => `
    <tr>
      <td>${row.websites?.name || '-'}</td>
      <td>${row.status === 'SKIP' ? 'SKIP' : formatNominal(row.telkomsel)}</td>
      <td>${row.status === 'SKIP' ? 'SKIP' : formatNominal(row.xl)}</td>
      <td>${row.status || '-'}</td>
      <td>${new Date(row.created_at).toLocaleString('id-ID')}</td>
    </tr>
  `).join('');

  tbody.innerHTML = rows || '<tr><td colspan="5">Data kosong</td></tr>';
}

function formatNominal(nominal) {
  if (nominal == null) return '-';
  return parseInt(nominal).toLocaleString('id-ID');
}

function generateInputRows(tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = '';
  for (let i = 1; i <= 10; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i}</td>
      <td><input type="text" placeholder="Masukkan nomor..." /></td>
    `;
    tbody.appendChild(tr);
  }
}

function jualkanSemua() {
  const telkomselNumbers = Array.from(document.querySelectorAll('#telkomsel-table input')).map(input => input.value.trim()).filter(val => val);
  const xlNumbers = Array.from(document.querySelectorAll('#xl-table input')).map(input => input.value.trim()).filter(val => val);

  if (telkomselNumbers.length === 0 && xlNumbers.length === 0) {
    alert('Masukkan minimal 1 nomor tujuan!');
    return;
  }

  let hasilDistribusi = '';

  Object.values(latestPerWebsite).forEach(row => {
    if (row.status === 'SKIP') return;

    hasilDistribusi += `${row.websites?.name}\n`;

    // Distribusi Telkomsel
    let sisaTelkomsel = row.telkomsel || 0;
    let alokasiTelkomsel = [];
    let telIndex = 0;

    while (sisaTelkomsel > 0 && telIndex < telkomselNumbers.length) {
      const alokasi = Math.min(1000000, sisaTelkomsel);
      alokasiTelkomsel.push(`${telkomselNumbers[telIndex]} = ${formatNominal(alokasi)}`);
      sisaTelkomsel -= alokasi;
      if (alokasi >= 1000000) telIndex++;
    }

    if (alokasiTelkomsel.length > 0) {
      hasilDistribusi += `\tTelkomsel -> ${alokasiTelkomsel.join(', ')}\n`;
    } else {
      hasilDistribusi += `\tTelkomsel -> -\n`;
    }

    // Distribusi XL
    let sisaXL = row.xl || 0;
    let alokasiXL = [];
    let xlIndex = 0;

    while (sisaXL > 0 && xlIndex < xlNumbers.length) {
      const alokasi = Math.min(1000000, sisaXL);
      alokasiXL.push(`${xlNumbers[xlIndex]} = ${formatNominal(alokasi)}`);
      sisaXL -= alokasi;
      if (alokasi >= 1000000) xlIndex++;
    }

    if (alokasiXL.length > 0) {
      hasilDistribusi += `\tXL -> ${alokasiXL.join(', ')}\n\n`;
    } else {
      hasilDistribusi += `\tXL -> -\n\n`;
    }
  });

  document.getElementById('hasil').textContent = hasilDistribusi || 'Tidak ada data yang didistribusi.';
}


window.addEventListener('DOMContentLoaded', () => {
  loadJualList();
  generateInputRows('telkomsel-table');
  generateInputRows('xl-table');
});
