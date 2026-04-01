import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Supabase session in localStorage
    const mockSession = {
      access_token: 'fake-token',
      refresh_token: 'fake-refresh',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: {
        id: '123d4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
        role: 'authenticated'
      }
    };
    
    await page.addInitScript((session) => {
      window.localStorage.setItem('pages-auth', JSON.stringify(session));
    }, mockSession);
    
    // Intercept Supabase product and category requests
    await page.route('**/rest/v1/products*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'prod-1',
            name: 'Producto Dummy E2E',
            price: 50.00,
            description: 'A mock product for testing checkout flow',
            image_url: 'https://via.placeholder.com/150',
            slug: 'producto-dummy'
          }
        ])
      });
    });
    
    await page.route('**/rest/v1/categories*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '[]'
      });
    });
    
    await page.route('**/rest/v1/rpc/generate_whatsapp_message*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify('Hola, me interesa el Producto Dummy E2E')
      });
    });
    
    await page.route('**/rest/v1/carts*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    
    await page.route('**/rest/v1/profiles*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: '123d4567-e89b-12d3-a456-426614174000', role: 'customer' }) });
    });
    
    await page.route('**/rest/v1/favorites*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.route('**/rest/v1/store_settings*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ contact_phone: '50370001234' }]) });
    });
  });

  test('should add a product and verify WhatsApp link', async ({ page, context }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    
    // 1. Go to catalog
    await page.goto('/catalog');
    
    // 2. Find "Añadir al carrito" button and click it
    const addButton = page.getByLabel('Añadir al carrito').first();
    await expect(addButton).toBeVisible();
    await addButton.click();
    
    // 3. Open Cart
    const cartButton = page.getByLabel('Abrir carrito').first();
    await cartButton.click();
    
    // 4. Verify product in cart drawer
    await expect(page.locator('body')).toContainText(/total a pagar/i);
    
    // 5. Open WhatsApp Confirm Dialog
    const sendOrderBtn = page.getByRole('button', { name: /pedir por whatsapp/i });
    await expect(sendOrderBtn).toBeVisible();
    await sendOrderBtn.click();
    
    // 6. Verify WhatsApp popup URL triggered by Confirm button
    const confirmBtn = page.getByRole('button', { name: /confirmar/i });
    await expect(confirmBtn).toBeVisible();
    
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      confirmBtn.click()
    ]);
    
    // Check that the popup URL went to WhatsApp (it starts as about:blank, then navigates to wa.me and then to api.whatsapp.com)
    await expect(newPage).toHaveURL(/wa\.me|api\.whatsapp\.com/);
    await expect(newPage).toHaveURL(/text=/);
  });
});
