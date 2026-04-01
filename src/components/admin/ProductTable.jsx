import { useState } from 'react';
import { formatPrice } from '@/utils/formatPrice';

export default function ProductTable({ products, onEdit, onDelete, onBulkDelete, isLoading }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-white/5 rounded-2xl p-8 flex flex-col items-center justify-center border border-slate-100 dark:border-white/5 shadow-360 animate-pulse">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400">Cargando productos...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-white/5 rounded-2xl p-12 flex flex-col items-center justify-center border border-slate-100 dark:border-white/5 shadow-360">
        <div className="w-16 h-16 bg-slate-50 dark:bg-transparent rounded-full flex items-center justify-center text-slate-400 mb-4">
          <span className="material-symbols-outlined text-[32px]">inventory_2</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No hay productos</h3>
        <p className="text-slate-500 text-center max-w-sm">Aún no has agregado productos o ninguno coincide con tu búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-360 overflow-hidden flex flex-col">
      {selectedIds.length > 0 && (
        <div className="bg-slate-50 dark:bg-white/5 px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-white/5">
          <span className="text-sm font-medium text-primary">
            {selectedIds.length} seleccionado(s)
          </span>
          <button 
            onClick={() => {
              if (onBulkDelete) {
                onBulkDelete(selectedIds).then(() => setSelectedIds([]));
              }
            }}
            className="text-sm font-bold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            Eliminar seleccionados
          </button>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-transparent/50 text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  checked={products.length > 0 && selectedIds.length === products.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 dark:border-white/5 text-primary focus:ring-primary/20"
                />
              </th>
              <th className="px-6 py-4 font-semibold w-24">Imagen</th>
              <th className="px-6 py-4 font-semibold">Producto</th>
              <th className="px-6 py-4 font-semibold">Precio</th>
              <th className="px-6 py-4 font-semibold">Categoría / Etiquetas</th>
              <th className="px-6 py-4 font-semibold w-24 text-center">Estado</th>
              <th className="px-6 py-4 font-semibold w-24 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(product.id)}
                    onChange={() => toggleSelect(product.id)}
                    className="rounded border-slate-300 dark:border-white/5 text-primary focus:ring-primary/20"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-transparent border border-slate-200 dark:border-white/5 overflow-hidden flex items-center justify-center">
                    {product.image_path ? (
                      <img src={product.image_path} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-slate-400">image</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{product.name}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[200px]">{product.description || 'Sin descripción'}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(product.price)}</span>
                    {product.old_price && (
                      <span className="text-xs text-slate-400 line-through">{formatPrice(product.old_price)}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{product.categories?.name || product.category || 'Sin categoría'}</p>
                  <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {product.tags && product.tags.slice(0,2).map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 text-xs rounded text-slate-600 dark:text-slate-300">{tag}</span>
                    ))}
                    {product.tags && product.tags.length > 2 && (
                      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 text-xs rounded text-slate-600 dark:text-slate-300">+{product.tags.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {product.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs font-bold">
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 text-xs font-bold">
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onEdit(product)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button 
                      onClick={() => onDelete(product.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
