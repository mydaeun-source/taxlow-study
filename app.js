document.addEventListener('DOMContentLoaded', () => {
    const authOverlay = document.getElementById('auth-overlay');
    const mainContent = document.getElementById('main-content');
    const passwordInput = document.getElementById('password-input');
    const loginBtn = document.getElementById('login-btn');
    const authError = document.getElementById('auth-error');

    const navDashboard = document.getElementById('nav-dashboard');
    const navProgress = document.getElementById('nav-progress');
    const dashboardSection = document.getElementById('dashboard-section');
    const progressSection = document.getElementById('progress-section');

    const todoList = document.getElementById('todo-list');
    const remakeBtn = document.getElementById('remake-btn');

    const statsGrid = document.getElementById('stats-grid');
    const logBody = document.getElementById('log-body');

    // 1. Authentication Logic - Password updated to '7008'
    loginBtn.addEventListener('click', () => {
        if (passwordInput.value === '7008') {
            authOverlay.classList.add('hidden');
            mainContent.classList.remove('hidden');
            loadDashboard();
        } else {
            authError.textContent = '비밀번호가 올바르지 않습니다.';
        }
    });

    // 2. Navigation
    navDashboard.addEventListener('click', () => {
        navDashboard.classList.add('active');
        navProgress.classList.remove('active');
        dashboardSection.classList.remove('hidden');
        progressSection.classList.add('hidden');
        loadDashboard();
    });

    navProgress.addEventListener('click', () => {
        navProgress.classList.add('active');
        navDashboard.classList.remove('active');
        progressSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
        loadProgress();
    });

    // 3. Dashboard Logic
    async function loadDashboard() {
        try {
            const response = await fetch('/api/topics');
            const data = await response.json();
            renderTodoList(data);
        } catch (err) {
            console.error('Failed to load topics:', err);
        }
    }

    function renderTodoList(topics) {
        todoList.innerHTML = '';
        topics.forEach(topic => {
            const card = document.createElement('div');
            card.className = 'todo-card';
            card.innerHTML = `
                <div class="part-tag">PART ${topic.part}</div>
                <div class="topic-title">${topic.topic}</div>
                <div class="card-actions">
                    <button class="complete-btn" data-id="${topic.id}" data-part="${topic.part}" data-topic="${topic.topic}">완료</button>
                    <button class="cancel-btn">취소</button>
                </div>
            `;

            card.querySelector('.complete-btn').addEventListener('click', async (e) => {
                const { id, part, topic: topicName } = e.target.dataset;
                await completeTopic(id, part, topicName);
                card.style.opacity = '0.5';
                card.querySelector('.card-actions').innerHTML = '<span style="color:var(--success)">완료됨</span>';
            });

            card.querySelector('.cancel-btn').addEventListener('click', () => {
                card.style.opacity = '0.5';
                card.querySelector('.card-actions').innerHTML = '<span style="color:var(--text-muted)">제거됨</span>';
            });

            todoList.appendChild(card);
        });
    }

    async function completeTopic(id, part, topic) {
        try {
            const response = await fetch('/api/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, part, topic })
            });
            if (response.ok) {
                // Keep the current view, but data is updated in DB
            }
        } catch (err) {
            console.error('Failed to complete topic:', err);
        }
    }

    remakeBtn.addEventListener('click', () => {
        loadDashboard();
    });

    // 4. Progress Logic
    async function loadProgress() {
        try {
            const response = await fetch('/api/progress');
            const { stats, logs } = await response.json();

            statsGrid.innerHTML = '';
            stats.forEach(s => {
                const item = document.createElement('div');
                item.className = 'stat-item';
                item.innerHTML = `
                    <div class="stat-label">PART ${s.part}</div>
                    <div class="stat-value">${s.total_count}</div>
                    <div class="stat-label">학습 완료</div>
                `;
                statsGrid.appendChild(item);
            });

            logBody.innerHTML = '';
            logs.forEach(log => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>Part ${log.part}</td>
                    <td>${log.topic}</td>
                    <td>${log.dodate}</td>
                `;
                logBody.appendChild(tr);
            });
        } catch (err) {
            console.error('Failed to load progress:', err);
        }
    }
});
