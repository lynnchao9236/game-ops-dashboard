// 主入口模块 - PC端适配版本
import { request, showToast } from './api.js';
import { renderDashboard } from './dashboard.js';
import { renderKolList, loadKolList } from './kolList.js';
import { renderSearch } from './search.js';
import { renderImport } from './import.js';
import { renderCooperation } from './cooperation.js';
import { renderHeaderMapping } from './headerMapping.js';

let currentPage = 'dashboard';
let fieldsConfig = [];

const pages = {
    dashboard: { title: '数据概览', render: renderDashboard },
    'kol-list': { title: 'KOL列表', render: renderKolList },
    search: { title: '智能推荐', render: renderSearch },
    import: { title: '数据导入', render: renderImport },
    cooperation: { title: '案例查看', render: renderCooperation },
    'header-mapping': { title: '表头对照关系', render: renderHeaderMapping },
};

// ========== 密码保护配置 ==========
const KOL_INTERNAL_PASSWORD = 'YOUR_INTERNAL_PASSWORD';
let kolPwdUnlocked = false;

function kolCheckPassword(onSuccess, title) {
    title = title || 'KOL数据已加密';
    if (kolPwdUnlocked) { onSuccess(); return; }
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'kolPwdOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;';
    overlay.innerHTML = '<div class="pwd-modal-box" style="background:#1A0E3E;border:1px solid rgba(255,255,255,0.12);border-radius:24px;max-width:380px;width:90%;padding:36px 28px 28px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.5);">' +
        '<div style="font-size:52px;margin-bottom:12px;">🔐</div>' +
        '<div style="font-size:18px;font-weight:700;color:rgba(255,255,255,0.9);margin-bottom:6px;">' + title + '</div>' +
        '<div style="font-size:13px;color:rgba(255,255,255,0.45);margin-bottom:20px;">请输入访问密码</div>' +
        '<div style="position:relative;margin-bottom:8px;">' +
            '<input type="password" id="kolPwdInput" placeholder="请输入密码..." autocomplete="off" ' +
            'style="width:100%;height:48px;background:rgba(255,255,255,0.08);border:2px solid rgba(255,255,255,0.18);border-radius:12px;padding:0 48px 0 16px;font-size:16px;color:rgba(255,255,255,0.9);box-sizing:border-box;outline:none;" />' +
            '<button id="kolPwdEyeBtn" type="button" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.4);font-size:18px;padding:4px;">' +
            '<i class="ri-eye-off-line"></i></button>' +
        '</div>' +
        '<div class="hidden" id="kolPwdError" style="font-size:12px;color:#FF8A80;margin-bottom:4px;text-align:left;">密码错误，请重试</div>' +
        '<div style="display:flex;gap:12px;justify-content:center;margin-top:16px;">' +
            '<button id="kolPwdCancelBtn" style="flex:1;padding:12px;border-radius:12px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.6);cursor:pointer;font-size:14px;">取消</button>' +
            '<button id="kolPwdConfirmBtn" style="flex:1;padding:12px;border-radius:12px;background:linear-gradient(135deg,#6C3CE1,#8B5CF6);border:none;color:white;cursor:pointer;font-size:14px;font-weight:600;"><i class="ri-lock-unlock-line"></i> 解锁</button>' +
        '</div></div>';
    document.body.appendChild(overlay);
    var input = document.getElementById('kolPwdInput');
    var eyeBtn = document.getElementById('kolPwdEyeBtn');
    var errorEl = document.getElementById('kolPwdError');
    var visible = false;
    eyeBtn.addEventListener('click', function() {
        visible = !visible;
        input.type = visible ? 'text' : 'password';
        eyeBtn.innerHTML = visible ? '<i class="ri-eye-line"></i>' : '<i class="ri-eye-off-line"></i>';
    });
    function doConfirm() {
        if (input.value === KOL_INTERNAL_PASSWORD) {
            kolPwdUnlocked = true;
            overlay.remove();
            onSuccess();
        } else {
            errorEl.classList.remove('hidden');
            input.value = '';
            input.focus();
            setTimeout(function() { errorEl.classList.add('hidden'); }, 2000);
        }
    }
    document.getElementById('kolPwdConfirmBtn').addEventListener('click', doConfirm);
    input.addEventListener('keydown', function(e) { if (e.key === 'Enter') doConfirm(); });
    document.getElementById('kolPwdCancelBtn').addEventListener('click', function() { overlay.remove(); });
    setTimeout(function() { input.focus(); }, 100);
}


function navigate(pageName) {
    const page = pages[pageName];
    if (!page) return;
    // KOL列表和案例查看需要密码
    if ((pageName === 'kol-list' || pageName === 'cooperation') && !kolPwdUnlocked) {
        kolCheckPassword(function() { navigate(pageName); }, pageName === 'kol-list' ? 'KOL列表已加密' : '案例查看已加密');
        return;
    }
    currentPage = pageName;
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = page.title;

    // 更新侧边栏激活状态（PC端）
    document.querySelectorAll('.sidebar-tab').forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageName);
    });

    // 更新移动端底部导航激活状态
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        const isActive = item.dataset.page === pageName;
        item.classList.toggle('active', isActive);
    });

    // 滚动到顶部
    document.getElementById('main-content')?.scrollTo(0, 0);
    window.scrollTo(0, 0);

    const container = document.getElementById('page-container');
    if (container) {
        page.render(container);
    }
}

// 加载字段配置
async function loadFieldsConfig() {
    try {
        const res = await request('/fields');
        fieldsConfig = res.data || [];
    } catch (e) {
        fieldsConfig = [];
    }
}

async function loadCcFieldsConfig() {
    try {
        const res = await request('/cc/fields');
        ccFieldsConfig = res.data || [];
    } catch (e) {
        ccFieldsConfig = [];
    }
}


// ============ 弹窗工具 ============
function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
}

window.closeDetailModal = function () {
    closeModal('kol-detail-modal');
};

// ============ KOL详情 ============

window.showKolDetail = async function (id) {
    await loadFieldsConfig();

    try {
        const res = await request(`/kol/${id}`);
        const kol = res.data;

        const avatarColors = ['from-indigo-400 to-purple-500', 'from-pink-400 to-rose-500', 'from-cyan-400 to-blue-500', 'from-green-400 to-emerald-500', 'from-orange-400 to-amber-500'];
        const colorIdx = (kol.id || 0) % avatarColors.length;

        let title = (kol.name && String(kol.name).trim()) ? String(kol.name).trim() : `KOL #${kol.id}`;
        const mergedCount = kol.merged_count || 1;

        // 基础信息字段 - 使用合并后的数据
        const coreFieldKeys = ['name', 'followers', 'platform', 'country', 'genre', 'price'];
        const coreFieldLabels = {
            name: 'Name',
            followers: 'Followers',
            platform: 'Platforms',
            country: 'Country',
            genre: 'Genre',
            price: 'Price'
        };

        const basicInfoHtml = coreFieldKeys.map(key => {
            let val = '';
            let extraHtml = '';

            if (key === 'platform') {
                // 使用合并后的平台展示
                val = kol.platform_display || '';
                if (!val && kol.all_platforms) {
                    const platforms = String(kol.all_platforms).split('||').map(u => u.trim()).filter(Boolean);
                    const names = [...new Set(platforms.map(p => {
                        const lower = p.toLowerCase();
                        if (lower.includes('youtube')) return 'YouTube';
                        if (lower.includes('twitch')) return 'Twitch';
                        if (lower.includes('tiktok')) return 'TikTok';
                        if (lower.includes('instagram')) return 'Instagram';
                        if (lower.includes('twitter') || lower.includes('x.com')) return 'X/Twitter';
                        if (lower.includes('bilibili')) return 'Bilibili';
                        return p;
                    }))];
                    val = names.join(' / ');
                }
                if (!val) val = kol[key] || '';
            } else if (key === 'price') {
                // 使用合并后的价格范围，格式化为整数+千分位
                const rawPrice = kol.price_display || kol[key] || '';
                if (rawPrice && String(rawPrice).trim()) {
                    const formatPriceNum = (n) => {
                        const num = parseFloat(n);
                        if (isNaN(num)) return n;
                        return Math.round(num).toLocaleString();
                    };
                    const priceStr = String(rawPrice).trim();
                    if (priceStr.includes('~')) {
                        const parts = priceStr.split('~');
                        val = '$' + formatPriceNum(parts[0]) + '~$' + formatPriceNum(parts[1]);
                    } else {
                        val = '$' + formatPriceNum(priceStr);
                    }
                } else {
                    val = '';
                }
            } else if (key === 'followers') {
                // 使用合并后的粉丝范围
                val = kol.followers_display || kol[key] || '';
            } else {
                val = kol[key] || '';
            }

            if (!val || !String(val).trim()) return `
                <div class="detail-item">
                    <span class="detail-label">${coreFieldLabels[key]}</span>
                    <span class="detail-value text-gray-300">-</span>
                </div>
            `;
            return `
                <div class="detail-item">
                    <span class="detail-label">${coreFieldLabels[key]}</span>
                    <span class="detail-value">${escapeHtml(val)}</span>
                </div>
            `;
        }).join('');

        // 记录明细（子记录表格）
        const subRecords = kol.sub_records || [];
        let subRecordsHtml = '';
        if (subRecords.length >= 1) {
            subRecordsHtml = `
            <div class="detail-section">
                <h4>
                    <i class="ri-file-list-3-line text-orange-500"></i> 
                    记录明细 
                    <span class="ml-2 px-2.5 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-semibold">${subRecords.length} 条</span>
                </h4>
                <div class="overflow-x-auto">
                    <table class="w-full text-xs">
                        <thead>
                            <tr class="border-b border-gray-100">
                                <th class="text-left py-2 px-2 font-medium text-gray-500">记录 ID</th>
                                <th class="text-left py-2 px-2 font-medium text-gray-500">平台</th>
                                <th class="text-left py-2 px-2 font-medium text-gray-500">Source</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">粉丝数</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">价格</th>
                                <th class="text-center py-2 px-2 font-medium text-gray-500">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subRecords.map(sr => `
                                <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td class="py-2 px-2 text-gray-600">#${sr.id}</td>
                                    <td class="py-2 px-2">
                                        ${sr.platform ? `<span class="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs">${escapeHtml(sr.platform)}</span>` : '<span class="text-gray-300">-</span>'}
                                    </td>
                                    <td class="py-2 px-2 text-gray-600">${sr.source ? escapeHtml(String(sr.source)) : '<span class="text-gray-300">-</span>'}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${sr.followers || '-'}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${sr.price ? '$' + (() => { const n = parseFloat(sr.price); return isNaN(n) ? sr.price : Math.round(n).toLocaleString(); })() : '-'}</td>
                                    <td class="py-2 px-2 text-center">
                                        <button onclick="event.stopPropagation();window.editRecord(${sr.id},${kol.id})"
                                            style="padding:3px 10px;font-size:11px;background:rgba(99,102,241,0.2);color:#a29bfe;border:none;border-radius:6px;cursor:pointer;font-weight:500;white-space:nowrap;"
                                            onmouseover="this.style.background='#e0e7ff'" onmouseout="this.style.background='#eef2ff'">
                                            ✏️ 编辑
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            `;
        }

        // 是否为合作创作者
        const isCC = kol.is_cc === true;
        const ccStatusHtml = `
            <div class="flex items-center gap-3 p-4 rounded-xl" style="${isCC ? 'background:rgba(5,150,105,0.12);border:1px solid rgba(5,150,105,0.3)' : 'background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1)'}">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="${isCC ? 'background:rgba(5,150,105,0.2)' : 'background:rgba(255,255,255,0.06)'}">
                    <i class="${isCC ? 'ri-user-heart-line text-green-600' : 'ri-user-line text-gray-400'} text-lg"></i>
                </div>
                <div>
                    <span class="text-sm font-medium ${isCC ? 'text-green-700' : 'text-gray-500'}">${isCC ? '是' : '否'}</span>
                    <p class="text-xs ${isCC ? 'text-green-500' : 'text-gray-400'} mt-0.5">${isCC ? '该KOL存在于CC Pool中' : '该KOL不在CC Pool中'}</p>
                </div>
            </div>
        `;

        // 往期合作效果
        const coopHistory = kol.cooperation_history || [];
        let coopHistoryHtml = '';
        if (coopHistory.length > 0) {
            coopHistoryHtml = `
                <div class="overflow-x-auto">
                    <table class="w-full text-xs">
                        <thead>
                            <tr class="border-b border-gray-100">
                                <th class="text-left py-2 px-2 font-medium text-gray-500">合作事件</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">Views</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">KOL Fees</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">CPM</th>
                                <th class="text-right py-2 px-2 font-medium text-gray-500">CPA</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${coopHistory.map(h => `
                                <tr class="border-b border-gray-50">
                                    <td class="py-2 px-2 font-medium text-gray-700">${escapeHtml(h.review_title || '-')}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${h.views > 0 ? formatLargeNum(h.views) : '-'}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${h.kol_fees > 0 ? '$' + Number(h.kol_fees).toLocaleString() : '-'}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${h.cpm > 0 ? '$' + Number(h.cpm).toFixed(2) : '-'}</td>
                                    <td class="py-2 px-2 text-right text-gray-600">${h.cpa > 0 ? '$' + Number(h.cpa).toFixed(2) : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            coopHistoryHtml = `<p class="text-sm text-gray-400 text-center py-6">暂无合作记录</p>`;
        }

        document.getElementById('kol-detail-content').innerHTML = `
            <div class="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                <div class="relative w-16 h-16 bg-gradient-to-br ${avatarColors[colorIdx]} rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md flex-shrink-0">
                    ${(title || '?')[0]}
                    ${mergedCount > 1 ? `<span class="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">${mergedCount}</span>` : ''}
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-bold text-gray-800 truncate">${escapeHtml(title)}</h3>
                    <p class="text-sm text-gray-400 mt-1">ID: ${kol.id}${mergedCount > 1 ? ` <span class="text-orange-500 text-xs ml-1">(${mergedCount}条记录合并)</span>` : ''}</p>
                </div>
                <button onclick="window.addKolRecord(this.dataset.name)" data-name="${escapeHtml(title)}" class="flex-shrink-0 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors">
                    <i class="ri-add-line mr-1"></i>新增记录
                </button>
            </div>

            <!-- 模块一：基础信息 -->
            <div class="detail-section">
                <h4><i class="ri-user-3-line text-indigo-500"></i> 基础信息</h4>
                <div class="detail-grid">
                    ${basicInfoHtml}
                </div>
            </div>

            <!-- 模块：记录明细 -->
            ${subRecordsHtml}

            <!-- 模块：是否合作创作者 -->
            <div class="detail-section">
                <h4><i class="ri-team-line text-purple-500"></i> 是否为合作创作者 (CC)</h4>
                ${ccStatusHtml}
            </div>

            <!-- 模块：往期效果 -->
            <div class="detail-section">
                <h4><i class="ri-bar-chart-horizontal-line text-cyan-500"></i> 往期合作效果</h4>
                ${coopHistoryHtml}
            </div>

            <div class="text-xs text-gray-400 mt-5 pt-3 border-t border-gray-100 flex justify-between">
                <span>创建: ${kol.created_at || '-'}</span>
                <span>更新: ${kol.updated_at || '-'}</span>
            </div>
        `;

        openModal('kol-detail-modal');
    } catch (err) {
        showToast('获取详情失败: ' + err.message, 'error');
    }
};

// ============ 编辑KOL ============

// ============ 新增KOL记录（kolName有值=详情页锁定，为空=数据导入可编辑）============

window.addKolRecord = function (kolName) {
    // name字段是否锁定：从KOL详情页触发时锁定，从数据导入时可编辑
    const nameIsLocked = !!kolName;
    // 固定字段，与编辑记录保持一致
    const fixedFields = [
        { key: 'field_1',  label: 'name',      readonly: nameIsLocked },
        { key: 'field_2',  label: 'platform',  readonly: false },
        { key: 'field_3',  label: 'followers', readonly: false },
        { key: 'field_6',  label: 'price',     readonly: false },
        { key: 'field_8',  label: 'country',   readonly: false },
        { key: 'field_9',  label: 'genre',     readonly: false },
        { key: 'field_12', label: 'source',    readonly: false },
        { key: 'field_13', label: 'notes',     readonly: false },
        { key: 'field_4',  label: 'views',     readonly: false },
        { key: 'field_5',  label: 'engagement',readonly: false },
    ];

    const inputStyle = 'width:100%;padding:8px 12px;border:1px solid rgba(255,255,255,0.15);border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.9);';
    const readonlyStyle = inputStyle + 'background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.35);cursor:not-allowed;';

    const formFields = fixedFields.map(f => {
        const val = f.key === 'field_1' ? (kolName || '') : '';
        const style = f.readonly ? readonlyStyle : inputStyle;
        const focus = f.readonly ? '' : `onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'"`;
        return `
            <div style="margin-bottom:14px;">
                <label style="display:block;font-size:12px;color:rgba(255,255,255,0.55);margin-bottom:4px;font-weight:500;">${f.label}</label>
                <input type="text" name="${f.key}" value="${escapeHtml(String(val))}"
                    ${f.readonly ? 'readonly' : ''} style="${style}" ${focus}>
                ${f.key === 'field_1' ? (nameIsLocked ? '<p style="font-size:11px;color:#9ca3af;margin-top:3px;">（KOL名称，不可修改）</p>' : '<p style="font-size:11px;color:#6366f1;margin-top:3px;">（输入KOL名称，相同 Name+Source 自动覆盖旧数据）</p>') : ''}
            </div>
        `;
    }).join('');

    let modal = document.getElementById('kol-add-record-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'kol-add-record-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:10600;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div style="background:#1a1035;border-radius:20px;padding:28px;width:500px;max-width:94vw;max-height:88vh;overflow-y:auto;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding-bottom:16px;border-bottom:1px solid #f3f4f6;">
                <div>
                    <h3 style="font-size:17px;font-weight:700;color:rgba(255,255,255,0.9);margin:0 0 4px 0;"><i class="ri-add-circle-line" style="color:#6366f1;margin-right:6px;"></i>新增记录</h3>
                    <p style="font-size:12px;color:#9ca3af;margin:0;">${escapeHtml(kolName || '')} · 新条目</p>
                </div>
                <button onclick="document.getElementById('kol-add-record-modal').remove()" style="width:32px;height:32px;border-radius:8px;border:none;background:rgba(255,255,255,0.1);cursor:pointer;font-size:16px;color:rgba(255,255,255,0.6);">✕</button>
            </div>
            <p style="font-size:12px;color:#9ca3af;margin-bottom:16px;">Source 相同的记录将覆盖旧数据，不同 Source 将作为新记录保存</p>
            <form id="kol-add-record-form">
                ${formFields}
            </form>
            <div style="display:flex;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid #f3f4f6;">
                <button onclick="window.saveKolRecord()" style="flex:1;padding:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">保存</button>
                <button onclick="document.getElementById('kol-add-record-modal').remove()" style="padding:10px 20px;background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);border:none;border-radius:10px;font-size:14px;cursor:pointer;">取消</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
};

window.saveKolRecord = async function () {
    const form = document.getElementById('kol-add-record-form');
    if (!form) return;
    const data = {};
    form.querySelectorAll('input[name]').forEach(input => {
        if (input.value.trim()) data[input.name] = input.value.trim();
    });
    try {
        const res = await request('/kol/upsert-record', { method: 'POST', body: JSON.stringify(data) });
        const action = res.data?.action === 'updated' ? '记录已覆盖更新 ✅' : '新记录已添加 ✅';
        showToast(action, 'success');
        document.getElementById('kol-add-record-modal')?.remove();
        if (currentPage === 'kol-list') {
            const { loadKolList } = await import('./kolList.js');
            loadKolList();
        }
    } catch (err) {
        showToast('保存失败: ' + err.message, 'error');
    }
};

// ============ 编辑KOL（整体编辑已有记录）============

window.editKol = async function (id) {
    await loadFieldsConfig();
    try {
        const res = await request(`/kol/${id}`);
        const kol = res.data;
        const title = (kol.name && String(kol.name).trim()) ? String(kol.name).trim() : `KOL #${id}`;

        // 生成编辑表单
        const formFields = fieldsConfig.map(fc => {
            const val = kol[fc.field_name] || '';
            return `
                <div style="margin-bottom: 14px;">
                    <label style="display:block;font-size:12px;color:rgba(255,255,255,0.55);margin-bottom:4px;font-weight:500;">${escapeHtml(fc.display_name)}</label>
                    <input type="text" name="${fc.field_name}" value="${escapeHtml(String(val))}"
                        style="width:100%;padding:8px 12px;border:1px solid rgba(255,255,255,0.15);border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.9);"
                        onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'">
                </div>
            `;
        }).join('');

        // 构建编辑弹窗（如不存在则创建）
        let editModal = document.getElementById('kol-edit-modal');
        if (!editModal) {
            editModal = document.createElement('div');
            editModal.id = 'kol-edit-modal';
            editModal.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.4);';
            document.body.appendChild(editModal);
        }
        editModal.innerHTML = `
            <div style="background:#1a1035;border-radius:20px;padding:28px;width:500px;max-width:94vw;max-height:88vh;overflow-y:auto;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #f3f4f6;">
                    <h3 style="font-size:17px;font-weight:700;color:rgba(255,255,255,0.9);margin:0;">编辑 KOL</h3>
                    <button onclick="document.getElementById('kol-edit-modal').remove()" style="width:32px;height:32px;border-radius:8px;border:none;background:rgba(255,255,255,0.1);cursor:pointer;font-size:16px;color:rgba(255,255,255,0.6);display:flex;align-items:center;justify-content:center;">✕</button>
                </div>
                <p style="font-size:13px;color:rgba(255,255,255,0.45);margin-bottom:16px;">${escapeHtml(title)} · ID: ${id}</p>
                <form id="kol-edit-form">
                    ${formFields}
                </form>
                <div style="display:flex;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid #f3f4f6;">
                    <button onclick="window.saveKolEdit(${id})" style="flex:1;padding:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">保存</button>
                    <button onclick="document.getElementById('kol-edit-modal').remove()" style="padding:10px 20px;background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);border:none;border-radius:10px;font-size:14px;cursor:pointer;">取消</button>
                </div>
            </div>
        `;
        editModal.style.display = 'flex';
        // 点背景关闭
        editModal.addEventListener('click', (e) => { if (e.target === editModal) editModal.remove(); });
    } catch (err) {
        showToast('获取KOL信息失败: ' + err.message, 'error');
    }
};

window.saveKolEdit = async function (id) {
    const form = document.getElementById('kol-edit-form');
    if (!form) return;
    const data = {};
    form.querySelectorAll('input[name]').forEach(input => {
        data[input.name] = input.value;
    });
    try {
        await request(`/kol/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        showToast('保存成功', 'success');
        document.getElementById('kol-edit-modal')?.remove();
        // 刷新列表
        if (currentPage === 'kol-list') {
            const { loadKolList } = await import('./kolList.js');
            loadKolList();
        }
    } catch (err) {
        showToast('保存失败: ' + err.message, 'error');
    }
};

// ============ 编辑单条子记录 ============

window.editRecord = async function (recordId, parentKolId) {
    await loadFieldsConfig();
    try {
        const res = await request(`/kol/${recordId}`);
        const kol = res.data;
        const title = (kol.name && String(kol.name).trim()) ? String(kol.name).trim() : `记录 #${recordId}`;

        // 生成编辑表单（同 editKol 逻辑）
        const formFields = fieldsConfig.map(fc => {
            const val = kol[fc.field_name] || kol[fc.display_name] || '';
            return `
                <div style="margin-bottom: 14px;">
                    <label style="display:block;font-size:12px;color:rgba(255,255,255,0.55);margin-bottom:4px;font-weight:500;">${escapeHtml(fc.display_name)}</label>
                    <input type="text" name="${fc.field_name}" value="${escapeHtml(String(val))}"
                        style="width:100%;padding:8px 12px;border:1px solid rgba(255,255,255,0.15);border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.9);"
                        onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='rgba(255,255,255,0.15)'">
                </div>
            `;
        }).join('');

        let editModal = document.getElementById('kol-record-edit-modal');
        if (!editModal) {
            editModal = document.createElement('div');
            editModal.id = 'kol-record-edit-modal';
            editModal.style.cssText = 'position:fixed;inset:0;z-index:10500;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';
            document.body.appendChild(editModal);
        }
        editModal.innerHTML = `
            <div style="background:#1a1035;border-radius:20px;padding:28px;width:500px;max-width:94vw;max-height:88vh;overflow-y:auto;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #f3f4f6;">
                    <h3 style="font-size:17px;font-weight:700;color:rgba(255,255,255,0.9);margin:0;">编辑记录</h3>
                    <button onclick="document.getElementById('kol-record-edit-modal').remove()" style="width:32px;height:32px;border-radius:8px;border:none;background:rgba(255,255,255,0.1);cursor:pointer;font-size:16px;color:rgba(255,255,255,0.6);display:flex;align-items:center;justify-content:center;">✕</button>
                </div>
                <p style="font-size:13px;color:rgba(255,255,255,0.45);margin-bottom:16px;">${escapeHtml(title)} · 记录 ID: #${recordId}</p>
                <form id="kol-record-edit-form">
                    ${formFields}
                </form>
                <div style="display:flex;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid #f3f4f6;">
                    <button onclick="window.saveRecordEdit(${recordId},${parentKolId})" style="flex:1;padding:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">保存</button>
                    <button onclick="document.getElementById('kol-record-edit-modal').remove()" style="padding:10px 20px;background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);border:none;border-radius:10px;font-size:14px;cursor:pointer;">取消</button>
                </div>
            </div>
        `;
        editModal.style.display = 'flex';
        editModal.addEventListener('click', (e) => { if (e.target === editModal) editModal.remove(); });
    } catch (err) {
        showToast('获取记录信息失败: ' + err.message, 'error');
    }
};

window.saveRecordEdit = async function (recordId, parentKolId) {
    const form = document.getElementById('kol-record-edit-form');
    if (!form) return;
    const data = {};
    form.querySelectorAll('input[name]').forEach(input => {
        data[input.name] = input.value;
    });
    try {
        await request(`/kol/${recordId}`, { method: 'PUT', body: JSON.stringify(data) });
        showToast('保存成功', 'success');
        document.getElementById('kol-record-edit-modal')?.remove();
        // 刷新详情弹窗
        if (typeof window.showKolDetail === 'function') {
            window.showKolDetail(parentKolId);
        }
        // 同步刷新列表
        if (currentPage === 'kol-list') {
            const { loadKolList } = await import('./kolList.js');
            loadKolList();
        }
    } catch (err) {
        showToast('保存失败: ' + err.message, 'error');
    }
};

// ============ 删除KOL ============

window.deleteKol = async function (id, name) {
    if (!confirm(`确定要删除 "${name}" 吗？`)) return;

    try {
        await request(`/kol/${id}`, { method: 'DELETE' });
        showToast('删除成功', 'success');
        if (currentPage === 'kol-list') {
            loadKolList();
        } else if (currentPage === 'dashboard') {
            renderDashboard(document.getElementById('page-container'));
        }
    } catch (err) {
        showToast('删除失败: ' + err.message, 'error');
    }
};

// ============ 工具函数 ============

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text || '').replace(/[&<>"']/g, m => map[m]);
}

function escapeAttr(text) {
    return String(text || '').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function formatLargeNum(num) {
    if (!num || num <= 0) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 10000) return (num / 1000).toFixed(1) + 'K';
    if (num >= 1000) return Number(num).toLocaleString();
    return String(Math.round(num));
}

// ============ 初始化 ============

function init() {
    // 侧边栏导航点击
    document.querySelectorAll('.sidebar-tab').forEach(item => {
        item.addEventListener('click', () => {
            navigate(item.dataset.page);
        });
    });

    // 关闭弹窗按钮
    document.getElementById('close-detail-modal')?.addEventListener('click', window.closeDetailModal);

    // 点击遮罩关闭
    document.getElementById('kol-detail-modal')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) window.closeDetailModal();
    });

    // ESC关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeDetailModal();
            closeMobileMoreDrawer();
        }
    });

    // ===== 移动端底部导航 =====
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            if (page === 'more-menu') {
                openMobileMoreDrawer();
            } else {
                navigate(page);
            }
        });
    });

    // 移动端更多抽屉中的菜单项
    document.querySelectorAll('.mobile-more-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            closeMobileMoreDrawer();
            if (page) navigate(page);
        });
    });

    // 点击遮罩关闭更多抽屉
    document.getElementById('mobile-more-drawer')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('mobile-more-backdrop')) {
            closeMobileMoreDrawer();
        }
    });

    navigate('dashboard');
}

function openMobileMoreDrawer() {
    const drawer = document.getElementById('mobile-more-drawer');
    if (!drawer) return;
    drawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeMobileMoreDrawer() {
    const drawer = document.getElementById('mobile-more-drawer');
    if (!drawer) return;
    drawer.classList.add('hidden');
    document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', init);