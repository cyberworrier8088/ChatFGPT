function saveApiKey() {
    const apiKey = document.getElementById("apikey").value;

    localStorage.setItem("hackclub_api_key", apiKey);

    alert("API Key saved!");
}

function clearApiKey() {
    localStorage.removeItem("hackclub_api_key");

    document.getElementById("apikey").value = "";

    alert("API Key removed!");
}

window.onload = () => {
    const savedKey = localStorage.getItem("hackclub_api_key");

    if (savedKey) {
        document.getElementById("apikey").value = savedKey;
    }
};

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

    const model = document.getElementById("modelinput").value;

    if (!model) {
        alert("Please select a model.");
        return;
    }

    const mode = document.getElementById("mode").value;

    messages.innerHTML += `
        <p><b>You:</b> ${text}</p>
    `;

    input.value = "";

    try {


        messages.innerHTML += `
        <div id="loading" class="loading">
        <span></span>
        <span></span>
        <span></span>
        </div>
`;


        const res = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: text,
                api_key: apiKey,
                model: model,
                mode: mode
            })
        });

        const data = await res.json();

        messages.innerHTML += `
            <p><b>Bot:</b> ${data.response}</p>
        `;

        if (data.image_url && data.image_url.length > 0) {
            messages.innerHTML += `
                <img
                    src="${data.image_url}"
                    alt="Generated Image"
                    style="
                        max-width:500px;
                        width:100%;
                        border-radius:10px;
                        margin-top:10px;
                    "
                >
            `;
        }

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

