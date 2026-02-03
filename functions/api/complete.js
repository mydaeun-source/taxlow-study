export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        const { id, part, topic } = await request.json();
        const now = new Date().toISOString().split('T')[0];

        // 1. TaxLawStudy 테이블 업데이트 (count + 1, 날짜 갱신)
        await env.DB.prepare(
            "UPDATE TaxLawStudy SET count = count + 1, last_date = ? WHERE id = ?"
        ).bind(now, id).run();

        // 2. StudyLog 테이블에 기록 삽입
        await env.DB.prepare(
            "INSERT INTO StudyLog (part, topic, dodate) VALUES (?, ?, ?)"
        ).bind(part, topic, now).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
