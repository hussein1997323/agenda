const empresa = process.env.AGENDA_EMPRESA ?? "01";
const filial = process.env.AGENDA_FILIAL ?? "0101";
export function agendaUrl(path:string) {
  const base = process.env.AGENDA_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  return base ? new URL(path.replace(/^\//,""), base.endsWith("/") ? base : `${base}/`) : null;
}
export const companyParams = () => ({ empresa, filial });
export const headers = { Accept:"application/json", "Content-Type":"application/json", ...(process.env.AGENDA_API_TOKEN ? { Authorization:`Bearer ${process.env.AGENDA_API_TOKEN}` } : {}) };
export async function safeJson(response:Response) { return (response.headers.get("content-type")??"").includes("application/json") ? response.json() : null; }
