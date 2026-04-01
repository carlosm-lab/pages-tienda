describe('Flujo de Checkout y WhatsApp', () => {
  beforeEach(() => {
    // Interceptar la llamada a window.open para verificar la URL de WhatsApp generada sin salir de la página
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.stub(win, 'open').as('windowOpen');
      }
    });
  });

  it('debería agregar productos al carrito y generar URL de WhatsApp correctamente', () => {
    // Esperar a que los productos carguen
    cy.get('[data-testid="product-card"]').first().should('be.visible');

    // Moverse al carrito vacio
    cy.get('[data-testid="cart-button"]').click();
    cy.get('[data-testid="cart-drawer"]').should('be.visible');
    cy.get('[data-testid="cart-drawer"]').contains('vacío', { matchCase: false });
    cy.get('[data-testid="close-cart"]').click();

    // Agregar primer producto (botón de agregar)
    cy.get('[data-testid="product-card"]').first().find('button').contains('Agregar').click();
    
    // El drawer debería abrirse al agregar (o mostar toast, ajustar según UI real)
    cy.get('[data-testid="cart-button"]').click();
    cy.get('[data-testid="cart-item"]').should('have.length', 1);

    // Proceder al checkout (botón "Pedir por WhatsApp")
    cy.get('[data-testid="checkout-button"]').click();

    // Test the generated URL
    cy.get('@windowOpen').should('have.been.calledOnce');
    cy.get('@windowOpen').then((stub) => {
      const url = stub.getCall(0).args[0];
      expect(url).to.include('whatsapp.com/send');
      expect(url).to.include('text=');
      // Verificar que la URL contiene "Hola" o información del pedido
      expect(decodeURIComponent(url)).to.include('Hola');
    });
  });
});
