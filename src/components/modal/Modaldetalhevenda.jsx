// Importa os hooks do React usados para guardar estado e executar efeitos.
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { atualizarPedido } from "../../services/api";

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
    const classeLabel = escuro ? "text-gray-500" : "text-gray-400";
    const classeInput = escuro
        ? "bg-gray-800/80 border-gray-700 text-gray-200"
        : "bg-white border-gray-200 text-gray-700";

    return (
        <div className={colSpan === 2 ? "col-span-2" : colSpan === 3 ? "col-span-3" : colSpan === 4 ? "col-span-4" : ""}>
            <label className={`block text-[9px] font-bold tracking-widest uppercase mb-1 ${classeLabel}`}>
                {rotulo}
            </label>
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
function CampoQuantidade({ valor, modoEdicao, aoAlterar, escuro, rotulo = "Quantidade" }) {
    // Define a cor do label conforme o tema.
    const classeLabel = escuro ? "text-gray-500" : "text-gray-400";
    const classeBase = "w-full px-3 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none transition-all duration-200";
    const classeLeitura = escuro
        ? "bg-gray-800/80 border-gray-700 text-gray-200 cursor-default"
        : "bg-white border-gray-200 text-gray-700 cursor-default";
    const classeEdicao = escuro
        ? "bg-blue-950/60 border-blue-500 text-white ring-1 ring-blue-500/40"
        : "bg-blue-50 border-blue-400 text-blue-900 ring-1 ring-blue-300/50";

    return (
        <div>
            <label className={`block text-[9px] font-bold tracking-widest uppercase mb-1 ${classeLabel}`}>
                {rotulo}
                {/* Mostra a etiqueta apenas quando o campo esta editavel. */}
                {modoEdicao && (
                    <span className={`ml-1.5 text-[8px] font-bold tracking-wider normal-case px-1.5 py-0.5 rounded-full
            ${escuro ? "bg-blue-900/60 text-blue-300" : "bg-blue-100 text-blue-600"}`}>
                        editável
                    </span>
                )}
            </label>
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
function CampoTextoEditavel({ rotulo, valor, modoEdicao, aoAlterar, escuro, colSpan = 1, placeholder = "" }) {
    const classeLabel = escuro ? "text-gray-500" : "text-gray-400";
    const classeBase = "w-full px-3 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none transition-all duration-200";
    const classeLeitura = escuro
        ? "bg-gray-800/80 border-gray-700 text-gray-200 cursor-default"
        : "bg-white border-gray-200 text-gray-700 cursor-default";
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
                        editável
                    </span>
                )}
            </label>
            <input
                type="text"
                value={valor}
                readOnly={!modoEdicao}
                onChange={(e) => aoAlterar(e.target.value)}
                placeholder={placeholder || "—"}
                className={`${classeBase} ${modoEdicao ? classeEdicao : classeLeitura}`}
            />
        </div>
    );
}

/* ── Cabeçalho de seção ── */
function CabecalhoSecao({ titulo, cor, escuro }) {
    return (
        <div className="flex items-center gap-2 mb-3">
            <div className={`w-1 h-4 rounded-full ${cor}`} />
            <span className={`text-[10px] font-extrabold tracking-widest uppercase ${escuro ? "text-white" : "text-gray-900"}`}>
                {titulo}
            </span>
        </div>
    );
}

/* ══════════════════════════════════════════
   MODAL PRINCIPAL
══════════════════════════════════════════ */
export default function ModalDetalheVenda({ venda, mes, detalhesVenda, aoFechar, aoAtualizar, escuro }) {
    // Cria uma chave juntando o mes e o id da venda.
    const chave = `${mes}-${venda.id}`;
    const detalhes = detalhesVenda?.[chave];

    // Quantidade
    const [quantidade, setQuantidade] = useState(detalhes?.produto?.quantidade ?? 0);
    const [quantidadeAntes, setQuantidadeAntes] = useState(quantidade);

    // Modo de edição
    const [modoEdicao, setModoEdicao] = useState(false);

    // Nome fantasia do cliente
    const [nomeFantasiaCliente, setNomeFantasiaCliente] = useState(detalhes?.cliente?.nomeFantasia ?? "");
    const [nomeFantasiaDistribuidor, setNomeFantasiaDistribuidor] = useState(detalhes?.distribuidor?.nomeFantasia ?? "");
    const [numeroNotaDistribuidor, setNumeroNotaDistribuidor] = useState(detalhes?.pedido?.numeroNotaDistribuidor ?? "");
    const [observacoes, setObservacoes] = useState(detalhes?.pedido?.observacoes ?? "");
    const [metodoPagamento, setMetodoPagamento] = useState(detalhes?.pedido?.metodoPagamento ?? "CARTAO_CREDITO");
    const [quantidadeParcelas, setQuantidadeParcelas] = useState(detalhes?.pedido?.quantidadeParcelas ?? 1);
    const [salvando, setSalvando] = useState(false);
    // Guarda se cliente e distribuidor estao em modo de edicao.
    // Guarda os valores antigos para cancelar alteracoes.
    const [nomeFantasiaClienteAntes, setNomeFantasiaClienteAntes] = useState(nomeFantasiaCliente);

    // Nome fantasia do distribuidor
    const [nomeFantasiaDistribuidorAntes, setNomeFantasiaDistribuidorAntes] = useState(nomeFantasiaDistribuidor);
    const [numeroNotaDistribuidorAntes, setNumeroNotaDistribuidorAntes] = useState(numeroNotaDistribuidor);
    const [observacoesAntes, setObservacoesAntes] = useState(observacoes);
    const [metodoPagamentoAntes, setMetodoPagamentoAntes] = useState(metodoPagamento);
    const [quantidadeParcelasAntes, setQuantidadeParcelasAntes] = useState(quantidadeParcelas);
    const pedidoEmAndamento = (detalhes?.pedido?.statusPedido ?? "").toUpperCase() === "EM_ANDAMENTO";

    // Entrega
    const [entrega, setEntrega] = useState(detalhes?.produto?.entrega ?? "");
    const [entregaAntes, setEntregaAntes] = useState(entrega);

    // Atualiza os dados quando troca a venda aberta.
    useEffect(() => {
        const qtd = detalhes?.produto?.quantidade ?? 0;
        setQuantidade(qtd);
        setQuantidadeAntes(qtd);

        const clienteFantasia = detalhes?.cliente?.nomeFantasia ?? "";
        const distribuidorFantasia = detalhes?.distribuidor?.nomeFantasia ?? "";
        const nota = detalhes?.pedido?.numeroNotaDistribuidor ?? "";
        const obs = detalhes?.pedido?.observacoes ?? "";
        const metodo = detalhes?.pedido?.metodoPagamento ?? "CARTAO_CREDITO";
        const parcelas = detalhes?.pedido?.quantidadeParcelas ?? 1;
        setNomeFantasiaCliente(clienteFantasia);
        setNomeFantasiaDistribuidor(distribuidorFantasia);
        setNomeFantasiaClienteAntes(clienteFantasia);
        setNomeFantasiaDistribuidorAntes(distribuidorFantasia);
        setNumeroNotaDistribuidor(nota);
        setObservacoes(obs);
        setMetodoPagamento(metodo);
        setQuantidadeParcelas(parcelas);
        setNumeroNotaDistribuidorAntes(nota);
        setObservacoesAntes(obs);
        setMetodoPagamentoAntes(metodo);
        setQuantidadeParcelasAntes(parcelas);

        const entregaVal = detalhes?.produto?.entrega ?? "";
        setEntrega(entregaVal);
        setEntregaAntes(entregaVal);

        // Sai do modo de edicao.
        setModoEdicao(false);
    }, [chave]);

    // Atalho Escape para fechar.
    useEffect(() => {
        function aoApertarTecla(e) { if (e.key === "Escape") tentarFechar(); }
        document.addEventListener("keydown", aoApertarTecla);
        return () => document.removeEventListener("keydown", aoApertarTecla);
    }, [modoEdicao, quantidadeAntes, nomeFantasiaClienteAntes, nomeFantasiaDistribuidorAntes, numeroNotaDistribuidorAntes, observacoesAntes, metodoPagamentoAntes, quantidadeParcelasAntes, entregaAntes]);

    function iniciarEdicao() {
        if (!pedidoEmAndamento) return;
        setQuantidadeAntes(quantidade);
        setNomeFantasiaClienteAntes(nomeFantasiaCliente);
        setNomeFantasiaDistribuidorAntes(nomeFantasiaDistribuidor);
        setNumeroNotaDistribuidorAntes(numeroNotaDistribuidor);
        setObservacoesAntes(observacoes);
        setMetodoPagamentoAntes(metodoPagamento);
        setQuantidadeParcelasAntes(quantidadeParcelas);
        setEntregaAntes(entrega);
        setModoEdicao(true);
    }
    // Confirma a edicao e fecha o modo editavel.
    async function confirmarEdicao(finalizarPedido = false) {
        if (!pedidoEmAndamento) return;

        if (finalizarPedido && (!numeroNotaDistribuidor.trim() || !observacoes.trim())) {
            toast.error("Informe nota e observações para finalizar o pedido.");
            return;
        }

        try {
            setSalvando(true);
            await atualizarPedido(detalhes.pedido.idPedido, criarPayload(finalizarPedido));
            toast.success(finalizarPedido ? "Pedido finalizado com sucesso." : "Pedido atualizado com sucesso.");
            setModoEdicao(false);
            aoAtualizar?.();
            if (finalizarPedido) aoFechar();
        } catch (error) {
            toast.error(error.message || "Não foi possível atualizar o pedido.");
        } finally {
            setSalvando(false);
        }
    }
    // Cancela a edicao e volta para o valor anterior.
        /* chamada à API aqui — incluir: quantidade, nomeFantasiaCliente, nomeFantasiaDistribuidor, entrega */
    function cancelarEdicao() {
        setQuantidade(quantidadeAntes);
        setNomeFantasiaCliente(nomeFantasiaClienteAntes);
        setNomeFantasiaDistribuidor(nomeFantasiaDistribuidorAntes);
        setNumeroNotaDistribuidor(numeroNotaDistribuidorAntes);
        setObservacoes(observacoesAntes);
        setMetodoPagamento(metodoPagamentoAntes);
        setQuantidadeParcelas(quantidadeParcelasAntes);
        setEntrega(entregaAntes);
        setModoEdicao(false);
    }
    function criarPayload(finalizarPedido) {
        return {
            idPedido: detalhes.pedido.idPedido,
            idCliente: detalhes.cliente.id,
            nomeFantasiaCliente,
            idDistribuidor: detalhes.distribuidor.id,
            nomeFantasiaDistribuidor,
            idItemPedido: detalhes.produto.idItemPedido,
            quantidade,
            numeroNotaDistribuidor,
            observacoes,
            metodoPagamento,
            parcelado: Number(quantidadeParcelas) > 1,
            quantidadeParcelas: Number(quantidadeParcelas),
            entrega,
            finalizarPedido,
        };
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
    const classeSecao = escuro ? "bg-gray-900/60 border-gray-700" : "bg-gray-50 border-gray-100";
    const classeSeparador = escuro ? "border-gray-700" : "border-gray-100";
    const parcelaEstaPaga = (parcela) => ["PAGA"].includes(String(parcela?.status || "").toUpperCase());
    const parcelaEstaLiberada = (parcela) => ["LIBERADA"].includes(String(parcela?.status || "").toUpperCase());
    const classesParcela = (parcela) => {
        if (parcelaEstaPaga(parcela)) {
            return escuro
                ? "bg-emerald-950/40 border-emerald-700/70 text-emerald-300"
                : "bg-emerald-50 border-emerald-200 text-emerald-700";
        }

        if (parcelaEstaLiberada(parcela)) {
            return escuro
                ? "bg-blue-950/40 border-blue-700/70 text-blue-300"
                : "bg-blue-50 border-blue-200 text-blue-700";
        }


        return escuro
            ? "bg-orange-950/40 border-orange-700/70 text-orange-300"
            : "bg-orange-50 border-orange-200 text-orange-600";
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) tentarFechar(); }}
        >
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
              ${venda.tipo === "paga"
                                ? "bg-green-500/20 text-green-300 border-green-500/40"
                                : venda.tipo === "liberada"
                                    ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                                    : "bg-orange-500/20 text-orange-300 border-orange-500/40"}`}>
                            {venda.status}
                        </span>
                    </div>
                </div>

                {/* ── Corpo ── */}
                <div className="modal-detalhe-scroll flex flex-col gap-4 p-8 overflow-y-auto flex-1 min-h-0">
                    {detalhes ? (
                        <>
                            {/* Cliente e Distribuidor */}
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
                                            placeholder="Nome fantasia do cliente"
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
                                            placeholder="Nome fantasia do distribuidor"
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

                            {/* Dados do Pedido */}
                            <div className={`rounded-xl border p-5 ${classeSecao}`}>
                                <CabecalhoSecao titulo="Dados do Pedido" cor="bg-sky-500" escuro={escuro} />
                                <div className="grid grid-cols-4 gap-x-5 gap-y-3">
                                    <CampoTextoEditavel
                                        rotulo="Número da Nota"
                                        valor={numeroNotaDistribuidor}
                                        modoEdicao={modoEdicao}
                                        aoAlterar={setNumeroNotaDistribuidor}
                                        escuro={escuro}
                                    />
                                    <CampoTextoEditavel
                                        rotulo="Observações"
                                        valor={observacoes}
                                        modoEdicao={modoEdicao}
                                        aoAlterar={setObservacoes}
                                        escuro={escuro}
                                        colSpan={2}
                                    />
                                    <CampoLeitura rotulo="Status" valor={detalhes.pedido?.statusPedido} escuro={escuro} />

                                    <div>
                                        <label className={`block text-[9px] font-bold tracking-widest uppercase mb-1 ${escuro ? "text-gray-500" : "text-gray-400"}`}>
                                            Método de Pagamento
                                        </label>
                                        <select
                                            value={metodoPagamento}
                                            disabled={!modoEdicao}
                                            onChange={(e) => setMetodoPagamento(e.target.value)}
                                            className={`w-full px-3 py-1.5 rounded-lg border text-xs font-semibold focus:outline-none transition-all duration-200
                                                ${modoEdicao
                                                    ? escuro ? "bg-blue-950/60 border-blue-500 text-white ring-1 ring-blue-500/40" : "bg-blue-50 border-blue-400 text-blue-900 ring-1 ring-blue-300/50"
                                                    : escuro ? "bg-gray-800/80 border-gray-700 text-gray-200 cursor-default" : "bg-white border-gray-200 text-gray-700 cursor-default"
                                                }`}
                                        >
                                            <option value="PIX">PIX</option>
                                            <option value="BOLETO">Boleto</option>
                                            <option value="CARTAO_CREDITO">Cartão de crédito</option>
                                            <option value="CARTAO_DEBITO">Cartão de débito</option>
                                            <option value="TRANSFERENCIA">Transferência</option>
                                            <option value="DINHEIRO">Dinheiro</option>
                                        </select>
                                    </div>

                                    <CampoQuantidade
                                        valor={quantidadeParcelas}
                                        modoEdicao={modoEdicao}
                                        aoAlterar={setQuantidadeParcelas}
                                        escuro={escuro}
                                        rotulo="Parcelas"
                                    />
                                </div>
                            </div>

                            {/* Dados do Produto */}
                            <div className={`rounded-xl border p-5 ${classeSecao}`}>
                                <CabecalhoSecao titulo="Dados do Produto" cor="bg-cyan-500" escuro={escuro} />

                                <div className="flex flex-col gap-4">
                                    <CampoLeitura
                                        rotulo="Descrição do Produto"
                                        valor={detalhes.produto.descricao}
                                        escuro={escuro}
                                        colSpan={4}
                                    />

                                    <div className={`w-full h-px ${classeSeparador}`} />

                                    <div className="grid grid-cols-4 gap-x-5 gap-y-3">
                                        <CampoLeitura rotulo="P/N" valor={detalhes.produto.pn} escuro={escuro} />
                                        <CampoTextoEditavel
                                            rotulo="Entrega"
                                            valor={entrega}
                                            modoEdicao={modoEdicao}
                                            aoAlterar={setEntrega}
                                            escuro={escuro}
                                            placeholder="Ex: Imediata"
                                        />
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

                            {/* ── Parcelas */}
                            {venda.parcelas?.length > 0 && (
                                <div className={`rounded-xl border p-5 ${classeSecao}`}>
                                    <CabecalhoSecao titulo="Parcelas desta Venda" cor="bg-emerald-500" escuro={escuro} />
                                    <div className="grid grid-cols-3 gap-3">
                                        {venda.parcelas.map((parcela, indice) => (
                                            <div
                                                key={indice}
                                                className={`flex items-center justify-between px-4 py-2.5 rounded-lg border ${classesParcela(parcela)}`}
                                            >
                                                <span className="flex items-center gap-2 text-xs">
                                                    {parcelaEstaPaga(parcela) && <IconeCheck />}
                                                    {parcela.label}
                                                </span>
                                                <span className="text-sm font-bold">{parcela.valor}</span>
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

                {/* Rodape */}
                <div className={`flex justify-end gap-2 px-8 py-4 border-t flex-shrink-0 ${classeSeparador}`}>
                    {modoEdicao && (
                        <p className={`text-[10px] mr-auto flex items-center gap-1.5
              ${escuro ? "text-blue-400" : "text-blue-500"}`}>
                            <IconeLapis />
                            Nome fantasia, quantidade, nota e observações podem ser editados
                        </p>
                    )}
                    {modoEdicao ? (
                        <>
                            <button
                                onClick={() => confirmarEdicao(true)}
                                disabled={salvando || !numeroNotaDistribuidor.trim() || !observacoes.trim()}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all
              bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <IconeCheck />
                                Finalizar Pedido
                            </button>
                            <button
                                onClick={() => confirmarEdicao(false)}
                                disabled={salvando}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all
              bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <IconeCheck />
                                Salvar
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={iniciarEdicao}
                            disabled={!pedidoEmAndamento}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all border
              bg-white border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
