// KOL列表页面模块 - PC端表格视图版本
import { request, showToast, debounce } from './api.js';

let currentPage = 1;
let currentPageSize = 20;
let fieldsConfig = [];

export async function renderKolList(container) {
    container.innerHTML = `
        <div class="animate-fadeIn">
            <!-- 搜索和筛选栏 -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
                <div class="flex items-center gap-4">
                    <div class="relative flex-1">
                        <i class="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input type="text" id="list-search" placeholder="搜索KOL名称、平台、标签..."
                            class="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors">
                    </div>
                    <select id="filter-sort" class="w-48 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50">
                        <option value="updated_at-desc">最近更新</option>
                        <option value="created_at-desc">最新添加</option>
                        <option value="id-asc">ID升序</option>
                        <option value="id-desc">ID降序</option>
                    </select>
                    <select id="page-size-select" class="w-36 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50">
                        <option value="10">每页 10 条</option>
                        <option value="20" selected>每页 20 条</option>
                        <option value="50">每页 50 条</option>
                    </select>
                </div>
            </div>

            <!-- KOL表格 -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-5">
                <div id="kol-table-container" class="overflow-x-auto"></div>
            </div>

            <!-- 分页 -->
            <div id="kol-pagination" class="mb-2"></div>
        </div>

        <!-- 签名 -->
        <div class="text-center mt-4 mb-2">
            
        </div>
    `;

    // 加载字段配置
    try {
        const res = await request('/fields');
        fieldsConfig = res.data || [];
    } catch (e) {
        fieldsConfig = [];
    }

    // 绑定事件
    const searchInput = document.getElementById('list-search');
    const doSearch = debounce(() => {
        currentPage = 1;
        loadKolList();
    }, 400);
    searchInput.addEventListener('input', doSearch);

    document.getElementById('filter-sort').addEventListener('change', () => {
        currentPage = 1;
        loadKolList();
    });

    document.getElementById('page-size-select').addEventListener('change', (e) => {
        currentPageSize = parseInt(e.target.value);
        currentPage = 1;
        loadKolList();
    });

    loadKolList();
}

export async function loadKolList() {
    const tableContainer = document.getElementById('kol-table-container');
    if (!tableContainer) return;
    tableContainer.innerHTML = `<div class="flex justify-center py-20"><div class="loading-spinner"></div></div>`;

    const keyword = document.getElementById('list-search')?.value || '';
    const sortVal = document.getElementById('filter-sort')?.value || 'updated_at-desc';
    const [sort_by, sort_order] = sortVal.split('-');

    try {
        const res = await request(`/kol/list?page=${currentPage}&page_size=${currentPageSize}&keyword=${encodeURIComponent(keyword)}&sort_by=${sort_by}&sort_order=${sort_order}`);
        const { list, total, page, total_pages } = res.data;

        if (list.length === 0) {
            tableContainer.innerHTML = `
                <div class="empty-state">
                    <i class="ri-user-search-line block"></i>
                    <p class="text-gray-400 text-base mb-1">暂无KOL数据</p>
                    <p class="text-gray-300 text-sm">请先通过「数据导入」上传Excel文件</p>
                </div>
            `;
            document.getElementById('kol-pagination').innerHTML = '';
            return;
        }

        // 渲染表格
        tableContainer.innerHTML = renderKolTable(list);
        renderPagination(page, total_pages, total);

        // 绑定行点击
        tableContainer.querySelectorAll('tr[data-id]').forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.closest('.table-action-btn')) return;
                window.showKolDetail(row.dataset.id);
            });
        });
    } catch (err) {
        tableContainer.innerHTML = `<div class="text-center py-16 text-red-400 text-sm"><i class="ri-error-warning-line text-2xl mb-2 block"></i>加载失败: ${err.message}</div>`;
    }
}

function extractPlatformName(url) {
    if (!url) return '';
    url = String(url).trim().toLowerCase();
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('twitch.tv')) return 'Twitch';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'X/Twitter';
    if (url.includes('facebook.com')) return 'Facebook';
    if (url.includes('bilibili.com')) return 'Bilibili';
    if (url.includes('douyin.com')) return '抖音';
    if (url.includes('weibo.com')) return '微博';
    if (url.includes('xiaohongshu.com')) return '小红书';
    if (!url.includes('.') && !url.includes('/')) return url.charAt(0).toUpperCase() + url.slice(1);
    return url;
}

function getPlatformTags(kol) {
    const raw = kol.all_platforms || kol.platform || '';
    if (!raw) return [];
    const urls = raw.split('||').map(u => u.trim()).filter(Boolean);
    const seen = new Set();
    const result = [];
    for (const url of urls) {
        const name = extractPlatformName(url);
        if (name && !seen.has(name)) {
            seen.add(name);
            result.push(name);
        }
    }
    return result;
}

function renderKolTable(list) {
    const avatarColors = ['from-indigo-400 to-purple-500', 'from-pink-400 to-rose-500', 'from-cyan-400 to-blue-500', 'from-green-400 to-emerald-500', 'from-orange-400 to-amber-500'];

    // 完全由 field_config 决定列，跳过 name（第一列已显示）
    const metaFields = ['id', 'created_at', 'updated_at', 'merged_count', 'all_platforms',
                        'price_min', 'price_max', 'followers_min', 'followers_max',
                        'price_display', 'followers_display', 'platform_display', 'sub_records'];
    // 找出 name 对应的 field_key（display_name === 'name'）
    const nameField = fieldsConfig.find(fc => fc.display_name.toLowerCase() === 'name');
    const nameFieldKey = nameField ? nameField.field_name : 'name';
    // 所有列：除了 name 列（已在第一列头像旁显示）
    const dynamicFields = fieldsConfig.filter(fc => fc.field_name !== nameFieldKey && !metaFields.includes(fc.field_name));

    // platform / followers / cost 特殊渲染标识
    const platformField = fieldsConfig.find(fc => fc.display_name.toLowerCase() === 'platform');
    const followersField = fieldsConfig.find(fc => fc.display_name.toLowerCase() === 'followers');
    const costField = fieldsConfig.find(fc => ['cost', 'price'].includes(fc.display_name.toLowerCase()));
    const platformKey = platformField ? platformField.field_name : null;
    const followersKey = followersField ? followersField.field_name : null;
    const costKey = costField ? costField.field_name : null;

    return `
        <table class="kol-table">
            <thead>
                <tr>
                    <th style="width: 220px;">KOL名称</th>
                    ${dynamicFields.map(fc => {
                        let w = '';
                        const dn = fc.display_name.toLowerCase();
                        if (dn === 'platform') w = 'style="width:160px;"';
                        else if (dn === 'followers' || dn === 'views') w = 'style="width:120px;"';
                        else if (['cost','price','engagement','cpm','cpa'].includes(dn)) w = 'style="width:110px;"';
                        return `<th ${w}>${escapeHtml(fc.display_name)}</th>`;
                    }).join('')}
                    <th style="width: 100px; text-align: center;">操作</th>
                </tr>
            </thead>
            <tbody>
                ${list.map(kol => {
                    const colorIdx = (kol.id || 0) % avatarColors.length;
                    const title = (kol.name && String(kol.name).trim()) ? String(kol.name).trim() : `KOL #${kol.id}`;
                    const mergedCount = kol.merged_count || 1;

                    const dynCells = dynamicFields.map(fc => {
                        const fn = fc.field_name;
                        // platform 列：显示平台标签
                        if (fn === platformKey) {
                            const platformDisplay = kol.platform_display || '';
                            const html = platformDisplay
                                ? platformDisplay.split(' / ').map(p => `<span class="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs mr-1 mb-0.5">${escapeHtml(p)}</span>`).join('')
                                : '<span class="text-gray-300">-</span>';
                            return `<td>${html}</td>`;
                        }
                        // followers 列：显示合并后的范围
                        if (fn === followersKey) {
                            const fDisp = kol.followers_display || '';
                            return `<td>${fDisp ? `<span class="font-medium text-gray-700">${escapeHtml(fDisp)}</span>` : '<span class="text-gray-300">-</span>'}</td>`;
                        }
                        // cost/price 列：显示合并后的价格范围
                        if (fn === costKey) {
                            const pDisp = kol.price_display || '';
                            return `<td>${pDisp ? `<span class="font-medium text-green-600">$${escapeHtml(pDisp)}</span>` : '<span class="text-gray-300">-</span>'}</td>`;
                        }
                        // 其他列：直接显示值
                        const val = kol[fn] || kol[fc.display_name] || '';
                        return `<td title="${escapeHtml(String(val))}">${val ? escapeHtml(truncate(String(val), 18)) : '<span class="text-gray-300">-</span>'}</td>`;
                    }).join('');

                    return `
                        <tr data-id="${kol.id}">
                            <td>
                                <div class="flex items-center gap-3">
                                    <div class="relative w-9 h-9 bg-gradient-to-br ${avatarColors[colorIdx]} rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                                        ${(title || '?')[0]}
                                        ${mergedCount > 1 ? `<span class="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">${mergedCount}</span>` : ''}
                                    </div>
                                    <div class="min-w-0">
                                        <span class="font-semibold text-gray-800 text-sm truncate block">${escapeHtml(truncate(title, 20))}</span>
                                        ${mergedCount > 1 ? `<span class="text-[10px] text-orange-500">${mergedCount}条记录合并</span>` : ''}
                                    </div>
                                </div>
                            </td>
                            ${dynCells}
                            <td>
                                <div class="flex items-center justify-center gap-1">
                                    <button onclick="event.stopPropagation();window.editKol(${kol.id})" class="table-action-btn" title="编辑">
                                        <i class="ri-edit-line text-sm"></i>
                                    </button>
                                    <button onclick="event.stopPropagation();window.deleteKol(${kol.id},'${escapeAttr(title)}')" class="table-action-btn delete" title="删除">
                                        <i class="ri-delete-bin-line text-sm"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function getFirstNonEmpty(kol, configs) {
    for (const fc of configs) {
        const val = kol[fc.field_name];
        if (val && String(val).trim()) return String(val).trim();
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

function escapeAttr(text) {
    return String(text || '').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function renderPagination(page, totalPages, total) {
    const container = document.getElementById('kol-pagination');
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = `<p class="text-sm text-gray-400 text-center py-3">共 ${total} 条记录</p>`;
        return;
    }

    let pages = [];
    const range = 3;
    for (let i = Math.max(1, page - range); i <= Math.min(totalPages, page + range); i++) {
        pages.push(i);
    }

    container.innerHTML = `
        <div class="bg-white rounded-2xl px-5 py-3 border border-gray-100 flex items-center justify-between">
            <p class="text-sm text-gray-500">共 <span class="font-semibold text-gray-700">${total}</span> 条记录，第 ${page}/${totalPages} 页</p>
            <div class="flex items-center gap-1.5">
                <button class="pagination-btn" id="pg-first" ${page === 1 ? 'disabled' : ''}>
                    <i class="ri-skip-back-mini-line text-sm"></i>
                </button>
                <button class="pagination-btn" id="pg-prev" ${page === 1 ? 'disabled' : ''}>
                    <i class="ri-arrow-left-s-line text-sm"></i>
                </button>
                ${pages.map(p => `
                    <button class="pagination-btn ${p === page ? 'active' : ''}" data-pg="${p}">${p}</button>
                `).join('')}
                <button class="pagination-btn" id="pg-next" ${page === totalPages ? 'disabled' : ''}>
                    <i class="ri-arrow-right-s-line text-sm"></i>
                </button>
                <button class="pagination-btn" id="pg-last" ${page === totalPages ? 'disabled' : ''}>
                    <i class="ri-skip-forward-mini-line text-sm"></i>
                </button>
            </div>
        </div>
    `;

    // 绑定分页事件
    container.querySelector('#pg-first')?.addEventListener('click', () => goPage(1));
    container.querySelector('#pg-prev')?.addEventListener('click', () => goPage(page - 1));
    container.querySelector('#pg-next')?.addEventListener('click', () => goPage(page + 1));
    container.querySelector('#pg-last')?.addEventListener('click', () => goPage(totalPages));
    container.querySelectorAll('[data-pg]').forEach(btn => {
        btn.addEventListener('click', () => goPage(Number(btn.dataset.pg)));
    });
}

function goPage(page) {
    currentPage = page;
    loadKolList();
    document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
}

window.goPage = goPage;
