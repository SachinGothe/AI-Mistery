const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };
export const saveCaseId = id => write('cases', [id, ...read('cases', []).filter(x => x !== id)].slice(0, 50));
export const savedIds = () => read('cases', []);
export const getBoard = id => read(`board:${id}`, { notes: '', links: {} });
export const setBoard = (id, b) => write(`board:${id}`, b);
