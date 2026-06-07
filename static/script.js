function saveApiKey() {
    const apiKey = document.getElementById("apikey").value;

    localStorage.setItem("hackclub_api_key", apiKey);

    alert("API Key saved!");
}

window.onload = () => {
    const savedKey = localStorage.getItem("hackclub_api_key");

    if (savedKey) {
        document.getElementById("apikey").value = savedKey;
    }
};

function clearApiKey() {
    localStorage.removeItem("hackclub_api_key");

    document.getElementById("apikey").value = "";

    alert("API Key removed!");
}

async function sendMessage() {
    const input = document.getElementById("input");
    const messages = document.getElementById("messages");

    const text = input.value.trim();

    if (!text) return;

    const apiKey = localStorage.getItem("hackclub_api_key");

    if (!apiKey) {
        alert("Please save your API key first.");
        return;
    }

    messages.innerHTML += `
        <p><b>You:</b> ${text}</p>
    `;

    input.value = "";

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: text,
                api_key: apiKey
            })
        });

        const data = await res.json();

        messages.innerHTML += `
            <p><b>Bot:</b> ${data.response}</p>
        `;

        messages.scrollTop = messages.scrollHeight;

    } catch (err) {
        console.error(err);

        messages.innerHTML += `
            <p><b>Error:</b> Failed to contact server.</p>
        `;
    }
}

document.getElementById("input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});