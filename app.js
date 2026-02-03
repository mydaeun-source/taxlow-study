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
    async function loadDashboard(regenerate = false) {
        todoList.innerHTML = '<div class="loading-msg">데이터를 불러오는 중...</div>';
        try {
            const url = regenerate ? '/api/topics?regenerate=true' : '/api/topics';
            const response = await fetch(url);
            if (!response.ok) throw new Error('API 응답 오류');
            const data = await response.json();
            if (data.length === 0) {
                todoList.innerHTML = '<div class="error-msg">표시할 주제가 없습니다. 데이터베이스를 확인해주세요.</div>';
            } else {
                renderTodoList(data);
            }
        } catch (err) {
            console.error('Failed to load topics:', err);
            todoList.innerHTML = '<div class="error-msg">데이터를 불러오지 못했습니다. (서버 연결 확인 필요)</div>';
        }
    }

    function renderTodoList(topics) {
        todoList.innerHTML = '';
        topics.forEach(topic => {
            const card = document.createElement('div');
            card.className = 'todo-card';
            card.innerHTML = `
                <div class="part-tag">${topic.part}</div>
                <div class="topic-title">${topic.topic}</div>
                <div class="card-actions">
                    <button class="complete-btn" data-id="${topic.id}" data-part="${topic.part}" data-topic="${topic.topic}">완료</button>
                    <button class="cancel-btn">취소</button>
                </div>
            `;

            card.querySelector('.complete-btn').addEventListener('click', async (e) => {
                const btn = e.currentTarget;
                const { id, part, topic: topicName } = btn.dataset;

                console.log("완료 버튼 클릭됨:", { id, part, topicName }); // 디버깅용 로그

                const result = await completeTopic(id, part, topicName);
                if (result.success) {
                    card.style.opacity = '0.5';
                    card.querySelector('.card-actions').innerHTML = '<span style="color:var(--success)">완료됨</span>';
                } else {
                    alert('저장에 실패했습니다: ' + (result.error || '알 수 없는 서버 오류'));
                }
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

            let data;
            try {
                data = await response.json();
            } catch (jsonErr) {
                return { success: false, error: '서버가 올바른 응답을 보내지 않았습니다. (JSON 파싱 오류)' };
            }

            if (!response.ok) {
                console.error('저장 실패 응답:', data);
                return { success: false, error: data.error };
            }
            return { success: true };
        } catch (err) {
            console.error('네트워크 또는 기타 통신 오류:', err);
            return { success: false, error: '서버 접속에 실패했습니다. 인터넷 연결이나 서버 상태를 확인하세요.' };
        }
    }

    remakeBtn.addEventListener('click', () => {
        if (confirm('현재 리스트를 지우고 새로운 추천 주제를 생성하시겠습니까?')) {
            loadDashboard(true);
        }
    });

    // 4. Progress Logic
    async function loadProgress() {
        statsGrid.innerHTML = '<div class="loading-msg">진도 데이터를 불러오는 중...</div>';
        logBody.innerHTML = '<tr><td colspan="3" style="text-align:center">기록을 불러오는 중...</td></tr>';

        try {
            const response = await fetch('/api/progress');
            if (!response.ok) throw new Error('API 응답 오류');

            const data = await response.json();
            const { stats, logs } = data;

            statsGrid.innerHTML = '';
            if (!stats || stats.length === 0) {
                statsGrid.innerHTML = '<div class="info-msg">아직 학습 데이터가 없습니다.</div>';
            } else {
                statsGrid.innerHTML = ''; // Clear again to be safe
                stats.forEach(s => {
                    const item = document.createElement('div');
                    item.className = 'stat-item';
                    item.innerHTML = `
                        <div class="stat-label">Part ${s.part}</div>
                        <div class="stat-value">${s.total_count}</div>
                        <div class="stat-label">학습 완료</div>
                    `;
                    statsGrid.appendChild(item);
                });
            }

            logBody.innerHTML = '';
            if (!logs || logs.length === 0) {
                logBody.innerHTML = '<tr><td colspan="3" style="text-align:center">최근 학습 기록이 없습니다.</td></tr>';
            } else {
                logs.forEach(log => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>Part ${log.part}</td>
                        <td>${log.topic}</td>
                        <td>${log.study_date}</td>
                    `;
                    logBody.appendChild(tr);
                });
            }
        } catch (err) {
            console.error('진도 로드 실패 상세:', err);
            statsGrid.innerHTML = `<div class="error-msg">진도 데이터를 불러오지 못했습니다. (${err.message})</div>`;
            logBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--danger)">데이터 로드 실패</td></tr>';
        }
    }
});
