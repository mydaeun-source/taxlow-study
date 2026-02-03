export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        const body = await request.json();
        const { id, part, topic } = body;

        console.log("저장 요청 데이터:", { id, part, topic });

        if (id === undefined || part === undefined || !topic) {
            throw new Error(`필수 데이터가 누락되었습니다. (id: ${id}, part: ${part}, topic: ${topic})`);
        }

        const numericId = parseInt(id, 10);
        const numericPart = parseInt(part, 10);

        if (isNaN(numericId) || isNaN(numericPart)) {
            throw new Error(`데이터 형식이 올바르지 않습니다. (numericId: ${numericId}, numericPart: ${numericPart})`);
        }

        const now = new Date().toISOString().split('T')[0];

        // 1. TaxLawStudy 테이블 업데이트 (count + 1, 날짜 갱신)
        const updateResult = await env.DB.prepare(
            "UPDATE TaxLawStudy SET count = count + 1, last_date = ? WHERE id = ?"
        ).bind(now, numericId).run();

        if (!updateResult.success) {
            throw new Error("TaxLawStudy 업데이트 실패: " + (updateResult.error || "DB 오류 발생"));
        }

        // 2. StudyLog 테이블에 기록 삽입
        const insertResult = await env.DB.prepare(
            "INSERT INTO StudyLog (part, topic, dodate) VALUES (?, ?, ?)"
        ).bind(numericPart, topic, now).run();

        if (!insertResult.success) {
            throw new Error("StudyLog 저장 실패: " + (insertResult.error || "DB 오류 발생"));
        }

        return new Response(JSON.stringify({ success: true, message: "학습 기록이 저장되었습니다." }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        console.error("학습 완료 API 오류:", err.message);
        return new Response(JSON.stringify({
            success: false,
            error: err.message,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
