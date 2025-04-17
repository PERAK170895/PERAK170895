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
    }
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

    // Logout handler
    document.getElementById("logout-btn").addEventListener("click", async () => {
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
