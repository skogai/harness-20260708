// Session Intelligence System - SQLite Vector Store
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
// ============================================================
// Vector Store
// ============================================================
export class VectorStore {
    db;
    constructor(dbPath) {
        const dir = dirname(dbPath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('synchronous = NORMAL');
        this.init();
    }
    init() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS session_embeddings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                source_type TEXT NOT NULL,
                chunk_type TEXT NOT NULL,
                chunk_text TEXT NOT NULL,
                embedding BLOB NOT NULL,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now')),
                UNIQUE(session_id, chunk_type)
            );

            CREATE TABLE IF NOT EXISTS session_metadata (
                session_id TEXT PRIMARY KEY,
                source_type TEXT NOT NULL,
                title TEXT,
                custom_title TEXT,
                total_turns INTEGER DEFAULT 0,
                files_edited TEXT,
                tools_used TEXT,
                start_time TEXT,
                end_time TEXT,
                file_size_bytes INTEGER DEFAULT 0,
                last_indexed_at TEXT
            );

            CREATE TABLE IF NOT EXISTS indexing_state (
                source_id TEXT PRIMARY KEY,
                source_type TEXT NOT NULL,
                last_hash TEXT,
                last_indexed_at TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_embeddings_session
                ON session_embeddings(session_id);
            CREATE INDEX IF NOT EXISTS idx_embeddings_source_type
                ON session_embeddings(source_type);
            CREATE INDEX IF NOT EXISTS idx_metadata_source_type
                ON session_metadata(source_type);
        `);
    }
    // ========================================================
    // Embeddings
    // ========================================================
    upsertEmbedding(sessionId, sourceType, chunkType, chunkText, embedding) {
        const buf = Buffer.from(new Float32Array(embedding).buffer);
        const stmt = this.db.prepare(`
            INSERT INTO session_embeddings (session_id, source_type, chunk_type, chunk_text, embedding)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(session_id, chunk_type) DO UPDATE SET
                chunk_text = excluded.chunk_text,
                embedding = excluded.embedding,
                updated_at = datetime('now')
        `);
        stmt.run(sessionId, sourceType, chunkType, chunkText, buf);
    }
    // ========================================================
    // Search (cosine similarity in JS)
    // ========================================================
    search(queryEmbedding, opts) {
        const limit = opts?.limit ?? 5;
        const minScore = opts?.minScore ?? 0.3;
        let sql = 'SELECT session_id, source_type, chunk_type, chunk_text, embedding FROM session_embeddings';
        const params = [];
        if (opts?.sourceType) {
            sql += ' WHERE source_type = ?';
            params.push(opts.sourceType);
        }
        const rows = this.db.prepare(sql).all(...params);
        const queryVec = new Float32Array(queryEmbedding);
        const results = [];
        for (const row of rows) {
            const storedVec = new Float32Array(row.embedding.buffer, row.embedding.byteOffset, row.embedding.byteLength / 4);
            const score = cosineSimilarity(queryVec, storedVec);
            if (score >= minScore) {
                results.push({
                    sessionId: row.session_id,
                    sourceType: row.source_type,
                    chunkType: row.chunk_type,
                    chunkText: row.chunk_text,
                    score,
                });
            }
        }
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, limit);
    }
    // ========================================================
    // Metadata
    // ========================================================
    upsertMetadata(meta) {
        const stmt = this.db.prepare(`
            INSERT INTO session_metadata (
                session_id, source_type, title, custom_title,
                total_turns, files_edited, tools_used,
                start_time, end_time, file_size_bytes, last_indexed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(session_id) DO UPDATE SET
                source_type = excluded.source_type,
                title = excluded.title,
                custom_title = excluded.custom_title,
                total_turns = excluded.total_turns,
                files_edited = excluded.files_edited,
                tools_used = excluded.tools_used,
                start_time = excluded.start_time,
                end_time = excluded.end_time,
                file_size_bytes = excluded.file_size_bytes,
                last_indexed_at = datetime('now')
        `);
        stmt.run(meta.sessionId, meta.sourceType, meta.title || null, meta.customTitle || null, meta.totalTurns, JSON.stringify(meta.filesEdited), JSON.stringify(meta.toolsUsed), meta.startTime || null, meta.endTime || null, meta.fileSizeBytes);
    }
    // ========================================================
    // Indexing State
    // ========================================================
    getIndexingState(sourceId) {
        const row = this.db.prepare('SELECT source_id, source_type, last_hash, last_indexed_at FROM indexing_state WHERE source_id = ?').get(sourceId);
        if (!row)
            return null;
        return {
            sourceId: row.source_id,
            sourceType: row.source_type,
            lastHash: row.last_hash,
            lastIndexedAt: row.last_indexed_at,
        };
    }
    updateIndexingState(sourceId, sourceType, hash) {
        this.db.prepare(`
            INSERT INTO indexing_state (source_id, source_type, last_hash, last_indexed_at)
            VALUES (?, ?, ?, datetime('now'))
            ON CONFLICT(source_id) DO UPDATE SET
                last_hash = excluded.last_hash,
                last_indexed_at = datetime('now')
        `).run(sourceId, sourceType, hash);
    }
    // ========================================================
    // Stats
    // ========================================================
    getStats() {
        const embeddings = this.db.prepare('SELECT COUNT(*) as count FROM session_embeddings').get().count;
        const sessions = this.db.prepare("SELECT COUNT(*) as count FROM session_metadata WHERE source_type = 'session'").get().count;
        const devdocs = this.db.prepare("SELECT COUNT(*) as count FROM session_metadata WHERE source_type = 'devdoc'").get().count;
        return { embeddings, sessions, devdocs };
    }
    close() {
        this.db.close();
    }
}
// ============================================================
// Cosine Similarity
// ============================================================
function cosineSimilarity(a, b) {
    if (a.length !== b.length)
        return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    if (denom === 0)
        return 0;
    return dot / denom;
}
