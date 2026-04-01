-- TAREA-020 / MED-010: Fallback para pg_cron
-- Agrega un recolector de basura probabilístico para limpiar carritos abandonados
-- en caso de que pg_cron falle o no esté habilitado en el plan actual.

CREATE OR REPLACE FUNCTION public.trigger_cleanup_stale_carts()
RETURNS trigger AS $$
BEGIN
  -- 1% de probabilidad de limpiar carritos antiguos en cada modificación.
  -- Esto evita saturar la BD pero asegura limpieza eventual sin cron.
  IF random() < 0.01 THEN
    DELETE FROM public.user_carts 
    WHERE updated_at < now() - interval '7 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recrear el trigger asegurando que use la función
DROP TRIGGER IF EXISTS cleanup_stale_carts_trigger ON public.user_carts;
CREATE TRIGGER cleanup_stale_carts_trigger
  AFTER INSERT OR UPDATE ON public.user_carts
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_cleanup_stale_carts();
