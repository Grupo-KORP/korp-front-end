export function draftStorageKey(token) {
  const payload = token?.split(".")[1];
  if (!payload) throw new Error("Entre na sua conta para acessar os rascunhos.");
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const user = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
  const owner = user.id ?? user.sub;
  if (!owner) throw new Error("Não foi possível identificar sua conta.");
  return `korp:pedido-drafts:v1:${encodeURIComponent(owner)}`;
}

export function readDrafts(storage, key) {
  const drafts = JSON.parse(storage.getItem(key) || "[]");
  if (!Array.isArray(drafts) || drafts.some(d => !d?.id || !d.updatedAt ||
    !d.data?.cliente || !d.data?.distribuidor || !Array.isArray(d.data?.produtos))) {
    throw new Error("Não foi possível ler os rascunhos salvos.");
  }
  return drafts;
}

export function saveDraft(storage, key, data, id = crypto.randomUUID()) {
  const draft = { id, updatedAt: new Date().toISOString(), data };
  const drafts = [draft, ...readDrafts(storage, key).filter(item => item.id !== id)];
  storage.setItem(key, JSON.stringify(drafts));
  return { draft, drafts };
}

export function removeDraft(storage, key, id) {
  const drafts = readDrafts(storage, key).filter(item => item.id !== id);
  storage.setItem(key, JSON.stringify(drafts));
  return drafts;
}
