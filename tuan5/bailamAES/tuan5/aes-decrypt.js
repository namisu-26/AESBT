function padKey(key) {
  const utf8Key = CryptoJS.enc.Utf8.parse(key);
  const keyLength = utf8Key.sigBytes;

  if (keyLength <= 16) return CryptoJS.enc.Utf8.parse(key.padEnd(16));
  if (keyLength <= 24) return CryptoJS.enc.Utf8.parse(key.padEnd(24));
  return CryptoJS.enc.Utf8.parse(key.padEnd(32));
}

function decryptFile() {
  const fileInput = document.getElementById("fileInput");
  const keyInput = document.getElementById("key");
  const status = document.getElementById("status");
  const file = fileInput.files[0];

  if (!file || !keyInput.value) {
    status.innerText = "Vui lòng chọn file và nhập khóa!";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const encryptedBase64 = e.target.result;
      const key = padKey(keyInput.value);

      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(encryptedBase64)
      });

      // Sử dụng IV đơn giản (cùng với key đầu)
      const iv = CryptoJS.lib.WordArray.create(key.words.slice(0, 4)); // 16 bytes

      const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: iv
      });

      const decoded = decrypted.toString(CryptoJS.enc.Utf8);
      if (!decoded) {
        status.innerText = "❌ Giải mã thất bại. Có thể sai khóa hoặc sai định dạng!";
        return;
      }

      const blob = new Blob([decoded], { type: "text/plain" });
      const downloadLink = document.getElementById("downloadLink");

      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = "decrypted.txt";
      downloadLink.style.display = "inline-block";
      downloadLink.innerText = "📥 Tải file đã giải mã";

      status.innerText = "✅ Giải mã thành công!";
    } catch (error) {
      status.innerText = "❌ Lỗi khi giải mã: " + error.message;
    }
  };

  reader.readAsText(file);
}
function handleFileSelect(event) {
  const file = event.target.files[0];
  const fileName = file ? file.name : "Chưa chọn file";
  document.getElementById("fileName").innerText = fileName;
}
function handleKeyInput(event) {
  const key = event.target.value;
  const keyLength = key.length;

  if (keyLength < 16) {
    document.getElementById("keyStatus").innerText = "🔴 Khóa quá ngắn (tối thiểu 16 ký tự)";
  } else if (keyLength > 32) {
    document.getElementById("keyStatus").innerText = "🟢 Khóa quá dài (tối đa 32 ký tự)";
  } else {
    document.getElementById("keyStatus").innerText = "🟢 Khóa hợp lệ";
  }
}
document.getElementById("fileInput").addEventListener("change", handleFileSelect);
document.getElementById("key").addEventListener("input", handleKeyInput);
document.getElementById("decryptButton").addEventListener("click", decryptFile);
document.getElementById("downloadLink").style.display = "none";
document.getElementById("status").innerText = "Chưa giải mã";
document.getElementById("keyStatus").innerText = "Nhập khóa để kiểm tra tính hợp lệ";
document.getElementById("fileName").innerText = "Chưa chọn file";
document.getElementById("key").value = "";
document.getElementById("fileInput").value = "";
document.getElementById("decryptButton").disabled = true;
document.getElementById("key").addEventListener("input", function () {
  const key = this.value;
  document.getElementById("decryptButton").disabled = !key || key.length < 16;
});
document.getElementById("fileInput").addEventListener("change", function () {
  const file = this.files[0];
  document.getElementById("decryptButton").disabled = !file;
});
document.getElementById("key").addEventListener("input", function () {
  const key = this.value;
  document.getElementById("decryptButton").disabled = !key || key.length < 16;
});
document.getElementById("fileInput").addEventListener("change", function () {
  const file = this.files[0];
  document.getElementById("decryptButton").disabled = !file;
});
function encryptFile() {
  const fileInput = document.getElementById("plainFileInput");
  const keyInput = document.getElementById("encryptKey");
  const status = document.getElementById("encryptStatus");
  const file = fileInput.files[0];

  if (!file || !keyInput.value) {
    status.innerText = "Vui lòng chọn file và nhập khóa!";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const text = e.target.result;
      const key = padKey(keyInput.value);
      const iv = CryptoJS.lib.WordArray.create(key.words.slice(0, 4)); // giống như giải mã

      const encrypted = CryptoJS.AES.encrypt(text, key, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: iv
      });

      const encryptedBase64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

      const blob = new Blob([encryptedBase64], { type: "text/plain" });
      const downloadLink = document.getElementById("encryptDownloadLink");

      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = "encrypted.txt";
      downloadLink.style.display = "inline-block";
      downloadLink.innerText = "📤 Tải file đã mã hóa";

      status.innerText = "✅ Mã hóa thành công!";
    } catch (error) {
      status.innerText = "❌ Lỗi khi mã hóa: " + error.message;
    }
  };

  reader.readAsText(file);
}

