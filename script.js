function startApp() {
    document.getElementById("landingPage").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
}

const video = document.getElementById("video");

let stream = null;

async function startCamera() {
    if (stream) return;

    try {
        stream = await navigator.mediaDevices.getUserMedia({video: true});
        video.srcObject = stream;

        video.onloadedmetadata = () => {
          video.play();
        };

    }   catch (error) {
        if (error.name === "AbortError") {
            alert("Kamera gagal dimulai. Pastikan tidak ada aplikasi lain yang menggunakan kamera.");
        } else if (error.name === "NotAllowedError") {
            alert("Izin kamera ditolak. Silahkan izinkan akses kamera di browser.");
        } else {
            alert("Kamera tidak bisa diakses:" + error.message);
        }
        console.error(error);
    }
}

function stopCamera() {
    if (!stream) return;
    
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    stream = null;

}

const canvas = document.getElementById("canvas");
const photo = document.getElementById("photo");

function capturePhoto() {
    if (!stream) {
        alert("Nyalain kamera dulu yaaa");
        return;
    }

    const ctx = canvas.getContext("2d")

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (width === 0 || height === 0) {
       alert("Tunggu kamera siap dulu yaaaa :)");
       return;
    }

    canvas.width = width;
    canvas.height = height;

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    const imageData = canvas.toDataURL("image/png");
    photo.src = imageData;

}

const countdownEl = document.getElementById("countdown");
const preview = document.getElementById("preview");

let photos = [];

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startPhotobooth() {
    if (!stream) {
        alert("Nyalakan kamera dulu yaaaa 😃");
        return;
    }

    photos = [];
    preview.innerHTML = "";

    for (let i = 0; i < 4; i++) {
        await runCountdown(3);
        captureToArray();
        showPreview();
        await delay(500);
    }

    alert("Yeyyy Foto Kamu Udah Jadi Nihh 🤩");
}

async function runCountdown(seconds) {
    for (let i = seconds; i > 0; i--) {
        countdownEl.innerText = i;
        await delay(1000);
    }
    countdownEl.innerText = "📸";
    await delay(500);
    countdownEl.innerText = "";
}

function captureToArray() {
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (width === 0 || height === 0) {
        alert("Kamera bellum siap nihh! ");
        return;
    }
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();
    const imageData = canvas.toDataURL("image/png");
    photos.push(imageData);
}

function showPreview() {
    preview.innerHTML = "";
    photos.forEach(img => {
        const image = document.createElement("img");
        image.src = img;
        image.style.width = "80px";
        image.style.margin = "5px";
        image.style.border = "2px solid pink";
        preview.appendChild(image);
    });
}

async function generateStrip() {
    if (photos.length < 4) {
        alert("Foto belum lengkap 😏");
        return;
    }

    const imgElements = [];
    for (let src of photos) {
        const img = new Image();
        img.src = src;
        await new Promise(resolve => {
            img.onload = resolve;
        });
        imgElements.push(img);
    }
    const padding = 20;
    const headerHeight = 60;
    const imgWidth = imgElements[0].width;
    const imgHeight = imgElements[0].height;

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = imgWidth + padding * 2;
    canvas.height = (imgHeight + padding) * imgElements.length + padding;
    
    if (selectedTheme === "pink") {
        ctx.fillStyle = "#ffc0cb";
    } else if (selectedTheme === "black") {
        ctx.fillStyle = "#000000";
    } else {
        ctx.fillStyle = "#fff";
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedTheme === "black" ? "#ffffff" : "#e75480";
    ctx.font = "bold 20px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("📸 photobooth", canvas.width / 2, 35);

    ctx.fillStyle = selectedTheme === "black" ? "#cccccc" : "#888888";
    ctx.font = "12px Arial";
    ctx.fillText(new Date().toLocaleDateString("id-ID"), canvas.width / 2, 52);

    imgElements.forEach((img, index) => {
        ctx.drawImage(
            img,
            padding,
            headerHeight + padding + index * (imgHeight + padding),
            imgWidth,
            imgHeight
        );
    });

    const finalImage = canvas.toDataURL("image/png");
    document.getElementById("result").src = finalImage;
    const link = document.getElementById("downloadLink");
    link.href = finalImage;
    link.style.display = "inline";
}

let selectedTheme = "white";

function setTheme(theme) {
    selectedTheme = theme;
    alert("Frame" + theme + "dipilih!");
}

function resetPhotobooth() {
    photos = [];
    preview.innerHTML = "";
    document.getElementById("result").src = "";
    document.getElementById("countdown").innerText = "";

    const link = document.getElementById("downloadLink");
    link.href = "";
    link.style.display = "none";

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        stream = null;
    }
    alert("PhotoBooth Berhasil Direset! Silahkan Mulai Kembali 😙");
}
