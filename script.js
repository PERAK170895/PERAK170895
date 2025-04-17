const supabaseUrl = 'https://piybzyheydavoujfptnx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpeWJ6eWhleWRhdm91amZwdG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4ODc0OTksImV4cCI6MjA1NTQ2MzQ5OX0.iFy_6QuuCfzKFh5MAyIgkwVGM-X7ygkKkhsLM_JhUvg';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const switchToRegister = document.getElementById("switch-to-register");
  const switchToLogin = document.getElementById("switch-to-login");
  const formTitle = document.getElementById("form-title");

  // Switch ke form register
  switchToRegister.addEventListener("click", function (e) {
    e.preventDefault();
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    formTitle.textContent = "Register";
  });

  // Switch ke form login
  switchToLogin.addEventListener("click", function (e) {
    e.preventDefault();
    registerForm.style.display = "none";
    loginForm.style.display = "block";
    formTitle.textContent = "Login";
  });

  // Login
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
  
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    console.log("Login result:", data, error); // Tambahkan untuk debug
  
    if (error) {
      alert("Login gagal: " + error.message);
    } else {
      alert("Login berhasil!");
      window.location.href = "dashboard.html";
    }
  });

  // Register
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("Pendaftaran gagal: " + error.message);
    } else {
      alert("Pendaftaran berhasil! Silakan cek email untuk verifikasi.");
      // Langsung alihkan ke login
      registerForm.style.display = "none";
      loginForm.style.display = "block";
      formTitle.textContent = "Login";
    }
  });
});