const API_BASE_URL = '/bytelock/messages';
let currentMessageId = null;
let currentEncryptedContent = null;

// Check if user is logged in
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    loadMessages();
    initMatrixEffect();
});

// Load user's messages
async function loadMessages() {
    const token = localStorage.getItem('token');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const messagesContainer = document.getElementById('messagesContainer');
    const noMessages = document.getElementById('noMessages');
    
    loadingSpinner.style.display = 'block';
    messagesContainer.innerHTML = '';
    noMessages.style.display = 'none';
    
    try {
        const response = await fetch(`${API_BASE_URL}/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        loadingSpinner.style.display = 'none';
        
        if (response.ok && data.messages && data.messages.length > 0) {
            displayMessages(data.messages);
        } else {
            noMessages.style.display = 'block';
        }
    } catch (err) {
        console.error(err);
        loadingSpinner.style.display = 'none';
        alert('Error loading messages');
    }
}

// Display messages
function displayMessages(messages) {
    const container = document.getElementById('messagesContainer');
    
    messages.forEach(msg => {
        const card = document.createElement('div');
        card.className = 'message-card';
        card.innerHTML = `
            <h4>${msg.title || 'Untitled'}</h4>
            <p><small>Created: ${new Date(msg.createdAt).toLocaleString()}</small></p>
            <div class="encrypted-preview">${msg.message.substring(0, 50)}...</div>
            <div class="message-actions">
                <button class="decode-btn" onclick="openDecodeModal('${msg._id}', '${msg.title}', '${msg.message}')">Decode</button>
                <button class="delete-btn" onclick="deleteMessage('${msg._id}')">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Open decode modal
function openDecodeModal(id, title, encryptedContent) {
    currentMessageId = id;
    currentEncryptedContent = encryptedContent;
    document.getElementById('modalTitle').innerText = title || 'Untitled';
    document.getElementById('modalKey').value = '';
    document.getElementById('modalResult').style.display = 'none';
    document.getElementById('decodeModal').style.display = 'block';
}

// Close modal
function closeDecodeModal() {
    document.getElementById('decodeModal').style.display = 'none';
}

// Decode message in modal
async function decodeMessageInModal() {
    const key = document.getElementById('modalKey').value;
    const resultDiv = document.getElementById('modalResult');
    
    if (!key) {
        alert('Please enter a key');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/decode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                encodedMessage: currentEncryptedContent, 
                key 
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            resultDiv.style.display = 'block';
            resultDiv.style.background = '#d4edda';
            resultDiv.style.color = '#155724';
            resultDiv.innerHTML = `<strong>Decoded:</strong><br>${data.decodedMessage}`;
        } else {
            resultDiv.style.display = 'block';
            resultDiv.style.background = '#f8d7da';
            resultDiv.style.color = '#721c24';
            resultDiv.innerText = 'Wrong key!';
        }
    } catch (err) {
        alert('Error decoding message');
    }
}

// Delete message
async function deleteMessage(id) {
    if (!confirm('Are you sure you want to delete this message?')) {
        return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            alert('Message deleted successfully');
            loadMessages();
        } else {
            alert('Error deleting message');
        }
    } catch (err) {
        alert('Error deleting message');
    }
}

// Navigation
function goHome() {
    window.location.href = 'index.html';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Matrix effect (copy from script.js)
function initMatrixEffect() {
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
}