const { jsPDF } = window.jspdf;

const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
const barcodeContainer = document.getElementById("barcodeContainer");
const codeInput = document.getElementById("codeInput");
const barcodeWrapper = document.querySelector(".barcode-wrapper");

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
        barcodeContainer.appendChild(div);
    });

    barcodeWrapper.classList.add("active");
});

clearBtn.addEventListener("click", () => {
    codeInput.value = "";
    barcodeContainer.innerHTML = "";
    barcodeWrapper.classList.remove("active");
});

downloadPdfBtn.addEventListener("click", async () => {
    const barcodes = barcodeContainer.querySelectorAll("canvas");
    if (barcodes.length === 0)
        return alert("Please generate barcodes first.");

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const barcodeWidth = (pageWidth - margin * 2) / 4;
    let x = margin,
        y = 20;
    let count = 0;

    for (const canvas of barcodes) {
        const imgData = canvas.toDataURL("image/png", 1.0);
        pdf.addImage(imgData, "PNG", x, y, barcodeWidth - 5, 30, "", "FAST");
        x += barcodeWidth;
        count++;

        if (count % 4 === 0) {
            x = margin;
            y += 40;
            if (y > 260 && count < barcodes.length) {
                pdf.addPage();
                y = 20;
            }
        }
    }

    // ✅ Generate timestamp for filename
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(
        now.getMonth() + 1,
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(
        now.getHours(),
    ).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;
    pdf.save(`barcodes-${timestamp}.pdf`);
});
