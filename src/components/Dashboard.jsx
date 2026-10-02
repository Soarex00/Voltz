function BarChart({ title, rows, color = '#1d4ed8' }) {
  const max = Math.max(1, ...rows.map(r => r.value));
  return <section className="panel"><h2 className="text-lg font-bold text-blue-900 mb-5">{title}</h2>
    {!rows.length ? <p className="text-slate-500">Os dados aparecerão após as primeiras avaliações.</p> : <><div className="space-y-4" role="img" aria-label={`${title}: ${rows.map(r => `${r.label}: ${r.value}`).join('; ')}`}>
      {rows.map(row => <div key={row.label}><div className="flex justify-between text-sm mb-1"><span>{row.label}</span><span className="font-semibold">{row.value}</span></div><div className="h-6 rounded bg-slate-100 overflow-hidden"><div className="h-full rounded" style={{ width: `${100 * row.value / max}%`, backgroundColor: color }} /></div></div>)}
    </div><table className="sr-only"><caption>{title}</caption><thead><tr><th>Categoria</th><th>Total</th></tr></thead><tbody>{rows.map(r => <tr key={r.label}><td>{r.label}</td><td>{r.value}</td></tr>)}</tbody></table></>}
  </section>;
}
export default function Dashboard({ data }) {
  if (!data) return <p>Carregando indicadores…</p>;
  const cards = [['Produtos',data.products],['Clientes',data.clients],['Avaliações',data.interactions],['Sem resposta',data.pending],['Nota média',data.average.toFixed(1)]];
  return <div className="space-y-6"><div className="grid grid-cols-2 lg:grid-cols-5 gap-4">{cards.map(([label,value]) => <div className="panel" key={label}><p className="text-sm text-slate-500">{label}</p><p className="text-3xl font-bold text-blue-900 mt-3">{value}</p></div>)}</div>
    <div className="grid lg:grid-cols-2 gap-6"><BarChart title="Distribuição das notas" rows={[1,2,3,4,5].map(n => ({ label: `${n} ${n === 1 ? 'estrela' : 'estrelas'}`, value: data.ratings.find(r => r.rating === n)?.total || 0 }))} /><BarChart title="Avaliações por mês" color="#0891b2" rows={data.months.map(m => ({ label: m.month.split('-').reverse().join('/'), value: m.total }))} /></div>
    <section className="panel"><h2 className="text-lg font-bold text-blue-900 mb-4">Produtos com melhor avaliação</h2>{data.topProducts.length ? <div className="overflow-auto"><table className="w-full text-left"><thead><tr className="border-b"><th className="py-3">Produto</th><th>Nota média</th><th>Avaliações</th></tr></thead><tbody>{data.topProducts.map(p => <tr className="border-b" key={p.id}><td className="py-3">{p.name}</td><td>{p.rating.toFixed(1)}</td><td>{p.reviews}</td></tr>)}</tbody></table></div> : <p>Nenhum produto avaliado.</p>}</section>
  </div>;
}
