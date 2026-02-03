export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        const body = await request.json();
        const { id, part, topic } = body;

        if (!id || !part || !topic) {
            throw new Error("필수 데이터(id, part, topic)가 누락되었습니다.");
        }

        const numericId = parseInt(id, 10);
        const numericPart = parseInt(part, 10);
        const now = new Date().toISOString().split('T')[0];

        // 1. TaxLawStudy 테이블 업데이트 (count + 1, 날짜 갱신)
        const updateResult = await env.DB.prepare(
            "UPDATE TaxLawStudy SET count = count + 1, last_date = ? WHERE id = ?"
        ).bind(now, numericId).run();

        if (!updateResult.success) {
            throw new Error("TaxLawStudy 업데이트 실패: " + (updateResult.error || "알 수 없는 오류"));
        }

        // 2. StudyLog 테이블에 기록 삽입
        const insertResult = await env.DB.prepare(
            "INSERT INTO StudyLog (part, topic, dodate) VALUES (?, ?, ?)"
        ).bind(numericPart, topic, now).run();

        if (!insertResult.success) {
            throw new Error("StudyLog 저장 실패: " + (insertResult.error || "알 수 없는 오류"));
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        console.error("Complete API Error:", err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
