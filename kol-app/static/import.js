// 数据导入页面模块 - 支持字段映射确认 + KOL/CC类型选择
import { showToast, API_BASE } from './api.js';

let currentUploadType = 'kol'; // 'kol' 或 'cc'

export function renderImport(container) {
    container.innerHTML = `
        <div class="animate-fadeIn">
            <!-- 导入说明 -->
            <div class="rounded-2xl p-6 mb-5" style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2)">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-bold mb-2 flex items-center gap-2" style="color:rgba(255,255,255,0.9)">
                            <i class="ri-file-excel-2-line text-green-600 text-xl"></i>
                            Excel数据导入
                        </h3>
                        <p class="text-sm" style="color:rgba(255,255,255,0.6)">上传KOL或创作者信息Excel表格，系统会<strong class="text-indigo-600">智能识别并匹配字段</strong>。</p>
                    </div>
                    <div class="flex items-center gap-6 ml-8">
                        ${['选择类型', '上传Excel', '确认字段映射', '导入数据库'].map((s, i) => `
                            <div class="flex items-center gap-2 flex-shrink-0">
                                <span class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style="background:rgba(99,102,241,0.25);color:rgba(167,139,250,1)">${i+1}</span>
                                <span class="text-sm whitespace-nowrap" style="color:rgba(255,255,255,0.6)">${s}</span>
                                ${i < 3 ? '<i class="ri-arrow-right-s-line flex-shrink-0 ml-2" style="color:rgba(255,255,255,0.2)"></i>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- 上传类型选择 -->
            <div class="rounded-2xl p-6 mb-5" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1)">
                <h3 class="text-sm font-semibold mb-4 flex items-center gap-2" style="color:rgba(255,255,255,0.8)">
                    <i class="ri-user-settings-line text-indigo-500"></i> 选择上传类型
                </h3>
                <div class="grid grid-cols-2 gap-4" id="upload-type-selector">
                    <button class="upload-type-card active" data-type="kol">
                        <div class="flex items-center gap-4 p-4 border-2 border-indigo-500 rounded-xl transition-all" style="background:rgba(99,102,241,0.2)"">
                            <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                                <i class="ri-user-star-line text-xl"></i>
                            </div>
                            <div class="text-left">
                                <h4 class="font-semibold text-gray-800">上传 KOL</h4>
                                <p class="text-xs text-gray-500 mt-0.5">KOL/网红信息导入至 KOL Pool</p>
                            </div>
                            <i class="ri-checkbox-circle-fill text-indigo-500 text-xl ml-auto"></i>
                        </div>
                    </button>
                    <button class="upload-type-card" data-type="cc">
                        <div class="flex items-center gap-4 p-4 border-2 border-gray-600 rounded-xl transition-all" style="background:rgba(255,255,255,0.06)"">
                            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                                <i class="ri-team-line text-xl"></i>
                            </div>
                            <div class="text-left">
                                <h4 class="font-semibold text-gray-800">上传创作者 (CC)</h4>
                                <p class="text-xs text-gray-500 mt-0.5">合作创作者信息导入至 CC Pool</p>
                            </div>
                            <i class="ri-checkbox-blank-circle-line text-gray-300 text-xl ml-auto"></i>
                        </div>
                    </button>
                </div>
            </div>

            <!-- 上传区 + 单条录入（左右布局）-->
            <div class="rounded-2xl p-6 mb-5" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1)">
                <div class="grid grid-cols-2 gap-5">
                    <!-- 左：Excel上传 -->
                    <div>
                        <div id="upload-zone" class="upload-zone rounded-xl p-8 text-center h-full flex flex-col items-center justify-center" style="min-height:220px;">
                            <input type="file" id="file-input" accept=".xlsx,.xls" class="hidden">
                            <div id="upload-icon" class="mb-3">
                                <i class="ri-upload-cloud-2-line text-5xl text-indigo-300"></i>
                            </div>
                            <p class="text-gray-600 font-medium text-base mb-1">点击或拖拽文件到此处上传</p>
                            <p class="text-sm text-gray-400 mb-4">支持 .xlsx / .xls 格式</p>
                            <button id="btn-select-file" class="bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                                <i class="ri-folder-open-line mr-1"></i> 选择文件
                            </button>
                        </div>
                        <!-- 文件信息 -->
                        <div id="file-info-bar" class="hidden mt-4">
                            <div class="flex items-center gap-3 mb-3">
                                <i class="ri-file-excel-2-line text-green-600 text-2xl flex-shrink-0"></i>
                                <div class="flex-1 min-w-0">
                                    <p id="file-name" class="text-sm font-medium text-gray-800 truncate"></p>
                                    <p id="file-size" class="text-xs text-gray-400"></p>
                                </div>
                                <button id="btn-remove-file" class="p-1.5 active:bg-red-50 rounded-lg text-gray-400 active:text-red-500 transition-colors flex-shrink-0">
                                    <i class="ri-close-line"></i>
                                </button>
                            </div>
                            <div class="w-full rounded-full h-1.5 mb-2" style="background:rgba(255,255,255,0.12)">
                                <div id="progress-bar" class="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500" style="width: 0%"></div>
                            </div>
                            <p id="progress-text" class="text-xs text-gray-400 text-center">准备解析...</p>
                        </div>
                    </div>

                    <!-- 右：单条录入 -->
                    <div class="border-2 border-dashed border-indigo-200 rounded-xl flex flex-col items-center justify-center text-center p-8 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer" style="min-height:220px;" onclick="window.openSingleKolEntry()">
                        <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                            <i class="ri-user-add-line text-3xl text-indigo-400"></i>
                        </div>
                        <p class="text-gray-700 font-semibold text-base mb-1">单条录入</p>
                        <p class="text-sm text-gray-400 mb-4">逐条填写KOL信息，<br>相同 Name+Source 自动覆盖</p>
                        <button class="bg-indigo-50 text-indigo-600 border border-indigo-200 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors pointer-events-none">
                            <i class="ri-edit-line mr-1"></i> 填写表单
                        </button>
                    </div>
                </div>
            </div>

            <!-- 字段映射区域 -->
            <div id="mapping-section" class="hidden mb-5">
                <div class="rounded-2xl p-6" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1)">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <i class="ri-links-line text-indigo-500"></i> 字段映射确认
                        </h3>
                        <div class="flex items-center gap-2">
                            <span id="mapping-stats" class="text-xs text-gray-500"></span>
                        </div>
                    </div>
                    
                    <p class="text-xs text-gray-500 mb-4 bg-blue-50 p-3 rounded-xl">
                        <i class="ri-information-line text-blue-500 mr-1"></i>
                        系统已自动识别Excel表头与标准字段的对应关系，您可以修改映射或选择"跳过"忽略该字段。
                    </p>
                    
                    <!-- 映射编辑表格 -->
                    <div id="mapping-table" class="overflow-x-auto border border-gray-200 rounded-xl"></div>
                    
                    <!-- 映射操作按钮 -->
                    <div class="flex items-center justify-between mt-4">
                        <button id="btn-auto-match" class="px-4 py-2 rounded-xl" style="background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.7)" class2=" text-xs font-medium active:bg-gray-200 transition-colors">
                            <i class="ri-magic-line mr-1"></i> 重新自动匹配
                        </button>
                        <div class="flex gap-2">
                            <button id="btn-reset-mapping" class="px-4 py-2 border rounded-xl" style="border-color:rgba(255,255,255,0.2);color:rgba(255,255,255,0.7)" class2=" text-xs font-medium active:bg-gray-50 transition-colors">
                                <i class="ri-refresh-line mr-1"></i> 重置
                            </button>
                            <button id="btn-confirm-mapping" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium active:bg-indigo-700 transition-colors">
                                <i class="ri-check-line mr-1"></i> 确认映射，预览数据
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 预览区域 -->
            <div id="preview-section" class="hidden mb-5 space-y-5">
                <!-- 数据预览 -->
                <div class="rounded-2xl p-6" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1)">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <i class="ri-table-2 text-indigo-500"></i> 数据预览
                        </h3>
                        <div class="flex items-center gap-2">
                            <span id="data-count" class="text-xs text-gray-400"></span>
                            <select id="preview-rows-select" class="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none">
                                <option value="10">前10行</option>
                                <option value="20">前20行</option>
                                <option value="50">前50行</option>
                                <option value="all" selected>全部</option>
                            </select>
                        </div>
                    </div>
                    <div id="data-preview-table" class="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 rounded-xl"></div>
                </div>

                <!-- 操作按钮 -->
                <div class="flex gap-4">
                    <button id="btn-back-mapping" class="px-6 py-3 border rounded-xl text-sm font-medium transition-colors" style="border-color:rgba(255,255,255,0.2);color:rgba(255,255,255,0.7)">
                        <i class="ri-arrow-left-line mr-1"></i> 返回修改映射
                    </button>
                    <button id="btn-confirm-import" class="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2">
                        <i class="ri-upload-2-line"></i> 确认导入数据库
                    </button>
                </div>
            </div>

            <!-- 导入结果 -->
            <div id="import-result" class="hidden rounded-2xl p-6 mb-5" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1)">
                <div id="result-content"></div>
            </div>

            <!-- 签名 -->
            <div class="text-center mt-4 mb-2">
                
            </div>
        </div>
    `;

    let selectedFile = null;
    let previewData = null;
    let currentMapping = {};  // 用户确认的映射关系
    let originalMapping = []; // 原始推荐的映射

    const zone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');

    // 上传类型选择
    document.querySelectorAll('.upload-type-card').forEach(card => {
        card.addEventListener('click', () => {
            currentUploadType = card.dataset.type;
            document.querySelectorAll('.upload-type-card').forEach(c => {
                const inner = c.querySelector(':scope > div');
                // 选择最后一个checkbox图标（ml-auto的那个）
                const icon = inner.querySelector(':scope > i.ml-auto');
                if (c.dataset.type === currentUploadType) {
                    c.classList.add('active');
                    if (currentUploadType === 'kol') {
                        inner.className = 'flex items-center gap-4 p-4 border-2 border-indigo-500 rounded-xl transition-all" style="background:rgba(99,102,241,0.2)"';
                        icon.className = 'ri-checkbox-circle-fill text-indigo-500 text-xl ml-auto';
                    } else {
                        inner.className = 'flex items-center gap-4 p-4 border-2 border-purple-500 rounded-xl transition-all';inner.style.background='rgba(139,92,246,0.2)';
                        icon.className = 'ri-checkbox-circle-fill text-purple-500 text-xl ml-auto';
                    }
                } else {
                    c.classList.remove('active');
                    inner.className = 'flex items-center gap-4 p-4 border-2 border-gray-600 rounded-xl transition-all" style="background:rgba(255,255,255,0.06)"';
                    icon.className = 'ri-checkbox-blank-circle-line text-gray-300 text-xl ml-auto';
                }
            });
            resetState();
        });
    });

    document.getElementById('btn-select-file').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
    });

    zone.addEventListener('click', (e) => {
        if (e.target === zone || e.target.closest('#upload-icon') || e.target.closest('p')) {
            fileInput.click();
        }
    });

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    });
    zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
    });
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
    });

    function handleFileSelect(file) {
        if (!file.name.match(/\.(xlsx|xls)$/i)) {
            showToast('请选择Excel文件(.xlsx/.xls)', 'error');
            return;
        }
        selectedFile = file;
        document.getElementById('file-name').textContent = file.name;
        document.getElementById('file-size').textContent = formatFileSize(file.size);
        document.getElementById('file-info-bar').classList.remove('hidden');
        doPreview();
    }

    document.getElementById('btn-remove-file').addEventListener('click', () => {
        resetState();
    });

    function resetState() {
        selectedFile = null;
        previewData = null;
        currentMapping = {};
        originalMapping = [];
        fileInput.value = '';
        document.getElementById('file-info-bar').classList.add('hidden');
        document.getElementById('mapping-section').classList.add('hidden');
        document.getElementById('preview-section').classList.add('hidden');
        document.getElementById('import-result').classList.add('hidden');
        document.getElementById('progress-bar').style.width = '0%';
        document.getElementById('progress-text').textContent = '准备解析...';
    }

    async function doPreview() {
        const bar = document.getElementById('progress-bar');
        const text = document.getElementById('progress-text');

        bar.style.width = '20%';
        text.textContent = '正在上传文件...';

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            bar.style.width = '50%';
            text.textContent = '正在解析Excel...';

            const previewUrl = currentUploadType === 'cc' ? `${API_BASE}/cc/preview` : `${API_BASE}/kol/preview`;
            const resp = await fetch(previewUrl, { method: 'POST', body: formData });
            bar.style.width = '80%';
            text.textContent = '正在分析字段...';

            // 先获取响应文本用于调试
            const respText = await resp.text();
            console.log('[doPreview] HTTP status:', resp.status);
            console.log('[doPreview] Response length:', respText.length);
            
            let data;
            try {
                data = JSON.parse(respText);
                console.log('[doPreview] Parsed code:', data.code);
                console.log('[doPreview] total_rows:', data.data?.total_rows);
                console.log('[doPreview] headers count:', data.data?.headers?.length);
                console.log('[doPreview] field_mapping count:', data.data?.field_mapping?.length);
            } catch (parseErr) {
                console.error('[doPreview] JSON parse error:', parseErr);
                console.error('[doPreview] Response (first 500 chars):', respText.substring(0, 500));
                throw new Error('服务器返回数据格式错误');
            }

            if (resp.ok && data.code === 0) {
                bar.style.width = '100%';
                text.textContent = `解析完成！共 ${data.data.total_rows} 条数据，${data.data.headers.length} 个字段`;
                previewData = data.data;
                originalMapping = data.data.field_mapping || [];
                console.log('[doPreview] originalMapping:', originalMapping.length, 'items');
                console.log('[doPreview] standard_fields:', Object.keys(data.data.standard_fields || {}));
                renderMappingSection(data.data);
            } else {
                bar.style.width = '0%';
                text.textContent = '解析失败';
                const errMsg = data.detail || data.message || `解析失败 (HTTP ${resp.status})`;
                console.error('[doPreview] Error:', errMsg);
                showToast(errMsg, 'error');
            }
        } catch (err) {
            bar.style.width = '0%';
            text.textContent = '解析失败';
            console.error('[doPreview] Exception:', err);
            showToast('解析失败: ' + err.message, 'error');
        }
    }

    function renderMappingSection(data) {
        console.log('[renderMappingSection] Called with data:', {
            total_rows: data.total_rows,
            headers: data.headers?.length,
            field_mapping: data.field_mapping?.length,
            standard_fields: Object.keys(data.standard_fields || {}).length
        });
        
        const mappingSection = document.getElementById('mapping-section');
        console.log('[renderMappingSection] mapping-section element:', mappingSection);
        
        mappingSection.classList.remove('hidden');
        mappingSection.style.display = 'block';
        document.getElementById('preview-section').classList.add('hidden');

        const standardFields = data.standard_fields || {};
        console.log('[renderMappingSection] standardFields keys:', Object.keys(standardFields));
        
        // 统计匹配情况
        const matchedCount = originalMapping.filter(m => m.suggested_field && m.match_score >= 50).length;
        const highScoreCount = originalMapping.filter(m => m.match_score >= 80).length;
        console.log('[renderMappingSection] matchedCount:', matchedCount, 'highScoreCount:', highScoreCount);
        
        document.getElementById('mapping-stats').innerHTML = `
            <span class="text-green-600">${highScoreCount}</span> 个高置信匹配 / 
            <span class="text-indigo-600">${matchedCount}</span> 个已推荐 / 
            共 <span class="text-gray-700">${originalMapping.length}</span> 个字段
        `;

        // 渲染映射表格
        const tableDiv = document.getElementById('mapping-table');
        
        // 构建标准字段下拉选项
        const fieldOptions = Object.entries(standardFields).map(([key, info]) => 
            `<option value="${key}">${info.display} (${key})</option>`
        ).join('');
        
        // 表格内容
        let tableHtml = `
            <table class="w-full text-xs">
                <thead class=""  style="background:rgba(255,255,255,0.08)">
                    <tr>
                        <th class="px-3 py-2.5 text-left text-gray-500 font-semibold w-8">#</th>
                        <th class="px-3 py-2.5 text-left text-gray-500 font-semibold">Excel表头</th>
                        <th class="px-3 py-2.5 text-center text-gray-500 font-semibold w-20">匹配度</th>
                        <th class="px-3 py-2.5 text-left text-gray-500 font-semibold">映射到字段</th>
                        <th class="px-3 py-2.5 text-left text-gray-500 font-semibold w-32">说明</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
        `;

        originalMapping.forEach((m, idx) => {
            const scoreClass = m.match_score >= 80 ? 'text-green-600 bg-green-50' : 
                              m.match_score >= 50 ? 'text-yellow-600 bg-yellow-50' : 
                              m.match_score > 0 ? 'text-orange-500 bg-orange-50' : 'text-gray-400 bg-gray-50';
            const scoreText = m.match_score >= 80 ? '高' : m.match_score >= 50 ? '中' : m.match_score > 0 ? '低' : '-';
            
            // 当前选中的值
            const selectedValue = m.suggested_field || '';
            
            tableHtml += `
                <tr class="hover:bg-indigo-50/30 transition-colors" data-idx="${idx}">
                    <td class="px-3 py-2 text-gray-400 font-mono">${idx + 1}</td>
                    <td class="px-3 py-2">
                        <div class="font-medium text-gray-800 truncate max-w-[200px]" title="${escapeHtml(m.excel_header)}">
                            ${escapeHtml(truncateText(m.excel_header, 30))}
                        </div>
                    </td>
                    <td class="px-3 py-2 text-center">
                        <span class="px-2 py-1 rounded-full text-[10px] font-medium ${scoreClass}">
                            ${scoreText} ${m.match_score > 0 ? Math.round(m.match_score) + '%' : ''}
                        </span>
                    </td>
                    <td class="px-3 py-2">
                        <select class="mapping-select w-full px-2 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none" style="background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.15);color:rgba(255,255,255,0.85)" data-excel-header="${escapeAttr(m.excel_header)}">
                            <option value="">-- 跳过该字段 --</option>
                            ${Object.entries(standardFields).map(([key, info]) => 
                                `<option value="${key}" ${key === selectedValue ? 'selected' : ''}>${info.display}</option>`
                            ).join('')}
                            <option value="__custom__" ${selectedValue && !standardFields[selectedValue] ? 'selected' : ''}>自定义字段名...</option>
                        </select>
                        <input type="text" class="custom-field-input hidden w-full mt-1 px-2 py-1 border border-indigo-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none" 
                            placeholder="输入自定义字段名" value="${selectedValue && !standardFields[selectedValue] ? selectedValue : ''}">
                    </td>
                    <td class="px-3 py-2 text-gray-500 text-[11px]">
                        ${m.description || (m.suggested_field ? standardFields[m.suggested_field]?.description || '' : '')}
                    </td>
                </tr>
            `;
        });

        tableHtml += '</tbody></table>';
        tableDiv.innerHTML = tableHtml;

        // 绑定下拉选择事件
        tableDiv.querySelectorAll('.mapping-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const row = e.target.closest('tr');
                const customInput = row.querySelector('.custom-field-input');
                if (e.target.value === '__custom__') {
                    customInput.classList.remove('hidden');
                    customInput.focus();
                } else {
                    customInput.classList.add('hidden');
                }
            });
        });

        // 自动匹配按钮
        document.getElementById('btn-auto-match').onclick = () => {
            tableDiv.querySelectorAll('.mapping-select').forEach((select, idx) => {
                const m = originalMapping[idx];
                if (m.suggested_field && m.match_score >= 50) {
                    select.value = m.suggested_field;
                }
            });
            showToast('已重新应用自动匹配结果', 'info');
        };

        // 重置按钮
        document.getElementById('btn-reset-mapping').onclick = () => {
            tableDiv.querySelectorAll('.mapping-select').forEach((select, idx) => {
                select.value = '';
            });
            showToast('已重置所有映射', 'info');
        };

        // 确认映射按钮
        document.getElementById('btn-confirm-mapping').onclick = () => {
            collectMapping();
            if (Object.keys(currentMapping).length === 0) {
                showToast('请至少映射一个字段', 'warning');
                return;
            }
            renderPreviewSection();
        };
    }

    function collectMapping() {
        currentMapping = {};
        document.querySelectorAll('.mapping-select').forEach(select => {
            const excelHeader = select.dataset.excelHeader;
            let value = select.value;
            
            if (value === '__custom__') {
                const row = select.closest('tr');
                const customInput = row.querySelector('.custom-field-input');
                value = customInput.value.trim();
            }
            
            if (value) {
                currentMapping[excelHeader] = value;
            }
        });
    }

    function renderPreviewSection() {
        document.getElementById('preview-section').classList.remove('hidden');
        
        const allHeaders = previewData.all_headers || previewData.headers;
        
        // 按目标字段分组：{ targetField: [{ excelHeader, colIndex }, ...] }
        const fieldGroups = {};
        allHeaders.forEach((h, idx) => {
            if (!h || !currentMapping[h]) return;
            const target = currentMapping[h];
            if (!fieldGroups[target]) fieldGroups[target] = [];
            fieldGroups[target].push({ excelHeader: h, colIndex: idx });
        });

        const uniqueFields = Object.keys(fieldGroups);
        document.getElementById('data-count').textContent = `共 ${previewData.total_rows} 条数据，${uniqueFields.length} 个映射字段`;
        
        renderTable(previewData, previewData.total_rows, fieldGroups);

        document.getElementById('preview-rows-select').addEventListener('change', (e) => {
            const val = e.target.value;
            const rowCount = val === 'all' ? previewData.total_rows : parseInt(val);
            renderTable(previewData, rowCount, fieldGroups);
        });
    }

    function renderTable(data, maxRows, fieldGroups) {
        const tableDiv = document.getElementById('data-preview-table');
        const rows = data.all_rows.slice(0, maxRows);
        const uniqueFields = Object.keys(fieldGroups);

        let html = `<table class="w-full text-xs">
            <thead class="bg-indigo-50 sticky top-0 z-10">
                <tr>
                    <th class="px-3 py-2.5 text-left text-gray-500 font-semibold whitespace-nowrap border-b border-gray-200">#</th>
                    ${uniqueFields.map(targetField => {
                        const cols = fieldGroups[targetField];
                        const displayName = previewData.standard_fields?.[targetField]?.display || targetField;
                        // 多个原始列合并显示：表头格式 "Notes (Style + Content)"
                        const srcLabels = cols.map(c => escapeHtml(truncateText(c.excelHeader, 12))).join(' + ');
                        const titleTip = cols.map(c => c.excelHeader).join(' + ');
                        return `<th class="px-3 py-2.5 text-left font-semibold whitespace-nowrap border-b border-gray-200 text-indigo-700" title="Excel: ${escapeHtml(titleTip)}">
                            ${escapeHtml(displayName)}
                            <span class="text-[10px] text-gray-400 ml-1">(${srcLabels})</span>
                        </th>`;
                    }).join('')}
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">`;

        rows.forEach((row, idx) => {
            const rowBg = idx % 2 === 0 ? '' : 'bg-gray-50/50';
            html += `<tr class="${rowBg} hover:bg-indigo-50/30 transition-colors">
                <td class="px-3 py-2 text-gray-400 font-mono">${idx + 1}</td>
                ${uniqueFields.map(targetField => {
                    const cols = fieldGroups[targetField];
                    // 同一目标字段的多个原始列值，换行合并展示
                    const parts = cols
                        .map(c => {
                            const cell = (row[c.colIndex] || '').toString();
                            return cell ? escapeHtml(cell.length > 40 ? cell.substring(0, 40) + '...' : cell) : '';
                        })
                        .filter(v => v !== '');
                    const cellHtml = parts.join('<br>');
                    const titleVal = cols.map(c => (row[c.colIndex] || '').toString()).filter(v => v).join(' | ');
                    return `<td class="px-3 py-2 text-gray-700 max-w-[180px]" title="${escapeHtml(titleVal)}">${cellHtml || ''}</td>`;
                }).join('')}
            </tr>`;
        });

        html += `</tbody></table>`;

        if (rows.length < data.total_rows) {
            html += `<div class="text-center py-3 text-xs text-gray-400 bg-gray-50 border-t border-gray-200">
                显示前 ${rows.length} 行 / 共 ${data.total_rows} 行数据
            </div>`;
        }

        tableDiv.innerHTML = html;
    }

    // 返回修改映射
    document.getElementById('btn-back-mapping').addEventListener('click', () => {
        document.getElementById('preview-section').classList.add('hidden');
        document.getElementById('mapping-section').classList.remove('hidden');
    });

    // 确认导入
    document.getElementById('btn-confirm-import').addEventListener('click', async () => {
        if (!selectedFile) return;

        const btn = document.getElementById('btn-confirm-import');
        btn.disabled = true;
        btn.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;border-width:2px;"></div> 正在导入...';

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('field_mapping', JSON.stringify(currentMapping));

        try {
            const importUrl = currentUploadType === 'cc' ? `${API_BASE}/cc/import` : `${API_BASE}/kol/import`;
            const resp = await fetch(importUrl, { method: 'POST', body: formData });
            const data = await resp.json();

            const resultDiv = document.getElementById('import-result');
            const resultContent = document.getElementById('result-content');
            resultDiv.classList.remove('hidden');

            if (data.code === 0) {
                const d = data.data;
                const typeLabel = currentUploadType === 'cc' ? '创作者(CC)' : 'KOL';
                resultContent.innerHTML = `
                    <div class="text-center mb-4">
                        <i class="ri-checkbox-circle-line text-5xl text-green-500 mb-2 block"></i>
                        <h4 class="text-lg font-bold text-gray-800">导入完成</h4>
                        <p class="text-sm text-gray-400 mt-1">已导入至 ${typeLabel} Pool</p>
                    </div>
                    <div class="grid grid-cols-3 gap-4 mb-4">
                        <div class="bg-green-50 rounded-xl p-4 text-center">
                            <p class="text-2xl font-bold text-green-600">${d.success}</p>
                            <p class="text-xs text-green-700">成功导入</p>
                        </div>
                        <div class="bg-red-50 rounded-xl p-4 text-center">
                            <p class="text-2xl font-bold text-red-500">${d.fail}</p>
                            <p class="text-xs text-red-600">导入失败</p>
                        </div>
                        <div class="bg-indigo-50 rounded-xl p-4 text-center">
                            <p class="text-2xl font-bold text-indigo-600">${d.fields_created}</p>
                            <p class="text-xs text-indigo-700">字段数</p>
                        </div>
                    </div>
                    ${d.field_mapping_used ? `
                        <div class="rounded-xl p-4 mb-3" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08)">
                            <h5 class="text-xs font-semibold text-gray-700 mb-2">使用的字段映射：</h5>
                            <div class="flex flex-wrap gap-1.5">
                                ${Object.entries(d.field_mapping_used).map(([excel, field]) => 
                                    `<span class="px-2 py-1 bg-white border border-gray-200 rounded text-[11px]">
                                        <span class="text-gray-600">${escapeHtml(truncateText(excel, 15))}</span>
                                        <i class="ri-arrow-right-line text-gray-400 mx-1"></i>
                                        <span class="text-indigo-600 font-medium">${field}</span>
                                    </span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${d.errors && d.errors.length > 0 ? `
                        <div class="bg-yellow-50 rounded-xl p-4">
                            <h5 class="text-xs font-semibold text-yellow-700 mb-2">错误详情：</h5>
                            <ul class="text-xs text-yellow-600 space-y-1">
                                ${d.errors.map(e => `<li>• ${e}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                `;
                showToast(data.message, 'success');
                document.getElementById('preview-section').classList.add('hidden');
                document.getElementById('mapping-section').classList.add('hidden');
            } else {
                resultContent.innerHTML = `
                    <div class="text-center">
                        <i class="ri-error-warning-line text-5xl text-red-400 mb-2 block"></i>
                        <h4 class="text-lg font-bold text-gray-800 mb-2">导入失败</h4>
                        <p class="text-sm text-red-500">${data.detail || data.message || '未知错误'}</p>
                    </div>
                `;
                showToast('导入失败', 'error');
            }
        } catch (err) {
            showToast('导入失败: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="ri-upload-2-line"></i> 确认导入数据库';
        }
    });
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text || '').replace(/[&<>"']/g, m => map[m]);
}

function escapeAttr(text) {
    return String(text || '').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function truncateText(text, maxLen) {
    if (!text) return '';
    text = String(text).replace(/\n/g, ' ');
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
}

// 单条录入 —— 复用 main.js 的 addKolRecord（name为空，用户自填）
window.openSingleKolEntry = function () {
    if (typeof window.addKolRecord === 'function') {
        window.addKolRecord('');
    } else {
        alert('请先加载KOL管理模块');
    }
};
