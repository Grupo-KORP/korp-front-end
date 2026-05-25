// Importa os hooks do React usados para guardar estado e executar efeitos.
import { useState, useEffect } from "react";

// Cria um componente pequeno para mostrar o icone de lapis.
const IconeLapis = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
         m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

// Cria um componente pequeno para mostrar o icone de confirmado.
const IconeCheck = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
);

// Cria um componente pequeno para mostrar o icone de cancelar.
const IconeX = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

/* ── Campo somente leitura ── */
function CampoLeitura({ rotulo, valor, escuro, colSpan = 1 }) {
    // Define a cor do texto do label de acordo com o tema.
    const classeLabel = escuro ? "text-gray-500" : "text-gray-400";
    // Define o visual do input de acordo com o tema.
    const classeInput = escuro
        ? "bg-gray-800/80 border-gray-700 text-gray-200"
        : "bg-white border-gray-200 text-gray-700";

    // Retorna o campo pronto para ser exibido na tela.
    return (
        <div className={colSpan === 2 ? "col-span-2" : colSpan === 3 ? "col-span-3" : colSpan === 4 ? "col-span-4" : ""}>
            {/* Mostra o nome do campo. */}
            <label className={`block text-[9px] font-bold tracking-widest uppercase mb-1 ${classeLabel}`}>
                {rotulo}
            </label>
            {/* Mostra o valor em um input que nao pode ser editado. */}
            <input
                type="text"
                readOnly
                value={valor || ""}
                placeholder="—"
                className={`w-full px-3 py-1.5 rounded-lg border text-xs font-semibold
          cursor-default focus:outline-none transition-colors ${classeInput}`}
            />
        </div>
    );
}

/* ── Campo de quantidade editável ── */
function CampoQuantidade({ valor, modoEdicao, aoAlterar, escuro }) {
    // Define a cor do label conforme o tema.
    const classeLabel = escuro ? "text-gray-500" : "text-gray-400";
    // Guarda as classes que o input sempre vai usar.
    const classeBase = "w-full px-3 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none transition-all duration-200";
    // Define o estilo quando o campo esta somente para leitura.
    const classeLeitura = escuro
        ? "bg-gray-800/80 border-gray-700 text-gray-200 cursor-default"
        : "bg-white border-gray-200 text-gray-700 cursor-default";
    // Define o estilo quando o campo esta em modo de edicao.
    const classeEdicao = escuro
        ? "bg-blue-950/60 border-blue-500 text-white ring-1 ring-blue-500/40"
        : "bg-blue-50 border-blue-400 text-blue-900 ring-1 ring-blue-300/50";

    // Retorna o campo de quantidade.
    return (
        <div>
            {/* Label do campo quantidade. */}
            <label className={`block text-[9px] font-bold tracking-widest uppercase mb-1 ${classeLabel}`}>
                Quantidade
                {/* Mostra a etiqueta apenas quando o campo esta editavel. */}
                {modoEdicao && (
                    <span className={`ml-1.5 text-[8px] font-bold tracking-wider normal-case px-1.5 py-0.5 rounded-full
            ${escuro ? "bg-blue-900/60 text-blue-300" : "bg-blue-100 text-blue-600"}`}>
                        editável
                    </span>
                )}
            </label>
            {/* Input numerico da quantidade. */}
            <input
                type="number"
                min={1}
                value={valor}
                readOnly={!modoEdicao}
                onChange={(e) => aoAlterar(Number(e.target.value))}
                className={`${classeBase} ${modoEdicao ? classeEdicao : classeLeitura}`}
            />
        </div>
    );
}

/* Campo de texto editavel */
function CampoTextoEditavel({ rotulo, valor, modoEdicao, aoAlterar, escuro, colSpan = 1 }) {
    // Define a cor do label conforme o tema.
    const classeLabel = escuro ? "text-gray-500" : "text-gray-400";
    // Guarda as classes que o input sempre vai usar.
    const classeBase = "w-full px-3 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none transition-all duration-200";
    // Define o estilo quando o campo esta somente para leitura.
    const classeLeitura = escuro
        ? "bg-gray-800/80 border-gray-700 text-gray-200 cursor-default"
        : "bg-white border-gray-200 text-gray-700 cursor-default";
    // Define o estilo quando o campo esta em modo de edicao.
    const classeEdicao = escuro
        ? "bg-blue-950/60 border-blue-500 text-white ring-1 ring-blue-500/40"
        : "bg-blue-50 border-blue-400 text-blue-900 ring-1 ring-blue-300/50";

    return (
        <div className={colSpan === 2 ? "col-span-2" : colSpan === 3 ? "col-span-3" : colSpan === 4 ? "col-span-4" : ""}>
            <label className={`block text-[9px] font-bold tracking-widest uppercase mb-1 ${classeLabel}`}>
                {rotulo}
                {modoEdicao && (
                    <span className={`ml-1.5 text-[8px] font-bold tracking-wider normal-case px-1.5 py-0.5 rounded-full
            ${escuro ? "bg-blue-900/60 text-blue-300" : "bg-blue-100 text-blue-600"}`}>
                        editavel
                    </span>
                )}
            </label>
            <input
                type="text"
                value={valor}
                readOnly={!modoEdicao}
                onChange={(e) => aoAlterar(e.target.value)}
                placeholder="Distribuidora XYZ"
                className={`${classeBase} ${modoEdicao ? classeEdicao : classeLeitura}`}
            />
        </div>
    );
}

/* ── Cabeçalho de seção ── */
function CabecalhoSecao({ titulo, cor, escuro }) {
    // Retorna o titulo da secao com uma barra colorida ao lado.
    return (
        <div className="flex items-center gap-2 mb-3">
            {/* Barra colorida que ajuda a identificar a secao. */}
            <div className={`w-1 h-4 rounded-full ${cor}`} />
            {/* Texto do titulo da secao. */}
            <span className={`text-[10px] font-extrabold tracking-widest uppercase ${escuro ? "text-white" : "text-gray-900"}`}>
                {titulo}
            </span>
        </div>
    );
}

/* ══════════════════════════════════════════
   MODAL PRINCIPAL
══════════════════════════════════════════ */
export default function ModalDetalheVenda({ venda, mes, detalhesVenda, aoFechar, escuro }) {
    // Cria uma chave juntando o mes e o id da venda.
    const chave = `${mes}-${venda.id}`;
    // Busca os detalhes da venda usando a chave criada.
    const detalhes = detalhesVenda?.[chave];

    // Guarda a quantidade atual do produto.
    const [quantidade, setQuantidade] = useState(detalhes?.produto?.quantidade ?? 0);
    // Guarda se o modal esta em modo de edicao.
    const [modoEdicao, setModoEdicao] = useState(false);
    // Guarda a quantidade antiga para cancelar alteracoes.
    const [quantidadeAntes, setQuantidadeAntes] = useState(quantidade);
    // Guarda os nomes fantasia editaveis.
    const [nomeFantasiaCliente, setNomeFantasiaCliente] = useState(detalhes?.cliente?.nomeFantasia ?? "");
    const [nomeFantasiaDistribuidor, setNomeFantasiaDistribuidor] = useState(detalhes?.distribuidor?.nomeFantasia ?? "");
    // Guarda se cliente e distribuidor estao em modo de edicao.
    // Guarda os valores antigos para cancelar alteracoes.
    const [nomeFantasiaClienteAntes, setNomeFantasiaClienteAntes] = useState(nomeFantasiaCliente);
    const [nomeFantasiaDistribuidorAntes, setNomeFantasiaDistribuidorAntes] = useState(nomeFantasiaDistribuidor);

    // Atualiza os dados quando troca a venda aberta.
    useEffect(() => {
        // Pega a quantidade do produto ou usa zero se nao existir.
        const qtd = detalhes?.produto?.quantidade ?? 0;
        // Atualiza a quantidade exibida.
        setQuantidade(qtd);
        // Salva a quantidade original.
        setQuantidadeAntes(qtd);
        // Atualiza os nomes fantasia exibidos.
        const clienteFantasia = detalhes?.cliente?.nomeFantasia ?? "";
        const distribuidorFantasia = detalhes?.distribuidor?.nomeFantasia ?? "";
        setNomeFantasiaCliente(clienteFantasia);
        setNomeFantasiaDistribuidor(distribuidorFantasia);
        setNomeFantasiaClienteAntes(clienteFantasia);
        setNomeFantasiaDistribuidorAntes(distribuidorFantasia);
        // Sai do modo de edicao.
        setModoEdicao(false);
    }, [chave]);

    // Cria o atalho para fechar o modal com a tecla Escape.
    useEffect(() => {
        // Verifica qual tecla foi apertada.
        function aoApertarTecla(e) { if (e.key === "Escape") tentarFechar(); }
        // Adiciona o evento no documento.
        document.addEventListener("keydown", aoApertarTecla);
        // Remove o evento quando o componente desmonta.
        return () => document.removeEventListener("keydown", aoApertarTecla);
    }, [modoEdicao, quantidadeAntes, nomeFantasiaClienteAntes, nomeFantasiaDistribuidorAntes]);

    // Ativa a edicao e guarda o valor atual.
    function iniciarEdicao() {
        setQuantidadeAntes(quantidade);
        setNomeFantasiaClienteAntes(nomeFantasiaCliente);
        setNomeFantasiaDistribuidorAntes(nomeFantasiaDistribuidor);
        setModoEdicao(true);
    }
    // Confirma a edicao e fecha o modo editavel.
    function confirmarEdicao() { setModoEdicao(false); /* chamada à API aqui */ }
    // Cancela a edicao e volta para o valor anterior.
    function cancelarEdicao() {
        setQuantidade(quantidadeAntes);
        setNomeFantasiaCliente(nomeFantasiaClienteAntes);
        setNomeFantasiaDistribuidor(nomeFantasiaDistribuidorAntes);
        setModoEdicao(false);
    }
    // Fecha normalmente ou pergunta se deve descartar alteracoes em andamento.
    function tentarFechar() {
        if (!modoEdicao) {
            aoFechar();
            return;
        }

        const deveDescartar = window.confirm("Descartar alterações?");
        if (deveDescartar) {
            cancelarEdicao();
            aoFechar();
        }
    }

    // Define o fundo e a borda do card principal.
    const classeCard = escuro
        ? "bg-gray-800 border-gray-700"
        : "bg-gray-100 border-gray-300";
    // Define o fundo e a borda das secoes internas.
    const classeSecao = escuro ? "bg-gray-900/60 border-gray-700" : "bg-gray-50 border-gray-100";
    // Define a cor das bordas/separadores.
    const classeSeparador = escuro ? "border-gray-700" : "border-gray-100";

    // Retorna o modal completo para a tela.
    return (
        // Div principal que cobre a tela toda atras do modal.
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) tentarFechar(); }}
        >
            {/* Card principal que contem todas as informacoes da venda. */}
            <div
                className={`w-full max-w-[96vw] max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl border flex flex-col ${classeCard}`}
                style={{ animation: "modalEntrar 0.2s ease-out" }}
            >
                {/* ── Cabeçalho ── */}
                <div
                    className="flex items-center justify-between px-8 py-4 rounded-t-2xl flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #0f2557 0%, #1a3a7a 60%, #1e4d9b 100%)" }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                            <span className="text-xs font-extrabold text-white">{venda.id}</span>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold tracking-widest text-blue-200 uppercase">Detalhes da Venda</p>
                            <p className="text-sm font-extrabold text-white">{venda.nome} – {venda.cliente}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold tracking-wider px-3 py-1 rounded-full uppercase border
              ${venda.tipo === "liberada"
                                ? "bg-green-500/20 text-green-300 border-green-500/40"
                                : "bg-orange-500/20 text-orange-300 border-orange-500/40"}`}>
                            {venda.status}
                        </span>
                </div>
                </div>

                {/* ── Corpo ── */}
                <div className="modal-detalhe-scroll flex flex-col gap-4 p-8 overflow-y-auto flex-1 min-h-0">
                    {detalhes ? (
                        <>
                            {/* Cliente e distribuidor*/}
                            <div className="grid grid-cols-2 gap-4">

                                {/* Dados do Cliente */}
                                <div className={`rounded-xl border p-5 ${classeSecao}`}>
                                    <CabecalhoSecao titulo="Dados do Cliente" cor="bg-blue-600" escuro={escuro} />
                                    <div className="grid grid-cols-2 gap-x-5 gap-y-3">
                                        <CampoLeitura rotulo="Razão Social" valor={detalhes.cliente.razaoSocial} escuro={escuro} colSpan={2} />
                                        <CampoTextoEditavel
                                            rotulo="Nome Fantasia"
                                            valor={nomeFantasiaCliente}
                                            modoEdicao={modoEdicao}
                                            aoAlterar={setNomeFantasiaCliente}
                                            escuro={escuro}
                                            colSpan={2}
                                        />
                                        <CampoLeitura rotulo="CNPJ" valor={detalhes.cliente.cnpj} escuro={escuro} />
                                        <CampoLeitura rotulo="Inscrição Estadual" valor={detalhes.cliente.inscricaoEstadual} escuro={escuro} />
                                        <CampoLeitura rotulo="Telefone" valor={detalhes.cliente.telefone} escuro={escuro} />
                                        <CampoLeitura rotulo="CEP" valor={detalhes.cliente.cep} escuro={escuro} />
                                        <CampoLeitura rotulo="Endereço" valor={detalhes.cliente.endereco} escuro={escuro} colSpan={2} />
                                        <CampoLeitura rotulo="Cidade" valor={detalhes.cliente.cidade} escuro={escuro} />
                                        <CampoLeitura rotulo="UF" valor={detalhes.cliente.uf} escuro={escuro} />
                                        <CampoLeitura rotulo="Contato" valor={detalhes.cliente.contato} escuro={escuro} />
                                        <CampoLeitura rotulo="E-mail" valor={detalhes.cliente.email} escuro={escuro} colSpan={2} />
                                    </div>
                                </div>

                                {/* Dados do Distribuidor */}
                                <div className={`rounded-xl border p-5 ${classeSecao}`}>
                                    <CabecalhoSecao titulo="Dados do Distribuidor" cor="bg-indigo-500" escuro={escuro} />
                                    <div className="grid grid-cols-2 gap-x-5 gap-y-3">
                                        <CampoLeitura rotulo="Razão Social" valor={detalhes.distribuidor.razaoSocial} escuro={escuro} colSpan={2} />
                                        <CampoTextoEditavel
                                            rotulo="Nome Fantasia"
                                            valor={nomeFantasiaDistribuidor}
                                            modoEdicao={modoEdicao}
                                            aoAlterar={setNomeFantasiaDistribuidor}
                                            escuro={escuro}
                                            colSpan={2}
                                        />
                                        <CampoLeitura rotulo="CNPJ" valor={detalhes.distribuidor.cnpj} escuro={escuro} />
                                        <CampoLeitura rotulo="Inscrição Estadual" valor={detalhes.distribuidor.inscricaoEstadual} escuro={escuro} />
                                        <CampoLeitura rotulo="Telefone" valor={detalhes.distribuidor.telefone} escuro={escuro} />
                                        <CampoLeitura rotulo="CEP" valor={detalhes.distribuidor.cep} escuro={escuro} />
                                        <CampoLeitura rotulo="Endereço" valor={detalhes.distribuidor.endereco} escuro={escuro} colSpan={2} />
                                        <CampoLeitura rotulo="Cidade" valor={detalhes.distribuidor.cidade} escuro={escuro} />
                                        <CampoLeitura rotulo="UF" valor={detalhes.distribuidor.uf} escuro={escuro} />
                                        <CampoLeitura rotulo="Contato" valor={detalhes.distribuidor.contato} escuro={escuro} />
                                        <CampoLeitura rotulo="E-mail" valor={detalhes.distribuidor.email} escuro={escuro} colSpan={2} />
                                    </div>
                                </div>
                            </div>

                            {/* Dados do Produto */}
                            <div className={`rounded-xl border p-5 ${classeSecao}`}>
                                <CabecalhoSecao titulo="Dados do Produto" cor="bg-cyan-500" escuro={escuro} />

                                <div className="flex flex-col gap-4">
                                    {/* Descrição ocupa toda a linha */}
                                    <CampoLeitura
                                        rotulo="Descrição do Produto"
                                        valor={detalhes.produto.descricao}
                                        escuro={escuro}
                                        colSpan={4}
                                    />

                                    <div className={`w-full h-px ${classeSeparador}`} />

                                    {/* 4 colunas aproveitando a largura */}
                                    <div className="grid grid-cols-4 gap-x-5 gap-y-3">
                                        <CampoLeitura rotulo="P/N" valor={detalhes.produto.pn} escuro={escuro} />
                                        <CampoLeitura rotulo="Entrega" valor={detalhes.produto.entrega} escuro={escuro} />
                                        <CampoQuantidade
                                            valor={quantidade}
                                            modoEdicao={modoEdicao}
                                            aoAlterar={setQuantidade}
                                            escuro={escuro}
                                        />
                                        <CampoLeitura rotulo="Valor Unitário" valor={detalhes.produto.valorUnitario} escuro={escuro} />
                                        <CampoLeitura rotulo="Valor Total" valor={detalhes.produto.valorTotal} escuro={escuro} />
                                    </div>

                                    <div className={`w-full h-px ${classeSeparador}`} />


                                    <div
                                        className="rounded-xl p-4 grid grid-cols-4 gap-x-5 gap-y-3 items-end"
                                        style={{
                                            background: escuro
                                                ? "linear-gradient(135deg, rgba(15,37,87,0.13) 0%, rgba(26,58,122,0.09) 100%)"
                                                : "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%)",
                                            border: escuro
                                                ? "1px solid rgba(59,130,246,0.45)"
                                                : "1px solid rgba(96,165,250,0.85)",
                                        }}
                                    >
                                        <div className="col-span-4 mb-0.5">
                                            <span className="text-[9px] font-extrabold tracking-widest uppercase text-blue-400">
                                                Valores Faturados
                                            </span>
                                        </div>
                                        <CampoLeitura rotulo="Valor Unitário Faturado" valor={detalhes.produto.valorUnitarioFaturado} escuro={escuro} />
                                        <CampoLeitura rotulo="Total Faturado" valor={detalhes.produto.totalFaturado} escuro={escuro} />
                                        <CampoLeitura
                                            rotulo="Total de Comissão Bruta"
                                            valor={venda.comissao}
                                            escuro={escuro}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── Parcelas (CONFERIR COM O GRUPO) */}
                            {venda.parcelas?.length > 0 && (
                                <div className={`rounded-xl border p-5 ${classeSecao}`}>
                                    <CabecalhoSecao titulo="Parcelas desta Venda" cor="bg-emerald-500" escuro={escuro} />
                                    <div className="grid grid-cols-3 gap-3">
                                        {venda.parcelas.map((parcela, indice) => (
                                            <div
                                                key={indice}
                                                className={`flex items-center justify-between px-4 py-2.5 rounded-lg border ${classeSeparador}
                          ${escuro ? "bg-gray-800" : "bg-white"}`}
                                            >
                                                <span className={`text-xs ${escuro ? "text-gray-400" : "text-gray-400"}`}>{parcela.label}</span>
                                                <span className={`text-sm font-bold ${escuro ? "text-gray-200" : "text-gray-700"}`}>{parcela.valor}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={`rounded-xl border p-8 text-center ${classeSecao}`}>
                            <p className="text-sm text-gray-400">Detalhes não disponíveis para esta venda.</p>
                        </div>
                    )}
                </div>

                {/* ── Rodapé ── */}
                <div className={`flex justify-end gap-2 px-8 py-4 border-t flex-shrink-0 ${classeSeparador}`}>
                    {modoEdicao && (
                        <p className={`text-[10px] mr-auto flex items-center gap-1.5
              ${escuro ? "text-blue-400" : "text-blue-500"}`}>
                            <IconeLapis />
                            Nome fantasia e quantidade podem ser editados
                        </p>
                    )}
                    {modoEdicao ? (
                        <button
                            onClick={confirmarEdicao}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all
              bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <IconeCheck />
                            Salvar
                        </button>
                    ) : (
                        <button
                            onClick={iniciarEdicao}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all border
              bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                        >
                            <IconeLapis />
                            Editar Informações
                        </button>
                    )}
                    <button
                        onClick={tentarFechar}
                        className="px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all
              bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Fechar
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes modalEntrar {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .modal-detalhe-scroll {
          scrollbar-width: thin;
          scrollbar-color: ${escuro ? "#6b7280 #1f2937" : "#9ca3af #e5e7eb"};
        }

        .modal-detalhe-scroll::-webkit-scrollbar {
          width: 10px;
        }

        .modal-detalhe-scroll::-webkit-scrollbar-button {
          -webkit-appearance: none;
          appearance: none;
          display: none;
          width: 0;
          height: 0;
          background: transparent;
        }

        .modal-detalhe-scroll::-webkit-scrollbar-button:single-button,
        .modal-detalhe-scroll::-webkit-scrollbar-button:vertical:start:decrement,
        .modal-detalhe-scroll::-webkit-scrollbar-button:vertical:start:increment,
        .modal-detalhe-scroll::-webkit-scrollbar-button:vertical:end:decrement,
        .modal-detalhe-scroll::-webkit-scrollbar-button:vertical:end:increment,
        .modal-detalhe-scroll::-webkit-scrollbar-button:horizontal:start:decrement,
        .modal-detalhe-scroll::-webkit-scrollbar-button:horizontal:start:increment,
        .modal-detalhe-scroll::-webkit-scrollbar-button:horizontal:end:decrement,
        .modal-detalhe-scroll::-webkit-scrollbar-button:horizontal:end:increment {
          -webkit-appearance: none;
          appearance: none;
          display: none;
          width: 0;
          height: 0;
          min-width: 0;
          min-height: 0;
          background: transparent;
        }

        .modal-detalhe-scroll::-webkit-scrollbar-track {
          background: ${escuro ? "#1f2937" : "#e5e7eb"};
          border-radius: 0 16px 16px 0;
          margin: 14px 0;
        }

        .modal-detalhe-scroll::-webkit-scrollbar-thumb {
          background: ${escuro
                ? "linear-gradient(180deg, #9ca3af 0%, #6b7280 100%)"
                : "linear-gradient(180deg, #d1d5db 0%, #9ca3af 100%)"};
          border: 2px solid ${escuro ? "#1f2937" : "#e5e7eb"};
          border-radius: 999px;
          min-height: 42px;
        }

        .modal-detalhe-scroll::-webkit-scrollbar-thumb:hover {
          background: ${escuro
                ? "linear-gradient(180deg, #d1d5db 0%, #9ca3af 100%)"
                : "linear-gradient(180deg, #9ca3af 0%, #6b7280 100%)"};
        }
      `}</style>
        </div>
    );
}

