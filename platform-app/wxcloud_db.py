"""
数据库操作封装模块 - 纯 MySQL 版本
所有读写操作直接对 MySQL 数据库执行，确保数据持久化。
支持连接池和自动重试，适合 Docker 容器部署环境。
"""
import os
import json
import time
import pymysql
from datetime import datetime
from contextlib import contextmanager

# ==================== 数据库配置 ====================
DB_CONFIG = {
    "host": os.environ.get("MYSQL_HOST", "127.0.0.1"),
    "port": int(os.environ.get("MYSQL_PORT", 3306)),
    "user": os.environ.get("MYSQL_USER", "root"),
    "password": os.environ.get("MYSQL_PASSWORD", "YOUR_DB_PASSWORD"),
    "database": os.environ.get("MYSQL_DATABASE", "YOUR_DATABASE_NAME"),
    "charset": "utf8mb4",
    "cursorclass": pymysql.cursors.DictCursor,
    "connect_timeout": 10,
    "read_timeout": 30,
    "write_timeout": 30,
    "autocommit": False,
}

# 兼容旧代码中引用的变量
_USE_LOCAL_MODE = False

# 简易连接池
_connection_pool = []
_POOL_MAX_SIZE = 3


@contextmanager
def get_db():
    """获取数据库连接的上下文管理器（带连接池和自动重试）"""
    conn = None
    # 尝试从池中复用连接
    while _connection_pool:
        c = _connection_pool.pop()
        try:
            c.ping(reconnect=True)
            conn = c
            break
        except Exception:
            try:
                c.close()
            except Exception:
                pass

    # 没有可用连接，新建一个（带重试）
    if conn is None:
        last_error = None
        for attempt in range(3):
            try:
                conn = pymysql.connect(**DB_CONFIG)
                break
            except Exception as e:
                last_error = e
                if attempt < 2:
                    time.sleep(1 * (attempt + 1))
        if conn is None:
            raise last_error or Exception("无法连接数据库")

    try:
        yield conn
    except Exception:
        # 出错时不归还连接（可能已损坏）
        try:
            conn.close()
        except Exception:
            pass
        raise
    else:
        # 正常结束，归还到池中
        if len(_connection_pool) < _POOL_MAX_SIZE:
            _connection_pool.append(conn)
        else:
            try:
                conn.close()
            except Exception:
                pass


def _now_str():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def _dt_to_str(dt_val):
    """将datetime对象转为字符串"""
    if dt_val is None:
        return _now_str()
    if hasattr(dt_val, "strftime"):
        return dt_val.strftime("%Y-%m-%d %H:%M:%S")
    return str(dt_val)


def _local_next_id():
    """生成一个基于时间的唯一ID（兼容旧代码调用）"""
    return int(time.time() * 1000) % 100000000


# ==================== 建表初始化 ====================

def init_tables():
    """确保所有需要的表存在"""
    with get_db() as db:
        cursor = db.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS platforms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                icon VARCHAR(50) DEFAULT '🎮',
                sort_order INT DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS strategies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                platform_id INT NOT NULL,
                category VARCHAR(50) NOT NULL,
                title VARCHAR(200) DEFAULT '',
                content LONGTEXT,
                version INT DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_platform_id (platform_id),
                INDEX idx_category (category)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS uploaded_docs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                platform_id INT DEFAULT NULL,
                filename VARCHAR(500) DEFAULT '',
                content LONGTEXT,
                original_content LONGTEXT,
                pdf_data LONGBLOB DEFAULT NULL,
                doc_type VARCHAR(50) DEFAULT 'policy',
                game_name VARCHAR(200) DEFAULT '',
                file_type VARCHAR(20) DEFAULT 'txt',
                status VARCHAR(20) DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_platform_id (platform_id),
                INDEX idx_doc_type (doc_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        # 确保旧表也有 pdf_data 列（ALTER TABLE 兼容已存在的表）
        try:
            cursor.execute("ALTER TABLE uploaded_docs ADD COLUMN pdf_data LONGBLOB DEFAULT NULL AFTER original_content")
        except Exception:
            pass  # 列已存在则忽略
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS update_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                platform_id INT DEFAULT NULL,
                action VARCHAR(500) DEFAULT '',
                detail TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_platform_id (platform_id),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        db.commit()
        cursor.close()
        print("[db] 数据库表初始化完成")


# ==================== 平台操作 ====================

def get_all_platforms():
    """获取所有平台"""
    with get_db() as db:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM platforms ORDER BY sort_order")
        rows = cursor.fetchall()
        cursor.close()
        for r in rows:
            r["created_at"] = _dt_to_str(r.get("created_at"))
            r["updated_at"] = _dt_to_str(r.get("updated_at"))
        return rows


# ==================== 策略操作 ====================

def get_strategies_by_platform(platform_id):
    """获取指定平台的所有策略"""
    with get_db() as db:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM strategies WHERE platform_id=%s ORDER BY id", (platform_id,))
        rows = cursor.fetchall()
        cursor.close()
        for s in rows:
            s["created_at"] = _dt_to_str(s.get("created_at"))
            s["updated_at"] = _dt_to_str(s.get("updated_at"))
            content = s.get("content", "") or ""
            if isinstance(content, str) and content.strip():
                try:
                    s["content"] = json.loads(content)
                except (json.JSONDecodeError, TypeError):
                    s["content"] = {"sections": []}
            else:
                s["content"] = {"sections": []}
        return rows


def get_all_strategies():
    """获取所有策略，附带平台信息"""
    platforms = {p["id"]: p for p in get_all_platforms()}
    with get_db() as db:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM strategies ORDER BY id")
        rows = cursor.fetchall()
        cursor.close()
        for s in rows:
            s["created_at"] = _dt_to_str(s.get("created_at"))
            s["updated_at"] = _dt_to_str(s.get("updated_at"))
            content = s.get("content", "") or ""
            if isinstance(content, str) and content.strip():
                try:
                    s["content"] = json.loads(content)
                except (json.JSONDecodeError, TypeError):
                    s["content"] = {"sections": []}
            else:
                s["content"] = {"sections": []}
            pid = s.get("platform_id")
            if pid in platforms:
                s["platform_name"] = platforms[pid].get("name", "")
                s["platform_icon"] = platforms[pid].get("icon", "🎮")
        return rows


def get_strategy_by_id(strategy_id):
    """获取单个策略"""
    with get_db() as db:
        cursor = db.cursor()
        cursor.execute("SELECT * FROM strategies WHERE id=%s", (strategy_id,))
        s = cursor.fetchone()
        cursor.close()
        if not s:
            return None
        s["created_at"] = _dt_to_str(s.get("created_at"))
        s["updated_at"] = _dt_to_str(s.get("updated_at"))
        content = s.get("content", "") or ""
        if isinstance(content, str) and content.strip():
            try:
                s["content"] = json.loads(content)
            except (json.JSONDecodeError, TypeError):
                s["content"] = {"sections": []}
        else:
            s["content"] = {"sections": []}
        return s


def update_strategy_content(strategy_id, content, version=None):
    """更新策略内容"""
    content_str = json.dumps(content, ensure_ascii=False) if isinstance(content, dict) else content
    with get_db() as db:
        cursor = db.cursor()
        if version:
            cursor.execute(
                "UPDATE strategies SET content=%s, version=%s, updated_at=%s WHERE id=%s",
                (content_str, version, _now_str(), strategy_id)
            )
        else:
            cursor.execute(
                "UPDATE strategies SET content=%s, updated_at=%s WHERE id=%s",
                (content_str, _now_str(), strategy_id)
            )
        db.commit()
        modified = cursor.rowcount
        cursor.close()
        return {"errcode": 0, "modified": modified}


# ==================== 文档操作 ====================

def add_document(platform_id, filename, content, doc_type="policy",
                 game_name=None, file_type="txt", original_content="", pdf_data=None, status="pending"):
    """添加文档记录"""
    with get_db() as db:
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO uploaded_docs (platform_id, filename, content, original_content, pdf_data,
                doc_type, game_name, file_type, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (platform_id, filename, content, original_content, pdf_data,
              doc_type, game_name or "", file_type, status, _now_str(), _now_str()))
        db.commit()
        doc_id = cursor.lastrowid
        cursor.close()
        return {"errcode": 0, "doc_id": doc_id}


def get_documents(status=None):
    """获取文档列表"""
    platforms = {p["id"]: p["name"] for p in get_all_platforms()}
    with get_db() as db:
        cursor = db.cursor()
        if status:
            cursor.execute(
                """SELECT id, platform_id, filename, doc_type, game_name, 
                   file_type, status, created_at, updated_at 
                   FROM uploaded_docs WHERE status=%s ORDER BY created_at DESC""",
                (status,)
            )
        else:
            cursor.execute(
                """SELECT id, platform_id, filename, doc_type, game_name, 
                   file_type, status, created_at, updated_at 
                   FROM uploaded_docs ORDER BY created_at DESC"""
            )
        rows = cursor.fetchall()
        cursor.close()
        for d in rows:
            d["created_at"] = _dt_to_str(d.get("created_at"))
            d["updated_at"] = _dt_to_str(d.get("updated_at"))
            pid = d.get("platform_id")
            d["platform_name"] = platforms.get(pid, "通用") if pid else "通用"
        return rows


def get_document_by_id(doc_id):
    """获取单个文档详情"""
    platforms = {p["id"]: p["name"] for p in get_all_platforms()}
    with get_db() as db:
        cursor = db.cursor()
        cursor.execute(
            """SELECT id, platform_id, filename, content, original_content,
               doc_type, game_name, file_type, status, created_at, updated_at
               FROM uploaded_docs WHERE id=%s""",
            (doc_id,)
        )
        doc = cursor.fetchone()
        cursor.close()
        if not doc:
            return None
        doc["created_at"] = _dt_to_str(doc.get("created_at"))
        doc["updated_at"] = _dt_to_str(doc.get("updated_at"))
        pid = doc.get("platform_id")
        doc["platform_name"] = platforms.get(pid, "通用") if pid else "通用"
        return doc


def get_pending_docs():
    """获取所有待处理文档"""
    with get_db() as db:
        cursor = db.cursor()
        cursor.execute(
            """SELECT id, platform_id, filename, content, original_content,
               doc_type, game_name, file_type, status, created_at, updated_at
               FROM uploaded_docs WHERE status='pending' ORDER BY created_at DESC"""
        )
        rows = cursor.fetchall()
        cursor.close()
        for d in rows:
            d["created_at"] = _dt_to_str(d.get("created_at"))
            d["updated_at"] = _dt_to_str(d.get("updated_at"))
        return rows


def update_doc_status(doc_id, status):
    """更新文档状态"""
    with get_db() as db:
        cursor = db.cursor()
        cursor.execute(
            "UPDATE uploaded_docs SET status=%s, updated_at=%s WHERE id=%s",
            (status, _now_str(), doc_id)
        )
        db.commit()
        modified = cursor.rowcount
        cursor.close()
        return {"errcode": 0, "modified": modified}


def delete_document(doc_id):
    """删除文档"""
    with get_db() as db:
        cursor = db.cursor()
        cursor.execute("DELETE FROM uploaded_docs WHERE id=%s", (doc_id,))
        db.commit()
        deleted = cursor.rowcount
        cursor.close()
        return {"errcode": 0, "deleted": deleted}


# ==================== 日志操作 ====================

def add_update_log(platform_id, action, detail=""):
    """添加操作日志"""
    with get_db() as db:
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO update_logs (platform_id, action, detail, created_at) VALUES (%s, %s, %s, %s)",
            (platform_id, action, detail, _now_str())
        )
        db.commit()
        cursor.close()
        return {"errcode": 0}


def get_logs(limit=20):
    """获取操作日志"""
    platforms = {p["id"]: p["name"] for p in get_all_platforms()}
    with get_db() as db:
        cursor = db.cursor()
        cursor.execute(
            "SELECT * FROM update_logs ORDER BY created_at DESC LIMIT %s",
            (limit,)
        )
        rows = cursor.fetchall()
        cursor.close()
        for log in rows:
            log["created_at"] = _dt_to_str(log.get("created_at"))
            pid = log.get("platform_id")
            log["platform_name"] = platforms.get(pid, "") if pid else ""
        return rows


# ==================== 兼容旧代码的通用操作 ====================

def db_query(collection, where=None, order_by=None, limit=100, skip=0):
    """兼容旧代码的通用查询（将NoSQL风格转为SQL）"""
    table = collection
    with get_db() as db:
        cursor = db.cursor()
        sql = f"SELECT * FROM {table}"
        params = []

        # 解析简单的 where 条件
        if where:
            import re
            conditions = []
            # 匹配 {key: "value"} 格式
            str_pairs = re.findall(r'(\w+)\s*:\s*"([^"]*)"'  , where)
            for key, val in str_pairs:
                conditions.append(f"{key}=%s")
                params.append(val)
            # 匹配 {key: number} 格式
            num_pairs = re.findall(r'(\w+)\s*:\s*(\d+)(?!["\.\w])', where)
            for key, val in num_pairs:
                if key not in [k for k, v in str_pairs]:
                    conditions.append(f"{key}=%s")
                    params.append(int(val))
            if conditions:
                sql += " WHERE " + " AND ".join(conditions)

        # 排序
        if order_by:
            if order_by.startswith('-'):
                sql += f" ORDER BY {order_by[1:]} DESC"
            else:
                sql += f" ORDER BY {order_by} ASC"

        sql += f" LIMIT %s OFFSET %s"
        params.extend([limit, skip])

        cursor.execute(sql, params)
        rows = cursor.fetchall()
        cursor.close()

        for r in rows:
            for key in ["created_at", "updated_at"]:
                if key in r:
                    r[key] = _dt_to_str(r[key])

        return {"errcode": 0, "data": rows, "pager": {"Total": len(rows)}}


def db_update(collection, where, data):
    """兼容旧代码的通用更新"""
    import re
    table = collection

    # 解析 data（可以是字典或字符串）
    if isinstance(data, dict):
        updates = data
    else:
        updates = {}
        str_pairs = re.findall(r'(\w+)\s*:\s*"([^"]*)"', data)
        for key, val in str_pairs:
            updates[key] = val
        num_pairs = re.findall(r'(\w+)\s*:\s*(\d+)(?!["\.\w])', data)
        for key, val in num_pairs:
            if key not in updates:
                updates[key] = int(val)

    if not updates:
        return {"errcode": 0, "modified": 0}

    # 解析 where 条件
    where_conditions = []
    where_params = []
    str_pairs = re.findall(r'(\w+)\s*:\s*"([^"]*)"', where)
    for key, val in str_pairs:
        where_conditions.append(f"{key}=%s")
        where_params.append(val)
    num_pairs = re.findall(r'(\w+)\s*:\s*(\d+)(?!["\.\w])', where)
    for key, val in num_pairs:
        if key not in [k for k, v in str_pairs]:
            where_conditions.append(f"{key}=%s")
            where_params.append(int(val))

    set_parts = []
    set_params = []
    for key, val in updates.items():
        set_parts.append(f"{key}=%s")
        set_params.append(val)

    sql = f"UPDATE {table} SET {', '.join(set_parts)}"
    if where_conditions:
        sql += " WHERE " + " AND ".join(where_conditions)

    with get_db() as db:
        cursor = db.cursor()
        cursor.execute(sql, set_params + where_params)
        db.commit()
        modified = cursor.rowcount
        cursor.close()
        return {"errcode": 0, "modified": modified}


def db_update_by_id(collection, record_id, updates):
    """通过ID更新记录"""
    table = collection
    if not updates:
        return {"errcode": 0, "modified": 0}

    set_parts = []
    params = []
    for key, val in updates.items():
        set_parts.append(f"{key}=%s")
        params.append(val)
    params.append(record_id)

    with get_db() as db:
        cursor = db.cursor()
        cursor.execute(f"UPDATE {table} SET {', '.join(set_parts)} WHERE id=%s", params)
        db.commit()
        modified = cursor.rowcount
        cursor.close()
        return {"errcode": 0, "modified": modified}


def db_add(collection, data):
    """兼容旧代码的通用添加"""
    table = collection
    if isinstance(data, list):
        ids = []
        for item in data:
            result = db_add(collection, item)
            ids.append(result.get("id"))
        return {"errcode": 0, "id_list": ids}

    # 过滤掉 _id 字段（NoSQL遗留）
    clean_data = {k: v for k, v in data.items() if k != "_id"}

    columns = list(clean_data.keys())
    values = list(clean_data.values())
    placeholders = ", ".join(["%s"] * len(columns))
    col_str = ", ".join(columns)

    with get_db() as db:
        cursor = db.cursor()
        cursor.execute(f"INSERT INTO {table} ({col_str}) VALUES ({placeholders})", values)
        db.commit()
        new_id = cursor.lastrowid
        cursor.close()
        return {"errcode": 0, "id": new_id, "id_list": [str(new_id)]}


def db_delete_by_id(collection, record_id):
    """通过ID删除记录"""
    table = collection
    with get_db() as db:
        cursor = db.cursor()
        cursor.execute(f"DELETE FROM {table} WHERE id=%s", (record_id,))
        db.commit()
        deleted = cursor.rowcount
        cursor.close()
        return {"errcode": 0, "deleted": deleted}


# ==================== 初始化入口 ====================

def init_all():
    """完整初始化"""
    print("[db] === 开始数据库初始化 (MySQL 持久化模式) ===")
    init_tables()
    # 初始化平台数据
    platforms = get_all_platforms()
    if not platforms:
        print("[db] 初始化平台数据...")
        with get_db() as db:
            cursor = db.cursor()
            platform_data = [
                (1, "Steam", "🎮", 1),
                (2, "Epic Games", "🏪", 2),
                (3, "Xbox", "🟢", 3),
                (4, "PlayStation", "🔵", 4),
            ]
            for pid, name, icon, sort in platform_data:
                cursor.execute(
                    "INSERT IGNORE INTO platforms (id, name, icon, sort_order) VALUES (%s, %s, %s, %s)",
                    (pid, name, icon, sort)
                )
            db.commit()
            cursor.close()
        print("[db] 平台数据初始化完成")
    else:
        print(f"[db] 平台数据已存在 ({len(platforms)} 条)")

    # 初始化策略骨架 - 仅在确认策略表完全为空时才初始化
    with get_db() as db:
        cursor = db.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM strategies")
        cnt = cursor.fetchone()["cnt"]
        cursor.close()
    if cnt == 0:
        # 只有完全为空才初始化，cnt < 12 的判断太危险，可能在部分数据丢失时误触发
        print("[db] 策略表为空，初始化策略骨架...")
        categories = [
            ("promotion", "推广资源策略"),
            ("operation", "运营功能策略"),
            ("technology", "技术合作策略"),
        ]
        platforms_map = {p["id"]: p["name"] for p in get_all_platforms()}
        with get_db() as db:
            cursor = db.cursor()
            sid = 1
            for pid in [1, 2, 3, 4]:
                pname = platforms_map.get(pid, f"平台{pid}")
                for cat, cat_name in categories:
                    cursor.execute(
                        """INSERT IGNORE INTO strategies (id, platform_id, category, title, content, version)
                           VALUES (%s, %s, %s, %s, %s, %s)""",
                        (sid, pid, cat, f"{pname}{cat_name}", "", 1)
                    )
                    sid += 1
            db.commit()
            cursor.close()
        print("[db] 策略骨架初始化完成")
    else:
        print(f"[db] 策略数据已存在 ({cnt} 条)")

    print("[db] === 数据库初始化完成 ===")