const { jsPDF } = window.jspdf;

const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
const barcodeContainer = document.getElementById("barcodeContainer");
const codeInput = document.getElementById("codeInput");
const barcodeWrapper = document.querySelector(".barcode-wrapper");

const barcodeModeBtn = document.getElementById("barcodeModeBtn");
const qrModeBtn = document.getElementById("qrModeBtn");

let currentMode = "barcode"; // 'barcode' or 'qr'

// Mode Selection
barcodeModeBtn.addEventListener("click", () => {
    currentMode = "barcode";
    barcodeModeBtn.classList.add("active");
    qrModeBtn.classList.remove("active");
    codeInput.placeholder = "Enter codes separated by commas for Barcodes...";
    clearContent();
});

qrModeBtn.addEventListener("click", () => {
    currentMode = "qr";
    qrModeBtn.classList.add("active");
    barcodeModeBtn.classList.remove("active");
    codeInput.placeholder = "Enter text/links separated by commas for QR Codes...";
    clearContent();
});

function clearContent() {
    barcodeContainer.innerHTML = "";
    barcodeWrapper.classList.remove("active");
}

generateBtn.addEventListener("click", () => {
    const input = codeInput.value.trim();
    barcodeContainer.innerHTML = "";
    if (!input) {
        barcodeWrapper.classList.remove("active");
        return alert("Please enter some codes!");
    }

    const codes = input
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

    codes.forEach((code) => {
        const div = document.createElement("div");
        div.classList.add("barcode-item");

        if (currentMode === "barcode") {
            const canvas = document.createElement("canvas");
            JsBarcode(canvas, code, {
                format: "CODE128",
                displayValue: true,
                fontSize: 14,
                lineColor: "#000",
                width: 2,
                height: 70,
                margin: 8,
                background: "#fff",
            });
            div.appendChild(canvas);
        } else {
            const qrDiv = document.createElement("div");
            qrDiv.classList.add("qr-code-instance");
            new QRCode(qrDiv, {
                text: code,
                width: 150,
                height: 150,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            div.appendChild(qrDiv);
            const label = document.createElement("p");
            label.textContent = code;
            label.style.fontSize = "12px";
            label.style.marginTop = "5px";
            label.style.wordBreak = "break-all";
            div.appendChild(label);
        }

        barcodeContainer.appendChild(div);
    });

    barcodeWrapper.classList.add("active");
});

clearBtn.addEventListener("click", () => {
    codeInput.value = "";
    clearContent();
});

downloadPdfBtn.addEventListener("click", async () => {
    const items = barcodeContainer.querySelectorAll(".barcode-item");
    if (items.length === 0)
        return alert("Please generate items first.");

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    let x = margin, y = 20;
    let count = 0;

    for (const item of items) {
        let imgData;
        if (currentMode === "barcode") {
            const canvas = item.querySelector("canvas");
            imgData = canvas.toDataURL("image/png", 1.0);
            const barcodeWidth = (pageWidth - margin * 2) / 4;
            pdf.addImage(imgData, "PNG", x, y, barcodeWidth - 5, 30, "", "FAST");
            x += barcodeWidth;
        } else {
            const qrImg = item.querySelector("img");
            imgData = qrImg.src;
            const qrSize = (pageWidth - margin * 2) / 4;
            pdf.addImage(imgData, "PNG", x, y, qrSize - 10, qrSize - 10, "", "FAST");

            // Text label for QR
            pdf.setFontSize(8);
            const label = item.querySelector("p").innerText;
            pdf.text(label, x, y + qrSize - 5, { maxWidth: qrSize - 10 });

            x += qrSize;
        }

        count++;

        if (count % 4 === 0) {
            x = margin;
            y += (currentMode === "barcode" ? 40 : 60);
            if (y > 260 && count < items.length) {
                pdf.addPage();
                y = 20;
            }
        }
    }

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    pdf.save(`${currentMode}s-${timestamp}.pdf`);
});
