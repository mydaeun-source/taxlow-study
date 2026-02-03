export async function onRequest(context) {
    const { env } = context;

    try {
        // 파트별 총 학습 횟수 및 로그 데이터 조회
        const stats = await env.DB.prepare(
            "SELECT part, SUM(count) as total_count FROM TaxLawStudy GROUP BY part"
        ).all();

        const logs = await env.DB.prepare(
            `SELECT l.*, t.part, t.topic 
             FROM StudyLog l
             JOIN TaxLawStudy t ON l.master_id = t.id
             ORDER BY l.study_date DESC, l.created_at DESC 
             LIMIT 50`
        ).all();

        return new Response(JSON.stringify({
            stats: stats.results || [],
            logs: logs.results || []
        }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
