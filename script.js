document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector("form.login-form");
  const kontakForm = document.querySelector("form.kontak-form");

  // Validasi LOGIN
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!username || !password) {
        alert("Harap isi semua kolom!");
        return;
      }

      if (username === "admin" && password === "1234") {
        window.location.href = "dashboard.html";
      } else {
        alert("Username atau kata sandi salah!");
      }
    });
  }

  // Validasi FORM KONTAK
  if (kontakForm) {
    kontakForm.addEventListener("submit", function (e) {
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
  }

  // Fungsi bantu validasi email
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  }
});
