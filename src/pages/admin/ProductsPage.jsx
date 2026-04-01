import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ProductTable from '@/components/admin/ProductTable';
import ProductModal from '@/components/admin/ProductModal';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { logger } from '@/utils/logger';
import { applyActiveOfferFilter } from '@/utils/productUtils';
import { useConfirm } from '@/context/ConfirmContext';
import { collectProductImageFiles } from '@/utils/storage';


export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination (Ref to avoid dependency loop in fetchData)
  const pageRef = useRef(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 25;
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce
  const [filterCategory, setFilterCategory] = useState('');
  const [filterOnSale, setFilterOnSale] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');
      
      if (catError) throw catError;
      setCategories(catData || []);
    } catch (error) {
      logger.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchData = useCallback(async (isLoadMore = false) => {
    setIsLoading(true);
    try {
      const currentPage = isLoadMore ? pageRef.current + 1 : 0;

      // Fetch products
      let query = supabase.from('products').select(`
        id, name, description, price, old_price, offer_ends_at, category, tags, image_path, images, is_active, slug, created_at,
        category_id,
        categories!products_category_id_fkey(name)
      `, { count: 'exact' }).order('created_at', { ascending: false });

      if (debouncedSearchTerm) {
        const escapedSearch = debouncedSearchTerm.replace(/[%_\\]/g, '\\$&');
        query = query.ilike('name', `%${escapedSearch}%`);
      }
      if (filterCategory) {
        query = query.eq('category', filterCategory);
      }
      if (filterOnSale) {
        query = applyActiveOfferFilter(query);
      }

      // Pagination
      query = query.range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

      const { data: prodData, count, error: prodError } = await query;
      
      if (prodError) throw prodError;
      
      if (isLoadMore) {
        setProducts(prev => [...prev, ...(prodData || [])]);
      } else {
        setProducts(prodData || []);
      }
      
      setTotalCount(count || 0);
      setHasMore((currentPage + 1) * PAGE_SIZE < (count || 0));
      pageRef.current = currentPage;
      
    } catch (error) {
      logger.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
     
  }, [debouncedSearchTerm, filterCategory, filterOnSale]);

  useEffect(() => {
    fetchData(false);
  }, [debouncedSearchTerm, filterCategory, filterOnSale, fetchData]);

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        // Update
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        
        if (error) throw error;
        toast.success('Producto actualizado correctamente.');
      } else {
        // Create
        const { error } = await supabase
          .from('products')
          .insert([productData]);
          
        if (error) throw error;
        toast.success('Producto creado correctamente.');
      }
      
      handleCloseModal();
      fetchData(); // Refresh list
    } catch (error) {
      logger.error('Error saving product:', error);
      toast.error(`Error guardando: ${error.message}`);
    }
  };

  const confirm = useConfirm();

  const handleDeleteProduct = async (product) => {
    const isConfirmed = await confirm({
      title: 'Eliminar producto',
      message: '¿Estás seguro de que quieres eliminar este producto de forma permanente? Esta acción no se puede deshacer.',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      type: 'danger'
    });
    
    if (!isConfirmed) return;
    
    try {
      // 1. Delete all images from storage if they exist
      // HIGH-002: Uses shared utility for consistent filename extraction
      const validFiles = collectProductImageFiles(product);
      
      if (validFiles.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('product-images')
          .remove(validFiles);
        if (storageError) logger.error('Error deleting images from storage:', storageError);
      }

      // 2. Delete the database record
      const { error: dbError } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);
        
      if (dbError) throw dbError;
      
      toast.success('Producto eliminado permanentemente.');
      fetchData(false);
    } catch (error) {
      logger.error('Error deleting product:', error);
      toast.error('Error eliminando el producto.');
    }
  };

  const handleBulkDelete = async (ids) => {
    const isConfirmed = await confirm({
      title: 'Eliminar productos masivamente',
      message: `¿Estás seguro de que quieres eliminar ${ids.length} productos de forma permanente?`,
      confirmText: 'Sí, eliminar todos',
      cancelText: 'Cancelar',
      type: 'danger'
    });
    
    if (!isConfirmed) return;
    
    try {
      // Find the products to get their images
      const productsToDelete = products.filter(p => ids.includes(p.id));
      
      // HIGH-002: Uses shared utility — same validation as single delete
      const validFiles = productsToDelete.flatMap(p => collectProductImageFiles(p));

      // 1. Delete from storage if any
      if (validFiles.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('product-images')
          .remove(validFiles);
        if (storageError) logger.error('Error deleting images from storage:', storageError);
      }

      // 2. Delete from database
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', ids);
        
      if (error) throw error;
      
      toast.success(`${ids.length} productos eliminados.`);
      fetchData(false);
    } catch (error) {
      logger.error('Error deleting products:', error);
      toast.error('Error eliminando los productos.');
    }
  };

  return (
    <div className="flex flex-col h-full max-w-[1400px] mx-auto">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Productos</h1>
          <p className="text-slate-500 dark:text-slate-400">Gestiona tu catálogo, inventario y ofertas.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nuevo Producto
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-white/5 p-4 rounded-2xl shadow-360 border border-slate-100 dark:border-white/5 mb-6 flex flex-col md:flex-row gap-4">
        
        {/* Search */}
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input 
            type="text" 
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-64 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
          </span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-white/5 rounded-xl focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white appearance-none cursor-pointer"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* On Sale Filter */}
        <div className="flex items-center gap-2 px-2 md:ml-auto">
          <input
            type="checkbox"
            id="onSaleFilter"
            checked={filterOnSale}
            onChange={(e) => setFilterOnSale(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 dark:border-white/5 outline-none text-primary focus:ring-primary bg-slate-50 dark:bg-white/5 cursor-pointer"
          />
          <label htmlFor="onSaleFilter" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            Solo ofertas activas
          </label>
        </div>

      </div>

      {/* Product Table */}
      <ProductTable 
        products={products}
        isLoading={isLoading && products.length === 0}
        onEdit={handleOpenModal}
        onDelete={(id) => {
           const product = products.find(p => p.id === id);
           handleDeleteProduct(product);
        }}
        onBulkDelete={handleBulkDelete}
      />
      
      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button 
            onClick={() => fetchData(true)}
            disabled={isLoading}
            className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">expand_more</span>
            )}
            Cargar más productos
          </button>
        </div>
      )}
      
      <div className="text-center text-sm text-slate-500 mt-4">
        Mostrando {products.length} de {totalCount} productos
      </div>

      {/* Create/Edit Modal */}
      <ProductModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={editingProduct}
        onSave={handleSaveProduct}
        categories={categories}
      />

    </div>
  );
}
