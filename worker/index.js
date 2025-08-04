async function handleMarkersRequest(env) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, latitude, longitude FROM markers"
    ).all();

    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  } catch (error) {
    console.error("Database error:", error);
    return new Response(JSON.stringify({ error: "Database error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    switch (url.pathname) {
      case '/api/markers':
        return handleMarkersRequest(env);
      default:
        return new Response('Not Found', { status: 404 });
    }
  },
};
