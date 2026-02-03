export async function onRequest(context) {
  const { env } = context;

  try {
    // 1. 실제 DB에 존재하는 모든 파트(법 이름) 목록을 가져옴
    const { results: parts } = await env.DB.prepare(
      "SELECT DISTINCT part FROM TaxLawStudy"
    ).all();

    const todoList = [];

    // 2. 각 파트별로 count가 가장 적은 것 중 하나를 랜덤하게 추출
    for (const p of parts) {
      const { results } = await env.DB.prepare(
        "SELECT * FROM TaxLawStudy WHERE part = ? ORDER BY count ASC, RANDOM() LIMIT 1"
      ).bind(p.part).all();

      if (results && results.length > 0) {
        todoList.push(results[0]);
      }
    }

    return new Response(JSON.stringify(todoList), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
