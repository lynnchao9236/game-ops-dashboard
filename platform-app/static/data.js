// data.js - API数据请求模块
// 前端和后端部署在同一台腾讯云轻量服务器，使用相对路径
// Nginx 将 /api/* 请求代理到后端 Docker 容器

const API_BASE = window.__API_BASE || '/api';

async function request(url, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${url}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        // 尝试解析JSON响应
        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            return { code: -1, msg: `服务器响应格式错误 (HTTP ${response.status})` };
        }

        // 如果HTTP状态码不是2xx，将FastAPI的错误格式转换为统一格式
        if (!response.ok) {
            const errMsg = data.detail || data.msg || data.message || `请求失败 (HTTP ${response.status})`;
            console.error('API error:', response.status, errMsg);
            return { code: -1, msg: errMsg, detail: errMsg };
        }

        return data;
    } catch (error) {
        console.error('Request error:', error.message || error);
        return { code: -1, msg: '网络请求失败: ' + (error.message || '未知错误') };
    }
}

// 获取所有平台
export async function fetchPlatforms() {
    return await request('/platforms');
}

// 获取指定平台的策略
export async function fetchStrategies(platformId) {
    return await request(`/strategies/${platformId}`);
}

// 获取所有策略
export async function fetchAllStrategies() {
    return await request('/strategies');
}

// 上传文件
export async function uploadFile(formData) {
    try {
        const response = await fetch(`${API_BASE}/documents/upload`, {
            method: 'POST',
            body: formData
        });

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            return { code: -1, msg: `服务器响应格式错误 (HTTP ${response.status})` };
        }

        if (!response.ok) {
            const errMsg = data.detail || data.msg || `上传失败 (HTTP ${response.status})`;
            return { code: -1, msg: errMsg, detail: errMsg };
        }

        return data;
    } catch (error) {
        console.error('Upload error:', error.message || error);
        return { code: -1, msg: '上传失败: ' + (error.message || '未知错误') };
    }
}

// 上传文本
export async function uploadText(data) {
    return await request('/documents/upload-text', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// 通过网址抓取并上传
export async function uploadUrl(data) {
    return await request('/documents/upload-url', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// 获取文档列表
export async function fetchDocuments(status = '') {
    const query = status ? `?status=${status}` : '';
    return await request(`/documents${query}`);
}

// 删除文档
export async function deleteDocument(docId) {
    return await request(`/documents/${docId}`, {
        method: 'DELETE'
    });
}

// 获取文档详情（含完整内容）
export async function fetchDocumentDetail(docId) {
    return await request(`/documents/${docId}`);
}

// 批量更新策略
export async function batchUpdateStrategies(platformId) {
    try {
        const formData = new FormData();
        formData.append('platform_id', platformId);
        const response = await fetch(`${API_BASE}/strategies/batch-update`, {
            method: 'POST',
            body: formData
        });

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            return { code: -1, msg: `服务器响应格式错误 (HTTP ${response.status})` };
        }

        if (!response.ok) {
            const errMsg = data.detail || data.msg || `更新失败 (HTTP ${response.status})`;
            return { code: -1, msg: errMsg, detail: errMsg };
        }

        return data;
    } catch (error) {
        console.error('Batch update error:', error.message || error);
        return { code: -1, msg: '更新失败: ' + (error.message || '未知错误') };
    }
}

// 更新单个策略
export async function updateStrategy(data) {
    return await request('/strategies/update', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// 获取日志
export async function fetchLogs(limit = 20) {
    return await request(`/logs?limit=${limit}`);
}

// 分类名称映射
export const categoryMap = {
    'promotion': { name: '推广资源', icon: 'ri-megaphone-line', color: '#FF6B6B' },
    'operation': { name: '运营功能', icon: 'ri-settings-3-line', color: '#4ECDC4' },
    'technology': { name: '技术合作', icon: 'ri-cpu-line', color: '#45B7D1' }
};

// 文档类型映射
export const docTypeMap = {
    'policy': { name: '平台政策', icon: 'ri-shield-check-line' },
    'resource': { name: '推广资源规则', icon: 'ri-gift-line' },
    'project': { name: '项目效果数据', icon: 'ri-bar-chart-2-line' },
    'report': { name: '内部项目报告', icon: 'ri-file-chart-line' },
    'other': { name: '其他信息', icon: 'ri-file-text-line' }
};

// 平台描述信息
export const platformDescMap = {
    'Steam': 'PC游戏最大平台',
    'Epic Games': '12%低分成优势',
    'Xbox': 'Game Pass生态',
    'PlayStation': '全球1亿+用户'
};

// 智能提问
export async function askQuestion(question) {
    return await request('/ask', {
        method: 'POST',
        body: JSON.stringify({ question })
    });
}

// 重置所有内部项目报告为待处理状态（允许重新整合到策略中）
export async function resetReportStatus() {
    return await request('/debug/reset-report-status', {
        method: 'POST'
    });
}

// 编辑策略中的内部项目数据
export async function editReportData(params) {
    return await request('/strategies/edit-report-data', {
        method: 'POST',
        body: JSON.stringify(params)
    });
}

// 删除策略中的内部项目数据
export async function deleteReportData(params) {
    return await request('/strategies/delete-report-data', {
        method: 'POST',
        body: JSON.stringify(params)
    });
}

// 验证内部项目数据查看密码
export async function verifyReportPassword(password) {
    return await request('/verify-report-password', {
        method: 'POST',
        body: JSON.stringify({ password })
    });
}

// 解析报告内容（文本方式）
export async function parseReportText(content, filename = '') {
    return await request('/documents/parse-report', {
        method: 'POST',
        body: JSON.stringify({ content, filename })
    });
}

// 解析报告文件
export async function parseReportFile(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_BASE}/documents/parse-report-file`, {
            method: 'POST',
            body: formData
        });
        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            return { code: -1, msg: `服务器响应格式错误 (HTTP ${response.status})` };
        }
        if (!response.ok) {
            const errMsg = data.detail || data.msg || `解析失败 (HTTP ${response.status})`;
            return { code: -1, msg: errMsg, detail: errMsg };
        }
        return data;
    } catch (error) {
        console.error('Parse report file error:', error.message || error);
        return { code: -1, msg: '解析失败: ' + (error.message || '未知错误') };
    }
}

// 提炼文档关键点
export async function extractKeypoints(docId) {
    return await request(`/documents/${docId}/extract-keypoints`);
}

// 获取文档原始文件URL
export function getOriginalFileUrl(docId) {
    return `${API_BASE}/documents/${docId}/original-file`;
}

// 获取文档PDF预览URL
export function getPdfPreviewUrl(docId) {
    return `${API_BASE}/documents/${docId}/pdf`;
}

// 上传经确认的报告
export async function uploadConfirmedReport(platformId, gameName, parsedContent, filename, tempId) {
    try {
        const formData = new FormData();
        if (platformId) formData.append('platform_id', platformId);
        if (gameName) formData.append('game_name', gameName);
        formData.append('parsed_content', parsedContent);
        formData.append('filename', filename || '内部项目报告');
        if (tempId) formData.append('temp_id', tempId);
        const response = await fetch(`${API_BASE}/documents/upload-report`, {
            method: 'POST',
            body: formData
        });
        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            return { code: -1, msg: `服务器响应格式错误 (HTTP ${response.status})` };
        }
        if (!response.ok) {
            const errMsg = data.detail || data.msg || `上传失败 (HTTP ${response.status})`;
            return { code: -1, msg: errMsg, detail: errMsg };
        }
        return data;
    } catch (error) {
        console.error('Upload confirmed report error:', error.message || error);
        return { code: -1, msg: '上传失败: ' + (error.message || '未知错误') };
    }
}