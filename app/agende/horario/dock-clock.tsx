"use client";

type Slot = {
  horario_inicio: string;
  horario_saida: string;
};

type DockClockProps = {
  slots: Slot[];
  selected: Slot | null;
  onSelect: (slot: Slot) => void;
};

const CENTER = 180;
const RADIUS = 126;

function time(iso: string) {
  return iso.slice(11, 16);
}

function minutesOfDay(iso: string) {
  const [hour, minute] = time(iso).split(":").map(Number);
  return hour * 60 + minute;
}

function point(minutes: number, radius = RADIUS) {
  const angle = (minutes / 1440) * Math.PI * 2 - Math.PI / 2;
  return {
    x: CENTER + Math.cos(angle) * radius,
    y: CENTER + Math.sin(angle) * radius,
  };
}

function durationInMinutes(slot: Slot) {
  return Math.max(
    0,
    Math.round(
      (new Date(slot.horario_saida).getTime() -
        new Date(slot.horario_inicio).getTime()) /
        60000,
    ),
  );
}

function arcPath(start: number, duration: number) {
  const end = start + Math.max(duration, 1);
  const startPoint = point(start);
  const endPoint = point(end);
  const largeArc = duration > 720 ? 1 : 0;
  return `M ${startPoint.x} ${startPoint.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${endPoint.x} ${endPoint.y}`;
}

export default function DockClock({
  slots,
  selected,
  onSelect,
}: DockClockProps) {
  const active = selected ?? slots[0] ?? null;
  const start = active ? minutesOfDay(active.horario_inicio) : 0;
  const duration = active ? durationInMinutes(active) : 0;
  const endPoint = active ? point(start + duration) : null;

  return (
    <div className="my-5 rounded-2xl border border-[#dce2dc] bg-[#f8faff] px-3 py-6 sm:px-6">
      <div className="text-center">
        <h3 className="text-lg font-extrabold">Seu horário na doca</h3>
        <p className="mt-1 text-sm text-[#68758a]">
          Relógio de 24 horas · clique em um ponto azul
        </p>
      </div>

      <div className="mx-auto mt-2 max-w-[430px]">
        <svg
          viewBox="0 0 360 360"
          className="h-auto w-full overflow-visible"
          aria-label="Relógio de horários disponíveis na doca"
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="white"
            stroke="#e4eaf3"
            strokeWidth="20"
          />

          {Array.from({ length: 24 }, (_, hour) => {
            const inner = point(hour * 60, hour % 6 === 0 ? 143 : 146);
            const outer = point(hour * 60, 151);
            const label = point(hour * 60, 166);
            return (
              <g key={hour}>
                <line
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="#a9bdd9"
                  strokeWidth={hour % 6 === 0 ? 2 : 1}
                />
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={hour % 6 === 0 ? "#06152e" : "#57739c"}
                  fontSize={hour % 6 === 0 ? 12 : 9}
                  fontWeight={hour % 6 === 0 ? 800 : 500}
                >
                  {String(hour).padStart(2, "0")}
                </text>
              </g>
            );
          })}

          {active && (
            <>
              <path
                d={arcPath(start, duration)}
                fill="none"
                stroke="#2567c9"
                strokeWidth="19"
                strokeLinecap="round"
              />
              {endPoint && (
                <circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r="7"
                  fill="#1eaa7a"
                  stroke="white"
                  strokeWidth="3"
                />
              )}
            </>
          )}

          {slots.map((slot) => {
            const dot = point(minutesOfDay(slot.horario_inicio));
            const isSelected =
              active?.horario_inicio === slot.horario_inicio;
            return (
              <circle
                key={slot.horario_inicio}
                cx={dot.x}
                cy={dot.y}
                r={isSelected ? 7 : 5}
                fill={isSelected ? "white" : "#9dc6f5"}
                stroke={isSelected ? "#2567c9" : "white"}
                strokeWidth={isSelected ? 4 : 2}
                className="cursor-pointer outline-none"
                role="button"
                tabIndex={0}
                aria-label={`Selecionar ${time(slot.horario_inicio)} até ${time(slot.horario_saida)}`}
                onClick={() => onSelect(slot)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(slot);
                  }
                }}
              />
            );
          })}

          <text
            x={CENTER}
            y="150"
            textAnchor="middle"
            fill="#7183a0"
            fontSize="9"
            letterSpacing="1.5"
          >
            {active ? "INÍCIO ESCOLHIDO" : "SEM HORÁRIOS"}
          </text>
          <text
            x={CENTER}
            y="184"
            textAnchor="middle"
            fill="#07142a"
            fontSize="32"
            fontWeight="800"
          >
            {active ? time(active.horario_inicio) : "--:--"}
          </text>
          <text
            x={CENTER}
            y="207"
            textAnchor="middle"
            fill="#2567c9"
            fontSize="12"
            fontWeight="600"
          >
            {active ? `Até ${time(active.horario_saida)}` : "Nenhuma disponibilidade"}
          </text>
          {active && (
            <text
              x={CENTER}
              y="230"
              textAnchor="middle"
              fill="#50627e"
              fontSize="10"
            >
              {duration} min previstos
            </text>
          )}
        </svg>
      </div>

      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-[#50627e]">
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-full bg-[#9dc6f5]" />
          Inícios disponíveis
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-full bg-[#2567c9]" />
          Período escolhido
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-full bg-[#1eaa7a]" />
          Saída prevista
        </span>
      </div>
      <p className="mt-5 text-center text-xs text-[#50627e]">
        A saída é calculada automaticamente conforme o tempo previsto pela
        agenda.
      </p>
    </div>
  );
}
