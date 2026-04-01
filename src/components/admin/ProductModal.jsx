import { useState, useEffect, useCallback, useRef } from 'react';
import ImageUploader from './ImageUploader';
import { supabase } from '@/lib/supabaseClient';
import { sanitizeUrl } from '@/utils/sanitize';
import toast from 'react-hot-toast';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useModal } from '@/hooks/useModal';
import { logger } from '@/utils/logger';
import { generateSlug } from '@/utils/slug';

/**
 * NOTA PARA AUDITORES:
 * Este formulario NO incluye campo de stock intencionalmente.
 * El negocio opera bajo modelo de PRODUCTOS POR PEDIDO (catálogo).
 * La administradora crea productos que siempre están disponibles.
 * No se requiere inventario ni pasarela de pago en línea.
 * Todo pedido se concreta vía WhatsApp. Ver: src/config/constants.js
 */

export default function ProductModal({ isOpen, onClose, product, onSave, categories }) {
  const manualUrlRef = useRef(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const { modalRef } = useModal({ isOpen, onClose });

  useBodyScrollLock(isOpen);
  const isMounted = useRef(true);
  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    old_price: '',
    offer_days: '',
    offer_hours: '',
    offer_minutes: '',
    offer_starts_at: '',
    category: '',
    tags: [],
    image_path: '',
    images: [],
    is_active: true,
    slug: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsSubmitting(false);
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        old_price: product.old_price || '',
        offer_days: '',
        offer_hours: '',
        offer_minutes: '',
        offer_starts_at: product.offer_starts_at ? new Date(product.offer_starts_at).toISOString().slice(0, 16) : '',
        category: product.category || '',
        tags: Array.isArray(product.tags) ? product.tags : [],
        image_path: product.images?.[0] || product.image_path || '',
        images: Array.isArray(product.images) ? product.images : [],
        is_active: product.is_active ?? true,
        slug: product.slug || ''
      });
      setSlugManuallyEdited(!!product.slug);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        old_price: '',
        offer_days: '',
        offer_hours: '',
        offer_minutes: '',
        offer_starts_at: '',
        category: categories?.[0]?.slug || '',
        tags: [],
        image_path: '',
        images: [],
        is_active: true,
        slug: ''
      });
      setSlugManuallyEdited(false);
    }
    setTagInput('');
  }, [product, isOpen, categories]);

  // These hooks MUST be before any early return (Rules of Hooks)
  const handleAddImage = useCallback((url) => {
    setFormData(prev => {
      const newImages = [...prev.images, url];
      return {
        ...prev,
        images: newImages,
        image_path: newImages[0] || ''
      };
    });
  }, []);

  const handleRemoveImage = useCallback((index) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        image_path: newImages[0] || ''
      };
    });
  }, []);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: type === 'checkbox' ? checked : value };
      // Auto-regenerate slug when name changes (only if slug wasn't manually set)
      if (name === 'name' && !slugManuallyEdited) {
        newData.slug = generateSlug(value);
      }
      return newData;
    });
    if (name === 'slug') {
      setSlugManuallyEdited(value.trim() !== '');
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.old_price && parseFloat(formData.old_price) <= parseFloat(formData.price)) {
      toast.error('El precio "Antes" debe ser mayor al precio actual para ser una oferta válida.');
      setIsSubmitting(false);
      return;
    }
    
    const finalSlug = formData.slug?.trim() || generateSlug(formData.name);

    // Validate slug uniqueness
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('slug', finalSlug)
        .maybeSingle();
        
      if (error) throw error;
      
      if (data && (!product || data.id !== product.id)) {
        toast.error('Ya existe un producto con esta URL/Slug. Modifica el nombre o hazlo único.');
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      logger.error('Error checking slug:', err);
      toast.error('Error al validar la URL del producto.');
      setIsSubmitting(false);
      return;
    }

    const parsedPrice = parseFloat(formData.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error('Por favor, ingresa un precio válido.');
      setIsSubmitting(false);
      return;
    }
    
    let parsedOldPrice = null;
    let offerEndsAt = product?.offer_ends_at || null;
    let offerStartsAt = product?.offer_starts_at || null;

    if (formData.old_price) {
      parsedOldPrice = parseFloat(formData.old_price);
      if (isNaN(parsedOldPrice) || parsedOldPrice < 0) {
        toast.error('Por favor, ingresa un precio de oferta válido.');
        setIsSubmitting(false);
        return;
      }

      // Calcular offer_ends_at con granularidad: días + horas + minutos
      const days = parseInt(formData.offer_days, 10) || 0;
      const hours = parseInt(formData.offer_hours, 10) || 0;
      const minutes = parseInt(formData.offer_minutes, 10) || 0;
      const totalMinutes = days * 1440 + hours * 60 + minutes;

      if (totalMinutes > 0) {
        // Si hay fecha de inicio programada, calcular desde ahí
        const baseDate = formData.offer_starts_at ? new Date(formData.offer_starts_at) : new Date();
        baseDate.setMinutes(baseDate.getMinutes() + totalMinutes);
        offerEndsAt = baseDate.toISOString();
      }

      // Programar oferta futura
      if (formData.offer_starts_at) {
        offerStartsAt = new Date(formData.offer_starts_at).toISOString();
      } else {
        offerStartsAt = null;
      }
    } else {
      offerEndsAt = null;
      offerStartsAt = null;
    }

    // Build payload with ONLY valid DB columns — no internal state leaking
    const payload = {
      name: formData.name,
      description: formData.description || null,
      price: parsedPrice,
      old_price: parsedOldPrice,
      category: formData.category || null,
      tags: Array.isArray(formData.tags) ? formData.tags : [],
      image_path: formData.images[0] || formData.image_path || null,
      images: formData.images.length > 0 ? formData.images : (formData.image_path ? [formData.image_path] : []),
      is_active: formData.is_active,
      slug: finalSlug,
      offer_ends_at: offerEndsAt,
      offer_starts_at: offerStartsAt,
      category_id: categories.find(c => c.slug === formData.category)?.id || null
    };

    await onSave(payload);
    if (isMounted.current) setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[85vh] mb-16 sm:mb-0 bg-white dark:bg-white/5 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600">
          <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4 md:col-span-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                  <input 
                    name="name" value={formData.name} onChange={handleChange} required
                    maxLength={200}
                    className="w-full rounded-lg border-slate-200 dark:border-white/5 bg-white dark:bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL (Slug) <span className="text-slate-400 font-normal ml-1">(Opcional, se genera auto)</span></label>
                  <input 
                    name="slug" value={formData.slug} onChange={handleChange} placeholder="ejemplo-de-producto"
                    maxLength={200}
                    className="w-full rounded-lg border-slate-200 dark:border-white/5 bg-white dark:bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
                  <textarea 
                    name="description" value={formData.description} onChange={handleChange} rows="3"
                    maxLength={2000}
                    className="w-full rounded-lg border-slate-200 dark:border-white/5 bg-white dark:bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 px-4 py-2 resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Precio ($)</label>
                <input 
                  type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required min="0"
                  onWheel={(e) => e.target.blur()}
                  className="w-full rounded-lg border-slate-200 dark:border-white/5 bg-white dark:bg-transparent text-slate-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Precio Anterior (Oferta)</label>
                <input 
                  type="number" step="0.01" name="old_price" value={formData.old_price} onChange={handleChange} min="0" placeholder="Dejar vacío si no hay oferta"
                  onWheel={(e) => e.target.blur()}
                  className="w-full rounded-lg border-slate-200 dark:border-white/5 bg-white dark:bg-transparent text-slate-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {formData.old_price && (
                <div className="md:col-span-2 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>timer</span>
                    <h4 className="font-bold text-sm">Configuración de Oferta</h4>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Duración de la oferta</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <input 
                          type="number" name="offer_days" value={formData.offer_days} onChange={handleChange} min="0" placeholder="0"
                          onWheel={(e) => e.target.blur()}
                          className="w-full rounded-lg border-slate-200 dark:border-white/5 bg-white dark:bg-transparent text-slate-900 dark:text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block text-center">Días</span>
                      </div>
                      <div>
                        <input 
                          type="number" name="offer_hours" value={formData.offer_hours} onChange={handleChange} min="0" max="23" placeholder="0"
                          onWheel={(e) => e.target.blur()}
                          className="w-full rounded-lg border-slate-200 dark:border-white/5 bg-white dark:bg-transparent text-slate-900 dark:text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block text-center">Horas</span>
                      </div>
                      <div>
                        <input 
                          type="number" name="offer_minutes" value={formData.offer_minutes} onChange={handleChange} min="0" max="59" placeholder="0"
                          onWheel={(e) => e.target.blur()}
                          className="w-full rounded-lg border-slate-200 dark:border-white/5 bg-white dark:bg-transparent text-slate-900 dark:text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block text-center">Minutos</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Si dejas todo en 0, la oferta no expirará automáticamente.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                        Programar inicio (Opcional)
                      </span>
                    </label>
                    <input 
                      type="datetime-local" name="offer_starts_at" value={formData.offer_starts_at} onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 dark:border-white/5 bg-white dark:bg-transparent text-slate-900 dark:text-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Si dejas vacío, la oferta inicia inmediatamente al guardar.</p>
                  </div>

                  <div className="flex items-start gap-1.5 text-[10px] text-amber-600 dark:text-amber-400/80 bg-amber-100/50 dark:bg-amber-500/10 rounded-lg p-2">
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: '14px' }}>info</span>
                    <span>Al vencer la oferta, el precio se restaurará automáticamente al precio anterior.</span>
                  </div>
                </div>
              )}

              {/* Category & Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
                <select 
                  name="category" value={formData.category} onChange={handleChange} required
                  className="w-full rounded-lg border-slate-200 dark:border-white/5 bg-white dark:bg-transparent text-slate-900 dark:text-white px-4 py-2 focus:ring-2 focus:ring-primary/20"
                >
                  <option value="" disabled>Seleccionar...</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Multi-Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Imágenes del Producto *</label>
                
                {/* Existing images thumbnails */}
                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-white/5 group">
                        <img src={sanitizeUrl(img)} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-white text-[18px]">delete</span>
                        </button>
                        {idx === 0 && (
                          <span className="absolute top-0.5 left-0.5 bg-primary text-white text-[9px] font-bold px-1 rounded">Principal</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Upload new image */}
                <ImageUploader 
                  currentImage={null}
                  onUploadSuccess={handleAddImage}
                  onRemoveImage={() => {}}
                />
                {/* Fallback opcional para URL manual */}
                <div className="mt-3 flex gap-2">
                  <input 
                    type="text" 
                    id="manual-image-url"
                    ref={manualUrlRef}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="flex-1 rounded-lg border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-transparent/50 text-slate-900 dark:text-white px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary/20"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const url = e.target.value.trim();
                        if (url) {
                          const safeUrl = sanitizeUrl(url);
                          if (safeUrl) {
                            handleAddImage(safeUrl);
                            e.target.value = '';
                          } else {
                            toast.error('URL inválida. Usa una URL con https://');
                          }
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = manualUrlRef.current;
                      const url = input?.value?.trim();
                      if (url) {
                        const safeUrl = sanitizeUrl(url);
                        if (safeUrl) {
                          handleAddImage(safeUrl);
                          input.value = '';
                        } else {
                          toast.error('URL inválida. Usa una URL con https://');
                        }
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-white/10 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                  >
                    Agregar URL
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Etiquetas (Presiona Enter)</label>
                <input 
                  type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag}
                  placeholder="Ej: Nuevo, Bestseller, Oferta..."
                  className="w-full rounded-lg border-slate-200 dark:border-white/5 bg-white dark:bg-transparent text-slate-900 dark:text-white px-4 py-2 mb-2 focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 px-2 py-1 rounded text-xs font-medium">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-white/5 peer-checked:bg-primary"></div>
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Producto Activo (Visible en tienda)
                  </span>
                </label>
              </div>

            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex justify-end gap-3">
          <button 
            type="button" onClick={onClose}
            className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" form="productForm" disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> Guardando...</>
            ) : (
              'Guardar Producto'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
