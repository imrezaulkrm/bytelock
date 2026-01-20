// Backend API Base URL
const API_BASE_URL = '/bytelock/messages';
const AUTH_BASE_URL = '/bytelock/auth';

// Check login status on page load
window.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});

// Update navbar based on login status
function updateNavbar() {
    const navRight = document.getElementById('navRight');
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (token && user) {
        navRight.innerHTML = `
            <span class="user-info">
                <img src="${user.avatar || 'image/default-avatar.png'}" alt="Avatar" class="user-avatar">
                <span>${user.name}</span>
            </span>
            <button onclick="goToDashboard()" class="nav-btn">My Messages</button>
            ${user.email === 'admin@example.com' ? '<button onclick="goToAdmin()" class="nav-btn admin-btn">Admin</button>' : ''}
            <button onclick="logout()" class="nav-btn logout-btn">Logout</button>
        `;
    } else {
        navRight.innerHTML = `
            <button onclick="loginWithGoogle()" class="nav-btn login-btn">
                <img src="https://www.google.com/favicon.ico" alt="G" style="width:16px; margin-right:5px;">
                Login with Google
            </button>
        `;
    }
}

// Google Login
function loginWithGoogle() {
    window.location.href = `${AUTH_BASE_URL}/google`;
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateNavbar();
    showMessage('Logged out successfully', 'success');
}

// Navigate to dashboard
function goToDashboard() {
    window.location.href = 'dashboard.html';
}

// Navigate to admin panel
function goToAdmin() {
    window.location.href = 'admin.html';
}

// Show message
function showMessage(text, type) {
    const messageBox = document.getElementById('messageBox');
    messageBox.innerText = text;
    messageBox.className = type;
    messageBox.style.display = 'block';
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000);
}

// Encode and Save Message (Updated with auth)
async function encodeMessage() {
    const message = document.getElementById('messageToEncode').value;
    const key = document.getElementById('encodeKey').value;

    if (!message || !key) {
        showMessage('Please enter both message and key', 'error');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/encode`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ message, key }),
        });

        const data = await response.json();

        if (response.ok) {
            const encodedMessage = data.encodedMessage;
            document.getElementById('encodedMessage').setAttribute('data-full', encodedMessage);
            document.getElementById('encodedMessage').innerText = shortenText(encodedMessage);
            
            showMessage(data.message || 'Message encoded successfully', 'success');
        } else {
            showMessage(data.message || 'Error encoding message', 'error');
        }
    } catch (err) {
        console.error(err);
        showMessage('Network error. Please try again.', 'error');
    }
}

// Decode Message (No changes needed, but added error handling)
async function decodeMessage() {
    const encodedMessage = document.getElementById('messageToDecode').value;
    const key = document.getElementById('decodeKey').value;

    if (!encodedMessage || !key) {
        showMessage('Please enter both encoded message and key', 'error');
        return;
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
            
            showMessage('Message decoded successfully', 'success');
        } else {
            showMessage(data.message || 'Wrong key or corrupted data', 'error');
        }
    } catch (err) {
        console.error(err);
        showMessage('Network error. Please try again.', 'error');
    }
}

// Function to shorten text display
function shortenText(text, length = 20) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// Copy encoded text (no changes)
function copyEncoded() {
    const encodedElement = document.getElementById('encodedMessage');
    const fullText = encodedElement.getAttribute('data-full');
    
    if (!fullText) {
        showMessage('Nothing to copy', 'error');
        return;
    }

    const copyBtn = encodedElement.nextElementSibling;
    
    navigator.clipboard.writeText(fullText).then(() => {
        showCopySuccess(copyBtn);
    }).catch(err => {
        console.error("Failed to copy:", err);
    });
}

// Copy decoded text (no changes)
function copyDecoded() {
    const decodedElement = document.getElementById('decodedMessage');
    const fullText = decodedElement.getAttribute('data-full');
    
    if (!fullText) {
        showMessage('Nothing to copy', 'error');
        return;
    }

    const copyBtn = decodedElement.nextElementSibling;
    
    navigator.clipboard.writeText(fullText).then(() => {
        showCopySuccess(copyBtn);
    }).catch(err => {
        console.error("Failed to copy:", err);
    });
}

// Show copy success
function showCopySuccess(copyBtn) {
    copyBtn.innerText = "Copied!";
    copyBtn.classList.add('copied');
    setTimeout(() => {
        copyBtn.innerText = "Copy";
        copyBtn.classList.remove('copied');
    }, 1500);
}

// Matrix Effect (No changes)
const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const letters = "QWERTYUIOPASDFGHJKLZXCVBNM01871468781!@#$%^&*?|}{[]+_=-()";
const fontSize = 12.5;
const columns = Math.floor(canvas.width / fontSize);
const drops = Array(columns).fill().map(() => Math.floor(Math.random() * canvas.height / fontSize));

function draw() {
    ctx.fillStyle = "rgba(242, 242, 242, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#b3b3b3";
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