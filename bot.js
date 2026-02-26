async function trackVisitor() {
    try {
        // 1. Track visit count and times using LocalStorage
        let visits = localStorage.getItem("visitCount") || 0;
        visits = parseInt(visits) + 1;
        localStorage.setItem("visitCount", visits);

        const firstVisit = localStorage.getItem("firstVisit") || new Date().toLocaleString();
        if (!localStorage.getItem("firstVisit")) {
            localStorage.setItem("firstVisit", firstVisit);
        }

        const now = new Date();
        const currentTime = now.toLocaleString();

        // 2. Get IP and Location info
        let locJson = { ip: "Unknown", city: "Unknown", region: "Unknown", country: "Unknown", loc: "Unknown", org: "Unknown" };
        try {
            // Some adblockers block ipinfo, so wrap in try-catch to not break the whole script
            const locationData = await fetch("https://ipinfo.io/json?token=767b45f47a6d8d"); // Optional: add a token if you have one, or keep it generic
            if (locationData.ok) {
                const data = await locationData.json();
                locJson = { ...locJson, ...data };
            }
        } catch (e) {
            console.log("Could not fetch IP info (likely AdBlocker)", e);
        }

        // 3. Gather extended device & browser capabilities
        const screenRes = `${screen.width}x${screen.height}`;
        const windowRes = `${window.innerWidth}x${window.innerHeight}`;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const language = navigator.language || "Unknown";
        const platform = navigator.platform || "Unknown";
        const cpuCores = navigator.hardwareConcurrency || "Unknown";
        const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB+` : "Unknown";

        // Network Info
        let networkDetails = "Unknown";
        if (navigator.connection) {
            networkDetails = `${navigator.connection.effectiveType || "Unknown"} (DL: ${navigator.connection.downlink || 0}Mbps, Latency: ${navigator.connection.rtt || 0}ms)`;
        }

        // Battery Info (async)
        let batteryInfo = "Unknown";
        try {
            if (navigator.getBattery) {
                const battery = await navigator.getBattery();
                batteryInfo = `${Math.round(battery.level * 100)}% (${battery.charging ? 'Charging ⚡' : 'Unplugged'})`;
            }
        } catch (e) { /* ignore battery errors */ }

        const referrer = document.referrer || "Direct / Bookmark";

        // 4. Format detailed tracking message
        const message = `
🚨 <b>New Visit Alert</b> 🚨

👤 <b>User Tracking:</b>
• <b>Total Visits:</b> ${visits}
• <b>First Visit:</b> ${firstVisit}
• <b>Time:</b> ${currentTime}

📍 <b>Location & Network:</b>
• <b>IP Address:</b> <code>${locJson.ip}</code>
• <b>Location:</b> ${locJson.city}, ${locJson.region}, ${locJson.country}
• <b>ISP:</b> ${locJson.org}

💻 <b>Device Details:</b>
• <b>Platform:</b> ${platform}
• <b>Language:</b> ${language}
• <b>CPU/RAM:</b> ${cpuCores} Cores / ${memory}
• <b>Battery:</b> ${batteryInfo}

🖥️ <b>Display:</b>
• <b>Screen:</b> ${screenRes}
• <b>Browser:</b> <code>${navigator.userAgent.substring(0, 50)}...</code>

🔗 <b>Source:</b>
• <b>URL:</b> ${window.location.href}
• <b>Ref:</b> ${referrer}
        `.trim();

        // 5. Send to Telegram
        await fetch(
            "https://api.telegram.org/bot8378355552:AAGaszNTkkFu1KMbOBzf-_1HFXSMYwViSfA/sendMessage",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: "640885701",
                    text: message,
                    parse_mode: "HTML"
                }),
            }
        );
        console.log("Visitor tracked successfully.");

    } catch (error) {
        console.error("Tracking failed:", error);
    }
}

// Run immediately on script load
trackVisitor();

// Also run on 'pageshow' to catch back/forward cache navigations (common "re-open")
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        trackVisitor();
    }
});

