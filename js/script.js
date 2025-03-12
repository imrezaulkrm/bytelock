// Custom encode function
function customEncode(message, key) {
    let reversedMessage = message.split('').reverse().join(''); // Reverse the message

    let shiftedMessage = '';
    for (let i = 0; i < reversedMessage.length; i++) {
        let charCode = reversedMessage.charCodeAt(i);
        let shiftValue = key.charCodeAt(i % key.length) + (i % 3 === 0 ? 5 : 0);
        shiftedMessage += String.fromCharCode(charCode + shiftValue);
    }

    return btoa(unescape(encodeURIComponent(shiftedMessage))); // Proper encoding
}

// Custom decode function
function customDecode(encodedMessage, key) {
    let shiftedMessage = decodeURIComponent(escape(atob(encodedMessage))); // Proper decoding

    let originalMessage = '';
    for (let i = 0; i < shiftedMessage.length; i++) {
        let charCode = shiftedMessage.charCodeAt(i);
        let shiftValue = key.charCodeAt(i % key.length) + (i % 3 === 0 ? 5 : 0);
        originalMessage += String.fromCharCode(charCode - shiftValue);
    }

    return originalMessage.split('').reverse().join(''); // Reverse back to original
}

// Encode the message
function encodeMessage() {
    const message = document.getElementById('messageToEncode').value;
    const key = document.getElementById('encodeKey').value;

    if (message && key) {
        const encodedMessage = customEncode(message, key);
        document.getElementById('encodedMessage').setAttribute('data-full', encodedMessage);
        document.getElementById('encodedMessage').innerText = shortenText(encodedMessage);
    } else {
        alert("Please enter both message and key!");
    }
}

// Decode the message
function decodeMessage() {
    const encodedMessage = document.getElementById('messageToDecode').value;
    const key = document.getElementById('decodeKey').value;

    if (encodedMessage && key) {
        const decodedMessage = customDecode(encodedMessage, key);
        document.getElementById('decodedMessage').setAttribute('data-full', decodedMessage);
        document.getElementById('decodedMessage').innerText = shortenText(decodedMessage);
    } else {
        alert("Please enter both encoded message and key!");
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

/*
// Function to generate random floating objects
function createFloatingObjects() {
    const numObjects = 30; // Increased number of floating objects
    const shapes = ['circle', 'rectangle', 'triangle', 'line', 'hexagon', 'star', 'square', 'pentagon', 'bike', 'computer', 'phone']; // Added more shapes

    for (let i = 0; i < numObjects; i++) {
        const object = document.createElement('div');
        const shape = shapes[Math.floor(Math.random() * shapes.length)]; // Random shape
        object.classList.add('floating-object', shape);

        // Randomize the position of the object
        const xPos = Math.random() * window.innerWidth; // Random X position
        const yPos = Math.random() * window.innerHeight; // Random Y position

        // Apply position to the object
        object.style.left = `${xPos}px`;
        object.style.top = `${yPos}px`;

        // Set random animation delay for each object to create more randomness
        const animationDelay = Math.random() * 5 + 's'; // Random animation delay
        object.style.animationDelay = animationDelay;

        // Add to the body
        document.body.appendChild(object); // Add the object to the body
    }
}
// Call the function to generate the objects
createFloatingObjects();
*/

const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*?|}{[]+_=-()";
const fontSize = 15;
const columns = Math.floor(canvas.width / fontSize);
const drops = Array(columns).fill(1);

function draw() {
    ctx.fillStyle = "rgba(242, 242, 242, 0.2)";
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
