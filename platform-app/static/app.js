// app.js - 主应用逻辑（响应式PC/移动端通用版）
import {
    fetchPlatforms, fetchAllStrategies, fetchStrategies,
    fetchDocuments, deleteDocument, fetchDocumentDetail,
    fetchLogs, uploadText, uploadUrl, uploadFile, batchUpdateStrategies,
    askQuestion, resetReportStatus, verifyReportPassword,
    parseReportText, uploadConfirmedReport,
    editReportData, deleteReportData,
    extractKeypoints, getOriginalFileUrl, getPdfPreviewUrl,
    categoryMap
} from './data.js?v=20260522';
import {
    renderHeroStats, renderPlatformCards, renderPlatformHeader,
    renderStrategyContent, renderRecentLogs, renderFullLogs,
    renderDocsList, populatePlatformSelects
} from './components.js?v=20260522';

// ==================== 全局状态 ====================
const state = {
    currentPage: 'home',
    currentPlatform: null,
    currentCategory: 'promotion',
    platforms: [],
    strategies: [],
    platformStrategies: [],
    docs: [],
    logs: [],
    messages: [],
    sending: false,
    docFilter: 'all',
    docsUnlocked: false  // 文档管理页面是否已解锁
};

// ==================== DOM 引用 ====================
const $ = id => document.getElementById(id);

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initQuickActions();
    initUpload();
    initAsk();
    initDocFilter();
    initPlatformActions();
    initModals();
    loadHomeData();
});

// ==================== 导航系统 ====================
function initNavigation() {
    // PC侧边栏
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            navigateTo(item.dataset.page);
        });
    });

    // 移动端底部TabBar
    document.querySelectorAll('.tabbar-item').forEach(item => {
        item.addEventListener('click', () => {
            navigateTo(item.dataset.page);
        });
    });

    // 移动端返回按钮
    $('nav-back').addEventListener('click', goBack);

    // PC刷新按钮
    $('pc-refresh').addEventListener('click', refreshCurrentPage);
    $('nav-refresh').addEventListener('click', refreshCurrentPage);
}

function navigateTo(page, options = {}) {
    // 文档管理页面需要密码验证
    if (page === 'docs' && !state.docsUnlocked) {
        showDocsPasswordModal(() => {
            state.docsUnlocked = true;
            navigateTo('docs', options);
        });
        return;
    }

    // 保存历史用于返回
    if (page === 'platform' && state.currentPage !== 'platform') {
        state.previousPage = state.currentPage;
    }

    state.currentPage = page;

    // 隐藏所有页面，显示目标页面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = $(`page-${page}`);
    if (targetPage) targetPage.classList.add('active');

    // 更新PC侧边栏active
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // 更新移动端TabBar active
    const isMainTab = ['home', 'ask', 'upload', 'docs', 'logs'].includes(page);
    document.querySelectorAll('.tabbar-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // 移动端返回按钮显示逻辑
    const navBack = $('nav-back');
    if (page === 'platform') {
        navBack.classList.remove('hidden');
    } else {
        navBack.classList.add('hidden');
    }

    // 更新面包屑
    updateBreadcrumb(page, options);
    // 更新移动端标题
    updateMobileTitle(page, options);

    // 页面进入时加载数据
    if (page === 'docs') loadDocs();
    if (page === 'logs') loadLogs();
    if (page === 'upload') {
        // 确保平台下拉框已填充数据
        if (state.platforms.length === 0) {
            fetchPlatforms().then(res => {
                if (res.code === 0 && res.data) {
                    state.platforms = res.data;
                    populatePlatformSelects(state.platforms);
                    // 填充完成后再设置预选值
                    if (options.platformId) {
                        const selects = document.querySelectorAll('#text-platform, #url-platform, #file-platform');
                        selects.forEach(s => { s.value = options.platformId; });
                    }
                }
            });
        } else {
            // 平台数据已有，确保下拉框已填充
            populatePlatformSelects(state.platforms);
            if (options.platformId) {
                setTimeout(() => {
                    const selects = document.querySelectorAll('#text-platform, #url-platform, #file-platform');
                    selects.forEach(s => { s.value = options.platformId; });
                }, 100);
            }
        }
        if (options.tab === 'text') switchUploadTab('text');
    }

    // 滚动到顶部
    window.scrollTo(0, 0);
}

function goBack() {
    if (state.currentPage === 'platform') {
        navigateTo(state.previousPage || 'home');
    } else {
        navigateTo('home');
    }
}

function updateBreadcrumb(page, options = {}) {
    const bc = $('breadcrumb');
    const pageNames = {
        home: '首页概览', ask: '智能提问', upload: '上传文档',
        docs: '文档管理', logs: '更新日志', platform: ''
    };

    if (page === 'platform') {
        const name = options.platformName || state.currentPlatform?.name || '';
        bc.innerHTML = `
            <span class="bc-item" onclick="window.__goHome()">首页</span>
            <span class="bc-sep">/</span>
            <span class="bc-item active">${name} 策略</span>
        `;
    } else {
        bc.innerHTML = `<span class="bc-item active">${pageNames[page] || page}</span>`;
    }
}

function updateMobileTitle(page, options = {}) {
    const titles = {
        home: '策略中心', ask: '智能问答', upload: '上传信息',
        docs: '文档管理', logs: '更新日志'
    };
    if (page === 'platform') {
        $('nav-title').textContent = (options.platformName || state.currentPlatform?.name || '') + ' 策略';
    } else {
        $('nav-title').textContent = titles[page] || '策略中心';
    }
}

// 暴露给面包屑点击
window.__goHome = () => navigateTo('home');

function refreshCurrentPage() {
    const page = state.currentPage;
    if (page === 'home') loadHomeData();
    else if (page === 'platform' && state.currentPlatform) loadPlatformData(state.currentPlatform);
    else if (page === 'docs') loadDocs();
    else if (page === 'logs') loadLogs();
    showToast('刷新成功');
}

// ==================== 首页数据 ====================
async function loadHomeData() {
    showLoading('加载数据...');
    try {
        const [platRes, stratRes, logRes] = await Promise.all([
            fetchPlatforms(), fetchAllStrategies(), fetchLogs(5)
        ]);

        state.platforms = (platRes.code === 0 ? platRes.data : []) || [];
        state.strategies = (stratRes.code === 0 ? stratRes.data : []) || [];
        const logs = (logRes.code === 0 ? logRes.data : []) || [];

        // 渲染Hero统计
        renderHeroStats($('hero-stats'), state.platforms, state.strategies);

        // 渲染平台卡片
        renderPlatformCards($('platform-grid'), state.platforms, state.strategies, (platform) => {
            state.currentPlatform = platform;
            loadPlatformData(platform);
            navigateTo('platform', { platformName: platform.name });
        });

        // 渲染最近日志
        renderRecentLogs($('recent-logs'), logs);

        // 填充上传页平台选择
        populatePlatformSelects(state.platforms);
    } catch (e) {
        console.error('loadHomeData error:', e);
        showToast('加载失败');
    }
    hideLoading();
}

// ==================== 平台详情 ====================
async function loadPlatformData(platform) {
    showLoading('加载策略...');
    try {
        const res = await fetchStrategies(platform.id);
        state.platformStrategies = (res.code === 0 ? res.data : []) || [];

        renderPlatformHeader($('platform-header'), platform, state.platformStrategies);
        renderCurrentCategory();
    } catch (e) {
        console.error('loadPlatformData error:', e);
        showToast('加载失败');
    }
    hideLoading();
}

function renderCurrentCategory() {
    // 更新Tab激活状态
    document.querySelectorAll('#tab-bar .tab-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === state.currentCategory);
    });
    renderStrategyContent($('strategy-content'), state.platformStrategies, state.currentCategory);

    // 绑定报告数据交互事件
    bindReportDataEvents();
}

// ==================== 快捷操作 ====================
function initQuickActions() {
    document.querySelectorAll('.quick-action-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            const routes = {
                ask: 'ask',
                upload: 'upload',
                'text-input': 'upload',
                logs: 'logs',
                docs: 'docs'
            };
            if (routes[action]) {
                const options = action === 'text-input' ? { tab: 'text' } : {};
                navigateTo(routes[action], options);
            }
        });
    });
}

function initPlatformActions() {
    // Tab切换
    document.querySelectorAll('#tab-bar .tab-item').forEach(item => {
        item.addEventListener('click', () => {
            state.currentCategory = item.dataset.tab;
            renderCurrentCategory();
        });
    });

    // 上传文档/更新策略按钮（事件委托，避免按钮未渲染时crash）
    document.addEventListener('click', (e) => {
        if (e.target.closest('#btn-platform-upload')) {
            navigateTo('upload', { platformId: state.currentPlatform?.id });
        }
        if (e.target.closest('#btn-platform-update')) {
            if (!state.currentPlatform) return;
            showModal(
                '确认更新',
                `将基于已上传的文档更新 ${state.currentPlatform.name} 的策略，是否继续？`,
                async () => {
                    showLoading('策略更新中...');
                    const res = await batchUpdateStrategies(state.currentPlatform.id);
                    hideLoading();
                    if (res.code === 0) {
                        showToast(res.msg || '更新成功');
                        loadPlatformData(state.currentPlatform);
                    } else {
                        showToast(res.msg || '更新失败');
                    }
                }
            );
        }
    });
}

// ==================== 上传功能 ====================
function initUpload() {
    // Tab切换
    document.querySelectorAll('.upload-tab').forEach(tab => {
        tab.addEventListener('click', () => switchUploadTab(tab.dataset.tab));
    });

    // 文档类型切换 -> 游戏名输入框显示
    $('text-doc-type').addEventListener('change', (e) => {
        const g = $('text-game-group');
        g.classList.toggle('hidden', e.target.value !== 'report');
    });
    $('url-doc-type').addEventListener('change', (e) => {
        const g = $('url-game-group');
        g.classList.toggle('hidden', e.target.value !== 'report');
    });
    $('file-doc-type').addEventListener('change', (e) => {
        const g = $('file-game-group');
        g.classList.toggle('hidden', e.target.value !== 'report');
    });

    // 提交文本
    $('btn-submit-text').addEventListener('click', submitText);

    // 提交URL
    $('btn-submit-url').addEventListener('click', submitUrl);

    // 文件上传相关
    initFileUpload();

    // 粘贴URL
    $('btn-paste-url').addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) $('url-input').value = text;
        } catch (e) {
            showToast('请允许剪贴板权限');
        }
    });
}

function switchUploadTab(tab) {
    document.querySelectorAll('.upload-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });
    $('upload-text-section').classList.toggle('active', tab === 'text');
    $('upload-file-section').classList.toggle('active', tab === 'file');
    $('upload-url-section').classList.toggle('active', tab === 'url');
}

async function submitText() {
    const title = $('text-title').value.trim();
    const content = $('text-content').value.trim();
    const platformId = $('text-platform').value || null;
    const docType = $('text-doc-type').value;
    const gameName = $('text-game-name')?.value.trim() || null;

    if (!title) return showToast('请输入标题');
    if (!content) return showToast('请输入内容');

    // 报告类型走特殊流程
    if (docType === 'report') {
        showLoading('解析报告内容...');
        const parseRes = await parseReportText(content, title);
        hideLoading();
        if (parseRes.code === 0 && parseRes.data) {
            showReportConfirmModal({
                originalText: content,
                parsedContent: parseRes.data.parsed_content || content,
                filename: title,
                platformId: platformId,
                gameName: gameName,
                tempId: parseRes.data.temp_id || null
            });
            return;
        }
    }

    $('btn-submit-text').disabled = true;
    showLoading('提交中...');
    const res = await uploadText({
        platform_id: platformId ? parseInt(platformId) : null,
        filename: title,
        content: content,
        doc_type: docType,
        game_name: gameName
    });
    hideLoading();
    $('btn-submit-text').disabled = false;

    if (res.code === 0) {
        showToast('提交成功');
        $('text-title').value = '';
        $('text-content').value = '';
        $('text-game-name').value = '';
    } else {
        showToast(res.msg || '提交失败');
    }
}

async function submitUrl() {
    const url = $('url-input').value.trim();
    const platformId = $('url-platform').value || null;
    const docType = $('url-doc-type').value;
    const title = $('url-title').value.trim() || null;
    const gameName = $('url-game-name')?.value.trim() || null;

    if (!url) return showToast('请输入网址');

    $('btn-submit-url').disabled = true;
    showLoading('抓取中...');
    const res = await uploadUrl({
        url, platform_id: platformId ? parseInt(platformId) : null,
        doc_type: docType, title, game_name: gameName
    });
    hideLoading();
    $('btn-submit-url').disabled = false;

    if (res.code === 0) {
        showToast(res.msg || '抓取成功');
        $('url-input').value = '';
        $('url-title').value = '';
        $('url-game-name').value = '';
    } else {
        showToast(res.msg || '抓取失败');
    }
}

// ==================== 文件上传功能 ====================
let _selectedFile = null;

function initFileUpload() {
    const dropZone = $('file-drop-zone');
    const fileInput = $('file-input');

    // 点击选择文件
    dropZone.addEventListener('click', () => fileInput.click());

    // 文件选择
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // 拖拽事件
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    // 移除文件
    $('file-preview-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        clearFileSelection();
    });

    // 提交文件
    $('btn-submit-file').addEventListener('click', submitFile);
}

function handleFileSelect(file) {
    const allowedExts = ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls', '.csv', '.txt', '.md', '.markdown', '.html', '.htm', '.rtf'];
    const fileName = file.name.toLowerCase();
    const ext = '.' + fileName.split('.').pop();

    if (!allowedExts.includes(ext)) {
        showToast('不支持的文件格式，请上传 PDF、PPTX、DOCX、XLSX、TXT、MD、HTML 等格式');
        return;
    }

    if (false) {  // 已取消文件大小限制
        
        return;
    }

    _selectedFile = file;

    // 显示文件预览
    const iconMap = {
        '.pdf': 'ri-file-pdf-2-line',
        '.docx': 'ri-file-word-line',
        '.doc': 'ri-file-word-line',
        '.pptx': 'ri-file-ppt-2-line',
        '.ppt': 'ri-file-ppt-2-line',
        '.xlsx': 'ri-file-excel-line',
        '.xls': 'ri-file-excel-line',
        '.csv': 'ri-file-list-line',
        '.txt': 'ri-file-text-line',
        '.md': 'ri-markdown-line',
        '.markdown': 'ri-markdown-line',
        '.html': 'ri-html5-line',
        '.htm': 'ri-html5-line',
        '.rtf': 'ri-file-text-line',
    };

    $('file-preview-icon').className = (iconMap[ext] || 'ri-file-line') + ' file-preview-icon';
    $('file-preview-name').textContent = file.name;
    $('file-preview-size').textContent = formatFileSize(file.size);
    $('file-preview').classList.remove('hidden');
    $('file-drop-zone').classList.add('has-file');
    const submitBtn = $('btn-submit-file');
    submitBtn.disabled = false;
    submitBtn.textContent = '';
    submitBtn.innerHTML = '<i class="ri-upload-cloud-line"></i> 点击上传文件';
    submitBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    submitBtn.classList.add('btn-ready');
    setTimeout(() => submitBtn.classList.remove('btn-ready'), 1500);
}

function clearFileSelection() {
    _selectedFile = null;
    $('file-input').value = '';
    $('file-preview').classList.add('hidden');
    $('file-drop-zone').classList.remove('has-file');
    const submitBtn = $('btn-submit-file');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="ri-upload-cloud-line"></i> 上传文件';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function submitFile() {
    if (!_selectedFile) return showToast('请先选择文件');

    const platformId = $('file-platform').value || null;
    const docType = $('file-doc-type').value;
    const gameName = $('file-game-name')?.value.trim() || null;

    // 报告类型走特殊流程
    if (docType === 'report') {
        showLoading('解析报告文件...');
        const { parseReportFile } = await import('./data.js');
        const parseRes = await parseReportFile(_selectedFile);
        hideLoading();
        if (parseRes.code === 0 && parseRes.data) {
            showReportConfirmModal({
                originalText: parseRes.data.original_preview || '',
                parsedContent: parseRes.data.parsed_items ? parseRes.data.parsed_items.join('\n') : '',
                filename: _selectedFile.name,
                platformId: platformId,
                gameName: gameName,
                tempId: parseRes.data.temp_id || null
            });
            clearFileSelection();
            return;
        } else {
            showToast(parseRes.msg || '解析失败');
            return;
        }
    }

    const formData = new FormData();
    formData.append('file', _selectedFile);
    if (platformId) formData.append('platform_id', platformId);
    formData.append('doc_type', docType);
    if (gameName) formData.append('game_name', gameName);

    $('btn-submit-file').disabled = true;
    showLoading('上传文件中...');
    const res = await uploadFile(formData);
    hideLoading();
    $('btn-submit-file').disabled = false;

    if (res.code === 0) {
        showToast(res.msg || '上传成功');
        clearFileSelection();
        $('file-game-name').value = '';
    } else {
        showToast(res.msg || '上传失败');
    }
}


// ==================== 文档管理 ====================
function initDocFilter() {
    document.querySelectorAll('#docs-filter .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#docs-filter .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.docFilter = btn.dataset.filter;
            renderFilteredDocs();
        });
    });

    // 重置报告状态按钮
    $('btn-reset-report')?.addEventListener('click', async () => {
        showModal('确认重置', '将所有内部项目报告重置为"待处理"状态，允许重新整合到策略中。是否继续？', async () => {
            showLoading('重置中...');
            const res = await resetReportStatus();
            hideLoading();
            if (res.code === 0) {
                showToast(res.msg || '重置成功');
                loadDocs();
            } else {
                showToast(res.msg || '重置失败');
            }
        });
    });
}

async function loadDocs() {
    showLoading('加载文档...');
    const res = await fetchDocuments();
    state.docs = (res.code === 0 ? res.data : []) || [];
    hideLoading();
    renderFilteredDocs();
}

function renderFilteredDocs() {
    let filtered = state.docs;
    if (state.docFilter === 'pending') filtered = filtered.filter(d => d.status === 'pending');
    else if (state.docFilter === 'applied') filtered = filtered.filter(d => d.status === 'applied');
    else if (state.docFilter === 'report') filtered = filtered.filter(d => d.doc_type === 'report');

    renderDocsList($('docs-list'), filtered,
        (docId) => { // onDelete
            showModal('确认删除', '删除后不可恢复，确定要删除吗？', async () => {
                showLoading('删除中...');
                await deleteDocument(docId);
                hideLoading();
                showToast('删除成功');
                loadDocs();
            });
        },
        (docId) => { // onViewReport
            if (!window.__reportDataUnlocked) {
                showPasswordModal(() => {
                    window.__reportDataUnlocked = true;
                    renderCurrentCategory();
                    showToast('已解锁内部数据');
                    showReportViewer(docId);
                });
            } else {
                showReportViewer(docId);
            }
        },
        (docId, fileType) => { // onViewOriginal
            window.open(getOriginalFileUrl(docId), '_blank');
        },
        (docId) => { // onExtractKeypoints
            showKeypointsModal(docId);
        }
    );
}

// ==================== 日志 ====================
async function loadLogs() {
    showLoading('加载日志...');
    const res = await fetchLogs(50);
    state.logs = (res.code === 0 ? res.data : []) || [];
    hideLoading();
    renderFullLogs($('logs-list'), state.logs);
}

// ==================== 智能提问 ====================
function initAsk() {
    // 快捷标签
    document.querySelectorAll('.ask-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            $('ask-input').value = tag.dataset.q;
            sendQuestion();
        });
    });

    // 发送按钮
    $('ask-send').addEventListener('click', sendQuestion);

    // 回车发送
    $('ask-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendQuestion();
        }
    });
}

async function sendQuestion() {
    const question = $('ask-input').value.trim();
    if (!question || state.sending) return;

    state.sending = true;
    $('ask-send').disabled = true;

    // 隐藏Hero和快捷标签
    const hero = $('ask-hero');
    const tags = $('ask-quick-tags');
    if (hero) hero.style.display = 'none';
    if (tags) tags.style.display = 'none';

    // 添加用户消息
    state.messages.push({ type: 'user', content: question });
    renderAskMessages();

    $('ask-input').value = '';

    // 显示加载
    state.messages.push({ type: 'loading' });
    renderAskMessages();

    try {
        const res = await askQuestion(question);
        // 移除loading
        state.messages = state.messages.filter(m => m.type !== 'loading');

        if (res.code === 0 && res.data) {
            state.messages.push({
                type: 'bot',
                content: res.data.answer || '未找到相关信息',
                sources: res.data.sources || []
            });
        } else {
            state.messages.push({ type: 'bot', content: res.msg || '查询失败，请稍后重试' });
        }
    } catch (e) {
        state.messages = state.messages.filter(m => m.type !== 'loading');
        state.messages.push({ type: 'bot', content: '网络请求失败，请检查网络后重试' });
    }

    state.sending = false;
    $('ask-send').disabled = false;
    renderAskMessages();
}

function renderAskMessages() {
    const area = $('ask-chat-area');
    area.innerHTML = state.messages.map(msg => {
        if (msg.type === 'loading') {
            return `<div class="ask-loading">
                <div class="ask-loading-dots"><span></span><span></span><span></span></div>
                <span class="ask-loading-text">思考中...</span>
            </div>`;
        }

        const cls = msg.type === 'user' ? 'ask-msg user' : 'ask-msg bot';
        const label = msg.type === 'user' ? '我' : '🤖 策略助手';
        let sourcesHtml = '';
        if (msg.sources && msg.sources.length > 0) {
            sourcesHtml = `<div class="ask-msg-sources">
                ${msg.sources.map(s => `<span class="ask-source-tag"><i class="ri-bookmark-line"></i> ${s}</span>`).join('')}
            </div>`;
        }
        return `<div class="${cls}">
            <div class="ask-msg-bubble">${escapeHtml(msg.content)}${sourcesHtml}</div>
            <div class="ask-msg-label">${label}</div>
        </div>`;
    }).join('');

    // 滚动到底部
    area.scrollTop = area.scrollHeight;
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
}

// ==================== 报告数据交互 ====================
function bindReportDataEvents() {
    // 解锁按钮
    document.querySelectorAll('.rd-unlock-btn:not(.unlocked)').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPasswordModal(() => {
                window.__reportDataUnlocked = true;
                renderCurrentCategory();
                showToast('已解锁内部数据');
            });
        });
    });

    // 编辑按钮
    document.querySelectorAll('.rd-edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const entry = btn.closest('.report-data-entry');
            if (!entry) return;
            const strategyId = parseInt(entry.dataset.strategyId);
            const sectionIdx = parseInt(entry.dataset.sectionIdx);
            const itemIdx = parseInt(entry.dataset.itemIdx);
            const rdIdx = parseInt(entry.dataset.rdIdx);
            showReportEditModal(strategyId, sectionIdx, itemIdx, rdIdx);
        });
    });

    // 删除按钮
    document.querySelectorAll('.rd-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const entry = btn.closest('.report-data-entry');
            if (!entry) return;
            const strategyId = parseInt(entry.dataset.strategyId);
            const sectionIdx = parseInt(entry.dataset.sectionIdx);
            const itemIdx = parseInt(entry.dataset.itemIdx);
            const rdIdx = parseInt(entry.dataset.rdIdx);
            showModal('确认删除', '确定要删除这条报告数据吗？', async () => {
                showLoading('删除中...');
                const res = await deleteReportData({ strategy_id: strategyId, section_idx: sectionIdx, item_idx: itemIdx, rd_idx: rdIdx });
                hideLoading();
                if (res.code === 0) {
                    showToast('删除成功');
                    loadPlatformData(state.currentPlatform);
                } else {
                    showToast(res.msg || '删除失败');
                }
            });
        });
    });

    // 查看报告按钮（需密码验证）
    document.querySelectorAll('.rd-view-report-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const docId = parseInt(btn.dataset.docId);
            if (!docId) { showToast('无关联报告'); return; }
            if (!window.__reportDataUnlocked) {
                showPasswordModal(() => {
                    window.__reportDataUnlocked = true;
                    renderCurrentCategory();
                    showToast('已解锁内部数据');
                    showReportViewer(docId);
                });
            } else {
                showReportViewer(docId);
            }
        });
    });
}

// ==================== 弹窗系统 ====================
function initModals() {
    // 通用Modal
    $('modal').querySelector('.modal-overlay').addEventListener('click', hideModal);
    $('modal-cancel').addEventListener('click', hideModal);

    // 报告确认弹窗
    $('report-confirm-modal').querySelector('.modal-overlay').addEventListener('click', () => hideEl('report-confirm-modal'));
    $('report-confirm-close').addEventListener('click', () => hideEl('report-confirm-modal'));
    $('report-confirm-cancel').addEventListener('click', () => hideEl('report-confirm-modal'));
    $('toggle-original').addEventListener('click', () => {
        const el = $('report-original-text');
        el.classList.toggle('hidden');
        $('toggle-original').innerHTML = el.classList.contains('hidden') ? '<i class="ri-eye-line"></i> 展开' : '<i class="ri-eye-off-line"></i> 收起';
    });

    // 密码弹窗
    $('password-modal').querySelector('.modal-overlay').addEventListener('click', () => hideEl('password-modal'));
    $('password-close').addEventListener('click', () => hideEl('password-modal'));
    $('password-cancel').addEventListener('click', () => hideEl('password-modal'));

    // 编辑弹窗
    $('rd-edit-modal').querySelector('.modal-overlay').addEventListener('click', () => hideEl('rd-edit-modal'));
    $('rd-edit-close').addEventListener('click', () => hideEl('rd-edit-modal'));
    $('rd-edit-cancel').addEventListener('click', () => hideEl('rd-edit-modal'));

    // 报告查看弹窗
    $('report-viewer-modal').querySelector('.modal-overlay').addEventListener('click', () => hideEl('report-viewer-modal'));
    $('rv-close').addEventListener('click', () => hideEl('report-viewer-modal'));

    // 文档管理密码弹窗
    $('docs-password-modal').querySelector('.modal-overlay').addEventListener('click', () => hideEl('docs-password-modal'));
    $('docs-pwd-close').addEventListener('click', () => hideEl('docs-password-modal'));
    $('docs-pwd-cancel').addEventListener('click', () => hideEl('docs-password-modal'));
    // 密码显示/隐藏切换
    $('docs-pwd-toggle').addEventListener('click', () => {
        const input = $('docs-pwd-input');
        const icon = $('docs-pwd-toggle').querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'ri-eye-line';
        } else {
            input.type = 'password';
            icon.className = 'ri-eye-off-line';
        }
    });

    // 关键点提炼弹窗
    $('keypoints-modal').querySelector('.modal-overlay').addEventListener('click', () => hideEl('keypoints-modal'));
    $('kp-close').addEventListener('click', () => hideEl('keypoints-modal'));

    // 原始文件查看弹窗
    $('original-file-modal').querySelector('.modal-overlay').addEventListener('click', () => hideEl('original-file-modal'));
    $('of-close').addEventListener('click', () => hideEl('original-file-modal'));
}

let _modalResolve = null;

function showModal(title, message, onConfirm) {
    $('modal-title').textContent = title;
    $('modal-body').textContent = message;
    showEl('modal');

    const confirmBtn = $('modal-confirm');
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
    newBtn.id = 'modal-confirm';
    newBtn.addEventListener('click', () => {
        hideModal();
        if (onConfirm) onConfirm();
    });
}

function hideModal() { hideEl('modal'); }

// 报告确认弹窗
let _reportConfirmData = null;

function showReportConfirmModal(data) {
    _reportConfirmData = data;
    $('report-original-text').textContent = data.originalText || '';
    $('report-original-text').classList.add('hidden');
    $('toggle-original').innerHTML = '<i class="ri-eye-line"></i> 展开';
    $('report-parsed-editor').value = data.parsedContent || '';
    showEl('report-confirm-modal');

    const submitBtn = $('report-confirm-submit');
    const newBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newBtn, submitBtn);
    newBtn.id = 'report-confirm-submit';
    newBtn.addEventListener('click', async () => {
        const parsed = $('report-parsed-editor').value.trim();
        if (!parsed) return showToast('解析内容不能为空');
        hideEl('report-confirm-modal');
        showLoading('上传报告中...');
        const res = await uploadConfirmedReport(
            _reportConfirmData.platformId ? parseInt(_reportConfirmData.platformId) : null,
            _reportConfirmData.gameName,
            parsed,
            _reportConfirmData.filename,
            _reportConfirmData.tempId
        );
        hideLoading();
        if (res.code === 0) {
            showToast(res.msg || '上传成功');
            $('text-title').value = '';
            $('text-content').value = '';
            $('text-game-name').value = '';
        } else {
            showToast(res.msg || '上传失败');
        }
    });
}

// 密码验证弹窗
function showPasswordModal(onSuccess) {
    $('password-input').value = '';
    $('password-error').classList.add('hidden');
    showEl('password-modal');

    const submitBtn = $('password-submit');
    const newBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newBtn, submitBtn);
    newBtn.id = 'password-submit';
    newBtn.addEventListener('click', async () => {
        const pwd = $('password-input').value;
        if (!pwd) return;
        const res = await verifyReportPassword(pwd);
        if (res.code === 0) {
            hideEl('password-modal');
            if (onSuccess) onSuccess();
        } else {
            const errEl = $('password-error');
            errEl.classList.remove('hidden');
            errEl.querySelector('span').textContent = res.msg || '密码错误';
        }
    });

    // 回车提交
    $('password-input').onkeydown = (e) => {
        if (e.key === 'Enter') newBtn.click();
    };
}

// 文档管理密码验证弹窗
function showDocsPasswordModal(onSuccess) {
    $('docs-pwd-input').value = '';
    $('docs-pwd-error').classList.add('hidden');
    showEl('docs-password-modal');

    // 聚焦输入框
    setTimeout(() => $('docs-pwd-input').focus(), 200);

    const submitBtn = $('docs-pwd-submit');
    const newBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newBtn, submitBtn);
    newBtn.id = 'docs-pwd-submit';
    newBtn.addEventListener('click', async () => {
        const pwd = $('docs-pwd-input').value;
        if (!pwd) {
            const errEl = $('docs-pwd-error');
            errEl.classList.remove('hidden');
            errEl.querySelector('span').textContent = '请输入密码';
            return;
        }
        newBtn.disabled = true;
        newBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> 验证中...';
        const res = await verifyReportPassword(pwd);
        newBtn.disabled = false;
        newBtn.innerHTML = '<i class="ri-lock-unlock-line"></i> 解锁文档';
        if (res.code === 0) {
            hideEl('docs-password-modal');
            showToast('🔓 文档管理已解锁', 2000);
            if (onSuccess) onSuccess();
        } else {
            const errEl = $('docs-pwd-error');
            errEl.classList.remove('hidden');
            errEl.querySelector('span').textContent = res.msg || '密码错误';
            // 抖动输入框
            $('docs-pwd-input').classList.add('shake-input');
            setTimeout(() => $('docs-pwd-input').classList.remove('shake-input'), 500);
        }
    });

    // 回车提交
    $('docs-pwd-input').onkeydown = (e) => {
        if (e.key === 'Enter') newBtn.click();
    };
}

// 报告编辑弹窗
function showReportEditModal(strategyId, sectionIdx, itemIdx, rdIdx) {
    // 从策略数据中获取当前报告数据
    const strategy = state.platformStrategies.find(s => s.id === strategyId);
    if (!strategy || !strategy.content) return;
    const sections = strategy.content.sections || [];
    const section = sections[sectionIdx];
    if (!section) return;
    const item = (section.items || [])[itemIdx];
    if (!item || !item.report_data) return;
    const rd = item.report_data[rdIdx];
    if (!rd) return;

    $('rd-edit-game').value = rd.game_name || '';
    $('rd-edit-date').value = rd.date || '';
    $('rd-edit-content').value = rd.data || '';
    showEl('rd-edit-modal');

    const submitBtn = $('rd-edit-submit');
    const newBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode.replaceChild(newBtn, submitBtn);
    newBtn.id = 'rd-edit-submit';
    newBtn.addEventListener('click', async () => {
        const newData = $('rd-edit-content').value.trim();
        if (!newData) return showToast('内容不能为空');
        hideEl('rd-edit-modal');
        showLoading('保存中...');
        const res = await editReportData({
            strategy_id: strategyId, section_idx: sectionIdx,
            item_idx: itemIdx, rd_idx: rdIdx,
            new_game_name: $('rd-edit-game').value.trim(),
            new_date: $('rd-edit-date').value.trim(),
            new_data: newData
        });
        hideLoading();
        if (res.code === 0) {
            showToast('保存成功');
            loadPlatformData(state.currentPlatform);
        } else {
            showToast(res.msg || '保存失败');
        }
    });
}

// 报告查看器
async function showReportViewer(docId) {
    $('rv-title').textContent = '加载中...';
    $('rv-meta').innerHTML = '';
    $('rv-body').innerHTML = '<div class="report-viewer-loading"><div class="spinner"></div><p>加载报告内容...</p></div>';
    showEl('report-viewer-modal');

    const res = await fetchDocumentDetail(docId);
    if (res.code !== 0 || !res.data) {
        $('rv-body').innerHTML = '<div class="empty-state"><i class="ri-file-warning-line"></i><p>加载失败</p></div>';
        return;
    }

    const doc = res.data;
    $('rv-title').textContent = doc.filename || '报告详情';
    $('rv-meta').innerHTML = `
        <span class="rv-meta-tag"><i class="ri-calendar-line"></i> ${doc.created_at || ''}</span>
        <span class="rv-meta-tag"><i class="ri-database-2-line"></i> ${doc.platform_name || '通用'}</span>
        ${doc.game_name ? `<span class="rv-meta-tag"><i class="ri-gamepad-line"></i> ${doc.game_name}</span>` : ''}
        <span class="rv-meta-tag rv-status-${doc.status}">${doc.status === 'pending' ? '待处理' : '已应用'}</span>
        ${doc.file_type && doc.file_type !== 'txt' ? `<a class="rv-meta-tag rv-original-link" href="${getOriginalFileUrl(docId)}" target="_blank"><i class="ri-file-download-line"></i> 查看原始${doc.file_type.toUpperCase()}文件</a>` : ''}
    `;

    const content = doc.content || '';
    const lines = content.split('\n').map(l => l.trim()).filter(l => l);

    const originalContent = doc.original_content || '';
    const originalLines = originalContent.split('\n').map(l => l.trim()).filter(l => l);
    const hasOriginal = originalLines.length > 0;
    const originalHtml = hasOriginal ? `
        <div style="margin-top:14px;border-top:1px solid #F0F0F0;padding-top:12px;">
            <div id="rv-original-toggle" style="display:flex;align-items:center;gap:6px;padding:10px 14px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);border-radius:10px;font-size:12px;font-weight:500;color:rgba(163,159,254,1);cursor:pointer;user-select:none;">
                <i class="ri-file-text-line"></i>
                <span>原始文档</span>
                <span id="rv-original-arrow" style="margin-left:auto;font-size:14px;">▼</span>
            </div>
            <div id="rv-original-body" style="display:none;padding:12px 14px;background:rgba(255,255,255,0.06);border:1px solid rgba(99,102,241,0.2);border-top:none;border-radius:0 0 10px 10px;font-size:12px;line-height:1.8;color:rgba(255,255,255,0.75);white-space:pre-wrap;word-break:break-all;">${originalLines.map(l => escapeHtml(l)).join('\n')}</div>
        </div>
    ` : '';

    $('rv-body').innerHTML = `
        <div class="report-viewer-content">
            ${lines.map(l => `<div class="rv-text-line">${escapeHtml(l)}</div>`).join('')}
        </div>
        ${originalHtml}
    `;

    if (hasOriginal) {
        const toggleBtn = document.getElementById('rv-original-toggle');
        const toggleBody = document.getElementById('rv-original-body');
        const toggleArrow = document.getElementById('rv-original-arrow');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const isOpen = toggleBody.style.display !== 'none';
                toggleBody.style.display = isOpen ? 'none' : 'block';
                toggleArrow.style.transform = isOpen ? '' : 'rotate(180deg)';
                toggleBtn.style.borderRadius = isOpen ? '10px' : '10px 10px 0 0';
            });
        }
    }
}

// ==================== 原始文件查看器 ====================
async function showOriginalFileViewer(docId, fileType) {
    $('of-title').textContent = '加载中...';
    $('of-body').innerHTML = '<div class="original-file-loading"><div class="spinner"></div><p>加载文档...</p></div>';
    showEl('original-file-modal');

    // 设置下载链接
    const fileUrl = getOriginalFileUrl(docId);
    $('of-download').href = fileUrl;

    // 获取文档详情
    const res = await fetchDocumentDetail(docId);
    if (res.code !== 0 || !res.data) {
        $('of-body').innerHTML = '<div class="empty-state"><i class="ri-file-warning-line"></i><p>加载失败</p></div>';
        return;
    }

    const doc = res.data;
    $('of-title').textContent = doc.filename || '原始文档';

    if (fileType === 'pdf') {
        // PDF使用iframe预览
        const pdfUrl = getPdfPreviewUrl(docId);
        $('of-body').innerHTML = `
            <div class="original-file-pdf-container">
                <iframe src="${pdfUrl}" class="original-file-iframe" title="PDF预览"></iframe>
            </div>
        `;
    } else if (fileType === 'docx' || fileType === 'doc') {
        // DOCX/DOC显示解析后的文本内容，并提供下载原始文件
        const content = doc.original_content || doc.content || '';
        const lines = content.split('\n').map(l => l.trim()).filter(l => l);
        $('of-body').innerHTML = `
            <div class="original-file-info-bar">
                <span class="of-info-badge"><i class="ri-file-word-line"></i> ${fileType.toUpperCase()} 文档</span>
                <span class="of-info-text">以下为解析后的文本内容，点击右上角"下载"获取原始文件</span>
            </div>
            <div class="original-file-text-content">
                ${lines.map(l => `<div class="of-text-line">${escapeHtml(l)}</div>`).join('')}
            </div>
        `;
    } else {
        // 其他格式显示文本
        const content = doc.original_content || doc.content || '';
        $('of-body').innerHTML = `
            <div class="original-file-text-content">
                <pre class="of-text-pre">${escapeHtml(content)}</pre>
            </div>
        `;
    }
}

// ==================== 关键点（策略内容查看器）====================
async function showKeypointsModal(docId) {
    $('kp-title').textContent = '加载中...';
    $('kp-meta').innerHTML = '';
    $('kp-body').innerHTML = '<div class="keypoints-loading"><div class="spinner"></div><p>加载中...</p></div>';
    showEl('keypoints-modal');

    const res = await fetchDocumentDetail(docId);
    if (res.code !== 0 || !res.data) {
        $('kp-body').innerHTML = '<div class="empty-state"><i class="ri-file-warning-line"></i><p>加载失败</p></div>';
        $('kp-title').textContent = '加载失败';
        return;
    }

    const doc = res.data;
    $('kp-title').textContent = doc.filename || '策略内容';
    $('kp-meta').innerHTML =
        '<span class="kp-meta-tag"><i class="ri-calendar-line"></i> ' + (doc.created_at || '') + '</span>' +
        '<span class="kp-meta-tag"><i class="ri-database-2-line"></i> ' + (doc.platform_name || '通用') + '</span>' +
        (doc.game_name ? '<span class="kp-meta-tag"><i class="ri-gamepad-line"></i> ' + doc.game_name + '</span>' : '') +
        '<span class="kp-meta-tag rv-status-' + doc.status + '">' + (doc.status === 'pending' ? '待处理' : '已应用') + '</span>';

    const content = doc.content || '';
    const lines = content.split('\n').map(l => l.trim()).filter(l => l);

    if (lines.length === 0) {
        $('kp-body').innerHTML = '<div class="empty-state"><i class="ri-file-text-line"></i><p>暂无策略内容</p></div>';
        return;
    }

    $('kp-body').innerHTML = '<div class="keypoints-content"><div class="kp-strategy-lines">' +
        lines.map(l => '<div class="kp-strategy-line">' + escapeHtml(l) + '</div>').join('') +
        '</div></div>';
}

// ==================== UI工具函数 ====================
function showToast(msg, duration = 2000) {
    const toast = $('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.add('hidden'), duration);
}

function showLoading(text = '加载中...') {
    $('loading-text').textContent = text;
    $('loading-mask').classList.remove('hidden');
}

function hideLoading() {
    $('loading-mask').classList.add('hidden');
}

function showEl(id) { $(id).classList.remove('hidden'); }
function hideEl(id) { $(id).classList.add('hidden'); }