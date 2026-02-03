export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        const body = await request.json();
        const { id, part, topic } = body;

        console.log("저장 시도 데이터:", { id, part, topic });

        if (!id || !part || !topic) {
            throw new Error(`필수 데이터 누락: id=${id}, part=${part}, topic=${topic}`);
        }

        const numericId = parseInt(id, 10);
        const numericPart = parseInt(part, 10);
        const now = new Date().toISOString().split('T')[0];

        // 1. TaxLawStudy 테이블 업데이트
        const updateOp = await env.DB.prepare(
            "UPDATE TaxLawStudy SET count = count + 1, last_date = ? WHERE id = ?"
        ).bind(now, numericId).run();

        if (!updateOp.success) {
            throw new Error(`TaxLawStudy 업데이트 실패: ${updateOp.error}`);
        }

        // 2. StudyLog 테이블에 기록 삽입
        const insertOp = await env.DB.prepare(
            "INSERT INTO StudyLog (part, topic, dodate) VALUES (?, ?, ?)"
        ).bind(numericPart, topic, now).run();

        if (!insertOp.success) {
            throw new Error(`StudyLog 저장 실패: ${insertOp.error}`);
        }

        return new Response(JSON.stringify({ success: true, message: "학습 완료 저장 성공" }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        console.error("저장 오류:", err.message);
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
