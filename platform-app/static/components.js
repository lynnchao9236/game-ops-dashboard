// components.js - UI组件渲染模块
import { categoryMap, docTypeMap, platformDescMap } from './data.js';

// 渲染Hero统计信息
export function renderHeroStats(container, platforms, strategies) {
    const totalStrategies = strategies.length;
    const totalPlatforms = platforms.length;
    container.innerHTML = `
        <div class="hero-stat">
            <div class="hero-stat-num">${totalPlatforms}</div>
            <div class="hero-stat-label">覆盖平台</div>
        </div>
        <div class="hero-stat">
            <div class="hero-stat-num">${totalStrategies}</div>
            <div class="hero-stat-label">策略条目</div>
        </div>
        <div class="hero-stat">
            <div class="hero-stat-num">v${getMaxVersion(strategies)}</div>
            <div class="hero-stat-label">最新版本</div>
        </div>
    `;
}

function getMaxVersion(strategies) {
    if (!strategies || strategies.length === 0) return '1.0';
    const maxV = Math.max(...strategies.map(s => s.version || 1));
    return maxV + '.0';
}

// 渲染平台卡片列表
export function renderPlatformCards(container, platforms, strategies, onClick) {
    container.innerHTML = '';
    const platformNames = ['steam', 'epic', 'xbox', 'playstation'];

    platforms.forEach((platform, index) => {
        const stratCount = strategies.filter(s => s.platform_id === platform.id).length;
        const maxVersion = strategies
            .filter(s => s.platform_id === platform.id)
            .reduce((max, s) => Math.max(max, s.version || 1), 1);
        const desc = platformDescMap[platform.name] || '';

        const card = document.createElement('div');
        card.className = 'platform-card';
        card.dataset.platform = platformNames[index] || '';
        card.innerHTML = `
            <div class="platform-card-badge">v${maxVersion}.0</div>
            <div class="platform-card-icon">${platform.icon || '🎮'}</div>
            <div class="platform-card-name">${platform.name}</div>
            <div class="platform-card-desc">${desc} · ${stratCount}项策略</div>
        `;
        card.addEventListener('click', () => onClick(platform));
        container.appendChild(card);
    });
}

// 渲染平台详情头部
export function renderPlatformHeader(container, platform, strategies) {
    const maxVersion = strategies.reduce((max, s) => Math.max(max, s.version || 1), 1);
    container.innerHTML = `
        <div class="platform-header-icon">${platform.icon || '🎮'}</div>
        <div class="platform-header-info">
            <h2>${platform.name}</h2>
            <p>${platformDescMap[platform.name] || ''} · ${strategies.length}项策略</p>
        </div>
        <div class="platform-header-right">
            <div class="version-badge">v${maxVersion}.0</div>
            <button class="btn-upload" id="btn-platform-upload">
                <i class="ri-upload-cloud-line"></i> 上传文档
            </button>
            <button class="btn-update" id="btn-platform-update">
                <i class="ri-refresh-line"></i> 更新策略
            </button>
        </div>
    `;
}

// 渲染策略内容
export function renderStrategyContent(container, strategies, category) {
    const strategy = strategies.find(s => s.category === category);
    if (!strategy || !strategy.content) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="ri-inbox-line"></i>
                <p>暂无${categoryMap[category]?.name || ''}策略数据</p>
            </div>
        `;
        return;
    }

    const strategyId = strategy.id;
    const content = strategy.content;
    const sections = content.sections || [];
    
    const sectionIcons = [
        'ri-star-line', 'ri-key-line', 'ri-lightbulb-line',
        'ri-bookmark-line', 'ri-flag-line', 'ri-compass-3-line'
    ];

    container.innerHTML = sections.map((section, sIdx) => {
        const icon = sectionIcons[sIdx % sectionIcons.length];
        const items = section.items || [];
        return `
            <div class="strategy-section">
                <div class="strategy-section-header">
                    <i class="${icon}"></i>
                    ${section.title}
                </div>
                ${items.map((item, iIdx) => {
                    const isReport = item.source === 'report';
                    const itemClass = isReport ? 'strategy-item from-report' : 'strategy-item';
                    let sourceTag = '';
                    if (isReport) {
                        const gameName = item.game_name || '';
                        if (gameName) {
                            sourceTag = `<span class="source-report-tag"><i class="ri-gamepad-line"></i> ${gameName}</span>`;
                        } else {
                            sourceTag = '<span class="source-report-tag"><i class="ri-file-chart-line"></i> 内部项目报告</span>';
                        }
                    }

                    let reportDataHtml = '';
                    if (item.report_data && item.report_data.length > 0) {
                        const isUnlocked = window.__reportDataUnlocked === true;
                        const reportEntries = item.report_data.map((rd, rdIdx) => {
                            const rdGameName = rd.game_name || '未知项目';
                            const rdDate = rd.date || '';
                            const dataItems = rd.data.split(/\s*\|\s*|\n/).map(d => d.trim()).filter(d => d);
                            const dataHtml = isUnlocked
                                ? dataItems.map(d => `<div class="report-data-line">${d}</div>`).join('')
                                : dataItems.map(d => `<div class="report-data-line masked-data">${maskText(d)}</div>`).join('');
                            const actionsHtml = isUnlocked ? `
                                        <div class="report-data-actions">
                                            <button class="rd-action-btn rd-edit-btn" title="编辑"><i class="ri-edit-line"></i></button>
                                            <button class="rd-action-btn rd-delete-btn" title="删除"><i class="ri-delete-bin-line"></i></button>
                                        </div>` : '';
                            const rdDocId = rd.doc_id || '';
                            const viewReportBtn = rdDocId ? `<button class="rd-view-report-btn" title="查看详细报告" data-doc-id="${rdDocId}"><i class="ri-file-chart-line"></i> 查看报告</button>` : '';
                            return `
                                <div class="report-data-entry" data-strategy-id="${strategyId}" data-section-idx="${sIdx}" data-item-idx="${iIdx}" data-rd-idx="${rdIdx}" data-doc-id="${rdDocId}">
                                    <div class="report-data-header">
                                        <span class="report-data-game"><i class="ri-gamepad-line"></i> ${rdGameName}</span>
                                        ${viewReportBtn}
                                        ${actionsHtml}
                                        <span class="report-data-date">${rdDate}</span>
                                    </div>
                                    <div class="report-data-content">${dataHtml}</div>
                                </div>
                            `;
                        }).join('');
                        const unlockBtnHtml = isUnlocked
                            ? '<button class="rd-unlock-btn unlocked"><i class="ri-lock-unlock-line"></i> 已解锁</button>'
                            : '<button class="rd-unlock-btn"><i class="ri-lock-2-line"></i> 输入密码查看</button>';
                        reportDataHtml = `
                            <div class="report-data-section">
                                <div class="report-data-title">
                                    <i class="ri-bar-chart-box-line"></i> 内部项目数据
                                    ${unlockBtnHtml}
                                </div>
                                ${reportEntries}
                            </div>
                        `;
                    }

                    return `
                    <div class="${itemClass}">
                        <div class="strategy-item-name">${item.name}${sourceTag}</div>
                        <div class="strategy-item-desc">${item.desc}</div>
                        ${reportDataHtml}
                    </div>
                `}).join('')}
            </div>
        `;
    }).join('');
}

// 渲染最近日志
export function renderRecentLogs(container, logs) {
    if (!logs || logs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="ri-history-line"></i>
                <p>暂无操作记录</p>
            </div>
        `;
        return;
    }

    container.innerHTML = logs.slice(0, 5).map(log => `
        <div class="log-item">
            <div class="log-dot"></div>
            <div class="log-info">
                <div class="log-action">${log.action}</div>
                <div class="log-detail">${log.platform_name ? `[${log.platform_name}] ` : ''}${log.detail || ''}</div>
                <div class="log-time">${log.created_at || ''}</div>
            </div>
        </div>
    `).join('');
}

// 渲染完整日志列表
export function renderFullLogs(container, logs) {
    if (!logs || logs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="ri-history-line"></i>
                <p>暂无操作记录</p>
            </div>
        `;
        return;
    }

    container.innerHTML = logs.map(log => `
        <div class="log-card">
            <div class="log-card-left">
                <div class="log-card-dot"></div>
                <div class="log-card-line"></div>
            </div>
            <div class="log-card-content">
                <div class="log-card-action">${log.action}</div>
                <div class="log-card-detail">${log.detail || ''}</div>
                ${log.platform_name ? `<span class="log-card-platform">${log.platform_name}</span>` : ''}
                <div class="log-card-time">${log.created_at || ''}</div>
            </div>
        </div>
    `).join('');
}

// 渲染文档列表
export function renderDocsList(container, docs, onDelete, onViewReport, onViewOriginal, onExtractKeypoints) {
    if (!docs || docs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="ri-folder-open-line"></i>
                <p>暂无文档</p>
            </div>
        `;
        return;
    }

    // 文件类型图标映射
    const fileTypeIconMap = {
        'pdf': 'ri-file-pdf-2-line',
        'docx': 'ri-file-word-line',
        'doc': 'ri-file-word-line',
        'txt': 'ri-file-text-line',
        'xlsx': 'ri-file-excel-line',
        'csv': 'ri-file-list-line',
    };

    container.innerHTML = docs.map(doc => {
        const typeInfo = docTypeMap[doc.doc_type] || docTypeMap['other'];
        const isReport = doc.doc_type === 'report';
        const cardClass = isReport ? 'doc-card doc-card-report' : 'doc-card';
        const gameTag = isReport && doc.game_name ? `<span class="doc-game-tag"><i class="ri-gamepad-line"></i> ${doc.game_name}</span>` : '';
        const viewBtn = `<button class="doc-action-btn view-report" data-doc-id="${doc.id}"><i class="ri-eye-line"></i> 查看</button>`;

        // 原始文件查看按钮（仅当有原始文件时显示）
        const fileType = doc.file_type || 'txt';
        const hasOriginalFile = fileType !== 'txt' && fileType !== '';
        const originalFileBtn = hasOriginalFile
            ? `<button class="doc-action-btn view-original" data-doc-id="${doc.id}" data-file-type="${fileType}" title="查看原始上传文件"><i class="${fileTypeIconMap[fileType] || 'ri-file-line'}"></i> 原始文件</button>`
            : '';

        // 提炼关键点按钮
        const keypointsBtn = `<button class="doc-action-btn extract-keypoints" data-doc-id="${doc.id}" title="提炼文档关键点"><i class="ri-lightbulb-flash-line"></i> 关键点</button>`;

        // 文件格式标签
        const fileTypeBadge = fileType && fileType !== 'txt'
            ? `<span class="doc-file-type-badge ${fileType}">${fileType.toUpperCase()}</span>`
            : '';

        return `
            <div class="${cardClass}" data-id="${doc.id}">
                <div class="doc-card-header">
                    <div class="doc-card-icon ${doc.doc_type}">
                        <i class="${typeInfo.icon}"></i>
                    </div>
                    <div class="doc-card-title">${doc.filename}${gameTag}${fileTypeBadge}</div>
                    <span class="doc-card-status ${doc.status}">${doc.status === 'pending' ? '待处理' : '已应用'}</span>
                </div>
                <div class="doc-card-meta">
                    <span>${doc.platform_name || '通用'} · ${typeInfo.name} · ${doc.created_at || ''}</span>
                    <div class="doc-card-actions">
                        ${originalFileBtn}
                        ${keypointsBtn}
                        <button class="doc-action-btn delete" data-doc-id="${doc.id}">
                            <i class="ri-delete-bin-line"></i> 删除
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.doc-action-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            onDelete(parseInt(btn.dataset.docId));
        });
    });


    if (onViewOriginal) {
        container.querySelectorAll('.doc-action-btn.view-original').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                onViewOriginal(parseInt(btn.dataset.docId), btn.dataset.fileType);
            });
        });
    }

    if (onExtractKeypoints) {
        container.querySelectorAll('.doc-action-btn.extract-keypoints').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                onExtractKeypoints(parseInt(btn.dataset.docId));
            });
        });
    }
}

// 文本屏蔽函数
function maskText(text) {
    if (!text) return '***';
    return text.replace(/[\u4e00-\u9fff]/g, '*').replace(/[a-zA-Z0-9]/g, '*');
}

// 填充平台选择下拉框
export function populatePlatformSelects(platforms) {
    const selects = document.querySelectorAll('#upload-platform, #text-platform, #url-platform, #file-platform');
    selects.forEach(select => {
        while (select.options.length > 1) {
            select.remove(1);
        }
        platforms.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.icon} ${p.name}`;
            select.appendChild(opt);
        });
    });
}