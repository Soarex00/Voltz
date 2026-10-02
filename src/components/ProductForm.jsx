import { useState } from 'react';
import { api, errorMessage } from '../services/api';
export default function ProductForm({ product, onSaved, onCancel }) {
  const [form, setForm] = useState(product ? { ...product, vehicles: product.vehicles.join(', ') } : { name: '', model: '', image: '', price: '', vehicles: '', description: '', destaque: false });
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    const body = { ...form, price: Number(form.price), vehicles: form.vehicles.split(',').map(v => v.trim()).filter(Boolean) };
    try { if (product) await api.put(`/products/${product.id}`, body); else await api.post('/products', body); await onSaved(); }
    catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  return <form className="panel space-y-5" onSubmit={submit}><h2 className="font-bold text-xl text-blue-900">{product ? 'Editar produto' : 'Cadastrar produto'}</h2>
    <div className="grid md:grid-cols-2 gap-5">{[['name','Nome do produto','text'],['model','Modelo','text'],['image','Imagem (URL ou /nome-do-arquivo.webp)','text'],['price','Preço (R$)','number'],['vehicles','Veículos compatíveis, separados por vírgula','text']].map(([key,label,type]) => <label className="block" key={key}>{label}<input className="field" type={type} min={type === 'number' ? 0 : undefined} max={type === 'number' ? 1000000 : undefined} step={type === 'number' ? '0.01' : undefined} maxLength={key === 'image' ? 1000 : 1000} required={key !== 'vehicles'} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}</div>
    <label className="block">Descrição<textarea className="field" rows={3} maxLength={3000} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
    <label className="flex items-center gap-2"><input type="checkbox" checked={form.destaque} onChange={e => setForm({ ...form, destaque: e.target.checked })} />Exibir nos destaques da loja</label>
    {error && <p role="alert" className="text-red-700">{error}</p>}<div className="flex gap-3"><button className="btn" disabled={busy}>{busy ? 'Salvando…' : 'Salvar produto'}</button><button type="button" className="btn-secondary" disabled={busy} onClick={onCancel}>Cancelar</button></div>
  </form>;
}
