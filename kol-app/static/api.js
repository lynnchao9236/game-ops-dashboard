// API工具模块
// 自动检测子路径前缀，适配 your-domain.com/kol/ 部署
const pathParts = window.location.pathname.split('/static/');
const basePath = pathParts[0] || '';
const API_BASE = basePath + '/api';
export { API_BASE, basePath };

export async function request(url, options = {}) {
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    };
    try {
        const resp = await fetch(`${API_BASE}${url}`, config);
        let data;
        const text = await resp.text();
        try {
            data = JSON.parse(text);
        } catch (parseErr) {
            console.error('JSON parse error:', parseErr, 'Response text:', text.substring(0, 500));
            throw new Error(`服务器错误 (HTTP ${resp.status})，请稍后重试`);
        }
        if (!resp.ok) {
            throw new Error(data.detail || data.message || `请求失败 (${resp.status})`);
        }
        if (data.code !== undefined && data.code !== 0) {
            throw new Error(data.detail || data.message || '请求失败');
        }
        return data;
    } catch (err) {
        console.error('API Error:', err);
        throw err;
    }
}

export function formatNumber(num) {
    if (!num) return '0';
    if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    return num.toLocaleString();
}

export function getStatusInfo(status) {
    const map = {
        1: { text: '活跃', class: 'status-active', icon: 'ri-checkbox-circle-line' },
        2: { text: '暂停', class: 'status-paused', icon: 'ri-pause-circle-line' },
        3: { text: '黑名单', class: 'status-blocked', icon: 'ri-forbid-line' },
    };
    return map[status] || map[1];
}

export function renderStars(rating) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

export function renderTags(tagsStr, maxCount = 5) {
    if (!tagsStr) return '';
    const colors = ['tag-primary', 'tag-success', 'tag-warning', 'tag-info', 'tag-purple'];
    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    const shown = tags.slice(0, maxCount);
    let html = shown.map((t, i) => `<span class="tag ${colors[i % colors.length]}">${t}</span>`).join('');
    if (tags.length > maxCount) {
        html += `<span class="tag tag-primary">+${tags.length - maxCount}</span>`;
    }
    return html;
}

export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-indigo-500',
    };
    const icons = {
        success: 'ri-check-line',
        error: 'ri-close-line',
        warning: 'ri-alert-line',
        info: 'ri-information-line',
    };
    const toast = document.createElement('div');
    toast.className = `toast ${colors[type]} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm`;
    toast.innerHTML = `<i class="${icons[type]}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}