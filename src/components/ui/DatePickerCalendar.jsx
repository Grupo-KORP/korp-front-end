import { calendarStyles } from "./calendarStyles.js";
import { useState, useRef, useEffect } from "react";

const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_PT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

const ANO_MIN = 2026;

export default function DatePickerCalendar({ selecao, aoSelecionar, dark }) {
  const cores = calendarStyles(dark);
  const [aberto, setAberto] = useState(false);
  const [mode, setMode] = useState("day");
  const [view, setView] = useState("day");
  const [cursor, setCursor] = useState(new Date());
  const [temp, setTemp] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    function fechar(e) {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false);
    }
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, []);

  function trocarMode(m) {
    setMode(m);
    setView(m === "month" ? "month" : "day");
    setTemp(null);
  }

  function navPrev() {
    if (view === "day") {
      const nova = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
      if (nova >= new Date(ANO_MIN, 0, 1)) setCursor(nova);
    } else if (view === "month") {
      if (cursor.getFullYear() > ANO_MIN) setCursor(new Date(cursor.getFullYear() - 1, 0, 1));
    } else {
      const base = ANO_MIN + Math.floor((cursor.getFullYear() - ANO_MIN) / 12) * 12;
      if (base > ANO_MIN) setCursor(new Date(cursor.getFullYear() - 12, 0, 1));
    }
  }

  function navNext() {
    if (view === "day") setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
    else if (view === "month") setCursor(new Date(cursor.getFullYear() + 1, 0, 1));
    else setCursor(new Date(cursor.getFullYear() + 12, 0, 1));
  }

  function selDay(d) { setTemp({ type: "day", d, m: cursor.getMonth(), y: cursor.getFullYear() }); }
  function selMonth(m) {
    if (mode === "month") { setTemp({ type: "month", m, y: cursor.getFullYear() }); }
    else { setCursor(new Date(cursor.getFullYear(), m, 1)); setView("day"); }
  }
  function selYear(y) {
    if (y < ANO_MIN) return;
    setCursor(new Date(y, cursor.getMonth(), 1));
    setView(mode === "month" ? "month" : "day");
  }

  function confirmar() {
    if (!temp) return;
    aoSelecionar(temp);
    setAberto(false);
  }

  function limpar() { setTemp(null); aoSelecionar(null); }

  const label = selecao
    ? selecao.type === "day"
      ? `${selecao.d} de ${MESES_PT[selecao.m]} de ${selecao.y}`
      : `${MESES_PT[selecao.m]} de ${selecao.y}`
    : "Selecionar data";

  const today = new Date();
  const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const base = ANO_MIN + Math.floor((cursor.getFullYear() - ANO_MIN) / 12) * 12;

  // Desabilita seta esquerda quando já estamos no limite
  const prevDesabilitado =
    (view === "day" && cursor.getFullYear() === ANO_MIN && cursor.getMonth() === 0) ||
    (view === "month" && cursor.getFullYear() <= ANO_MIN) ||
    (view === "year" && base <= ANO_MIN);

  const titleMap = {
    day: `${MESES_PT[cursor.getMonth()]} ${cursor.getFullYear()}`,
    month: `${cursor.getFullYear()}`,
    year: `${base} – ${base + 11}`,
  };

  const btn = (ativo) => `flex-1 py-1.5 text-xs font-medium rounded-md transition-colors
    ${ativo
      ? cores.selected
      : `${cores.text} ${cores.hover}`
    }`;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setAberto(p => !p)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors shadow-sm
          ${cores.trigger} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {label}
        <svg className={`w-4 h-4 transition-transform ${aberto ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {aberto && (
        <div className={`absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl z-30 p-4
          ${dark ? "bg-gray-800 border border-gray-700 shadow-lg" : "bg-white border border-gray-100 shadow-lg"}`}>

          {/* Toggle */}
          <div className={`flex gap-1 p-1 rounded-lg mb-3 ${dark ? "bg-gray-700/50" : "bg-gray-100"}`}>
            <button onClick={() => trocarMode("day")} className={btn(mode === "day")}>Por dia</button>
            <button onClick={() => trocarMode("month")} className={btn(mode === "month")}>Por mês</button>
          </div>

          {/* Header nav */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={navPrev} disabled={prevDesabilitado}
              className={`p-1.5 rounded-lg text-xl leading-none transition-colors
                ${prevDesabilitado
                  ? "opacity-25 cursor-not-allowed"
                  : `${cores.text} ${cores.hover}`}`}>
              ‹
            </button>
            <button onClick={() => setView(v => v === "year" ? mode : "year")}
              className={`text-sm font-medium px-3 py-1 rounded-lg ${cores.text} ${cores.hover}`}>
              {titleMap[view]}
            </button>
            <button onClick={navNext}
              className={`p-1.5 rounded-lg text-xl leading-none ${cores.text} ${cores.hover}`}>
              ›
            </button>
          </div>

          {/* Dias */}
          {mode === "day" && view === "day" && (
            <div className="grid grid-cols-7 gap-0.5">
              {DIAS_PT.map(d => (
                <div key={d} className={`text-center text-[10px] font-medium py-1 ${dark ? "text-gray-500" : "text-gray-400"}`}>{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1;
                const isToday = today.getDate() === d && today.getMonth() === cursor.getMonth() && today.getFullYear() === cursor.getFullYear();
                const isSel = temp?.type === "day" && temp.d === d && temp.m === cursor.getMonth() && temp.y === cursor.getFullYear();
                return (
                  <button key={d} onClick={() => selDay(d)}
                    className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-colors
                      ${isSel ? cores.selected
                        : isToday ? `${cores.today} ${cores.hover}`
                        : `${cores.text} ${cores.hover}`}`}>
                    {d}
                  </button>
                );
              })}
            </div>
          )}

          {/* Anos */}
          {view === "year" && (
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 12 }).map((_, i) => {
                const y = base + i;
                const isSel = temp?.y === y;
                const desabilitado = y < ANO_MIN;
                return (
                  <button key={y} onClick={() => selYear(y)} disabled={desabilitado}
                    className={`py-2 text-xs rounded-lg transition-colors
                      ${desabilitado ? "opacity-25 cursor-not-allowed"
                        : isSel ? cores.selected
                        : `${cores.text} ${cores.hover}`}`}>
                    {y}
                  </button>
                );
              })}
            </div>
          )}

          {/* Meses */}
          {view === "month" && (
            <div className="grid grid-cols-3 gap-1.5">
              {MESES_PT.map((mn, i) => {
                const isSel = temp?.type === "month" && temp.m === i && temp.y === cursor.getFullYear();
                return (
                  <button key={mn} onClick={() => selMonth(i)}
                    className={`py-2 text-xs rounded-lg transition-colors
                      ${isSel ? cores.selected
                        : `${cores.text} ${cores.hover}`}`}>
                    {mn.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className={`flex items-center justify-between mt-3 pt-3 border-t ${dark ? "border-gray-700" : "border-gray-100"}`}>
            <button onClick={limpar} className={`text-xs ${cores.text} ${cores.hover}`}>
              Limpar
            </button>
            <button onClick={confirmar}
              className={`text-xs font-medium px-4 py-1.5 rounded-lg ${cores.confirm}`}>
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
