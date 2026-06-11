import { useState, useRef, useEffect } from "react";

const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_PT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

const ANO_MIN = 2026;

export default function DatePickerCalendar({ selecao, aoSelecionar, dark }) {
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
    } else if (view === "month" || mode === "month") {
      if (cursor.getFullYear() > ANO_MIN) setCursor(new Date(cursor.getFullYear() - 1, 0, 1));
    } else {
      const base = Math.floor(cursor.getFullYear() / 12) * 12;
      if (base > ANO_MIN) setCursor(new Date(cursor.getFullYear() - 12, 0, 1));
    }
  }

  function navNext() {
    if (view === "day") setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
    else if (view === "month" || mode === "month") setCursor(new Date(cursor.getFullYear() + 1, 0, 1));
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
    setView("day");
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
  const base = Math.floor(cursor.getFullYear() / 12) * 12;

  // Desabilita seta esquerda quando já estamos no limite
  const prevDesabilitado =
    (view === "day" && cursor.getFullYear() === ANO_MIN && cursor.getMonth() === 0) ||
    (view === "month" && cursor.getFullYear() <= ANO_MIN) ||
    (mode === "month" && cursor.getFullYear() <= ANO_MIN) ||
    (view === "year" && base <= ANO_MIN);

  const titleMap = {
    day: `${MESES_PT[cursor.getMonth()]} ${cursor.getFullYear()}`,
    month: `${cursor.getFullYear()}`,
    year: `${base} – ${base + 11}`,
  };

  const btn = (ativo) => `flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors
    ${ativo
      ? dark ? "bg-gray-700 text-white" : "bg-white text-gray-800 shadow-sm"
      : dark ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
    }`;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setAberto(p => !p)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-colors shadow-sm
          ${dark ? "border-gray-600 bg-gray-800 text-gray-300 hover:border-blue-500 hover:text-blue-400"
                 : "border-gray-200 bg-white text-gray-500 hover:border-blue-300 hover:text-blue-600"}`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {label}
        <svg className={`w-4 h-4 transition-transform ${aberto ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {aberto && (
        <div className={`absolute right-0 mt-2 w-72 rounded-2xl z-30 p-4
          ${dark ? "bg-gray-800 border border-gray-700 shadow-xl" : "bg-white border border-gray-100 shadow-xl"}`}>

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
                  : dark ? "text-gray-400 hover:bg-gray-700" : "text-gray-400 hover:bg-gray-100"}`}>
              ‹
            </button>
            <button onClick={() => mode !== "month" && setView(v => v === "day" ? "year" : "day")}
              className={`text-sm font-semibold px-3 py-1 rounded-lg ${dark ? "text-white hover:bg-gray-700" : "text-gray-800 hover:bg-gray-100"}`}>
              {titleMap[mode === "month" ? "month" : view]}
            </button>
            <button onClick={navNext}
              className={`p-1.5 rounded-lg text-xl leading-none ${dark ? "text-gray-400 hover:bg-gray-700" : "text-gray-400 hover:bg-gray-100"}`}>
              ›
            </button>
          </div>

          {/* Dias */}
          {mode === "day" && view === "day" && (
            <div className="grid grid-cols-7 gap-0.5">
              {DIAS_PT.map(d => (
                <div key={d} className={`text-center text-[10px] font-bold py-1 ${dark ? "text-gray-500" : "text-gray-400"}`}>{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1;
                const isToday = today.getDate() === d && today.getMonth() === cursor.getMonth() && today.getFullYear() === cursor.getFullYear();
                const isSel = temp?.type === "day" && temp.d === d && temp.m === cursor.getMonth() && temp.y === cursor.getFullYear();
                return (
                  <button key={d} onClick={() => selDay(d)}
                    className={`aspect-square flex items-center justify-center text-xs rounded-lg transition-colors
                      ${isSel ? "bg-blue-700 text-white font-semibold"
                        : isToday ? `border border-blue-500 ${dark ? "text-blue-400" : "text-blue-600"}`
                        : dark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}>
                    {d}
                  </button>
                );
              })}
            </div>
          )}

          {/* Anos (modo dia) */}
          {mode === "day" && view === "year" && (
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 12 }).map((_, i) => {
                const y = base + i;
                const isSel = temp?.y === y;
                const desabilitado = y < ANO_MIN;
                return (
                  <button key={y} onClick={() => selYear(y)} disabled={desabilitado}
                    className={`py-2 text-xs rounded-lg transition-colors
                      ${desabilitado ? "opacity-25 cursor-not-allowed"
                        : isSel ? "bg-blue-700 text-white font-semibold"
                        : dark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}>
                    {y}
                  </button>
                );
              })}
            </div>
          )}

          {/* Meses */}
          {mode === "month" && (
            <div className="grid grid-cols-3 gap-1.5">
              {MESES_PT.map((mn, i) => {
                const isSel = temp?.type === "month" && temp.m === i && temp.y === cursor.getFullYear();
                return (
                  <button key={mn} onClick={() => selMonth(i)}
                    className={`py-2 text-xs rounded-lg transition-colors
                      ${isSel ? "bg-blue-700 text-white font-semibold"
                        : dark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}`}>
                    {mn.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className={`flex items-center justify-between mt-3 pt-3 border-t ${dark ? "border-gray-700" : "border-gray-100"}`}>
            <button onClick={limpar} className={`text-xs ${dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}>
              Limpar
            </button>
            <button onClick={confirmar}
              className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors">
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}