export async function onRequestPost(context) {
    const { env, request } = context;

    try {
        const body = await request.json();
        const { id, part, topic } = body;

        // 로깅: 수신된 데이터 확인
        console.log("학습 완료 요청 수신:", { id, part, topic });

        if (id === undefined || part === undefined || !topic) {
            return new Response(JSON.stringify({
                success: false,
                error: `데이터 부족: id=${id}, part=${part}, topic=${topic}`
            }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        const numericId = parseInt(id, 10);
        const numericPart = parseInt(part, 10);
        const now = new Date().toISOString().split('T')[0];

        // 1. TaxLawStudy 업데이트 시도
        const updateStmt = env.DB.prepare(
            "UPDATE TaxLawStudy SET count = count + 1, last_date = ? WHERE id = ?"
        ).bind(now, numericId);

        const updateResult = await updateStmt.run();

        if (!updateResult.success) {
            throw new Error(`TaxLawStudy 업데이트 SQL 실행 실패: ${updateResult.error}`);
        }

        // 실제로 변경된 행이 있는지 확인 (ID가 잘못되었을 경우 0)
        if (updateResult.meta.changes === 0) {
            throw new Error(`ID ${numericId}에 해당하는 주제를 찾을 수 없어 업데이트하지 못했습니다.`);
        }

        // 2. StudyLog 이력 삽입 (수정된 구조 반영)
        const insertStmt = env.DB.prepare(
            "INSERT INTO StudyLog (master_id, study_date) VALUES (?, ?)"
        ).bind(numericId, now);

        const insertResult = await insertStmt.run();

        if (!insertResult.success) {
            throw new Error(`StudyLog 삽입 SQL 실행 실패: ${insertResult.error}`);
        }

        // 3. CurrentTodoList에서도 완료 상태로 표시
        await env.DB.prepare(
            "UPDATE CurrentTodoList SET is_completed = 1 WHERE topic_id = ?"
        ).bind(numericId).run();

        return new Response(JSON.stringify({
            success: true,
            message: "저장 성공",
            details: { updatedId: numericId, insertedPart: numericPart }
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error("완료 API 치명적 오류:", err.message);
        return new Response(JSON.stringify({
            success: false,
            error: err.message
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
