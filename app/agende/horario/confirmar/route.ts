import { agendaUrl, companyParams, headers, safeJson } from "@/lib/agenda-api";
export async function POST(request: Request) {
  try {
    const b = await request.json(),
      pedido = String(b.pedido ?? "")
        .trim()
        .toUpperCase(),
      motorista = String(b.motorista ?? "").trim(),
      documento = String(b.documento ?? "").replace(/\D/g, ""),
      placa = String(b.placa ?? "")
        .replace(/[^A-Za-z0-9]/g, "")
        .toUpperCase(),
      documento_tipo = b.documento_tipo === "CNPJ" ? "CNPJ" : "CPF",
      horario_inicio = String(b.horario_inicio ?? "");
    if (
      !/^[A-Z0-9-]{3,30}$/.test(pedido) ||
      motorista.length < 3 ||
      !/^\d{11,14}$/.test(documento) ||
      !/^[A-Z0-9]{7}$/.test(placa) ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-03:00$/.test(horario_inicio)
    )
      return Response.json(
        { error: "Confira os dados informados antes de confirmar." },
        { status: 400 },
      );
    const endpoint = agendaUrl("agendas/");
    if (!endpoint)
      return Response.json(
        { error: "A URL do serviço de agenda não está configurada." },
        { status: 503 },
      );
    endpoint.search = new URLSearchParams(companyParams()).toString();
    const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          pedido,
          horario_inicio,
          motorista,
          documento_tipo,
          documento,
          placa,
        }),
        signal: AbortSignal.timeout(10000),
      }),
      payload = await safeJson(response);
    if (response.status === 401 || response.status === 403)
      return Response.json(
        {
          error:
            "A API recusou a confirmação por falta de autenticação. Verifique a credencial configurada no servidor.",
        },
        { status: response.status },
      );
    if (!response.ok)
      return Response.json(
        {
          error:
            "O horário não pôde ser confirmado. Consulte a agenda novamente.",
        },
        { status: response.status },
      );
    return Response.json(payload ?? { sucesso: true }, {
      status: response.status,
    });
  } catch {
    return Response.json(
      { error: "O serviço de agendamento está temporariamente indisponível." },
      { status: 502 },
    );
  }
}
