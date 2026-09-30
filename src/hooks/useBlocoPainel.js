import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Carrega um bloco do painel: refaz a busca quando `params` muda e ignora respostas
 * de buscas antigas. `params` deve ser um objeto simples (comparado por JSON).
 */
export function useBlocoPainel(buscar, params, habilitado, mensagemErro) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const chave = JSON.stringify(params);

  useEffect(() => {
    if (!habilitado) return;

    let ativo = true;
    setCarregando(true);

    buscar(JSON.parse(chave))
      .then((resposta) => {
        if (ativo) setDados(resposta);
      })
      .catch((error) => {
        if (!ativo) return;
        setDados(null);
        toast.error(error.message || mensagemErro);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
    // `buscar` e `mensagemErro` são estáveis; só o filtro dispara nova busca
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habilitado, chave]);

  return { dados, carregando };
}
