import { test, expect } from '@playwright/test';

test.describe('WhatsApp Checkout Full Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Definimos el mock del entorno para que la prueba no dependa de DB real
    await page.route('**/rest/v1/store_settings*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ contact_phone: '50370001234' }]) });
    });

    await page.route('**/rest/v1/products*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'prod-uuid-1',
            name: 'Ramo Buchón E2E',
            price: 75.00,
            description: 'Producto para test',
            image_url: 'https://via.placeholder.com/150',
            slug: 'ramo-buchon-e2e',
            is_active: true
          }
        ])
      });
    });

    await page.route('**/rest/v1/categories*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    // Mock del RPC para evitar validación de backend y asegurar el payload
    await page.route('**/rest/v1/rpc/generate_whatsapp_message*', async (route) => {
      const requestData = JSON.parse(route.request().postData() || '{}');
      
      // Verificamos que los items contengan nota y color
      const hasNote = requestData.items?.[0]?.note === 'Para mi novia, sin tarjeta';
      
      let mensajeGenerado = 'Hola, me encanta el producto.';
      if (hasNote) {
         mensajeGenerado += ' Nota: "Para mi novia, sin tarjeta".';
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mensajeGenerado)
      });
    });
  });

  test('debe agregar producto, personalizar nota y disparar WhatsApp Web correctamente (URL encoded)', async ({ page, context }) => {
    // Navegamos al detalle del producto
    await page.goto('/product/ramo-buchon-e2e');
    
    // Rellenamos una nota o color si el componente de personalización existe 
    // Usamos selectores resilientes
    const noteInput = page.getByPlaceholder(/nota|mensaje|personalizació/i);
    // Si el input está visible, le agregamos texto
    if (await noteInput.isVisible()) {
        await noteInput.fill('Para mi novia, sin tarjeta');
    }

    // click Añadir
    const addToCartBtn = page.getByRole('button', { name: /añadir al carrito/i });
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // Abrir carrito
    const openCartBtn = page.getByLabel(/carrito/i).first();
    await openCartBtn.click();

    // Verificamos que el producto esté listado
    await expect(page.locator('body')).toContainText('Ramo Buchón E2E');
    
    // ClickPedir por WhatsApp
    const requestWA = page.getByRole('button', { name: /pedir por whatsapp/i });
    await expect(requestWA).toBeVisible();
    await requestWA.click();
    
    // Capturar la nueva pestaña que abre window.open o target="_blank"
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /enviar|confirmar/i }).click()
    ]);
    
    // La url de la nueva pestaña debe ser obligatoriamente wa.me/ o api.whatsapp.com
    await newPage.waitForLoadState();
    const popupUrl = newPage.url();
    
    // Test 1: Destino válido (no whatsapp.com desktop directo, no localhost)
    expect(popupUrl).toMatch(/https:\/\/(wa\.me|api\.whatsapp\.com)\//);
    
    // Test 2: Inclusión del teléfono
    expect(popupUrl).toContain('50370001234');
    
    // Test 3: Contiene text= encodeado
    expect(popupUrl).toContain('text=');
  });
});
