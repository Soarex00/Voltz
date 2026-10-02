export default function InteractionList({ items }) {
  if (!items.length) return <p className="text-slate-500 py-5">Nenhuma avaliação registrada ainda.</p>;
  return <div className="space-y-4">{items.map(item => <article className="panel" key={item.id}>
    <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold text-blue-900">{item.client_name}{item.product_name && ` • ${item.product_name}`}</h3><time className="text-sm text-slate-500">{new Date(item.created_at).toLocaleDateString('pt-BR')}</time></div>
    <p className="text-amber-600 mt-2" aria-label={`Nota ${item.rating} de 5`}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</p>
    <p className="mt-3 whitespace-pre-wrap break-words">{item.comment}</p>
    {item.reply ? <div className="bg-blue-50 rounded-lg p-4 mt-4"><p className="font-semibold text-blue-900">Resposta da loja • {item.admin_name}</p><p className="mt-2 whitespace-pre-wrap break-words">{item.reply}</p><p className="text-xs text-slate-500 mt-2">{new Date(item.replied_at).toLocaleString('pt-BR')}</p></div> : <p className="text-sm text-slate-500 mt-4">Aguardando resposta da loja.</p>}
  </article>)}</div>;
}
