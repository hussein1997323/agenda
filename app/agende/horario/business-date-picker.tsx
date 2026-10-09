"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  minimumDate: string;
  onChange: (value: string) => void;
};

const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const pad = (value: number) => String(value).padStart(2, "0");

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function formatValue(value: string) {
  if (!value) return "Selecione uma data";
  return parseDate(value).toLocaleDateString("pt-BR");
}

export default function BusinessDatePicker({
  value,
  minimumDate,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState("");
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function showCalendar() {
    setVisibleMonth((value || minimumDate).slice(0, 7));
    setOpen(true);
  }

  function changeMonth(offset: number) {
    const [year, month] = visibleMonth.split("-").map(Number);
    const next = new Date(year, month - 1 + offset, 1, 12);
    setVisibleMonth(`${next.getFullYear()}-${pad(next.getMonth() + 1)}`);
  }

  const [year, month] = (visibleMonth || minimumDate || "2000-01")
    .split("-")
    .map(Number);
  const firstWeekday = new Date(year, month - 1, 1, 12).getDay();
  const totalDays = new Date(year, month, 0, 12).getDate();
  const monthLabel = new Date(year, month - 1, 1, 12).toLocaleDateString(
    "pt-BR",
    { month: "long", year: "numeric" },
  );

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : showCalendar())}
        className="flex h-13 w-full items-center rounded-xl border border-[#dce2dc] bg-white px-4 text-left text-[15px] text-[#17231d] outline-none transition hover:border-[#1e8a57] focus:border-[#1e8a57] focus:ring-4 focus:ring-[#1e8a57]/10"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={value ? "font-semibold" : "text-[#7b867f]"}>
          {formatValue(value)}
        </span>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="ml-auto size-6 shrink-0 text-[#115d39]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M7 2v3M17 2v3M3.5 9h17M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Escolher data da retirada"
          className="absolute top-[calc(100%+8px)] left-0 z-30 w-[310px] max-w-[calc(100vw-48px)] rounded-2xl border border-[#dce2dc] bg-white p-4 shadow-[0_18px_50px_rgba(23,35,29,.18)]"
        >
          <div className="mb-4 flex items-center justify-between">
            <strong className="capitalize">{monthLabel}</strong>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="grid size-9 place-items-center rounded-lg text-xl hover:bg-[#eef4ef]"
                aria-label="Mês anterior"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="grid size-9 place-items-center rounded-lg text-xl hover:bg-[#eef4ef]"
                aria-label="Próximo mês"
              >
                ›
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center">
            {weekdays.map((weekday) => (
              <span
                key={weekday}
                className="pb-2 text-[10px] font-extrabold text-[#68756d]"
              >
                {weekday}
              </span>
            ))}
            {Array.from({ length: firstWeekday }, (_, index) => (
              <span key={`empty-${index}`} />
            ))}
            {Array.from({ length: totalDays }, (_, index) => {
              const day = index + 1;
              const dateValue = `${year}-${pad(month)}-${pad(day)}`;
              const weekday = new Date(year, month - 1, day, 12).getDay();
              const disabled =
                weekday === 0 ||
                weekday === 6 ||
                Boolean(minimumDate && dateValue < minimumDate);
              const selected = dateValue === value;
              return (
                <button
                  key={dateValue}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(dateValue);
                    setOpen(false);
                  }}
                  className={`mx-auto grid size-9 place-items-center rounded-lg text-sm transition ${selected ? "bg-[#115d39] font-extrabold text-white" : "hover:bg-[#e2f3e9]"} disabled:cursor-not-allowed disabled:text-[#bdc4bf] disabled:hover:bg-transparent`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#e5e9e6] pt-3">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-xs font-bold text-[#68756d] hover:underline"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(minimumDate);
                setVisibleMonth(minimumDate.slice(0, 7));
                setOpen(false);
              }}
              className="rounded-lg bg-[#e2f3e9] px-3 py-2 text-xs font-extrabold text-[#115d39]"
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
