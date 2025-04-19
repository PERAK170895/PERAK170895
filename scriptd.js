const supabaseUrl = 'https://piybzyheydavoujfptnx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpeWJ6eWhleWRhdm91amZwdG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4ODc0OTksImV4cCI6MjA1NTQ2MzQ5OX0.iFy_6QuuCfzKFh5MAyIgkwVGM-X7ygkKkhsLM_JhUvg';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
const bucketName = "files";

console.log("✨ script.js LOADED");

async function checkSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Gagal mengambil sesi:", error.message);
        return;
    }

    const session = data.session;
    if (!session || !session.user) {
        window.location.href = "index.html";
    } else {
        const email = session.user.email;
        document.getElementById("user-email").textContent = "User id: " + email.slice(0, 7) + "...";

        // ⏱️ Update logins table
        const { error: upsertError } = await supabase.from("logins").upsert([
            {
                user_id: session.user.id,
                email: session.user.email,
                last_login: new Date().toISOString(),
                is_online: true,
            }
        ], { onConflict: ['user_id'] });

        if (upsertError) {
            console.error("Gagal update login tracking:", upsertError.message);
        }
    }
}

async function updateStats() {
    const statsEl = document.querySelector(".stats ul");

    const { data: onlineUsers, error: onlineError } = await supabase
        .from("logins")
        .select("*", { count: "exact" })
        .eq("is_online", true);

    const { data: recentLogins, error: recentError } = await supabase
        .from("logins")
        .select("last_login")
        .order("last_login", { ascending: false })
        .limit(1);

    if (onlineError || recentError) {
        console.error("Gagal memuat statistik:", onlineError?.message || recentError?.message);
        return;
    }

    const lastLoginText = recentLogins.length > 0
        ? new Date(recentLogins[0].last_login).toLocaleString("id-ID")
        : "Tidak tersedia";

    statsEl.innerHTML = `
        <li>Pengguna aktif: ${onlineUsers.length}</li>
        <li>Pesan masuk: 0 (placeholder)</li>
        <li>Login terakhir: ${lastLoginText}</li>
    `;
}

async function listFiles() {
    const { data, error } = await supabase.storage.from(bucketName).list('');
    if (error) {
        console.error("Gagal mengambil file:", error.message);
        return;
    }

    const listEl = document.getElementById("files-ul");
    listEl.innerHTML = "";

    for (const file of data) {
        const { data: urlData, error: urlError } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(file.name, 60);

        if (urlError) {
            console.error("Gagal buat signed URL:", urlError.message);
            continue;
        }

        const li = document.createElement("li");
        li.innerHTML = `<a href="${urlData.signedUrl}" target="_blank">${file.name}</a>`;
        listEl.appendChild(li);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    console.log("📦 DOMContentLoaded fired");

    await checkSession();
    await listFiles();
    await updateStats();
    setInterval(updateStats, 10000);

    // Logout handler
    document.getElementById("logout-btn").addEventListener("click", async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;

        if (user) {
            await supabase.from("logins").update({ is_online: false }).eq("user_id", user.id);
        }

        const { error } = await supabase.auth.signOut();
        if (error) {
            alert("Gagal logout: " + error.message);
        } else {
            alert("Logout berhasil!");
            window.location.href = "index.html";
        }
    });

    // Upload handler
    const uploadBtn = document.getElementById("upload-btn");
    const fileInput = document.getElementById("file-input");

    uploadBtn.addEventListener("click", async () => {
        const file = fileInput.files[0];
        if (!file) {
            alert("Pilih file terlebih dahulu.");
            return;
        }

        console.log("⬆️ Uploading file:", file.name);

        const { error } = await supabase.storage.from(bucketName).upload(file.name, file, {
            cacheControl: '3600',
            upsert: false,
        });

        if (error) {
            console.error("Upload gagal:", error.message);
            alert("Upload gagal: " + error.message);
        } else {
            alert("✅ File berhasil di-upload!");
            listFiles(); // Refresh daftar file
        }
    });
});
