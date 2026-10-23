import { api } from "../services/api.js";

const ENTITY_CONFIG = {
  cliente: { idField: "idCliente", path: "/cliente" },
  distribuidor: { idField: "idDistribuidor", path: "/distribuidor" },
};

const onlyDigits = (value) => String(value ?? "").replace(/\D/g, "");

// Handlers do modal de detalhes (contatos e dados da empresa) compartilhados por Cliente e Distribuidor.
export function useEntityDetailsHandlers(type, entity, setEntity, reload) {
  const { idField, path } = ENTITY_CONFIG[type];
  const entityId = entity?.[idField] ?? entity?.id;

  async function onSaveContact(contact) {
    const payload = {
      nome: contact.nome.trim(),
      email: contact.email.trim(),
      telefone: onlyDigits(contact.telefone),
      [idField]: entityId,
    };
    const isUpdate = contact.idContato != null;
    const { data } = isUpdate
      ? await api.put(`/contatos/${contact.idContato}`, payload)
      : await api.post("/contatos", payload);

    setEntity((previous) => ({
      ...previous,
      contatos: isUpdate
        ? previous.contatos.map((item) => (item.idContato === contact.idContato ? data : item))
        : [...(previous.contatos ?? []), data],
    }));
  }

  async function onDeleteContact(contact) {
    await api.delete(`/contatos/${contact.idContato}`);
    setEntity((previous) => ({
      ...previous,
      contatos: previous.contatos.filter((item) => item.idContato !== contact.idContato),
    }));
    await reload?.();
  }

  async function onSaveCompany(company) {
    const payload = {
      nomeFantasia: company.nomeFantasia.trim(),
      telefone: onlyDigits(company.telefone),
    };
    await api.patch(`${path}/${entityId}/dados`, payload);
    setEntity((previous) => ({ ...previous, ...payload }));
  }

  return { onSaveContact, onDeleteContact, onSaveCompany };
}
