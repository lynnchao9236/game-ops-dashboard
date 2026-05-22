// 仪表盘页面模块 - PC端适配版本
import { request } from './api.js';

export async function renderDashboard(container) {
    container.innerHTML = `<div class="flex items-center justify-center py-20"><div class="loading-spinner"></div></div>`;

    try {
        const res = await request('/dashboard');
        const d = res.data;

        container.innerHTML = `
            <div class="animate-fadeIn">
                <!-- 顶部统计卡片 - 三列 -->
                <div class="grid grid-cols-3 gap-5 mb-6">
                    <div class="rounded-2xl p-5 transition-shadow" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);transition:box-shadow 0.2s">
                        <div class="flex items-center justify-between mb-3">
                            <div class="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <i class="ri-team-line text-xl text-white"></i>
                            </div>
                            <span style="font-size:0.75rem;color:rgba(255,255,255,0.4);background:rgba(255,255,255,0.08);padding:2px 10px;border-radius:8px">总计</span>
                        </div>
                        <h3 class="text-3xl font-bold text-white mb-1">${d.total}</h3>
                        <p class="text-sm" style="color:rgba(255,255,255,0.5)">KOL Pool 总数</p>
                    </div>
                    <div class="rounded-2xl p-5 transition-shadow" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);transition:box-shadow 0.2s">
                        <div class="flex items-center justify-between mb-3">
                            <div class="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                <i class="ri-handshake-line text-xl text-white"></i>
                            </div>
                            <span style="font-size:0.75rem;color:rgba(255,255,255,0.4);background:rgba(255,255,255,0.08);padding:2px 10px;border-radius:8px">合作</span>
                        </div>
                        <h3 class="text-3xl font-bold text-white mb-1">${d.cooperated_count || 0}</h3>
                        <p class="text-sm" style="color:rgba(255,255,255,0.5)">合作过的 KOL</p>
                    </div>
                    <div class="rounded-2xl p-5 transition-shadow" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);transition:box-shadow 0.2s">
                        <div class="flex items-center justify-between mb-3">
                            <div class="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                                <i class="ri-database-2-line text-xl text-white"></i>
                            </div>
                            <span style="font-size:0.75rem;color:rgba(255,255,255,0.4);background:rgba(255,255,255,0.08);padding:2px 10px;border-radius:8px">字段</span>
                        </div>
                        <h3 class="text-3xl font-bold text-white mb-1">${d.field_count}</h3>
                        <p class="text-sm" style="color:rgba(255,255,255,0.5)">数据字段</p>
                    </div>
                </div>

                ${d.total === 0 ? `
                <!-- 空状态 -->
                <div class="rounded-2xl p-12 text-center max-w-lg mx-auto" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1)">
                    <div class="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style="background:rgba(99,102,241,0.15)">
                        <i class="ri-upload-cloud-2-line text-5xl text-indigo-300"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">还没有KOL数据</h3>
                    <p class="text-sm mb-6 leading-relaxed" style="color:rgba(255,255,255,0.45)">请先到「数据导入」页面上传您的Excel表格<br>系统将自动识别字段并创建KOL档案</p>
                    <button id="go-import-btn" class="bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2">
                        <i class="ri-upload-2-line"></i> 去导入数据
                    </button>
                </div>
                ` : `
                <!-- 动态图表 - 三列 -->
                <div class="grid grid-cols-3 gap-5">
                    ${d.charts.map((chart, idx) => `
                        <div class="rounded-2xl p-5 transition-shadow" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);transition:box-shadow 0.2s">
                            <h3 class="text-sm font-semibold mb-4 flex items-center gap-2" style="color:rgba(255,255,255,0.85)">
                                <span class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:rgba(99,102,241,0.25)">
                                    <i class="${idx === 1 ? 'ri-bar-chart-horizontal-line' : 'ri-pie-chart-line'} text-sm text-indigo-600"></i>
                                </span>
                                ${chart.display_name} 分布
                            </h3>
                            <div id="chart-${idx}" style="height: 320px;"></div>
                        </div>
                    `).join('')}
                </div>
                `}

                <!-- 签名 -->
                <div class="text-center mt-8 mb-2">
                    
                </div>
            </div>
        `;

        // 绑定去导入按钮
        const goImportBtn = document.getElementById('go-import-btn');
        if (goImportBtn) {
            goImportBtn.addEventListener('click', () => {
                document.querySelector('.sidebar-tab[data-page="import"]')?.click();
            });
        }

        // 渲染动态图表
        if (d.charts.length > 0) {
            setTimeout(() => renderCharts(d.charts), 100);
        }
    } catch (err) {
        container.innerHTML = `
            <div class="text-center py-20">
                <i class="ri-error-warning-line text-4xl text-red-300 mb-3 block"></i>
                <p class="text-sm text-red-400">加载失败: ${err.message}</p>
                <button onclick="location.reload()" class="mt-4 px-5 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-600 hover:bg-gray-200 transition-colors">重试</button>
            </div>
        `;
    }
}

function renderCharts(charts) {
    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#84cc16', '#0ea5e9'];

    charts.forEach((chart, idx) => {
        const el = document.getElementById(`chart-${idx}`);
        if (!el) return;

        const eChart = echarts.init(el);

        // followers 用条形图，其余用饼图
        const isBar = chart.field_name === 'followers';

        // 取数据中的值字段（country/followers/genre）
        const valKey = chart.field_name === 'country' ? 'country'
                     : chart.field_name === 'followers' ? 'followers'
                     : 'genre';

        const data = chart.stats.map(s => ({
            name: String(s[valKey] || s['country'] || s['followers'] || s['genre'] || '未填写'),
            value: Number(s.cnt) || 0,
        }));

        if (isBar) {
            // 粉丝量：横向条形图（按粉丝量从高到低，保持原始顺序）
            eChart.setOption({
                tooltip: { trigger: 'axis', confine: true },
                grid: { left: '3%', right: '12%', bottom: '3%', top: '3%', containLabel: true },
                xAxis: {
                    type: 'value',
                    axisLine: { show: false },
                    axisTick: { show: false },
                    splitLine: { lineStyle: { type: 'dashed', color: '#f3f4f6' } },
                    axisLabel: { fontSize: 11, color: '#9ca3af' },
                },
                yAxis: {
                    type: 'category',
                    data: data.map(e => e.name).reverse(),
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: { fontSize: 11, color: '#374151', width: 100, overflow: 'truncate' },
                },
                series: [{
                    type: 'bar',
                    data: data.map(e => e.value).reverse(),
                    barWidth: 18,
                    itemStyle: {
                        borderRadius: [0, 8, 8, 0],
                        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                            { offset: 0, color: '#6366f1' },
                            { offset: 1, color: '#a855f7' }
                        ])
                    },
                    label: { show: true, position: 'right', fontSize: 11, color: '#6b7280' }
                }]
            });
        } else {
            // 国家/内容类型：饼图
            eChart.setOption({
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)',
                    confine: true,
                },
                color: colors,
                legend: {
                    orient: 'vertical',
                    right: 5,
                    top: 'center',
                    itemWidth: 10,
                    itemHeight: 10,
                    textStyle: { fontSize: 11, color: '#6b7280' },
                    type: 'scroll',
                    pageTextStyle: { color: '#6b7280' },
                },
                series: [{
                    type: 'pie',
                    radius: ['38%', '65%'],
                    center: ['38%', '50%'],
                    avoidLabelOverlap: true,
                    itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
                    label: { show: false },
                    emphasis: {
                        label: { show: true, fontSize: 12, fontWeight: 'bold' }
                    },
                    data: data,
                }]
            });
        }

        window.addEventListener('resize', () => eChart.resize());
    });
}
