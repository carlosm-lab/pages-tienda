-- CRIT-DB01: Consolidated Dashboard RPC — hardened against missing dependent functions
-- This function provides all dashboard data in a single network call.
-- Requires admin role. Fixed phantom columns and added safe handling for optional functions.

-- Drop legacy fallback function if it exists
DROP FUNCTION IF EXISTS public.get_dashboard_summary();

CREATE OR REPLACE FUNCTION get_dashboard_data(limit_products int DEFAULT 5, limit_messages int DEFAULT 4, top_favorites_limit int DEFAULT 5)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result json;
    summary_data record;
    products_data json;
    messages_data json;
    category_data json;
    top_favs_data json;
BEGIN
    -- Only admins can access dashboard data — prevents data leak to regular users
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Access denied';
    END IF;

    -- 1. Summary Stats
    SELECT 
        (SELECT COUNT(*) FROM public.products) as total_products,
        (SELECT COUNT(*) FROM public.products
         WHERE old_price IS NOT NULL AND old_price > price
         AND (offer_starts_at IS NULL OR offer_starts_at <= now())
         AND (offer_ends_at IS NULL OR offer_ends_at > now())) as active_offers,
        (SELECT COUNT(*) FROM public.contact_messages WHERE is_read = false) as unread_messages,
        (SELECT COUNT(*) FROM public.user_favorites) as total_favorites,
        (SELECT COUNT(*) FROM public.categories) as total_categories,
        (SELECT COUNT(*) FROM public.profiles) as total_users
    INTO summary_data;

    -- 2. Recent Products (fixed: 'category' -> 'category_id', added is_active column)
    SELECT json_agg(p)
    INTO products_data
    FROM (
        SELECT id, name, price, category_id, image_path, created_at, is_active
        FROM public.products
        ORDER BY created_at DESC
        LIMIT limit_products
    ) p;

    -- 3. Recent Messages
    SELECT json_agg(m)
    INTO messages_data
    FROM (
        SELECT id, name, subject, message, created_at, is_read
        FROM public.contact_messages
        WHERE is_read = false
        ORDER BY created_at DESC
        LIMIT limit_messages
    ) m;

    -- 4. Category Stats — safely handle missing function
    BEGIN
        category_data := public.get_category_stats();
    EXCEPTION WHEN undefined_function THEN
        category_data := '[]'::json;
    END;

    -- 5. Top Favorites — safely handle missing function
    BEGIN
        top_favs_data := public.get_top_favorites(top_favorites_limit);
    EXCEPTION WHEN undefined_function THEN
        top_favs_data := '[]'::json;
    END;

    -- Assemble JSON response
    result := json_build_object(
        'summary', json_build_object(
            'totalProducts', summary_data.total_products,
            'activeOffers', summary_data.active_offers,
            'unreadMessages', summary_data.unread_messages,
            'totalFavorites', summary_data.total_favorites,
            'totalCategories', summary_data.total_categories,
            'totalUsers', summary_data.total_users
        ),
        'recentProducts', COALESCE(products_data, '[]'::json),
        'recentMessages', COALESCE(messages_data, '[]'::json),
        'categoryData', COALESCE(category_data, '[]'::json),
        'topFavorites', COALESCE(top_favs_data, '[]'::json)
    );

    RETURN result;
END;
$$;
