// 智能推荐页面模块 - PC端适配版本
import { request, showToast } from './api.js';

let fieldsConfig = [];

export async function renderSearch(container) {
    // 加载字段配置
    try {
        const res = await request('/fields');
        fieldsConfig = res.data || [];
    } catch (e) {
        fieldsConfig = [];
    }

    container.innerHTML = `
        <div class="animate-fadeIn">
            <!-- 搜索区域 -->
            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-5">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <i class="ri-magic-line text-lg text-white"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-800">智能KOL推荐</h3>
                        <p class="text-xs text-gray-400">输入需求关键词，智能匹配最合适的KOL</p>
                    </div>
                </div>
                <div class="flex gap-4 mt-4">
                    <div class="relative flex-1">
                        <i class="ri-magic-line absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400"></i>
                        <input type="text" id="search-keywords" placeholder="输入关键词，逗号分隔多个..."
                            class="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 outline-none transition-colors bg-gray-50 focus:bg-white">
                    </div>
                    <button id="btn-search" class="px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2 shadow-sm">
                        <i class="ri-search-eye-line"></i> 智能匹配
                    </button>
                </div>

                <!-- 搜索范围说明 -->
                ${fieldsConfig.length > 0 ? `
                <div class="mt-4 flex items-center gap-2 flex-wrap">
                    <span class="text-xs text-gray-400 flex-shrink-0">搜索覆盖字段：</span>
                    <div class="flex gap-1.5 flex-wrap">
                        ${fieldsConfig.slice(0, 12).map(fc => `<span class="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs">${fc.display_name}</span>`).join('')}
                        ${fieldsConfig.length > 12 ? `<span class="text-xs text-gray-400">+${fieldsConfig.length - 12}个</span>` : ''}
                    </div>
                </div>
                ` : ''}
            </div>

            <!-- 搜索结果 -->
            <div id="search-results"></div>

            <!-- 搜索历史 -->
            <div id="search-history-section" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <i class="ri-history-line text-indigo-500"></i> 最近搜索
                </h3>
                <div id="search-history-list" class="flex flex-wrap gap-2"></div>
            </div>
        </div>

        <!-- 签名 -->
        <div class="text-center mt-8 mb-2">
            
        </div>
    `;

    document.getElementById('btn-search').addEventListener('click', doSearch);
    document.getElementById('search-keywords').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') doSearch();
    });

    loadSearchHistory();
}

async function doSearch() {
    const keywords = document.getElementById('search-keywords').value.trim();
    if (!keywords) {
        showToast('请输入搜索关键词', 'warning');
        return;
    }

    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = `
        <div class="text-center py-20">
            <div class="loading-spinner mb-3"></div>
            <p class="text-sm text-gray-400">正在为您智能匹配最合适的KOL...</p>
        </div>
    `;

    try {
        const res = await request('/kol/search', {
            method: 'POST',
            body: JSON.stringify({ keywords }),
        });

        const { list, total, keywords: parsedKws } = res.data;

        if (list.length === 0) {
            resultsDiv.innerHTML = `
                <div class="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center mb-6">
                    <i class="ri-emotion-sad-line text-5xl text-gray-300 mb-3 block"></i>
                    <p class="text-gray-500 mb-2">未找到匹配的KOL</p>
                    <p class="text-xs text-gray-400">试试更换关键词</p>
                </div>
            `;
        } else {
            resultsDiv.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3 flex-wrap">
                        <h3 class="text-sm font-semibold text-gray-700">
                            <i class="ri-sparkling-2-line text-indigo-500 mr-1"></i>
                            推荐 <span class="text-indigo-600 text-lg font-bold">${total}</span> 位KOL
                        </h3>
                        <div class="flex flex-wrap gap-1.5">
                            ${parsedKws.map(kw => `<span class="tag tag-primary">${kw}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-4 mb-5">
                    ${list.map((kol, idx) => renderRecommendCard(kol, idx)).join('')}
                </div>
            `;
        }

        loadSearchHistory();
    } catch (err) {
        resultsDiv.innerHTML = `<div class="text-center py-10 text-red-500">${err.message}</div>`;
    }
}

function renderRecommendCard(kol, index) {
    const avatarColors = ['from-indigo-400 to-purple-500', 'from-pink-400 to-rose-500', 'from-cyan-400 to-blue-500', 'from-green-400 to-emerald-500', 'from-orange-400 to-amber-500'];
    const colorIdx = (kol.id || 0) % avatarColors.length;
    const matchScore = kol.match_score || 0;
    const maxScore = Math.max(fieldsConfig.length * 10, 50);
    const matchPercent = Math.min(100, Math.round((matchScore / maxScore) * 100));

    const title = (kol.name && String(kol.name).trim()) ? String(kol.name).trim() : `KOL #${kol.id}`;

    // 动态展示有值字段（跳过 name/followers，已固定显示）
    const fieldItems = [];
    const tagColors = ['tag-primary', 'tag-success', 'tag-warning', 'tag-info', 'tag-purple'];
    fieldsConfig.forEach((fc, i) => {
        const dn = fc.display_name.toLowerCase();
        if (dn === 'name' || dn === 'followers') return;
        const val = kol[fc.field_name] || '';
        if (val && String(val).trim()) {
            fieldItems.push({
                name: fc.display_name,
                value: String(val).trim(),
                colorClass: tagColors[i % tagColors.length],
            });
        }
    });

    const tags = fieldItems.slice(0, 4).map((f, i) =>
        `<span class="tag ${f.colorClass}" title="${f.name}: ${escapeHtml(f.value)}">${truncate(f.value, 14)}</span>`
    ).join('');

    return `
        <div class="recommend-card bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-fadeIn" style="animation-delay: ${index * 0.05}s">
            <!-- 头部 -->
            <div class="flex items-center gap-3 mb-4">
                <div class="relative flex-shrink-0">
                    <div class="w-12 h-12 bg-gradient-to-br ${avatarColors[colorIdx]} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                        ${(title || '?')[0]}
                    </div>
                    <div class="absolute -top-1.5 -right-1.5 w-6 h-6 bg-indigo-600 rounded-full text-white text-xs font-bold flex items-center justify-center shadow">
                        ${index + 1}
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-gray-800 text-sm truncate" title="${escapeHtml(title)}">${escapeHtml(truncate(title, 22))}</h4>
                    ${(() => { const fv = kol.followers_display || kol.followers || ''; if (!fv) return '<p class="text-xs text-gray-400">ID: ' + kol.id + '</p>'; const n = parseInt(String(fv).replace(/,/g,'')); const fmt = isNaN(n) ? fv : (n>=1000000?(n/1000000).toFixed(1)+'M':n>=10000?Math.round(n/1000)+'K':String(n)); return '<p class="text-xs text-indigo-500 font-medium mt-0.5"><i class=\"ri-user-line mr-0.5\"></i>' + escapeHtml(fmt) + ' followers</p>'; })()}
                </div>
                <div class="flex flex-col items-end gap-2">
                    <span class="match-badge">${matchPercent}%</span>
                    <button onclick="window.showKolDetail(${kol.id})" class="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">
                        <i class="ri-eye-line mr-0.5"></i>查看
                    </button>
                </div>
            </div>

            <!-- 标签 -->
            <div class="flex flex-wrap gap-1.5 mb-3">
                ${tags}
            </div>

            <!-- 匹配原因 -->
            ${(kol.match_reasons || []).length > 0 ? `
            <div class="flex flex-wrap gap-1 mt-2 pt-3 border-t border-gray-100">
                ${(kol.match_reasons || []).map(r => `<span class="inline-flex items-center gap-0.5 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs"><i class="ri-check-line"></i>${r}</span>`).join('')}
            </div>
            ` : ''}
        </div>
    `;
}

function getFirstNonEmpty(kol) {
    for (const fc of fieldsConfig) {
        const val = kol[fc.field_name];
        if (val && val.trim()) return val.trim();
    }
    return null;
}

function truncate(str, len) {
    if (!str) return '';
    str = String(str);
    return str.length > len ? str.substring(0, len) + '...' : str;
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text || '').replace(/[&<>"']/g, m => map[m]);
}

async function loadSearchHistory() {
    try {
        const res = await request('/search/history');
        const list = res.data || [];
        const container = document.getElementById('search-history-list');
        if (!container) return;

        if (list.length === 0) {
            container.innerHTML = '<p class="text-xs text-gray-400">暂无搜索记录</p>';
            return;
        }

        container.innerHTML = list.slice(0, 15).map(item => `
            <button class="history-tag px-3 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5" data-kw="${item.keywords}">
                <i class="ri-time-line"></i>
                ${item.keywords}
                <span class="text-gray-300 ml-1">(${item.result_count})</span>
            </button>
        `).join('');

        container.querySelectorAll('.history-tag').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('search-keywords').value = btn.dataset.kw;
                doSearch();
            });
        });
    } catch (e) {
        console.error(e);
    }
}
