import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/logger';


export default function ImageUploader({ onUploadSuccess, currentImage, onRemoveImage }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const isMounted = useRef(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  // No pre-compression size limit — we compress everything to WebP
  const maxCompressedSize = 2 * 1024 * 1024; // 2MB post-compression safety net

  /**
   * LOW-009: Compresión y Sanitización de Imágenes
   * Renderizar la imagen en un elemento <canvas> y luego exportarla con toBlob()
   * tiene el efecto secundario crítico de ELIMINAR toda la metadata EXIF (GPS, 
   * modelo de cámara, fechas). Esto es esencial para la privacidad/seguridad
   * de la administradora al subir fotos tomadas con su móvil desde su ubicación.
   *
   * Compresión adaptativa: imágenes más grandes reciben más compresión.
   * El resultado siempre es WebP, que típicamente reduce 50-80% vs JPEG/PNG.
   */
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        URL.revokeObjectURL(img.src);
        let width = img.width;
        let height = img.height;
        const maxDim = 1600;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round(height * maxDim / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round(width * maxDim / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Adaptive quality: larger originals get more compression
        const sizeMB = file.size / (1024 * 1024);
        let quality = sizeMB > 8 ? 0.55 : sizeMB > 4 ? 0.65 : sizeMB > 2 ? 0.72 : 0.80;

        // Try compression, reduce quality if still too large
        const tryCompress = (q) => {
          return new Promise((res) => {
            canvas.toBlob((blob) => res(blob), 'image/webp', q);
          });
        };

        try {
          let blob = await tryCompress(quality);
          // If still over limit, reduce quality further
          while (blob && blob.size > maxCompressedSize && quality > 0.3) {
            quality -= 0.1;
            blob = await tryCompress(quality);
          }

          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }

          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Error loading image for compression'));
    });
  };

  const processFile = async (file) => {
    setError(null);
    
    if (!acceptedTypes.includes(file.type)) {
      setError('Formato no soportado. Usa JPG, PNG, WEBP o GIF.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const compressedFile = await compressImage(file);
      setUploadProgress(40);

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/webp'
        });

      if (uploadError) throw uploadError;
      setUploadProgress(80);

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
        
      setUploadProgress(100);
      
      if (onUploadSuccess) {
        onUploadSuccess(publicUrl);
      }
      
    } catch (err) {
      logger.error('Error uploading image:', err);
      if (err.statusCode === 403 || err.message?.includes('403') || err.message?.toLowerCase().includes('permission')) {
        setError('Error 403: No tienes permisos para subir archivos. Sesión expirada o política Storage RLS denegada.');
      } else if (err.cause?.name === 'QuotaExceededError' || err.statusCode === 413) {
        setError('Error: El archivo comprimido sigue siendo muy grande. Usa una imagen más pequeña.');
      } else {
        setError('Ocurrió un error de red al subir la imagen. Intenta de nuevo.');
      }
    } finally {
      setIsUploading(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (isMounted.current) setUploadProgress(0);
      }, 1000);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  return (
    <div className="w-full">
      {currentImage ? (
        <div className="relative w-full aspect-video sm:aspect-square md:aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-transparent border border-slate-200 dark:border-white/5 flex items-center justify-center group">
          <img src={currentImage} alt="Vista previa" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button 
               type="button"
               onClick={onRemoveImage}
               className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-360 flex items-center gap-2 px-4"
             >
               <span className="material-symbols-outlined text-[18px]">delete</span>
               <span className="text-sm font-bold">Cambiar Imagen</span>
             </button>
          </div>
        </div>
      ) : (
        <div 
          className={`relative w-full border-2 border-dashed rounded-xl p-6 md:p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
            ${isUploading ? 'border-primary bg-blue-50/50' : 'border-slate-300 dark:border-white/5 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-white/10 bg-white dark:bg-white/5'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/jpeg, image/png, image/webp, image/gif" 
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center w-full max-w-[200px]">
               <span className="material-symbols-outlined text-primary text-4xl animate-bounce mb-2">cloud_upload</span>
               <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subiendo imagen...</p>
               <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                 <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
               </div>
            </div>
          ) : (
            <>
               <span className="material-symbols-outlined text-slate-400 text-4xl mb-3">add_photo_alternate</span>
               <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Haz clic o arrastra tu imagen aquí</p>
               <p className="text-xs text-slate-500 dark:text-slate-400">JPG, PNG, WEBP o GIF — se comprime automáticamente</p>
            </>
          )}
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span> {error}</p>}
    </div>
  );
}
