const API_BASE_URL = '/bytelock/admin';
const MESSAGES_API = '/bytelock/messages';

// Check if user is admin
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!token || !user) {
        alert('Please login first');
        window.location.href = 'index.html';
        return;
    }
    
    // Check if admin (you can customize this check)
    if (user.email !== 'admin@example.com') {
        alert('Access denied. Admin only.');
        window.location.href = 'index.html';
        return;
    }
    
    loadStats();
    loadUsers();
    initMatrixEffect();
});

// Load statistics
async function loadStats() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok && data.stats) {
            document.getElementById('totalUsers').innerText = data.stats.totalUsers || 0;
            document.getElementById('totalMessages').innerText = data.stats.totalMessages || 0;
            document.getElementById('orphanMessages').innerText = data.stats.orphanMessages || 0;
        }
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

// Load all users
async function loadUsers() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('usersContainer');
    
    container.innerHTML = '<div class="loading">Loading users...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        container.innerHTML = '';
        
        if (response.ok && data.users && data.users.length > 0) {
            displayUsers(data.users);
        } else {
            container.innerHTML = '<div class="no-messages">No users found</div>';
        }
    } catch (err) {
        console.error('Error loading users:', err);
        container.innerHTML = '<div class="no-messages">Error loading users</div>';
    }
}

// Display users
function displayUsers(users) {
    const container = document.getElementById('usersContainer');
    
    users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.innerHTML = `
            <div class="user-card-header">
                <img src="${user.avatar || 'https://via.placeholder.com/50'}" 
                     alt="${user.name}" 
                     class="user-avatar-large">
                <div class="user-info">
                    <h4>${user.name}</h4>
                    <p>${user.email}</p>
                </div>
            </div>
            <div class="user-stats">
                <p><strong>Messages:</strong> ${user.messageCount || 0}</p>
                <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                <p><strong>Last Login:</strong> ${new Date(user.lastLogin).toLocaleDateString()}</p>
            </div>
            <div class="user-actions">
                <button class="view-btn" onclick="viewUserDetails('${user.id}')">View Details</button>
                <button class="delete-user-btn" onclick="deleteUser('${user.id}', '${user.name}')">Delete User</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// View user details
async function viewUserDetails(userId) {
    const token = localStorage.getItem('token');
    const modal = document.getElementById('userModal');
    const detailsDiv = document.getElementById('userDetails');
    
    detailsDiv.innerHTML = '<div class="loading">Loading user details...</div>';
    modal.style.display = 'block';
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayUserDetails(data);
        } else {
            detailsDiv.innerHTML = '<div class="no-messages">Error loading user details</div>';
        }
    } catch (err) {
        console.error('Error loading user details:', err);
        detailsDiv.innerHTML = '<div class="no-messages">Error loading user details</div>';
    }
}

// Display user details
function displayUserDetails(data) {
    const detailsDiv = document.getElementById('userDetails');
    
    let messagesHTML = '';
    if (data.messages && data.messages.list && data.messages.list.length > 0) {
        messagesHTML = data.messages.list.map(msg => `
            <div class="message-item">
                <h5>${msg.title || 'Untitled'}</h5>
                <div class="message-meta">
                    <small>Created: ${new Date(msg.createdAt).toLocaleString()}</small>
                </div>
                <div class="encrypted-text">${msg.message.substring(0, 100)}...</div>
                <button onclick="deleteUserMessage('${data.user.id}', '${msg._id}')">Delete Message</button>
            </div>
        `).join('');
    } else {
        messagesHTML = '<div class="no-messages">No messages found</div>';
    }
    
    detailsDiv.innerHTML = `
        <div class="user-detail-header">
            <img src="${data.user.avatar || 'https://via.placeholder.com/80'}" 
                 alt="${data.user.name}">
            <div class="user-detail-info">
                <h3>${data.user.name}</h3>
                <p><strong>Email:</strong> ${data.user.email}</p>
                <p><strong>User ID:</strong> ${data.user.id}</p>
                <p><strong>Joined:</strong> ${new Date(data.user.createdAt).toLocaleString()}</p>
                <p><strong>Last Login:</strong> ${new Date(data.user.lastLogin).toLocaleString()}</p>
                <p><strong>Total Messages:</strong> ${data.messages.count}</p>
            </div>
        </div>
        <div class="messages-list">
            <h4>User's Messages (${data.messages.count})</h4>
            ${messagesHTML}
        </div>
    `;
}

// Delete user
async function deleteUser(userId, userName) {
    if (!confirm(`Are you sure you want to delete user "${userName}"?\n\nThis will also delete all their messages. This action cannot be undone!`)) {
        return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('User deleted successfully');
            loadStats();
            loadUsers();
        } else {
            alert(data.message || 'Error deleting user');
        }
    } catch (err) {
        console.error('Error deleting user:', err);
        alert('Error deleting user');
    }
}

// Delete user's message
async function deleteUserMessage(userId, messageId) {
    if (!confirm('Are you sure you want to delete this message?')) {
        return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/messages/${messageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Message deleted successfully');
            viewUserDetails(userId); // Reload user details
            loadStats(); // Update stats
        } else {
            alert(data.message || 'Error deleting message');
        }
    } catch (err) {
        console.error('Error deleting message:', err);
        alert('Error deleting message');
    }
}

// Close modal
function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Navigation functions
function goHome() {
    window.location.href = 'index.html';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Matrix effect (same as other pages)
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