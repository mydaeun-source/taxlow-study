export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const regenerate = url.searchParams.get('regenerate') === 'true';

  try {
    // 1. regenerate 가 아니고, 저장된 리스트가 있는지 확인
    if (!regenerate) {
      const { results } = await env.DB.prepare(
        "SELECT t.*, c.is_completed FROM CurrentTodoList c JOIN TaxLawStudy t ON c.topic_id = t.id"
      ).all();

      if (results && results.length > 0) {
        return new Response(JSON.stringify(results), {
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // 2. 리스트를 새로 생성해야 하는 경우 (regenerate=true 거나 저장된 게 없을 때)

    // 기존 CurrentTodoList 비우기
    await env.DB.prepare("DELETE FROM CurrentTodoList").run();

    // 실제 DB에 존재하는 모든 파트(법 이름) 목록을 가져옴
    const { results: parts } = await env.DB.prepare(
      "SELECT DISTINCT part FROM TaxLawStudy"
    ).all();

    const todoList = [];

    // 각 파트별로 count가 가장 적은 것 중 하나를 랜덤하게 추출
    for (const p of parts) {
      const { results } = await env.DB.prepare(
        "SELECT * FROM TaxLawStudy WHERE part = ? ORDER BY count ASC, RANDOM() LIMIT 1"
      ).bind(p.part).all();

      if (results && results.length > 0) {
        todoList.push(results[0]);
        // CurrentTodoList 에 저장
        await env.DB.prepare("INSERT INTO CurrentTodoList (topic_id) VALUES (?)").bind(results[0].id).run();
      }
    }

    return new Response(JSON.stringify(todoList), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
