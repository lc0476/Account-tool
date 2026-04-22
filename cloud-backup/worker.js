const MAX_VERSIONS = 3;

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Sync-Key, X-Restore-Version"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const syncKey = (request.headers.get("X-Sync-Key") || "").trim();
    if (!syncKey || syncKey.length < 4) {
      return Response.json({ error: "同步密钥不能少于4位" }, { status: 400, headers: cors });
    }

    const kvKey = "backup:" + syncKey;
    const indexKey = "versions:" + syncKey;

    if (request.method === "PUT") {
      const body = await request.text();
      if (!body) {
        return Response.json({ error: "数据不能为空" }, { status: 400, headers: cors });
      }

      const now = new Date().toISOString();
      const versionId = now.replace(/[^0-9]/g, "");
      const versionKey = kvKey + ":v:" + versionId;

      // Save new version
      await env.BACKUP_KV.put(versionKey, body);
      // Update latest
      await env.BACKUP_KV.put(kvKey, body);

      // Update version index
      let versions = [];
      try {
        const raw = await env.BACKUP_KV.get(indexKey);
        if (raw) versions = JSON.parse(raw);
      } catch (e) {}
      versions.unshift({ id: versionId, time: now });

      // Clean old versions beyond MAX_VERSIONS
      while (versions.length > MAX_VERSIONS) {
        const old = versions.pop();
        await env.BACKUP_KV.delete(kvKey + ":v:" + old.id);
      }
      await env.BACKUP_KV.put(indexKey, JSON.stringify(versions));

      return Response.json({
        ok: true,
        time: now,
        versionId,
        versions: versions.map(v => ({ id: v.id, time: v.time }))
      }, { headers: cors });
    }

    if (request.method === "GET") {
      // Support restoring a specific version
      const restoreVersion = (request.headers.get("X-Restore-Version") || "").trim();

      if (restoreVersion === "list") {
        let versions = [];
        try {
          const raw = await env.BACKUP_KV.get(indexKey);
          if (raw) versions = JSON.parse(raw);
        } catch (e) {}
        return Response.json({ versions }, { headers: cors });
      }

      let data;
      if (restoreVersion) {
        data = await env.BACKUP_KV.get(kvKey + ":v:" + restoreVersion);
        if (!data) {
          return Response.json({ error: "未找到该版本备份" }, { status: 404, headers: cors });
        }
      } else {
        data = await env.BACKUP_KV.get(kvKey);
        if (!data) {
          return Response.json({ error: "未找到备份数据" }, { status: 404, headers: cors });
        }
      }

      return new Response(data, {
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    return Response.json({ error: "不支持的请求" }, { status: 405, headers: cors });
  }
};
