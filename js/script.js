// Backend API Base URL
//const API_BASE_URL = 'http://localhost:5000/messages';
//const API_BASE_URL = 'https://bytelock-backend.onrender.com/messages';
const API_BASE_URL = 'bytelock/messages';


// Encode and Save Message (Backend Integration)
async function encodeMessage() {
    const message = document.getElementById('messageToEncode').value;
    const key = document.getElementById('encodeKey').value;

    if (!message || !key) {
        return; // Do nothing if inputs are empty
    }

    try {
        const response = await fetch(`${API_BASE_URL}/encode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, key }),
        });

        const data = await response.json();

        if (response.ok) {
            const encodedMessage = data.encodedMessage;
            document.getElementById('encodedMessage').setAttribute('data-full', encodedMessage);
            document.getElementById('encodedMessage').innerText = shortenText(encodedMessage);
        }
    } catch (err) {
        console.error(err.message); // Log the error in the console
    }
}

// Decode Message (Backend Integration)
async function decodeMessage() {
    const encodedMessage = document.getElementById('messageToDecode').value;
    const key = document.getElementById('decodeKey').value;

    if (!encodedMessage || !key) {
        return; // Do nothing if inputs are empty
    }

    try {
        const response = await fetch(`${API_BASE_URL}/decode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ encodedMessage, key }),
        });

        const data = await response.json();

        if (response.ok) {
            const decodedMessage = data.decodedMessage;
            document.getElementById('decodedMessage').setAttribute('data-full', decodedMessage);
            document.getElementById('decodedMessage').innerText = shortenText(decodedMessage);
        }
    } catch (err) {
        console.error(err.message); // Log the error in the console
    }
}

// Function to shorten text display
function shortenText(text, length = 20) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// Copy encoded text
function copyEncoded() {
    const encodedElement = document.getElementById('encodedMessage');
    const fullText = encodedElement.getAttribute('data-full');
    const copyBtn = encodedElement.nextElementSibling;

    if (fullText) {
        navigator.clipboard.writeText(fullText);
        copyBtn.innerText = "Copied!";
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyBtn.innerText = "Copy";
            copyBtn.classList.remove('copied');
        }, 1500);
    }
}

// Copy decoded text
function copyDecoded() {
    const decodedElement = document.getElementById('decodedMessage');
    const fullText = decodedElement.getAttribute('data-full');
    const copyBtn = decodedElement.nextElementSibling;

    if (fullText) {
        navigator.clipboard.writeText(fullText);
        copyBtn.innerText = "Copied!";
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyBtn.innerText = "Copy";
            copyBtn.classList.remove('copied');
        }, 1500);
    }
}

// Matrix Effect (No changes needed)
const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = "QWERTYUIOPASDFGHJKLZXCVBNM01871468781!@#$%^&*?|}{[]+_=-()";

const fontSize = 12.5;
const columns = Math.floor(canvas.width / fontSize);
//const drops = Array(columns).fill(1);
const drops = Array(columns).fill().map(() => Math.floor(Math.random() * canvas.height / fontSize));


function draw() {
    ctx.fillStyle = "rgba(242, 242, 242, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#b3b3b3"; // Green color
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > .975) {
            drops[i] = 0;
        }
        drops[i] += 0.5;
    }
}

setInterval(draw, 50);

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});