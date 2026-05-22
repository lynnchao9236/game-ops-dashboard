// 案例查看页面模块 - 包含"合作回顾"和"竞品案例"两个Tab
import { request, showToast, API_BASE } from './api.js';

let currentReviewId = null;
let currentView = 'list'; // 'list' | 'detail' | 'report'
let currentTab = 'cooperation'; // 'cooperation' | 'competitor'

export async function renderCooperation(container) {
    currentView = 'list';
    currentReviewId = null;
    renderTabPage(container);
}

// ============ Tab切换页面 ============
function renderTabPage(container) {
    container.innerHTML = `
        <div class="animate-fadeIn">
            <!-- 顶部Tab切换 -->
            <div class="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-5 inline-flex gap-1">
                <button class="case-tab px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${currentTab === 'cooperation' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}" data-tab="cooperation">
                    <i class="ri-folder-history-line mr-1.5"></i>合作回顾
                </button>
                <button class="case-tab px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${currentTab === 'competitor' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}" data-tab="competitor">
                    <i class="ri-spy-line mr-1.5"></i>竞品案例
                </button>
            </div>

            <!-- Tab内容区 -->
            <div id="tab-content"></div>
        </div>
    `;

    // 绑定Tab切换
    container.querySelectorAll('.case-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            currentTab = tab.dataset.tab;
            currentView = 'list';
            currentReviewId = null;
            renderTabPage(container);
        });
    });

    // 渲染当前Tab内容
    const tabContent = container.querySelector('#tab-content');
    if (currentTab === 'cooperation') {
        renderCooperationContent(tabContent, container);
    } else {
        renderCompetitorContent(tabContent, container);
    }
}

// ============ 合作回顾 - 列表视图 ============
async function renderCooperationContent(tabContent, mainContainer) {
    tabContent.innerHTML = `<div class="flex items-center justify-center py-20"><div class="loading-spinner"></div></div>`;
    try {
        const res = await request('/cooperation/list');
        const list = res.data || [];

        tabContent.innerHTML = `
            <!-- 页面头部 -->
            <div class="gradient-card rounded-2xl p-6 mb-5 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-white/70 text-xs mb-1">往期合作回顾</p>
                        <h2 class="text-2xl font-bold">${list.length} <span class="text-base font-normal text-white/80">个合作项目</span></h2>
                        <p class="text-white/60 text-sm mt-1">上传合作资料，自动生成数据报告和合作洞察</p>
                    </div>
                    <button id="btn-new-cooperation" class="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
                        <i class="ri-add-circle-line text-lg"></i>
                        <span>新建合作回顾</span>
                    </button>
                </div>
            </div>

            <!-- 合作列表 -->
            ${list.length === 0 ? `
                <div class="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                    <div class="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="ri-folder-open-line text-5xl text-indigo-300"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-700 mb-2">还没有合作回顾</h3>
                    <p class="text-sm text-gray-400">点击上方按钮创建您的第一个合作回顾</p>
                </div>
            ` : `
                <div class="grid grid-cols-3 gap-5">
                    ${list.map(item => renderCooperationCard(item)).join('')}
                </div>
            `}

            <!-- 签名 -->
            <div class="text-center mt-6 mb-2">
                
            </div>
        `;

        // 绑定新建按钮
        document.getElementById('btn-new-cooperation')?.addEventListener('click', () => showCreateModal(mainContainer));

        // 绑定卡片事件
        tabContent.querySelectorAll('.coop-card').forEach(card => {
            card.addEventListener('click', async (e) => {
                if (e.target.closest('.coop-actions')) return;
                const id = parseInt(card.dataset.id);
                const item = list.find(i => i.id === id);
                if (item && item.status === 'generated') {
                    mainContainer.innerHTML = `<div class="flex items-center justify-center py-20"><div class="loading-spinner"></div></div>`;
                    try {
                        const detailRes = await request(`/cooperation/${id}`);
                        const review = detailRes.data;
                        if (review.report_content) {
                            let report = review.report_content;
                            if (typeof report === 'string') {
                                try { report = JSON.parse(report); } catch (e) {}
                            }
                            renderReportView(mainContainer, id, report);
                        } else {
                            renderDetailView(mainContainer, id);
                        }
                    } catch (err) {
                        renderDetailView(mainContainer, id);
                    }
                } else {
                    renderDetailView(mainContainer, id);
                }
            });
        });

        // 绑定删除按钮
        tabContent.querySelectorAll('.btn-delete-coop').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const name = btn.dataset.name;
                if (!confirm(`确定要删除「${name}」吗？所有上传的文件和报告都将被删除。`)) return;
                try {
                    await request(`/cooperation/${id}`, { method: 'DELETE' });
                    showToast('删除成功', 'success');
                    renderCooperationContent(tabContent, mainContainer);
                } catch (err) {
                    showToast('删除失败: ' + err.message, 'error');
                }
            });
        });
    } catch (err) {
        tabContent.innerHTML = `
            <div class="text-center py-20">
                <i class="ri-error-warning-line text-4xl text-red-300 mb-3 block"></i>
                <p class="text-sm text-red-400">加载失败: ${err.message}</p>
            </div>
        `;
    }
}

function renderCooperationCard(item) {
    const statusMap = {
        draft: { text: '待上传', class: 'bg-yellow-50 text-yellow-600', icon: 'ri-draft-line' },
        pending: { text: '待上传', class: 'bg-yellow-50 text-yellow-600', icon: 'ri-draft-line' },
        generated: { text: '已生成', class: 'bg-green-50 text-green-600', icon: 'ri-check-double-line' },
    };
    const st = statusMap[item.status] || statusMap.draft;
    const fileCount = item.file_count || 0;
    const date = item.updated_at ? item.updated_at.split(' ')[0] : '';

    return `
        <div class="coop-card bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all" data-id="${item.id}">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                    <div class="w-11 h-11 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                        ${(item.title || '?')[0]}
                    </div>
                    <div class="min-w-0 flex-1">
                        <h4 class="font-semibold text-gray-800 text-sm truncate">${escapeHtml(item.title)}</h4>
                        <p class="text-xs text-gray-400 mt-0.5">${date}</p>
                    </div>
                </div>
                <div class="coop-actions flex items-center gap-1 flex-shrink-0 ml-2">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-medium ${st.class}">
                        <i class="${st.icon} mr-0.5"></i>${st.text}
                    </span>
                    <button class="btn-delete-coop w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 active:bg-red-50 active:text-red-500 transition-colors" data-id="${item.id}" data-name="${escapeAttr(item.title)}">
                        <i class="ri-delete-bin-line text-sm"></i>
                    </button>
                </div>
            </div>
            ${item.description ? `<p class="text-xs text-gray-500 mb-2 line-clamp-2">${escapeHtml(item.description)}</p>` : ''}
            <div class="flex items-center gap-3 text-xs text-gray-400">
                <span class="flex items-center gap-1"><i class="ri-attachment-2"></i>${fileCount} 个文件</span>
                ${item.status === 'generated' ? '<span class="flex items-center gap-1 text-green-500"><i class="ri-file-chart-line"></i>报告已生成</span>' : ''}
            </div>
        </div>
    `;
}

// ============ 新建合作弹窗 ============
function showCreateModal(container) {
    const modal = document.createElement('div');
    modal.id = 'coop-create-modal';
    modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fadeIn">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 class="text-base font-semibold text-gray-800">新建合作回顾</h3>
                <button id="close-create-modal" class="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <i class="ri-close-line text-xl text-gray-500"></i>
                </button>
            </div>
            <div class="p-5">
                <div class="mb-4">
                    <label class="block text-xs text-gray-500 mb-1.5 font-medium">合作名称 <span class="text-red-500">*</span></label>
                    <input type="text" id="coop-title" placeholder="例如：2024 Q3 Delta Force KOL推广" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors">
                </div>
                <div class="mb-5">
                    <label class="block text-xs text-gray-500 mb-1.5 font-medium">合作描述</label>
                    <textarea id="coop-desc" rows="3" placeholder="简要描述本次合作的背景和目标..." class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors resize-none"></textarea>
                </div>
                <div class="flex gap-3">
                    <button id="cancel-create" class="flex-1 py-3 border border-gray-200 rounded-2xl text-sm text-gray-600 font-medium active:bg-gray-50 transition-colors">取消</button>
                    <button id="confirm-create" class="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-medium active:bg-indigo-700 transition-colors">创建</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    const closeModal = () => {
        modal.remove();
        document.body.style.overflow = '';
    };

    modal.querySelector('#close-create-modal').addEventListener('click', closeModal);
    modal.querySelector('#cancel-create').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    modal.querySelector('#confirm-create').addEventListener('click', async () => {
        const title = document.getElementById('coop-title').value.trim();
        const desc = document.getElementById('coop-desc').value.trim();
        if (!title) { showToast('请输入合作名称', 'warning'); return; }
        try {
            const res = await request('/cooperation/create', {
                method: 'POST',
                body: JSON.stringify({ title, description: desc }),
            });
            showToast('创建成功', 'success');
            closeModal();
            renderDetailView(container, res.data.id);
        } catch (err) {
            showToast('创建失败: ' + err.message, 'error');
        }
    });

    document.getElementById('coop-title').focus();
}

// ============ 详情视图 ============
async function renderDetailView(container, reviewId) {
    currentReviewId = reviewId;
    currentView = 'detail';
    container.innerHTML = `<div class="flex items-center justify-center py-20"><div class="loading-spinner"></div></div>`;

    try {
        const res = await request(`/cooperation/${reviewId}`);
        const review = res.data;
        const files = review.files || [];

        container.innerHTML = `
            <div class="animate-fadeIn">
                <!-- 面包屑导航 -->
                <div class="flex items-center gap-2 mb-4 text-sm">
                    <button id="btn-back-list" class="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                        <i class="ri-arrow-left-s-line"></i> 返回列表
                    </button>
                    <span class="text-gray-300">/</span>
                    <span class="text-gray-500 truncate">${escapeHtml(review.title)}</span>
                </div>

                <!-- 项目信息 -->
                <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-5">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-md">
                                ${(review.title || '?')[0]}
                            </div>
                            <div>
                                <h2 class="text-xl font-bold text-gray-800">${escapeHtml(review.title)}</h2>
                                ${review.description ? `<p class="text-sm text-gray-400 mt-1">${escapeHtml(review.description)}</p>` : ''}
                                <div class="flex items-center gap-5 text-xs text-gray-400 mt-2">
                                    <span><i class="ri-time-line mr-1"></i>创建: ${review.created_at || '-'}</span>
                                    <span><i class="ri-refresh-line mr-1"></i>更新: ${review.updated_at || '-'}</span>
                                    <span><i class="ri-attachment-2 mr-1"></i>${files.length} 个文件</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            ${review.status === 'generated' ? `
                                <button id="btn-view-report" class="px-5 py-2.5 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors flex items-center gap-2">
                                    <i class="ri-file-chart-line"></i> 查看报告
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <!-- 文件上传和列表 -->
                <div class="grid grid-cols-2 gap-5 mb-5">
                    <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span class="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <i class="ri-upload-cloud-2-line text-xs text-indigo-600"></i>
                            </span>
                            上传合作资料
                        </h3>
                        <div id="upload-zone" class="upload-zone p-6 text-center rounded-xl cursor-pointer hover:border-indigo-400 transition-colors">
                            <input type="file" id="file-input" multiple accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.gif,.bmp,.webp" class="hidden">
                            <div class="mb-3">
                                <i class="ri-upload-cloud-2-line text-4xl text-indigo-400"></i>
                            </div>
                            <p class="text-sm text-gray-600 mb-1 font-medium">点击或拖拽文件到此处上传</p>
                            <p class="text-xs text-gray-400 mb-3">支持 PDF、Excel、图片等格式，可多选</p>
                            <button type="button" id="btn-pick-file" class="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium hover:bg-indigo-700 transition-colors">
                                <i class="ri-folder-open-line"></i> 选择文件
                            </button>
                        </div>
                        <div id="upload-progress" class="hidden mt-3"></div>
                    </div>

                    <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <span class="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                                <i class="ri-file-list-3-line text-xs text-green-600"></i>
                            </span>
                            已上传文件 <span class="text-gray-400 font-normal">(${files.length})</span>
                        </h3>
                        <div id="file-list" class="max-h-64 overflow-y-auto">
                            ${files.length === 0 ? `
                                <div class="text-center py-8 text-gray-400">
                                    <i class="ri-folder-open-line text-3xl mb-2 block"></i>
                                    <p class="text-xs">还没有上传文件</p>
                                </div>
                            ` : files.map(f => renderFileItem(f)).join('')}
                        </div>
                    </div>
                </div>

                <!-- 生成报告按钮 -->
                <div class="mb-5">
                    <button id="btn-generate-report" class="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 ${files.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
                        <i class="ri-magic-line text-lg"></i>
                        <span>输出报告</span>
                    </button>
                    <p class="text-xs text-gray-400 text-center mt-2">根据上传的所有文件自动分析，生成关键数据和合作洞察</p>
                </div>

                <div class="text-center mt-6 mb-2">
                    
                </div>
            </div>
        `;

        document.getElementById('btn-back-list')?.addEventListener('click', () => { currentTab = 'cooperation'; renderTabPage(container); });

        document.getElementById('btn-view-report')?.addEventListener('click', () => {
            if (review.report_content) {
                let report = review.report_content;
                if (typeof report === 'string') {
                    try { report = JSON.parse(report); } catch (e) {}
                }
                renderReportView(container, reviewId, report);
            }
        });

        setupFileUpload(container, reviewId);

        document.getElementById('btn-generate-report')?.addEventListener('click', async () => {
            if (files.length === 0) {
                showToast('请先上传文件', 'warning');
                return;
            }
            await generateReport(container, reviewId);
        });

        container.querySelectorAll('.btn-delete-file').forEach(btn => {
            btn.addEventListener('click', async () => {
                const fileId = parseInt(btn.dataset.id);
                if (!confirm('确定要删除此文件吗？')) return;
                try {
                    await request(`/cooperation/file/${fileId}`, { method: 'DELETE' });
                    showToast('文件已删除', 'success');
                    renderDetailView(container, reviewId);
                } catch (err) {
                    showToast('删除失败: ' + err.message, 'error');
                }
            });
        });

    } catch (err) {
        container.innerHTML = `
            <div class="text-center py-20">
                <i class="ri-error-warning-line text-4xl text-red-300 mb-3 block"></i>
                <p class="text-sm text-red-400">加载失败: ${err.message}</p>
                <button id="btn-back-err" class="mt-4 px-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-600">返回列表</button>
            </div>
        `;
        document.getElementById('btn-back-err')?.addEventListener('click', () => { currentTab = 'cooperation'; renderTabPage(container); });
    }
}

function renderFileItem(f) {
    const iconMap = {
        pdf: { icon: 'ri-file-pdf-2-line', color: 'text-red-500 bg-red-50' },
        excel: { icon: 'ri-file-excel-2-line', color: 'text-green-500 bg-green-50' },
        image: { icon: 'ri-image-line', color: 'text-blue-500 bg-blue-50' },
        other: { icon: 'ri-file-line', color: 'text-gray-500 bg-gray-50' },
    };
    const fi = iconMap[f.file_type] || iconMap.other;
    const sizeStr = formatSize(f.file_size);

    return `
        <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
            <div class="w-10 h-10 rounded-xl ${fi.color} flex items-center justify-center flex-shrink-0">
                <i class="${fi.icon} text-lg"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-700 truncate">${escapeHtml(f.file_name)}</p>
                <p class="text-xs text-gray-400">${sizeStr} · ${f.file_type}</p>
            </div>
            ${f.extracted_text && f.extracted_text.length > 10 ? `
                <span class="px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded-full text-[10px] flex-shrink-0">已提取</span>
            ` : ''}
            <a href="/api/cooperation/file/${f.id}/download" download="${escapeHtml(f.file_name)}"
               class="btn-download-file w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-blue-50 hover:text-blue-500 transition-all flex-shrink-0"
               title="下载文件">
                <i class="ri-download-line text-sm"></i>
            </a>
            <button class="btn-delete-file w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 active:bg-red-50 active:text-red-500 transition-all flex-shrink-0" data-id="${f.id}">
                <i class="ri-close-line text-sm"></i>
            </button>
        </div>
    `;
}

// ============ 文件上传 ============
function setupFileUpload(container, reviewId) {
    const zone = document.getElementById('upload-zone');
    const input = document.getElementById('file-input');
    if (!zone || !input) return;

    zone.addEventListener('click', (e) => {
        if (e.target.closest('#btn-pick-file')) return; // 按钮自己处理
        input.click();
    });
    document.getElementById('btn-pick-file')?.addEventListener('click', (e) => {
        e.stopPropagation();
        input.click();
    });
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) uploadFiles(container, reviewId, e.dataTransfer.files);
    });
    input.addEventListener('change', () => {
        if (input.files.length > 0) uploadFiles(container, reviewId, input.files);
    });
}

async function uploadFiles(container, reviewId, fileList) {
    const progressDiv = document.getElementById('upload-progress');
    if (!progressDiv) return;
    progressDiv.classList.remove('hidden');

    const files = Array.from(fileList);
    let successCount = 0;
    let failCount = 0;

    progressDiv.innerHTML = `
        <div class="space-y-2">
            ${files.map((f, i) => `
                <div id="upload-item-${i}" class="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <div class="w-6 h-6 flex items-center justify-center flex-shrink-0">
                        <div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div>
                    </div>
                    <span class="text-xs text-gray-600 truncate flex-1">${escapeHtml(f.name)}</span>
                    <span id="upload-status-${i}" class="text-xs text-gray-400">上传中...</span>
                </div>
            `).join('')}
        </div>
    `;

    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const formData = new FormData();
        formData.append('file', f);

        try {
            const resp = await fetch(`${API_BASE}/cooperation/${reviewId}/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await resp.json();
            if (!resp.ok || data.code !== 0) throw new Error(data.detail || data.message || '上传失败');

            successCount++;
            const itemEl = document.getElementById(`upload-item-${i}`);
            const statusEl = document.getElementById(`upload-status-${i}`);
            if (itemEl) itemEl.querySelector('.loading-spinner')?.replaceWith(Object.assign(document.createElement('i'), { className: 'ri-check-line text-green-500' }));
            if (statusEl) { statusEl.textContent = '成功'; statusEl.className = 'text-xs text-green-500'; }
        } catch (err) {
            failCount++;
            const itemEl = document.getElementById(`upload-item-${i}`);
            const statusEl = document.getElementById(`upload-status-${i}`);
            if (itemEl) itemEl.querySelector('.loading-spinner')?.replaceWith(Object.assign(document.createElement('i'), { className: 'ri-close-line text-red-500' }));
            if (statusEl) { statusEl.textContent = err.message; statusEl.className = 'text-xs text-red-500'; }
        }
    }

    showToast(`上传完成：${successCount}个成功${failCount > 0 ? `，${failCount}个失败` : ''}`, successCount > 0 ? 'success' : 'error');
    setTimeout(() => renderDetailView(container, reviewId), 800);
}

// ============ 生成报告 ============
async function generateReport(container, reviewId) {
    const btn = document.getElementById('btn-generate-report');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;border-top-color:white;"></div><span>正在分析数据并生成报告...</span>`;
    }

    try {
        const res = await request(`/cooperation/${reviewId}/generate-report`, { method: 'POST' });
        showToast('报告生成成功！', 'success');
        await renderReportView(container, reviewId, res.data);
    } catch (err) {
        showToast('报告生成失败: ' + err.message, 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="ri-magic-line text-lg"></i><span>输出报告</span>`;
        }
    }
}

// ============ 报告视图 ============
async function renderReportView(container, reviewId, report) {
    currentView = 'report';
    currentReviewId = reviewId;

    let reviewFiles = [];
    try {
        const reviewRes = await request(`/cooperation/${reviewId}`);
        reviewFiles = reviewRes.data?.files || [];
    } catch (e) {
        reviewFiles = [];
    }

    container.innerHTML = `
        <div class="animate-fadeIn">
            <div class="flex items-center gap-2 mb-4 text-sm">
                <button id="btn-back-list2" class="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                    <i class="ri-arrow-left-s-line"></i> 返回列表
                </button>
                <span class="text-gray-300">/</span>
                <span class="text-gray-500">${escapeHtml(report.title || '分析报告')}</span>
            </div>

            <div class="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 mb-5 text-white">
                <div class="flex items-center gap-2 mb-2">
                    <i class="ri-file-chart-line text-2xl"></i>
                    <h2 class="text-xl font-bold">${escapeHtml(report.title || '合作分析报告')}</h2>
                </div>
                <p class="text-white/80 text-sm leading-relaxed">${escapeHtml(report.summary || '')}</p>
                <p class="text-white/50 text-xs mt-3"><i class="ri-time-line mr-1"></i>生成时间: ${report.generated_at || '-'}</p>
            </div>

            <div class="mb-5">
                <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span class="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <i class="ri-bar-chart-box-line text-xs text-indigo-600"></i>
                    </span>
                    数据总结
                </h3>
                <div class="grid grid-cols-4 gap-4">
                    ${report.key_metrics && report.key_metrics.length > 0 ? report.key_metrics.map(m => `
                        <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div class="flex items-center gap-2 mb-3">
                                <i class="${m.icon || 'ri-hashtag'} text-2xl text-indigo-500"></i>
                                <p class="text-xs text-gray-400">${escapeHtml(m.label)}</p>
                            </div>
                            <p class="text-xl font-bold text-gray-800">${escapeHtml(m.value)}</p>
                            ${m.detail ? `<p class="text-xs text-gray-400 mt-2">${escapeHtml(m.detail)}</p>` : ''}
                        </div>
                    `).join('') : '<div class="col-span-4 text-center py-6 text-gray-400 text-sm">暂无关键指标数据</div>'}
                </div>

                ${report.followers_distribution && report.followers_distribution.length > 0 ? `
                <div class="mt-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h4 class="text-xs font-semibold text-indigo-200 mb-3 flex items-center gap-2">
                        <i class="ri-group-line text-indigo-500"></i> 粉丝量分布
                    </h4>
                    <div class="grid grid-cols-4 gap-3">
                        ${report.followers_distribution.map((fd, idx) => {
                            const bgColors = ['dist-card-pink', 'dist-card-orange', 'dist-card-cyan', 'dist-card-gray'];
                            return `
                            <div class="${bgColors[idx]} rounded-lg p-3 text-center">
                                <p class="text-lg font-bold text-white">${fd.count}</p>
                                <p class="text-[11px] text-indigo-200 mt-0.5">${escapeHtml(fd.tier)}</p>
                                <p class="text-[10px] text-indigo-300">${escapeHtml(fd.percent)}</p>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
                ` : ''}
            </div>

            ${report.country_summary && report.country_summary.length > 0 ? `
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
                <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span class="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i class="ri-global-line text-xs text-blue-600"></i>
                    </span>
                    分国家汇总
                </h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-xs">
                        <thead>
                            <tr class="border-b border-gray-100">
                                <th class="text-left py-2 px-2 font-medium text-gray-500">国家</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">KOL数</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">总观看量</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">总费用</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">总互动量</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">平均粉丝量</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">平均CPM</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">平均CPA</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${report.country_summary.map(r => `
                                <tr class="border-b border-gray-50 hover:bg-gray-50">
                                    <td class="py-2 px-2 font-medium text-gray-700">${escapeHtml(r.country)}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${r.kol_count}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${r.total_views > 0 ? formatLargeNumber(r.total_views) : '-'}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${r.total_cost > 0 ? '$' + r.total_cost.toLocaleString() : '-'}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${r.total_engagement > 0 ? formatLargeNumber(r.total_engagement) : '-'}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${r.avg_followers > 0 ? formatLargeNumber(r.avg_followers) : '-'}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${r.avg_cpm > 0 ? '$' + Number(r.avg_cpm).toFixed(2) : '-'}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${r.avg_cpa > 0 ? '$' + Number(r.avg_cpa).toFixed(2) : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            ` : ''}

            ${report.kol_details && report.kol_details.length > 0 ? `
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
                <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span class="w-6 h-6 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <i class="ri-user-star-line text-xs text-cyan-600"></i>
                    </span>
                    KOL详情（按name合并，共${report.kol_details.length}位）
                </h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-xs">
                        <thead>
                            <tr class="border-b border-gray-100">
                                <th class="text-left py-2 px-2 font-medium text-gray-500">KOL名称</th>
                                <th class="text-left py-2 px-2 font-medium text-gray-500">国家</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">记录数</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">总观看量</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">总费用</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">总互动量</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">CPM</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">CPA</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">粉丝量级</th>
                                <th class="text-center py-2 px-2 font-medium text-gray-500">平台</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${report.kol_details.map(kol => `
                                <tr class="border-b border-gray-50 hover:bg-gray-50">
                                    <td class="py-2 px-2 font-medium text-gray-700">${escapeHtml(kol.name)}</td>
                                    <td class="py-2 px-2 text-gray-600">${kol.country ? escapeHtml(kol.country) : '-'}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${kol.record_count > 1 ? `<span class="text-orange-500 font-medium">${kol.record_count}</span>` : '1'}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${kol.total_views > 0 ? formatLargeNumber(kol.total_views) : '-'}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${kol.total_cost > 0 ? '$' + kol.total_cost.toLocaleString() : '-'}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${kol.total_engagement > 0 ? formatLargeNumber(kol.total_engagement) : '-'}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${kol.avg_cpm > 0 ? '$' + Number(kol.avg_cpm).toFixed(2) : '-'}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${kol.avg_cpa > 0 ? '$' + Number(kol.avg_cpa).toFixed(2) : '-'}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${kol.followers > 0 ? formatLargeNumber(kol.followers) : '-'}</td>
                                    <td class="py-2 px-2 text-center">${kol.platforms.length > 0 ? kol.platforms.map(p => `<span class="inline-block px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] mr-0.5">${p}</span>`).join('') : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            ` : ''}

            ${report.file_overview && report.file_overview.length > 0 ? `
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
                <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span class="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                        <i class="ri-file-list-3-line text-xs text-gray-600"></i>
                    </span>
                    分析文件清单
                </h3>
                <div class="space-y-1">
                    ${report.file_overview.map(f => `
                        <p class="text-xs text-gray-500 pl-3">${escapeHtml(f)}</p>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <div class="flex gap-4 mb-5">
                <button id="btn-regenerate" class="px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <i class="ri-refresh-line"></i> 重新生成
                </button>
            </div>

            <div class="grid grid-cols-2 gap-5 mb-5">
                <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span class="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <i class="ri-upload-cloud-2-line text-xs text-indigo-600"></i>
                        </span>
                        上传合作资料
                    </h3>
                    <div id="upload-zone" class="upload-zone p-8 text-center rounded-xl">
                        <input type="file" id="file-input" multiple accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.gif,.bmp,.webp" class="hidden">
                        <div class="mb-3">
                            <i class="ri-upload-cloud-2-line text-4xl text-indigo-300"></i>
                        </div>
                        <p class="text-sm text-gray-500 mb-1">点击或拖拽文件到此处上传</p>
                        <p class="text-xs text-gray-400">支持 PDF、Excel、图片等格式，可多选</p>
                    </div>
                    <div id="upload-progress" class="hidden mt-3"></div>
                </div>

                <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span class="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                            <i class="ri-file-list-3-line text-xs text-green-600"></i>
                        </span>
                        文档记录 <span class="text-gray-400 font-normal">(${reviewFiles.length})</span>
                    </h3>
                    <div id="file-list" class="max-h-64 overflow-y-auto">
                        ${reviewFiles.length === 0 ? `
                            <div class="text-center py-8 text-gray-400">
                                <i class="ri-folder-open-line text-3xl mb-2 block"></i>
                                <p class="text-xs">还没有上传文件</p>
                            </div>
                        ` : reviewFiles.map(f => renderFileItem(f)).join('')}
                    </div>
                </div>
            </div>

            <div class="text-center mt-6 mb-2">
                
            </div>
        </div>
    `;

    document.getElementById('btn-back-list2')?.addEventListener('click', () => { currentTab = 'cooperation'; renderTabPage(container); });
    document.getElementById('btn-regenerate')?.addEventListener('click', () => generateReport(container, reviewId));

    setupFileUploadInReport(container, reviewId, report);

    container.querySelectorAll('.btn-delete-file').forEach(btn => {
        btn.addEventListener('click', async () => {
            const fileId = parseInt(btn.dataset.id);
            if (!confirm('确定要删除此文件吗？')) return;
            try {
                await request(`/cooperation/file/${fileId}`, { method: 'DELETE' });
                showToast('文件已删除', 'success');
                renderReportView(container, reviewId, report);
            } catch (err) {
                showToast('删除失败: ' + err.message, 'error');
            }
        });
    });
}

function setupFileUploadInReport(container, reviewId, report) {
    const zone = document.getElementById('upload-zone');
    const input = document.getElementById('file-input');
    if (!zone || !input) return;

    zone.addEventListener('click', () => input.click());
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) uploadFilesInReport(container, reviewId, report, e.dataTransfer.files);
    });
    input.addEventListener('change', () => {
        if (input.files.length > 0) uploadFilesInReport(container, reviewId, report, input.files);
    });
}

async function uploadFilesInReport(container, reviewId, report, fileList) {
    const progressDiv = document.getElementById('upload-progress');
    if (!progressDiv) return;
    progressDiv.classList.remove('hidden');

    const files = Array.from(fileList);
    let successCount = 0;
    let failCount = 0;

    progressDiv.innerHTML = `
        <div class="space-y-2">
            ${files.map((f, i) => `
                <div id="upload-item-${i}" class="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <div class="w-6 h-6 flex items-center justify-center flex-shrink-0">
                        <div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div>
                    </div>
                    <span class="text-xs text-gray-600 truncate flex-1">${escapeHtml(f.name)}</span>
                    <span id="upload-status-${i}" class="text-xs text-gray-400">上传中...</span>
                </div>
            `).join('')}
        </div>
    `;

    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const formData = new FormData();
        formData.append('file', f);

        try {
            const resp = await fetch(`${API_BASE}/cooperation/${reviewId}/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await resp.json();
            if (!resp.ok || data.code !== 0) throw new Error(data.detail || data.message || '上传失败');

            successCount++;
            const itemEl = document.getElementById(`upload-item-${i}`);
            const statusEl = document.getElementById(`upload-status-${i}`);
            if (itemEl) itemEl.querySelector('.loading-spinner')?.replaceWith(Object.assign(document.createElement('i'), { className: 'ri-check-line text-green-500' }));
            if (statusEl) { statusEl.textContent = '成功'; statusEl.className = 'text-xs text-green-500'; }
        } catch (err) {
            failCount++;
            const itemEl = document.getElementById(`upload-item-${i}`);
            const statusEl = document.getElementById(`upload-status-${i}`);
            if (itemEl) itemEl.querySelector('.loading-spinner')?.replaceWith(Object.assign(document.createElement('i'), { className: 'ri-close-line text-red-500' }));
            if (statusEl) { statusEl.textContent = err.message; statusEl.className = 'text-xs text-red-500'; }
        }
    }

    showToast(`上传完成：${successCount}个成功${failCount > 0 ? `，${failCount}个失败` : ''}`, successCount > 0 ? 'success' : 'error');
    setTimeout(() => renderReportView(container, reviewId, report), 800);
}

// ============ 竞品案例 ============
async function renderCompetitorContent(tabContent, mainContainer) {
    tabContent.innerHTML = `<div class="flex items-center justify-center py-20"><div class="loading-spinner"></div></div>`;
    try {
        const res = await request('/competitor/list');
        const list = res.data || [];

        tabContent.innerHTML = `
            <!-- 页面头部 -->
            <div class="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-2xl p-6 mb-5 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-white/70 text-xs mb-1">竞品案例库</p>
                        <h2 class="text-2xl font-bold">${list.length} <span class="text-base font-normal text-white/80">个竞品案例</span></h2>
                        <p class="text-white/60 text-sm mt-1">上传竞品的合作案例文档，方便随时查阅参考</p>
                    </div>
                    <button id="btn-upload-competitor" class="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
                        <i class="ri-upload-cloud-2-line text-lg"></i>
                        <span>上传案例</span>
                    </button>
                </div>
            </div>

            <!-- 案例列表 -->
            ${list.length === 0 ? `
                <div class="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                    <div class="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="ri-spy-line text-5xl text-orange-300"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-700 mb-2">还没有竞品案例</h3>
                    <p class="text-sm text-gray-400">点击上方按钮上传竞品案例文档</p>
                </div>
            ` : `
                <div class="grid grid-cols-3 gap-5">
                    ${list.map(item => renderCompetitorCard(item)).join('')}
                </div>
            `}

            <!-- 签名 -->
            <div class="text-center mt-6 mb-2">
                
            </div>
        `;

        // 绑定上传按钮
        document.getElementById('btn-upload-competitor')?.addEventListener('click', () => showCompetitorUploadModal(tabContent, mainContainer));

        // 绑定卡片查看
        tabContent.querySelectorAll('.competitor-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.competitor-actions')) return;
                const id = parseInt(card.dataset.id);
                viewCompetitorFile(id);
            });
        });

        // 绑定删除
        tabContent.querySelectorAll('.btn-delete-competitor').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const name = btn.dataset.name;
                if (!confirm(`确定要删除「${name}」吗？`)) return;
                try {
                    await request(`/competitor/${id}`, { method: 'DELETE' });
                    showToast('删除成功', 'success');
                    renderCompetitorContent(tabContent, mainContainer);
                } catch (err) {
                    showToast('删除失败: ' + err.message, 'error');
                }
            });
        });

    } catch (err) {
        tabContent.innerHTML = `
            <div class="text-center py-20">
                <i class="ri-error-warning-line text-4xl text-red-300 mb-3 block"></i>
                <p class="text-sm text-red-400">加载失败: ${err.message}</p>
            </div>
        `;
    }
}

function renderCompetitorCard(item) {
    const typeIconMap = {
        pdf: { icon: 'ri-file-pdf-2-line', color: 'from-red-400 to-red-600', bg: 'bg-red-50 text-red-500' },
        excel: { icon: 'ri-file-excel-2-line', color: 'from-green-400 to-green-600', bg: 'bg-green-50 text-green-500' },
        word: { icon: 'ri-file-word-2-line', color: 'from-blue-400 to-blue-600', bg: 'bg-blue-50 text-blue-500' },
        image: { icon: 'ri-image-line', color: 'from-purple-400 to-purple-600', bg: 'bg-purple-50 text-purple-500' },
        ppt: { icon: 'ri-file-ppt-2-line', color: 'from-orange-400 to-orange-600', bg: 'bg-orange-50 text-orange-500' },
        video: { icon: 'ri-video-line', color: 'from-pink-400 to-pink-600', bg: 'bg-pink-50 text-pink-500' },
        other: { icon: 'ri-file-line', color: 'from-gray-400 to-gray-600', bg: 'bg-gray-50 text-gray-500' },
    };
    const ti = typeIconMap[item.file_type] || typeIconMap.other;
    const date = item.created_at ? item.created_at.split(' ')[0] : '';
    const sizeStr = formatSize(item.file_size);

    return `
        <div class="competitor-card bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-orange-200 hover:shadow-md transition-all" data-id="${item.id}">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                    <div class="w-11 h-11 bg-gradient-to-br ${ti.color} rounded-xl flex items-center justify-center text-white text-lg shadow-sm flex-shrink-0">
                        <i class="${ti.icon}"></i>
                    </div>
                    <div class="min-w-0 flex-1">
                        <h4 class="font-semibold text-gray-800 text-sm truncate">${escapeHtml(item.title)}</h4>
                        <p class="text-xs text-gray-400 mt-0.5">${date}</p>
                    </div>
                </div>
                <div class="competitor-actions flex items-center gap-1 flex-shrink-0 ml-2">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-medium ${ti.bg}">
                        ${item.file_type.toUpperCase()}
                    </span>
                    <button class="btn-delete-competitor w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 active:bg-red-50 active:text-red-500 transition-colors" data-id="${item.id}" data-name="${escapeAttr(item.title)}">
                        <i class="ri-delete-bin-line text-sm"></i>
                    </button>
                </div>
            </div>
            ${item.description ? `<p class="text-xs text-gray-500 mb-2 line-clamp-2">${escapeHtml(item.description)}</p>` : ''}
            <div class="flex items-center gap-3 text-xs text-gray-400">
                <span class="flex items-center gap-1"><i class="ri-file-line"></i>${escapeHtml(item.file_name)}</span>
                <span>${sizeStr}</span>
            </div>
            <div class="mt-3 pt-3 border-t border-gray-50">
                <span class="text-xs text-indigo-500 flex items-center gap-1"><i class="ri-eye-line"></i>点击查看源文档</span>
            </div>
        </div>
    `;
}

// 竞品案例上传弹窗
function showCompetitorUploadModal(tabContent, mainContainer) {
    const modal = document.createElement('div');
    modal.id = 'competitor-upload-modal';
    modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fadeIn">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 class="text-base font-semibold text-gray-800">上传竞品案例</h3>
                <button id="close-competitor-modal" class="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <i class="ri-close-line text-xl text-gray-500"></i>
                </button>
            </div>
            <div class="p-5">
                <div class="mb-4">
                    <label class="block text-xs text-gray-500 mb-1.5 font-medium">案例标题</label>
                    <input type="text" id="competitor-title" placeholder="留空则使用文件名作为标题" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors">
                </div>
                <div class="mb-4">
                    <label class="block text-xs text-gray-500 mb-1.5 font-medium">案例描述</label>
                    <textarea id="competitor-desc" rows="2" placeholder="简要描述竞品案例信息..." class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors resize-none"></textarea>
                </div>
                <div class="mb-5">
                    <label class="block text-xs text-gray-500 mb-1.5 font-medium">选择文件 <span class="text-red-500">*</span></label>
                    <div id="competitor-upload-zone" class="upload-zone p-6 text-center rounded-xl" style="border-color: #fed7aa;">
                        <input type="file" id="competitor-file-input" accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.bmp,.webp,.mp4" class="hidden">
                        <div class="mb-2">
                            <i class="ri-upload-cloud-2-line text-3xl text-orange-300"></i>
                        </div>
                        <p class="text-sm text-gray-500 mb-1">点击选择文件</p>
                        <p class="text-xs text-gray-400">支持 PDF、Word、Excel、PPT、图片、视频等格式</p>
                    </div>
                    <div id="competitor-file-preview" class="hidden mt-3 flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                        <i class="ri-file-line text-orange-500 text-lg"></i>
                        <span id="competitor-file-name" class="text-sm text-gray-700 truncate flex-1"></span>
                        <button id="competitor-file-clear" class="text-gray-400 hover:text-red-500">
                            <i class="ri-close-line"></i>
                        </button>
                    </div>
                </div>
                <div id="competitor-upload-progress" class="hidden mb-4">
                    <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div>
                        <span class="text-xs text-gray-600">正在上传...</span>
                    </div>
                </div>
                <div class="flex gap-3">
                    <button id="cancel-competitor" class="flex-1 py-3 border border-gray-200 rounded-2xl text-sm text-gray-600 font-medium active:bg-gray-50 transition-colors">取消</button>
                    <button id="confirm-competitor" class="flex-1 py-3 bg-orange-500 text-white rounded-2xl text-sm font-medium active:bg-orange-600 transition-colors">上传</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    let selectedFile = null;

    const closeModal = () => {
        modal.remove();
        document.body.style.overflow = '';
    };

    modal.querySelector('#close-competitor-modal').addEventListener('click', closeModal);
    modal.querySelector('#cancel-competitor').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    const fileInput = modal.querySelector('#competitor-file-input');
    const uploadZone = modal.querySelector('#competitor-upload-zone');
    const filePreview = modal.querySelector('#competitor-file-preview');
    const fileNameEl = modal.querySelector('#competitor-file-name');

    uploadZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            selectedFile = fileInput.files[0];
            fileNameEl.textContent = selectedFile.name;
            filePreview.classList.remove('hidden');
            uploadZone.classList.add('hidden');
        }
    });

    modal.querySelector('#competitor-file-clear')?.addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        filePreview.classList.add('hidden');
        uploadZone.classList.remove('hidden');
    });

    modal.querySelector('#confirm-competitor').addEventListener('click', async () => {
        if (!selectedFile) {
            showToast('请选择文件', 'warning');
            return;
        }

        const title = document.getElementById('competitor-title').value.trim();
        const desc = document.getElementById('competitor-desc').value.trim();

        const progressDiv = modal.querySelector('#competitor-upload-progress');
        progressDiv.classList.remove('hidden');
        modal.querySelector('#confirm-competitor').disabled = true;

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', title);
        formData.append('description', desc);

        try {
            const resp = await fetch(`${API_BASE}/competitor/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await resp.json();
            if (!resp.ok || data.code !== 0) throw new Error(data.detail || data.message || '上传失败');

            showToast('竞品案例上传成功', 'success');
            closeModal();
            renderCompetitorContent(tabContent, mainContainer);
        } catch (err) {
            showToast('上传失败: ' + err.message, 'error');
            progressDiv.classList.add('hidden');
            modal.querySelector('#confirm-competitor').disabled = false;
        }
    });
}

// 查看竞品案例源文件
function viewCompetitorFile(caseId) {
    // 在新窗口打开文件
    window.open(`${API_BASE}/competitor/${caseId}/download`, '_blank');
}

// ============ 工具函数 ============
function formatSize(bytes) {
    if (!bytes) return '0B';
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
}

function formatLargeNumber(num) {
    if (num === null || num === undefined || num === '') return '0';
    num = parseFloat(num);
    if (isNaN(num) || num <= 0) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 10000) return (num / 1000).toFixed(1) + 'K';
    if (num >= 1) {
        // 如果是整数则不显示小数，否则显示两位小数
        return Number.isInteger(num) ? num.toLocaleString() : num.toFixed(2);
    }
    return num.toFixed(2);
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text || '').replace(/[&<>"']/g, m => map[m]);
}

function escapeAttr(text) {
    return String(text || '').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}