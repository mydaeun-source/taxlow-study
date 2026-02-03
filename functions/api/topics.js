export async function onRequest(context) {
  const { env } = context;
  
  try {
    const todoList = [];
    // 1부터 8까지 각 파트에서 count가 가장 적은 것 중 하나를 랜덤하게 추출
    for (let p = 1; p <= 8; p++) {
      const { results } = await env.DB.prepare(
        "SELECT * FROM TaxLawStudy WHERE part = ? ORDER BY count ASC, RANDOM() LIMIT 1"
      ).bind(p).all();
      
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
