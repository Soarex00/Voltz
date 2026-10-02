import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
export default function AIAdvice({ vehicle }) {
  const [data, setData] = useState(null), [loading, setLoading] = useState(false), [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    setData(null); setError('');
    if (!vehicle) { setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    api.get('/ai/advice', { params: { vehicle }, signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setData(data); })
      .catch(err => { if (!controller.signal.aborted) setError(err.response?.data?.message || 'Não foi possível buscar sugestões agora.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [vehicle, retry]);
  if (!vehicle) return <p className="text-sm text-blue-800 mb-6">Digite o modelo do carro para receber uma recomendação. Ano e motorização são opcionais e ajudam a refinar a escolha.</p>;
  return <div className="panel bg-blue-50 border-blue-100 mb-7" aria-live="polite">
    <h3 className="flex gap-2 items-center text-xl font-bold text-blue-900"><Sparkles />Sugestões para {vehicle}</h3>
    {loading ? <p className="mt-4" role="status">Analisando seu carro e as baterias cadastradas…</p> : error ? <div className="mt-4"><p role="alert" className="text-slate-600">{error}</p><button className="btn-secondary mt-4" onClick={() => setRetry(value => value + 1)}>Tentar novamente</button></div> : data && <>
      <p className="text-sm text-blue-700 mt-3 font-semibold">Sugestões geradas por IA • {data.source}</p>
      <p className="mt-4 text-slate-700 whitespace-pre-line leading-relaxed">{data.text}</p>
      {data.products.length > 0 && <div className="grid sm:grid-cols-3 gap-3 mt-5">{data.products.map((product, index) => <Link key={product.id} to={`/produtos/${product.id}`} className={`panel hover:border-blue-400 ${index === 0 ? 'border-blue-300' : ''}`}>
        <span className="block text-xs font-semibold text-blue-700 mb-2">{index === 0 ? 'RECOMENDAÇÃO PRINCIPAL' : 'ALTERNATIVA'}</span><strong className="text-blue-900">{product.name}</strong><p className="text-sm text-slate-600">Modelo {product.model}</p><p className="font-bold mt-2">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p><span className="text-sm text-blue-700">Ver detalhes e avaliações →</span>
      </Link>)}</div>}
      <p className="text-xs text-slate-500 mt-4">Consulta em {new Date(data.generatedAt).toLocaleString('pt-BR')}. Opções selecionadas pela IA a partir do catálogo. Confirme ano, versão e especificações no manual antes da compra.</p>
    </>}
  </div>;
}
