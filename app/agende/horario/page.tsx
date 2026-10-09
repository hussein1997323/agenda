"use client";

import { FormEvent, useEffect, useState } from "react";
import DockClock from "./dock-clock";

type Slot = { horario_inicio: string; horario_saida: string };
type Result = { pedido: string; quantidade: number; possibilidades: Slot[] };

const pad = (value: number) => String(value).padStart(2, "0");
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
const time = (iso: string) => iso.slice(11, 16);

const inputClass =
  "h-13 w-full rounded-xl border border-[#dce2dc] bg-white px-4 text-[15px] text-[#17231d] outline-none transition focus:border-[#1e8a57] focus:ring-4 focus:ring-[#1e8a57]/10";
const labelClass = "grid gap-2 text-xs font-bold text-[#536058]";
const primaryButton =
  "flex h-13 items-center justify-between rounded-xl border-0 bg-[#115d39] px-5 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0b4e2f] disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0";
const cardClass =
  "rounded-3xl border border-[#17231d]/10 bg-[#fffefa]/95 p-6 shadow-[0_12px_40px_rgba(41,58,48,.05)] sm:p-8";

export default function SchedulePage() {
  const [now, setNow] = useState<Date | null>(null);
  const [pedido, setPedido] = useState("A93809");
  const [data, setData] = useState("");
  const [minimumDate, setMinimumDate] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [driver, setDriver] = useState({
    motorista: "",
    documento_tipo: "CPF",
    documento: "",
    placa: "",
  });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const currentDate = today();
      setNow(new Date());
      setData(currentDate);
      setMinimumDate(currentDate);
    });
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, []);

  async function loadAvailability(selectedDate: string) {
    if (!pedido.trim() || !selectedDate) return;
    setLoading(true);
    setMessage("");
    setSlot(null);
    try {
      const response = await fetch("/agende/horario/possibilidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedido, data: selectedDate }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setResult(payload);
    } catch (error) {
      setResult(null);
      setMessage(error instanceof Error ? error.message : "Erro na consulta.");
    } finally {
      setLoading(false);
    }
  }

  async function search(event: FormEvent) {
    event.preventDefault();
    await loadAvailability(data);
  }

  async function book(event: FormEvent) {
    event.preventDefault();
    if (!slot) return;
    setSending(true);
    setMessage("");
    try {
      const response = await fetch("/agende/horario/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...driver,
          pedido,
          horario_inicio: slot.horario_inicio,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setMessage("SUCESSO: Horário agendado. Sua retirada está confirmada!");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Erro no agendamento.",
      );
    } finally {
      setSending(false);
    }
  }

  const dateText = data
    ? new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    : "";

  return (
    <main className="min-h-screen text-[#17231d]">
      <header className="mx-auto flex h-20 max-w-[1180px] items-center justify-between border-b border-[#17231d]/10 px-5 sm:px-7">
        <a
          className="flex items-center gap-3 font-[var(--font-display)] font-extrabold tracking-tight"
          href="/agende/horario/"
        >
          <b className="grid size-10 place-items-center rounded-xl bg-[#115d39] text-xs tracking-wider text-white">
            BM
          </b>
          <span className="hidden text-lg tracking-[.08em] sm:inline">
            BRMOTORS
          </span>
        </a>
        <div className="flex items-baseline gap-2.5">
          <small className="hidden text-[10px] tracking-[.15em] text-[#68756d] sm:inline">
            AGORA
          </small>
          <strong className="text-lg tabular-nums">
            {now
              ? now.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--"}
          </strong>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 py-12 sm:px-7 sm:py-16 md:grid-cols-[1fr_190px]">
        <div>
          <p className="text-xs font-extrabold tracking-[.17em] text-[#115d39]">
            BRMOTORS • SEGURANÇA PARA SUA MOTO
          </p>
          <h1 className="my-3 max-w-[830px] font-[var(--font-display)] text-[42px] leading-[1.02] font-extrabold tracking-[-.06em] sm:text-6xl lg:text-[69px]">
            Agende sua retirada com segurança.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[#68756d]">
            Escolha um horário disponível e conte com a agilidade e a confiança
            da BRMOTORS.
          </p>
        </div>
        <div
          aria-hidden="true"
          className="relative hidden aspect-square w-[185px] rounded-full border border-[#17231d]/15 bg-[#fffefa]/70 shadow-[0_22px_45px_rgba(41,58,48,.08),inset_0_0_0_10px_rgba(255,255,255,.55)] md:block"
        >
          <i className="absolute bottom-1/2 left-[calc(50%-2px)] h-12 w-1 origin-bottom rotate-[42deg] rounded bg-[#17231d]" />
          <i className="absolute bottom-1/2 left-[calc(50%-2px)] h-16 w-1 origin-bottom rotate-[140deg] rounded bg-[#1e8a57]" />
          <b className="absolute top-[calc(50%-6px)] left-[calc(50%-6px)] size-[13px] rounded-full bg-[#115d39]" />
        </div>
      </section>

      <div className="mx-auto grid max-w-[1180px] gap-5 px-5 pb-16 sm:px-7 md:grid-cols-[.82fr_1.18fr]">
        <section className={cardClass}>
          <Step
            number="01"
            eyebrow="Localizar pedido"
            title="Quando você quer retirar?"
          />
          <form className="grid gap-4.5" onSubmit={search}>
            <label className={labelClass}>
              Número do pedido
              <input
                className={inputClass}
                value={pedido}
                onChange={(e) => setPedido(e.target.value.toUpperCase())}
                required
              />
            </label>
            <label className={labelClass}>
              Data da retirada
              <input
                className={inputClass}
                type="date"
              min={minimumDate}
                value={data}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  setData(selectedDate);
                  void loadAvailability(selectedDate);
                }}
                required
              />
            </label>
            <button className={primaryButton} disabled={loading}>
              {loading ? "Consultando…" : "Ver horários"}
              <span className="text-xl font-normal">→</span>
            </button>
          </form>
        </section>

        <section className={cardClass}>
          <Step
            number="02"
            eyebrow="Agenda do dia"
            title="Horários disponíveis"
          />
          {!result ? (
            <div className="grid min-h-[270px] place-content-center justify-items-center text-center text-[#68756d]">
              <b className="grid size-16 place-items-center rounded-full border border-[#dce2dc] text-3xl text-[#1e8a57]">
                ◷
              </b>
              <p className="max-w-[270px]">
                Informe o pedido e a data para consultar a agenda.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f1f3ee] px-4 py-3.5 capitalize">
                <strong className="text-sm">{dateText}</strong>
                <span className="text-xs font-extrabold text-[#115d39]">
                  {result.possibilidades.length} livres
                </span>
              </div>
              <div className="my-4 flex gap-5 text-[11px] text-[#68756d]">
                <span className="text-[#1e8a57]">● Disponível</span>
              </div>
              <div className="grid max-h-[370px] grid-cols-2 gap-2.5 overflow-auto pr-1 sm:grid-cols-3">
                {result.possibilidades.length === 0 && (
                  <p className="col-span-full rounded-xl bg-[#f2f2ef] p-6 text-center text-sm text-[#68756d]">
                    Não há horários disponíveis para esta data.
                  </p>
                )}
                {result.possibilidades.map((item) => {
                  const selected = slot?.horario_inicio === item.horario_inicio;
                  return (
                    <button
                      type="button"
                      key={item.horario_inicio}
                      onClick={() => {
                        setSlot(item);
                        setMessage("");
                      }}
                      className={`grid min-h-[91px] content-center justify-items-start rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${selected ? "border-[#1e8a57] bg-[#1e8a57] text-white ring-4 ring-[#1e8a57]/20" : "border-[#b8ddc7] bg-[#e2f3e9] text-[#115d39]"}`}
                    >
                      <strong className="font-[var(--font-display)] text-xl font-extrabold">
                        {time(item.horario_inicio)}
                      </strong>
                      <small
                        className={
                          selected ? "text-[#e3f6eb]" : "text-[#4a775f]"
                        }
                      >
                        até {time(item.horario_saida)}
                      </small>
                      <b className="mt-1.5 text-[9px] tracking-[.12em]">
                        {selected ? "SELECIONADO" : "LIVRE"}
                      </b>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {result && result.possibilidades.length > 0 && (
          <section className={`${cardClass} md:col-span-2`}>
            <DockClock
              slots={result.possibilidades}
              selected={slot}
              onSelect={(item) => {
                setSlot(item);
                setMessage("");
              }}
            />
          </section>
        )}

        {slot && (
          <section className={`${cardClass} md:col-span-2`}>
            <Step
              number="03"
              eyebrow="Último passo"
              title="Dados para a retirada"
            />
            <div className="mb-6 grid overflow-hidden rounded-xl border border-[#dce2dc] sm:grid-cols-3">
              <Summary label="Pedido" value={pedido} />
              <Summary
                label="Data"
                value={new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR")}
              />
              <Summary
                label="Horário"
                value={`${time(slot.horario_inicio)} — ${time(slot.horario_saida)}`}
              />
            </div>
            <form
              className="grid items-end gap-4 md:grid-cols-[1.4fr_.7fr_1fr_1fr]"
              onSubmit={book}
            >
              <label className={labelClass}>
                Nome do motorista
                <input
                  className={inputClass}
                  minLength={3}
                  value={driver.motorista}
                  onChange={(e) =>
                    setDriver({ ...driver, motorista: e.target.value })
                  }
                  required
                />
              </label>
              <label className={labelClass}>
                Documento
                <select
                  className={inputClass}
                  value={driver.documento_tipo}
                  onChange={(e) =>
                    setDriver({ ...driver, documento_tipo: e.target.value })
                  }
                >
                  <option>CPF</option>
                  <option>CNPJ</option>
                </select>
              </label>
              <label className={labelClass}>
                Número
                <input
                  className={inputClass}
                  inputMode="numeric"
                  value={driver.documento}
                  onChange={(e) =>
                    setDriver({ ...driver, documento: e.target.value })
                  }
                  required
                />
              </label>
              <label className={labelClass}>
                Placa
                <input
                  className={inputClass}
                  maxLength={8}
                  value={driver.placa}
                  onChange={(e) =>
                    setDriver({
                      ...driver,
                      placa: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="ABC1D23"
                  required
                />
              </label>
              <button
                className={`${primaryButton} md:col-start-4`}
                disabled={sending}
              >
                {sending ? "Confirmando…" : "Confirmar agendamento"}
                <span>✓</span>
              </button>
            </form>
          </section>
        )}

        {message && (
          <div
            role="alert"
            className={`rounded-xl border px-5 py-4 font-bold md:col-span-2 ${message.startsWith("SUCESSO") ? "border-[#aad6bc] bg-[#dff4e7] text-[#0d5b35]" : "border-[#e9c0bb] bg-[#f9e8e6] text-[#873a34]"}`}
          >
            {message.replace("SUCESSO: ", "")}
          </div>
        )}
      </div>
      <footer className="mx-6 flex max-w-[1124px] justify-between border-t border-[#17231d]/10 py-6 text-xs text-[#68756d] xl:mx-auto">
        <span>BRMOTORS</span>
        <span>Segurança para sua moto</span>
      </footer>
    </main>
  );
}

function Step({
  number,
  eyebrow,
  title,
}: {
  number: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-7 flex gap-4">
      <span className="grid size-[34px] shrink-0 place-items-center rounded-full border border-[#1e8a57] text-[11px] font-extrabold text-[#115d39]">
        {number}
      </span>
      <div>
        <small className="text-[11px] font-extrabold tracking-[.13em] text-[#115d39] uppercase">
          {eyebrow}
        </small>
        <h2 className="mt-0.5 font-[var(--font-display)] text-2xl font-extrabold tracking-tight">
          {title}
        </h2>
      </div>
    </div>
  );
}
function Summary({ label, value }: { label: string; value: string }) {
  return (
    <span className="grid gap-1 border-b border-[#dce2dc] px-4 py-3.5 last:border-0 sm:border-r sm:border-b-0">
      <small className="text-[#68756d]">{label}</small>
      <b>{value}</b>
    </span>
  );
}
