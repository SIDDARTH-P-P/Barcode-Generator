async function trackVisitor() {
    try {
        // 1. Track visit count and times using LocalStorage
        let visits = localStorage.getItem("visitCount");
        const firstVisit = localStorage.getItem("firstVisit") || new Date().toLocaleString();

        if (!visits) {
            visits = 1;
            localStorage.setItem("firstVisit", firstVisit);
            localStorage.setItem("lastDailyLog", new Date().toDateString());
        } else {
            visits = parseInt(visits) + 1;
        }
        localStorage.setItem("visitCount", visits);

        // 2. Get IP and Location info
        const locationData = await fetch("https://ipinfo.io/json");
        const locJson = await locationData.json();

        const now = new Date();
        const currentTime = now.toLocaleString();

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
        } catch (e) {
            // ignore battery errors
        }

        const referrer = document.referrer || "Direct / Bookmark";

        // 4. Format detailed tracking message
        const message = `
🚨 *Visitor Activity Alert* 🚨

👤 *User Tracking:*
• *Total Visits:* ${visits}
• *First Visit:* ${firstVisit}
• *Current Login:* ${currentTime}

📍 *Location & Network:*
• *IP Address:* \`${locJson.ip || "Unknown"}\`
• *Location:* ${locJson.city || "Unknown"}, ${locJson.region || "Unknown"}, ${locJson.country || "Unknown"}
• *Coordinates:* \`${locJson.loc || "Unknown"}\`
• *ISP / Org:* ${locJson.org || "Unknown"}
• *Timezone:* ${timezone}

💻 *Device Details:*
• *Platform:* ${platform}
• *Browser/Agent:* \`${navigator.userAgent}\`
• *Language:* ${language}
• *CPU Cores:* ${cpuCores}
• *RAM Estimate:* ${memory}
• *Battery:* ${batteryInfo}

🖥️ *Display & Connection:*
• *Screen Res:* ${screenRes}
• *Window Res:* ${windowRes}
• *Network Type:* ${networkDetails}

🔗 *Navigation Data:*
• *URL:* ${window.location.href}
• *Referrer:* ${referrer}
        `.trim();

        // 5. (Optional logic) Check if it's after 10 PM for daily summary label
        // Note: Client-side JS can only send this if the user is actively visiting the page after 10 PM.
        const lastLogDay = localStorage.getItem("lastDailyLog");
        const isAfter10PM = now.getHours() >= 22;
        const currentDayStr = now.toDateString();

        let finalMessage = message;
        if (isAfter10PM && lastLogDay !== currentDayStr) {
            finalMessage = `🌙 *End of Day 10 PM Summary* 🌙\n\n` + message;
            localStorage.setItem("lastDailyLog", currentDayStr);
        }

        // 6. Send to Telegram
        await fetch(
            "https://api.telegram.org/bot8378355552:AAGaszNTkkFu1KMbOBzf-_1HFXSMYwViSfA/sendMessage",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: "640885701",
                    text: finalMessage,
                    parse_mode: "Markdown" // Use Markdown for better formatting
                }),
            },
        );
    } catch (error) {
        console.log("Tracking failed", error);
    }
}

trackVisitor();
