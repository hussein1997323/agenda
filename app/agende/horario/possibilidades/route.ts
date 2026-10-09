import { agendaUrl, companyParams, headers, safeJson } from "@/lib/agenda-api";
export async function POST(request: Request) {
  try {
    const body = await request.json(),
      pedido =
        typeof body.pedido === "string" ? body.pedido.trim().toUpperCase() : "",
      data = typeof body.data === "string" ? body.data : "";
    if (!/^[A-Z0-9-]{3,30}$/.test(pedido) || !/^\d{4}-\d{2}-\d{2}$/.test(data))
      return Response.json(
        { error: "Informe um pedido e uma data válidos." },
        { status: 400 },
      );
    const endpoint = agendaUrl("agendas/possibilidades/");
    if (!endpoint)
      return Response.json(
        { error: "A URL do serviço de agenda não está configurada." },
        { status: 503 },
      );
    endpoint.search = new URLSearchParams({
      ...companyParams(),
      pedido,
      data,
    }).toString();
    const response = await fetch(endpoint, {
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }),
      payload = await safeJson(response);
    if (response.status === 401 || response.status === 403)
      return Response.json(
        {
          error:
            "A API recusou a consulta por falta de autenticação. Verifique a credencial configurada no servidor.",
        },
        { status: response.status },
      );
    if (!response.ok)
      return Response.json(
        { error: "A agenda não pôde ser consultada agora." },
        { status: response.status },
      );
    return Response.json(payload);
  } catch {
    return Response.json(
      { error: "A agenda está temporariamente indisponível." },
      { status: 502 },
    );
  }
}
