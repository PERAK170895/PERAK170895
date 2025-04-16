const form = document.querySelector("form");

form.addEventListener("submit", function (e) {
  const nama = document.getElementById("nama").value.trim();
  const email = document.getElementById("email").value.trim();
  const pesan = document.getElementById("pesan").value.trim();

  if (!nama || !email || !pesan) {
    e.preventDefault();
    alert("Semua kolom harus diisi ya!");
  } else if (!validateEmail(email)) {
    e.preventDefault();
    alert("Format email tidak valid.");
  }
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
}
