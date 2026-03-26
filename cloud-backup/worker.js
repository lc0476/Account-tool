export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Sync-Key"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const syncKey = (request.headers.get("X-Sync-Key") || "").trim();
    if (!syncKey || syncKey.length < 4) {
      return Response.json({ error: "同步密钥不能少于4位" }, { status: 400, headers: cors });
    }

    const kvKey = "backup:" + syncKey;

    if (request.method === "PUT") {
      const body = await request.text();
      if (!body) {
        return Response.json({ error: "数据不能为空" }, { status: 400, headers: cors });
      }
      await env.BACKUP_KV.put(kvKey, body);
      return Response.json({ ok: true, time: new Date().toISOString() }, { headers: cors });
    }

    if (request.method === "GET") {
      const data = await env.BACKUP_KV.get(kvKey);
      if (!data) {
        return Response.json({ error: "未找到备份数据" }, { status: 404, headers: cors });
      }
      return new Response(data, {
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    return Response.json({ error: "不支持的请求" }, { status: 405, headers: cors });
  }
};
