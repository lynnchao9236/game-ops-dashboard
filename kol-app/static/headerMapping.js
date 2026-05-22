// 表头对照关系管理页面
import { request, showToast } from './api.js';

let mappings = [];
let editingId = null;

export async function renderHeaderMapping(container) {
    container.innerHTML = `
        <div class="animate-fadeIn">
            <!-- 页面标题 -->
            <div class="flex items-center justify-between mb-5">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <i class="ri-translate-2 text-lg text-white"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-800">表头对照关系</h3>
                        <p class="text-xs text-gray-400">管理系统表头与同义词的映射关系，导入Excel时自动识别</p>
                    </div>
                </div>
                <button id="btn-add-mapping" class="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                    <i class="ri-add-line text-base"></i> 新增字段 / 同义词
                </button>
            </div>

            <!-- 使用说明 -->
            <div class="rounded-2xl p-5 mb-5" style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2)">
                <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style="background:rgba(99,102,241,0.2)">
                        <i class="ri-lightbulb-line text-indigo-600"></i>
                    </div>
                    <div class="text-sm leading-relaxed" style="color:rgba(255,255,255,0.65)">
                        <p class="font-medium mb-1" style="color:rgba(255,255,255,0.9)">使用说明</p>
                        <p>• <strong>补充同义词</strong>：填写已有字段名（如 name、followers），在同义词里添加你 Excel 中的列名，导入时自动识别</p>
                        <p>• <strong>新增字段</strong>：填写一个新的字段名（如 tiktok_handle），该字段会自动出现在 KOL Pool 表格中</p>
                        <p>• 同义词之间用英文逗号分隔，匹配不区分大小写</p>
                        <p>• 内置字段（🔒 标识）的同义词可在此补充，但无法删除内置字段本身</p>
                    </div>
                </div>
            </div>

            <!-- 映射列表 -->
            <div id="mapping-list" class="space-y-3">
                <div class="flex items-center justify-center py-20">
                    <div class="loading-spinner"></div>
                </div>
            </div>

            <!-- 签名 -->
            <div class="text-center mt-8 mb-2">
                
            </div>
        </div>

        <!-- 编辑弹窗 -->
        <div id="mapping-modal" class="modal-overlay hidden">
            <div class="modal-backdrop"></div>
            <div class="modal-container">
                <div class="modal-sheet" style="max-width: 560px;">
                    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                        <h3 id="mapping-modal-title" class="text-lg font-bold text-gray-800">新增字段 / 补充同义词</h3>
                        <button id="close-mapping-modal" class="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <i class="ri-close-line text-xl text-gray-500"></i>
                        </button>
                    </div>
                    <div class="p-6">
                        <form id="mapping-form">
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1.5">字段标识（英文）<span class="text-red-500">*</span></label>
                                    <input type="text" id="form-system-header" placeholder="例如：tiktok_handle、game_title..."
                                        class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors">
                                    <p class="text-xs mt-1" id="form-system-header-tip">
                                        <span class="text-blue-500">💡 若填写已有字段（如 name/followers）→ 仅补充同义词；</span>
                                        <span class="text-green-600 font-medium">若填写新名称 → 创建新字段并同步到 KOL Pool</span>
                                    </p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1.5">显示名称</label>
                                    <input type="text" id="form-display-name" placeholder="用于页面展示的友好名称..."
                                        class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors">
                                    <p class="text-xs text-gray-400 mt-1">留空则使用系统表头作为显示名称</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1.5">同义词</label>
                                    <textarea id="form-synonyms" rows="4" placeholder="输入同义词，用英文逗号分隔，例如：kol, cc, Content Creator, Influencer"
                                        class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors resize-none"></textarea>
                                    <p class="text-xs text-gray-400 mt-1">Excel中可能出现的各种表头名称，用英文逗号分隔</p>
                                </div>
                            </div>
                            <div class="flex gap-3 pt-5 mt-5 border-t border-gray-100">
                                <button type="button" id="cancel-mapping-modal" class="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">取消</button>
                                <button type="submit" class="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">保存</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 绑定事件
    document.getElementById('btn-add-mapping').addEventListener('click', () => openEditModal(null));
    document.getElementById('close-mapping-modal').addEventListener('click', closeEditModal);
    document.getElementById('cancel-mapping-modal').addEventListener('click', closeEditModal);
    document.getElementById('mapping-modal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) closeEditModal();
    });
    document.getElementById('mapping-form').addEventListener('submit', handleSave);

    // 加载数据
    await loadMappings();
}

async function loadMappings() {
    const listEl = document.getElementById('mapping-list');
    if (!listEl) return;

    listEl.innerHTML = `<div class="flex items-center justify-center py-20"><div class="loading-spinner"></div></div>`;

    try {
        const res = await request('/header-mapping');
        mappings = res.data || [];
        renderMappingList();
    } catch (err) {
        listEl.innerHTML = `
            <div class="text-center py-20">
                <i class="ri-error-warning-line text-4xl text-red-300 mb-3 block"></i>
                <p class="text-sm text-red-400">加载失败: ${err.message}</p>
            </div>
        `;
    }
}

function renderMappingList() {
    const listEl = document.getElementById('mapping-list');
    if (!listEl) return;

    if (mappings.length === 0) {
        listEl.innerHTML = `
            <div class="rounded-2xl p-12 text-center" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1)">
                <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style="background:rgba(99,102,241,0.15)">
                    <i class="ri-translate-2 text-4xl text-indigo-300"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-700 mb-2">暂无表头对照关系</h3>
                <p class="text-sm text-gray-400">点击右上角「新增表头」按钮添加</p>
            </div>
        `;
        return;
    }

    const tagColors = ['bg-indigo-50 text-indigo-600', 'bg-purple-50 text-purple-600', 'bg-cyan-50 text-cyan-600', 'bg-green-50 text-green-600', 'bg-orange-50 text-orange-600', 'bg-pink-50 text-pink-600', 'bg-amber-50 text-amber-700', 'bg-teal-50 text-teal-600'];

    listEl.innerHTML = mappings.map((m, idx) => {
        const synonyms = (m.synonyms || '').split(',').map(s => s.trim()).filter(Boolean);
        const colorClass = tagColors[idx % tagColors.length];
        const displaySynonyms = synonyms.slice(0, 20);
        const remaining = synonyms.length - displaySynonyms.length;
        const isBuiltin = !!m.is_builtin;

        return `
            <div class="rounded-2xl p-5 transition-all group" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1)" data-id="${m.id || ''}">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-3 mb-3">
                            <span class="inline-flex items-center px-3 py-1.5 ${colorClass} rounded-lg text-sm font-bold">
                                ${escapeHtml(m.system_header)}
                            </span>
                            ${m.display_name && m.display_name !== m.system_header ? `
                                <span class="text-sm text-gray-500 flex items-center gap-1">
                                    <i class="ri-arrow-right-line text-gray-300"></i>
                                    ${escapeHtml(m.display_name)}
                                </span>
                            ` : ''}
                            ${m.description ? `<span class="text-xs text-gray-400">${escapeHtml(m.description)}</span>` : ''}
                            ${isBuiltin
                                ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-400 rounded-full text-[10px] ml-auto flex-shrink-0"><i class="ri-lock-line text-[10px]"></i>内置</span>`
                                : `<span class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-500 rounded-full text-[10px] ml-auto flex-shrink-0"><i class="ri-user-line text-[10px]"></i>自定义</span>`
                            }
                        </div>
                        <div class="flex flex-wrap gap-1.5">
                            ${displaySynonyms.map(s => `
                                <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs transition-colors ${isBuiltin ? '' : 'synonym-tag'}" ${isBuiltin ? '' : `data-mapping-id="${m.id}" data-synonym="${escapeAttr(s)}"`}>
                                    ${escapeHtml(s)}
                                    ${!isBuiltin ? `
                                    <button class="ml-1.5 text-gray-300 hover:text-red-500 transition-colors delete-synonym-btn" title="删除此同义词">
                                        <i class="ri-close-line text-xs"></i>
                                    </button>` : ''}
                                </span>
                            `).join('')}
                            ${remaining > 0 ? `<span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs" style="background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.4)">+${remaining}个</span>` : ''}
                            ${!isBuiltin ? `
                            <button class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs transition-colors add-synonym-btn" style="background:rgba(99,102,241,0.15);color:rgba(167,139,250,1)" data-id="${m.id}" title="添加同义词">
                                <i class="ri-add-line text-xs mr-0.5"></i>添加
                            </button>` : ''}
                        </div>
                    </div>
                    ${!isBuiltin ? `
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors edit-mapping-btn" data-id="${m.id}" title="编辑">
                            <i class="ri-edit-line text-sm"></i>
                        </button>
                        <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors delete-mapping-btn" data-id="${m.id}" title="删除">
                            <i class="ri-delete-bin-line text-sm"></i>
                        </button>
                    </div>` : ''}
                </div>
            </div>
        `;
    }).join('');

    // 绑定事件
    listEl.querySelectorAll('.edit-mapping-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const mapping = mappings.find(m => m.id === id);
            if (mapping) openEditModal(mapping);
        });
    });

    listEl.querySelectorAll('.delete-mapping-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const mapping = mappings.find(m => m.id === id);
            if (mapping) deleteMapping(mapping);
        });
    });

    listEl.querySelectorAll('.delete-synonym-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const tag = btn.closest('.synonym-tag');
            if (!tag) return;
            const mappingId = parseInt(tag.dataset.mappingId);
            const synonym = tag.dataset.synonym;
            deleteSynonym(mappingId, synonym);
        });
    });

    listEl.querySelectorAll('.add-synonym-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            addSynonymInline(id, btn);
        });
    });
}

function openEditModal(mapping) {
    editingId = mapping ? mapping.id : null;
    const modal = document.getElementById('mapping-modal');
    const title = document.getElementById('mapping-modal-title');

    title.textContent = mapping ? '编辑表头' : '新增表头';
    document.getElementById('form-system-header').value = mapping ? mapping.system_header : '';
    document.getElementById('form-display-name').value = mapping ? (mapping.display_name || '') : '';
    document.getElementById('form-synonyms').value = mapping ? (mapping.synonyms || '') : '';

    // 编辑模式下系统表头禁止修改（已有记录不能改 key）
    const headerEl = document.getElementById('form-system-header');
    headerEl.disabled = !!mapping;
    if (mapping) headerEl.style.opacity = '0.6';
    else headerEl.style.opacity = '1';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    document.getElementById('form-system-header').focus();
}

function closeEditModal() {
    const modal = document.getElementById('mapping-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
    editingId = null;
}

async function handleSave(e) {
    e.preventDefault();

    const systemHeader = document.getElementById('form-system-header').value.trim();
    const displayName = document.getElementById('form-display-name').value.trim();
    const synonyms = document.getElementById('form-synonyms').value.trim();

    if (!systemHeader) {
        showToast('请输入系统表头', 'warning');
        return;
    }

    try {
        if (editingId) {
            await request(`/header-mapping/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    system_header: systemHeader,
                    display_name: displayName || systemHeader,
                    synonyms: synonyms,
                }),
            });
            showToast('更新成功', 'success');
        } else {
            const res = await request('/header-mapping', {
                method: 'POST',
                body: JSON.stringify({
                    system_header: systemHeader,
                    display_name: displayName || systemHeader,
                    synonyms: synonyms,
                }),
            });
            const isNew = res.data && res.data.is_new_field;
            const toastMsg = isNew
                ? `新字段「${displayName || systemHeader}」创建成功，已同步到 KOL Pool ✅`
                : '同义词添加成功';
            showToast(toastMsg, 'success');
        }
        closeEditModal();
        await loadMappings();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteMapping(mapping) {
    if (!confirm(`确定要删除系统表头「${mapping.system_header}」及其所有同义词吗？`)) return;

    try {
        await request(`/header-mapping/${mapping.id}`, { method: 'DELETE' });
        showToast('删除成功', 'success');
        await loadMappings();
    } catch (err) {
        showToast('删除失败: ' + err.message, 'error');
    }
}

async function deleteSynonym(mappingId, synonym) {
    const mapping = mappings.find(m => m.id === mappingId);
    if (!mapping) return;

    const synonyms = (mapping.synonyms || '').split(',').map(s => s.trim()).filter(Boolean);
    const newSynonyms = synonyms.filter(s => s !== synonym);

    try {
        await request(`/header-mapping/${mappingId}`, {
            method: 'PUT',
            body: JSON.stringify({ synonyms: newSynonyms.join(',') }),
        });
        showToast(`已删除同义词「${synonym}」`, 'success');
        await loadMappings();
    } catch (err) {
        showToast('删除失败: ' + err.message, 'error');
    }
}

function addSynonymInline(mappingId, btnEl) {
    // 检查是否已有输入框
    const existing = btnEl.parentElement.querySelector('.inline-synonym-input');
    if (existing) {
        existing.focus();
        return;
    }

    const inputWrapper = document.createElement('span');
    inputWrapper.className = 'inline-flex items-center inline-synonym-input';
    inputWrapper.innerHTML = `
        <input type="text" placeholder="输入同义词..." 
            class="w-28 px-2.5 py-1 border border-indigo-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
            autofocus>
    `;

    btnEl.parentElement.insertBefore(inputWrapper, btnEl);
    const input = inputWrapper.querySelector('input');
    input.focus();

    const save = async () => {
        const val = input.value.trim();
        if (!val) {
            inputWrapper.remove();
            return;
        }

        const mapping = mappings.find(m => m.id === mappingId);
        if (!mapping) return;

        const synonyms = (mapping.synonyms || '').split(',').map(s => s.trim()).filter(Boolean);
        // 支持逗号分隔输入多个
        const newSyns = val.split(',').map(s => s.trim()).filter(Boolean);
        const merged = [...synonyms, ...newSyns];

        try {
            await request(`/header-mapping/${mappingId}`, {
                method: 'PUT',
                body: JSON.stringify({ synonyms: merged.join(',') }),
            });
            showToast(`已添加同义词`, 'success');
            await loadMappings();
        } catch (err) {
            showToast('添加失败: ' + err.message, 'error');
            inputWrapper.remove();
        }
    };

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            save();
        }
    });
    input.addEventListener('blur', save);
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text || '').replace(/[&<>"']/g, m => map[m]);
}

function escapeAttr(text) {
    return String(text || '').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
