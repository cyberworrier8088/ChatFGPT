// script.js



// this is made for fun.
// this using hack club api
/// Chat fake GPP

//  enjoy My code :)


// === globaly functions :) ====

function openSettings() {
    document.getElementById('popupOverlay').style.display = 'block';
}

function submitForm() {
    const keyInput = document.getElementById('KeyInput');
    const apiKey = keyInput.value.trim();

    if (!apiKey) {
        alert("Please enter an API key.");
        return;
    }

    localStorage.setItem("hackclub_api_key", apiKey);
    alert("API Key saved!");

    // Close the popup after saving
    document.getElementById('popupOverlay').style.display = 'none';
}

function clearApiKey() {
    localStorage.removeItem("hackclub_api_key");
    document.getElementById("KeyInput").value = "";
    alert("API Key removed!");
}

function model() {
    const modelInput = document.getElementById("modelinput").value;
    if (!modelInput) {
        alert("Please select or type a model name.");
        return;
    }
    alert("Model set to: " + modelInput);
}

// === this privent XSS attack ===
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// === dom loading setup ===
document.addEventListener('DOMContentLoaded', function () {
    const popupOverlay = document.getElementById('popupOverlay');
    const closePopupBtn = document.getElementById('closePopup');

    // this for firsst time user opening time open pop or setuped api that time auto use that in local storage.  :)
    const savedKey = localStorage.getItem("hackclub_api_key");
    if (!savedKey) {
        popupOverlay.style.display = 'block';
    } else {
        //prefiling the key input if one is already savd
        document.getElementById("KeyInput").value = savedKey;
    }

    // close the popup when the close button is clicked
    closePopupBtn.addEventListener('click', function () {
        popupOverlay.style.display = 'none';
    });

    // close the popup when clicking outside the popup content
    popupOverlay.addEventListener('click', function (event) {
        if (event.target === popupOverlay) {
            popupOverlay.style.display = 'none';
        }
    });
});

// === chat logic ===
async function sendMessage() {
    const input = document.getElementById("input");
    const messages = document.getElementById("messages");

    const text = input.value.trim();

    if (!text) return;

    const apiKey = localStorage.getItem("hackclub_api_key");

    if (!apiKey) {
        alert("Please save your API key first.");
        openSettings();
        return;
    }

    const modelValue = document.getElementById("modelinput").value;

    if (!modelValue) {
        alert("Please select a model.");
        return;
    }

    const mode = document.getElementById("mode").value;

    // add user message escaped to prevent XSS ^~^
    const userMsg = document.createElement('p');
    userMsg.innerHTML = '<b>You:</b> ' + escapeHtml(text);
    messages.appendChild(userMsg);

    input.value = "";

    // add loading indicator
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading';
    loadingEl.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(loadingEl);

    messages.scrollTop = messages.scrollHeight;

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: text,
                api_key: apiKey,
                model: modelValue,
                mode: mode
            })
        });

        // remve loading indicator
        if (loadingEl.parentNode) {
            loadingEl.parentNode.removeChild(loadingEl);
        }

        if (!res.ok) {
            const errText = await res.text();
            const errMsg = document.createElement('p');
            errMsg.innerHTML = '<b>Error:</b> ' + escapeHtml(errText || 'Server returned ' + res.status);
            messages.appendChild(errMsg);
            return;
        }

        const data = await res.json();

        const botMsg = document.createElement('p');
        botMsg.innerHTML = '<b>Bot:</b> ' + escapeHtml(data.response);
        messages.appendChild(botMsg);

        if (data.image_url && data.image_url.length > 0) {
            const img = document.createElement('img');
            img.src = data.image_url;
            img.alt = 'Generated Image';
            img.style.maxWidth = '500px';
            img.style.width = '100%';
            img.style.borderRadius = '10px';
            img.style.marginTop = '10px';
            messages.appendChild(img);
        }

        messages.scrollTop = messages.scrollHeight;

    } catch (err) {
        console.error(err);

        // remove loading indicator on error too
        if (loadingEl.parentNode) {
            loadingEl.parentNode.removeChild(loadingEl);
        }

        const errMsg = document.createElement('p');
        errMsg.innerHTML = '<b>Error:</b> Failed to contact server.';
        messages.appendChild(errMsg);
    }
}

// send on enter key
document.getElementById("input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});