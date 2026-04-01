import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Supabase session for admin
    const mockSession = {
      access_token: 'fake-admin-token',
      refresh_token: 'fake-admin-refresh',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: {
        id: 'admin-123',
        email: 'admin@example.com',
        user_metadata: { full_name: 'Admin User' },
        role: 'authenticated'
      }
    };
    
    await page.addInitScript((session) => {
      window.localStorage.setItem('pages-auth', JSON.stringify(session));
      window.sessionStorage.setItem('pages_is_admin', 'true');
    }, mockSession);
    
    // Intercept Supabase profile fetch for AuthContext
    await page.route('**/rest/v1/profiles?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'admin-123', role: 'admin' })
      });
    });
  });

  test('should access admin dashboard and see product administration', async ({ page }) => {
    await page.goto('/admin');
    
    // Admin layout should be visible
    await expect(page.locator('text=/panel de control/i').first()).toBeVisible();
    
    // Verify tabs/links to "Productos" "Categorías" are present
    await expect(page.locator('a[href="/admin/products"]').first()).toBeVisible();
  });
});
