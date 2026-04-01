import { Helmet } from 'react-helmet-async';
import { BASE_URL, SITE_NAME } from '@/config/constants';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 pt-[calc(var(--navbar-height)*0.5)] pb-[var(--space-3xl)]">
      <Helmet>
        <title>Términos y Condiciones | {SITE_NAME}</title>
        <meta property="og:url" content={`${BASE_URL}/terms`} />
        <meta property="og:image" content={`${BASE_URL}/og-image.png`} />
        <meta name="description" content={`Términos y condiciones de uso de la plataforma ${SITE_NAME}. Información sobre precios, envíos, devoluciones, responsabilidades y derechos del usuario.`} />
      </Helmet>

      <div className="container mx-auto px-[var(--space-md)] sm:px-[var(--space-lg)] max-w-4xl">
        <div className="bg-white dark:bg-white/5 rounded-3xl px-[var(--space-xl)] pb-[var(--space-xl)] pt-[var(--space-2xl)] sm:px-[var(--space-3xl)] sm:pb-[var(--space-3xl)] sm:pt-[var(--space-3xl)] shadow-360 dark:shadow-none border border-slate-100 dark:border-white/5">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-[var(--space-md)]">Términos y Condiciones de Uso</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-[var(--space-xl)]">{SITE_NAME}</p>

          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-[var(--space-lg)]">

            {/* ── Sección 1: Aceptación ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">1</span>
                Aceptación de los términos
              </h2>
              <p>
                Al acceder, navegar o utilizar de cualquier manera la plataforma web de PaGe's Detalles &amp; Más, usted declara haber leído, comprendido y aceptado en su totalidad los presentes Términos y Condiciones de Uso. Esta aceptación es inmediata y automática desde el momento en que usted accede a cualquier página de la plataforma, independientemente de si ha creado una cuenta, de si ha realizado alguna compra, o de si ha interactuado con alguna funcionalidad específica del servicio. Si usted no está de acuerdo con alguno de los términos aquí establecidos, debe abstenerse de utilizar la plataforma de forma inmediata y no volver a acceder a ella hasta que los términos sean de su conformidad o hasta que haya obtenido una aclaración por escrito del operador del servicio.
              </p>
              <p>
                Estos términos constituyen un acuerdo legalmente vinculante entre usted, en su calidad de usuario de la plataforma, y PaGe's Detalles &amp; Más, en su calidad de operador del servicio. La relación entre las partes se rige exclusivamente por los presentes términos y por la legislación aplicable de la República de El Salvador. Cualquier uso continuado de la plataforma después de la publicación de modificaciones a estos términos constituirá aceptación tácita de dichas modificaciones.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 2: Descripción del servicio ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">2</span>
                Descripción del servicio y naturaleza de la plataforma
              </h2>
              <p>
                PaGe's Detalles &amp; Más opera como una plataforma de catálogo comercial en línea cuyo propósito es exhibir productos disponibles para la venta y facilitar el contacto entre compradores interesados y la administración del negocio. La plataforma no es una tienda en línea en el sentido convencional del término: no procesa pagos, no gestiona inventario en tiempo real, no garantiza la disponibilidad inmediata de ningún producto, y no constituye por sí misma un contrato de compraventa. La plataforma es un medio de presentación y comunicación, no un sistema de transacciones comerciales automatizadas.
              </p>
              <p>
                Todo el proceso de compra, desde la confirmación de disponibilidad del producto hasta el acuerdo sobre el precio final, la modalidad de pago, las condiciones de entrega y cualquier otro aspecto de la transacción, se realiza directamente entre el comprador y la administración del negocio a través de WhatsApp u otros canales de comunicación directa. La plataforma web actúa únicamente como puente inicial que facilita ese contacto, y su función termina en el momento en que el usuario genera el mensaje de pedido y lo envía a través de WhatsApp. Lo que ocurre a partir de ese momento es una transacción privada entre las partes, sujeta a los acuerdos que ellas mismas establezcan.
              </p>
              <p>
                El operador de la plataforma se reserva el derecho de modificar, suspender, interrumpir o descontinuar el servicio o cualquiera de sus funcionalidades en cualquier momento, con o sin previo aviso, sin que esto genere ninguna obligación de compensación, indemnización o responsabilidad de ningún tipo hacia los usuarios.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 3: Elegibilidad ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">3</span>
                Elegibilidad y capacidad legal
              </h2>
              <p>
                Para utilizar los servicios de esta plataforma usted declara tener al menos dieciocho años de edad o la mayoría de edad legal en su jurisdicción de residencia, lo que sea mayor. Declara además tener plena capacidad legal para celebrar contratos y asumir las obligaciones derivadas del uso de este servicio. Si usted es menor de edad, solo puede utilizar la plataforma bajo la supervisión directa de su padre, madre o tutor legal, quien asume plena responsabilidad por cualquier interacción, compra o comunicación realizada a través de la plataforma bajo dicha supervisión.
              </p>
              <p>
                Al crear una cuenta mediante Google OAuth, usted garantiza que la cuenta de Google utilizada le pertenece y que tiene autorización para acceder a ella. No está permitido crear cuentas utilizando la identidad de otra persona, crear cuentas falsas o ficticias, ni utilizar mecanismos automatizados para crear múltiples cuentas.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 4: Precios y disponibilidad ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">4</span>
                Precios, disponibilidad y naturaleza informativa del catálogo
              </h2>
              <p>
                Los precios mostrados en el catálogo de la plataforma tienen carácter exclusivamente informativo y referencial. En ningún caso constituyen una oferta contractual vinculante ni garantizan que el producto esté disponible al precio indicado en el momento en que el comprador decida proceder con la adquisición. Los precios están sujetos a cambios sin previo aviso y sin que medie ninguna comunicación anticipada al usuario. La administración del negocio se reserva el derecho de modificar cualquier precio en cualquier momento, por cualquier razón y sin ninguna obligación de justificación.
              </p>
              <p>
                La disponibilidad de los productos tampoco está garantizada por la plataforma. El hecho de que un producto aparezca en el catálogo y esté marcado como disponible no implica que exista stock físico del mismo en el momento de la consulta. La disponibilidad real de cada producto debe confirmarse directamente con la administración del negocio a través de WhatsApp antes de asumir que la adquisición es posible. La plataforma utiliza el valor de disponibilidad estándar establecido por el esquema de datos estructurados de Google para efectos de presentación en motores de búsqueda, lo cual es una convención técnica de posicionamiento web y no una declaración de inventario real.
              </p>
              <p>
                El usuario comprende y acepta que la plataforma puede mostrar productos que ya no están disponibles debido a demoras en la actualización del catálogo, que los precios pueden diferir entre el momento de la visualización y el momento de la confirmación del pedido, y que ninguna de estas circunstancias genera derecho a reclamación alguna contra el operador de la plataforma o contra el negocio.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 5: Pagos ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">5</span>
                Pagos y modalidades de pago
              </h2>
              <p>
                Esta plataforma no procesa pagos de ningún tipo. No existe ninguna integración con pasarelas de pago, sistemas de tarjetas de crédito o débito, billeteras digitales, criptomonedas ni ningún otro mecanismo de pago automatizado. La plataforma no almacena, no solicita y no transmite información financiera de ninguna naturaleza.
              </p>
              <p>
                La modalidad de pago aplicable a cada transacción se acuerda directamente entre el comprador y la administración del negocio a través de WhatsApp, una vez que la disponibilidad del producto y el precio final han sido confirmados. Las modalidades de pago aceptadas pueden incluir transferencia bancaria, depósito bancario, pago en efectivo al momento de la entrega o modalidad de contraentrega, entre otras opciones que la administración del negocio determine según las circunstancias de cada transacción. El acuerdo sobre la modalidad de pago es exclusivamente entre las partes y no involucra a la plataforma web de ninguna manera.
              </p>
              <p>
                El operador de la plataforma web no es parte en ninguna transacción financiera que ocurra entre el comprador y el negocio, y no asume ninguna responsabilidad por problemas, disputas, fraudes o incumplimientos que puedan surgir en relación con los pagos acordados fuera de la plataforma. El usuario reconoce que cualquier pago realizado es una transacción privada y directa con el negocio, y que la plataforma no interviene ni puede intervenir en dichas transacciones de ninguna manera.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 6: Envíos ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">6</span>
                Envíos y entregas
              </h2>
              <p>
                Todo lo relacionado con el proceso de envío y entrega de los productos adquiridos a través de esta plataforma debe ser acordado directamente con la administración del negocio a través de WhatsApp. La plataforma no gestiona, no coordina, no supervisa y no garantiza ningún aspecto del proceso de envío o entrega. La disponibilidad de entrega a domicilio, los territorios cubiertos por el servicio de entrega, los tiempos estimados de entrega, los costos de envío aplicables, las zonas geográficas atendidas y cualquier otra condición relacionada con la logística de entrega son aspectos que se definen y acuerdan exclusivamente en la comunicación directa entre el comprador y la administración del negocio.
              </p>
              <p>
                Cuando el usuario genera un mensaje de pedido a través de la plataforma y lo envía por WhatsApp, ese mensaje representa únicamente una expresión de interés en adquirir los productos listados, no un pedido confirmado ni un contrato de compraventa perfeccionado. La confirmación del pedido, incluyendo la disponibilidad de entrega en la ubicación del comprador, ocurre únicamente cuando la administración del negocio la confirma explícitamente a través de la conversación de WhatsApp. Hasta ese momento, no existe ninguna obligación contractual entre las partes.
              </p>
              <p>
                El operador de la plataforma web no asume ninguna responsabilidad por retrasos en la entrega, daños en el transporte, extravíos, incumplimientos de los plazos acordados, o cualquier otro problema que pueda surgir durante el proceso de entrega. Estos aspectos son de exclusiva responsabilidad del negocio y del comprador según los acuerdos que hayan establecido entre sí. El usuario exonera expresamente al operador de la plataforma de cualquier reclamación relacionada con el proceso de envío o entrega.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 7: Devoluciones ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">7</span>
                Política de devoluciones
              </h2>
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-[var(--space-md)]">
                <p className="font-semibold text-amber-800 dark:text-amber-300 mb-2">⚠️ Importante</p>
                <p className="text-amber-700 dark:text-amber-200/80">
                  Por la naturaleza de los productos comercializados a través de esta plataforma, no se aceptan devoluciones. Una vez que el comprador ha recibido el producto adquirido, la transacción se considera concluida de forma definitiva e irreversible, y no existe ningún mecanismo de devolución del producto ni de reembolso del precio pagado. El usuario comprende y acepta esta condición como parte inherente e inseparable de las condiciones de uso de la plataforma y de adquisición de los productos del negocio.
                </p>
              </div>
              <p>
                Esta política de no devoluciones aplica de manera universal a todos los productos disponibles en el catálogo, sin excepciones, independientemente del motivo que el comprador alegue para solicitar la devolución, del tiempo transcurrido desde la recepción del producto, o de las circunstancias particulares de cada caso. El usuario, al proceder con la adquisición de cualquier producto, declara conocer y aceptar esta política de forma expresa e irrevocable.
              </p>
              <p>
                Se recomienda encarecidamente al usuario verificar con detenimiento todas las características, especificaciones, dimensiones, colores, materiales y cualquier otro atributo relevante del producto antes de confirmar su adquisición, ya que la imposibilidad de devolución hace que la decisión de compra sea definitiva. Para cualquier duda sobre las características específicas de un producto, el usuario debe consultar directamente con la administración del negocio a través de WhatsApp antes de confirmar el pedido. El operador de la plataforma web no asume ninguna responsabilidad por adquisiciones realizadas sin la debida verificación previa de las características del producto.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 8: Cuentas de usuario ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">8</span>
                Cuentas de usuario y responsabilidades del titular
              </h2>
              <p>
                Al crear una cuenta en la plataforma mediante Google OAuth, el usuario se convierte en el único responsable de toda la actividad que se realice bajo su cuenta, incluyendo todas las comunicaciones enviadas a través del formulario de contacto, todos los pedidos generados a través del carrito de compras, y cualquier otra interacción con el sistema que quede asociada a su identidad. El usuario se compromete a mantener la confidencialidad de sus credenciales de acceso y a notificar inmediatamente a la administración del negocio si tiene conocimiento o sospecha fundada de que su cuenta ha sido accedida por un tercero no autorizado.
              </p>
              <p>
                El operador de la plataforma no asume ninguna responsabilidad por pérdidas, daños o perjuicios de cualquier naturaleza que resulten del acceso no autorizado a una cuenta de usuario, del uso indebido de credenciales, o de la usurpación de identidad en el contexto del uso de esta plataforma. La seguridad de las credenciales de Google utilizadas para acceder a la plataforma es responsabilidad exclusiva del titular de esas credenciales.
              </p>
              <p>
                El usuario se compromete a utilizar su cuenta únicamente para los fines legítimos previstos por la plataforma, a no compartir sus credenciales con terceros, a no utilizar la cuenta para actividades fraudulentas o contrarias a la ley, y a no intentar acceder a cuentas de otros usuarios. El incumplimiento de estas obligaciones puede resultar en la suspensión o eliminación de la cuenta sin previo aviso y sin que esto genere ningún derecho a compensación.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 9: Conducta del usuario ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">9</span>
                Conducta del usuario y usos prohibidos
              </h2>
              <p>
                El usuario se compromete a utilizar la plataforma de conformidad con los presentes términos, con las leyes aplicables de la República de El Salvador y con las normas generales de conducta en internet. Está expresamente prohibido utilizar la plataforma para cualquiera de los siguientes propósitos, de forma enunciativa y no limitativa:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Intentar acceder a áreas restringidas de la plataforma o a cuentas de otros usuarios mediante técnicas de fuerza bruta, ingeniería social, explotación de vulnerabilidades o cualquier otro método.</li>
                <li>Enviar contenido fraudulento, engañoso, abusivo, difamatorio, obsceno, amenazante o inapropiado a través del formulario de contacto.</li>
                <li>Utilizar sistemas automatizados, robots, scrapers o cualquier herramienta de extracción masiva de datos para acceder al catálogo de la plataforma.</li>
                <li>Intentar interferir con el funcionamiento normal de la plataforma mediante ataques de denegación de servicio, inyección de código malicioso, manipulación de las solicitudes HTTP o cualquier otra técnica.</li>
                <li>Utilizar la plataforma para enviar comunicaciones comerciales no solicitadas, spam o cualquier tipo de contenido masivo no autorizado.</li>
                <li>Reproducir, distribuir, modificar o crear obras derivadas del contenido de la plataforma sin autorización expresa del operador.</li>
              </ul>
              <p>
                El operador se reserva el derecho de tomar las medidas técnicas, legales y comerciales que considere necesarias frente a cualquier uso que contravenga estas prohibiciones, incluyendo la denuncia ante las autoridades competentes cuando los hechos puedan constituir un delito bajo la legislación salvadoreña o internacional.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 10: Propiedad intelectual ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">10</span>
                Propiedad intelectual y contenido de la plataforma
              </h2>
              <p>
                Todo el contenido disponible en la plataforma, incluyendo pero sin limitarse a los textos, fotografías de productos, logotipos, diseños, código fuente, estructura de navegación, selección y organización de los elementos del catálogo, y cualquier otro elemento protegible bajo la legislación de propiedad intelectual, es propiedad del operador de la plataforma o ha sido licenciado por sus legítimos titulares. Ningún elemento de la plataforma puede ser copiado, reproducido, distribuido, publicado, transmitido, modificado o utilizado de ninguna manera sin el consentimiento previo y expreso por escrito del operador.
              </p>
              <p>
                El usuario que accede a la plataforma obtiene únicamente una licencia limitada, personal, no exclusiva, no transferible y revocable para visualizar el contenido de la plataforma en su dispositivo con el único propósito de explorar el catálogo y generar pedidos según el flujo normal de uso previsto. Esta licencia no incluye ningún derecho a descargar, almacenar, reproducir, redistribuir, modificar, crear obras derivadas, comercializar o explotar de cualquier otra manera el contenido de la plataforma.
              </p>
              <p>
                Las marcas, nombres comerciales, logotipos y cualquier otro signo distintivo que aparezcan en la plataforma son propiedad de sus respectivos titulares y están protegidos por la legislación aplicable. Su aparición en la plataforma no implica ninguna concesión de licencia sobre dichos signos distintivos.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 11: Exoneración contenido catálogo ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">11</span>
                Exoneración de responsabilidad por el contenido del catálogo
              </h2>
              <p>
                El operador de la plataforma realiza sus mejores esfuerzos para mantener la información del catálogo actualizada y precisa, pero no garantiza de ninguna manera la exactitud, completitud, actualidad o idoneidad de la información presentada sobre los productos. Las fotografías de los productos son representativas y pueden diferir del producto real en aspectos como el color, las dimensiones, el acabado superficial o la presentación, debido a factores como la calibración de pantallas, las condiciones de iluminación en las fotografías, el procesamiento digital de las imágenes o variaciones naturales en los productos. Las descripciones de los productos son meramente informativas y no constituyen especificaciones técnicas garantizadas.
              </p>
              <p>
                El usuario asume la plena responsabilidad de verificar las características del producto que le interesa directamente con la administración del negocio antes de proceder con cualquier adquisición. El operador de la plataforma no asume ninguna responsabilidad por expectativas no satisfechas derivadas de discrepancias entre la información presentada en el catálogo y las características reales del producto recibido.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 12: Limitación de responsabilidad ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">12</span>
                Limitación de responsabilidad del operador de la plataforma
              </h2>
              <p>
                En la máxima medida permitida por la legislación aplicable, el operador de la plataforma, el desarrollador del sistema, sus empleados, colaboradores, proveedores de servicios tecnológicos y cualquier otra persona relacionada con la operación de la plataforma quedan expresamente exonerados de toda responsabilidad por daños directos, indirectos, incidentales, especiales, consecuentes, punitivos o ejemplares de cualquier naturaleza, incluyendo pero sin limitarse a pérdidas económicas, pérdidas de beneficios esperados, pérdidas de datos, interrupción del negocio, daños a la reputación, daños morales o cualquier otra pérdida o perjuicio, que resulten de o estén relacionados con: el uso o la imposibilidad de uso de la plataforma; errores, omisiones, inexactitudes o falta de actualización en el contenido del catálogo; fallos técnicos, interrupciones del servicio, pérdida de datos o problemas de seguridad en la plataforma o en los servicios de terceros que esta utiliza; transacciones realizadas entre el comprador y el negocio a través de cualquier canal de comunicación externo a la plataforma, incluyendo WhatsApp; conducta de otros usuarios de la plataforma; o cualquier otro asunto relacionado con el uso de este servicio.
              </p>
              <p>
                Esta limitación de responsabilidad aplica independientemente de la teoría jurídica bajo la cual se plantee la reclamación, ya sea contrato, agravio, responsabilidad objetiva, negligencia o cualquier otra, y aplica incluso en el caso de que el operador haya sido advertido de la posibilidad de dichos daños. Si, a pesar de las limitaciones anteriores, algún tribunal determinara que el operador tiene responsabilidad frente al usuario, dicha responsabilidad estará limitada en todo caso al monto efectivamente pagado por el usuario al operador por el uso del servicio durante los doce meses anteriores al evento generador de la reclamación, que en la gran mayoría de los casos será cero, dado que el uso de la plataforma es gratuito para los usuarios.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 13: Exoneración desarrollador ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">13</span>
                Exoneración de responsabilidad del desarrollador
              </h2>
              <p>
                El desarrollador del sistema que construyó y mantiene la infraestructura tecnológica de la plataforma actúa en calidad de prestador de servicios técnicos y no tiene participación alguna en las decisiones comerciales del negocio, en la determinación de los precios, en la gestión del inventario, en las políticas de devolución, ni en ningún otro aspecto operativo del negocio de PaGe's Detalles &amp; Más. El desarrollador no es responsable por ninguna pérdida, daño, perjuicio o reclamación de ningún tipo que derive del uso de la plataforma, de las transacciones realizadas a través de ella, de la información publicada en el catálogo, o de cualquier otro aspecto del funcionamiento del negocio. El usuario reconoce expresamente que el desarrollador es un tercero ajeno a cualquier relación comercial que pudiera establecerse entre el usuario y el negocio, y renuncia expresamente a cualquier reclamación contra el desarrollador relacionada con el uso de la plataforma o con cualquier transacción comercial.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 14: Servicios de terceros ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">14</span>
                Servicios de terceros e infraestructura tecnológica
              </h2>
              <p>
                La plataforma utiliza servicios tecnológicos de terceros para su funcionamiento, incluyendo Supabase para la gestión de la base de datos y la autenticación, Vercel para el alojamiento y la distribución del contenido, Google para el servicio de autenticación OAuth, Cloudflare para el sistema de verificación antispam del formulario de contacto, y Meta Platforms a través de WhatsApp para la comunicación entre el usuario y el negocio. El operador de la plataforma no tiene control sobre el funcionamiento, la disponibilidad, las políticas o las prácticas de privacidad de estos servicios de terceros, y no asume ninguna responsabilidad por su comportamiento, sus interrupciones, sus cambios de políticas o cualquier otro aspecto de su operación.
              </p>
              <p>
                El usuario reconoce que al utilizar la plataforma interactúa indirectamente con estos servicios de terceros y queda sujeto a sus respectivos términos de uso y políticas de privacidad. Se recomienda al usuario consultar los términos de servicio y las políticas de privacidad de cada uno de estos proveedores para comprender cómo tratan su información. En particular, cuando el usuario utiliza WhatsApp para comunicarse con el negocio, dicha comunicación queda sujeta a las políticas de Meta Platforms, sobre las cuales el operador de esta plataforma no tiene ningún control ni responsabilidad.
              </p>
              <p>
                El operador no garantiza la disponibilidad continua de la plataforma, ya que su funcionamiento depende de la disponibilidad de los servicios de terceros mencionados, de la conectividad a internet del usuario, y de otros factores fuera del control del operador. Las interrupciones del servicio, ya sean planificadas o no planificadas, no generan ningún derecho a compensación o indemnización.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 15: Indemnización ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">15</span>
                Indemnización por parte del usuario
              </h2>
              <p>
                El usuario se compromete a indemnizar, defender y mantener indemne al operador de la plataforma, al desarrollador del sistema, a sus empleados, colaboradores, proveedores y representantes frente a cualquier reclamación, demanda, acción legal, pérdida, daño, costo, gasto u honorario de abogado que resulte de o esté relacionado con: el incumplimiento por parte del usuario de cualquiera de los presentes términos y condiciones; el uso indebido de la plataforma por parte del usuario; la violación por parte del usuario de cualquier ley o regulación aplicable; la infracción por parte del usuario de derechos de terceros, incluyendo derechos de propiedad intelectual, derechos de privacidad o cualquier otro derecho; contenido generado o enviado por el usuario a través de la plataforma; o cualquier otra conducta del usuario en relación con la plataforma. Esta obligación de indemnización subsistirá a la terminación o modificación de los presentes términos.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 16: Seguridad ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">16</span>
                Seguridad de la plataforma y responsabilidad del usuario
              </h2>
              <p>
                La plataforma implementa medidas técnicas de seguridad razonables para proteger los datos de los usuarios y la integridad del sistema, pero el operador no puede garantizar que la plataforma sea completamente segura o libre de vulnerabilidades en todo momento. El usuario reconoce que ningún sistema informático es absolutamente seguro y acepta los riesgos inherentes al uso de servicios en línea. El usuario asume la responsabilidad de utilizar dispositivos seguros, conexiones de red confiables, y software actualizado para acceder a la plataforma.
              </p>
              <p>
                Cualquier intento de comprometer la seguridad de la plataforma, acceder a datos de otros usuarios, explotar vulnerabilidades del sistema, ejecutar código malicioso, o realizar cualquier otra actividad que afecte la integridad o disponibilidad de la plataforma constituye una violación grave de estos términos y puede constituir un delito informático bajo la legislación salvadoreña, sujeto a las consecuencias legales correspondientes. El operador se reserva el derecho de reportar dichas actividades a las autoridades competentes y de ejercer todas las acciones legales disponibles para proteger la integridad del sistema y los derechos de los usuarios afectados.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 17: Menores de edad ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">17</span>
                Menores de edad y responsabilidad parental
              </h2>
              <p>
                Esta plataforma no está dirigida a personas menores de dieciocho años. Los padres, madres y tutores legales son responsables de supervisar el uso que los menores bajo su custodia hagan de internet en general y de esta plataforma en particular. Si un menor realiza un pedido o cualquier otra interacción a través de esta plataforma con o sin el conocimiento de su tutor legal, el tutor legal asume plena responsabilidad por dicha interacción y por las consecuencias que de ella se deriven, incluyendo cualquier obligación de pago que pudiera haberse acordado. El operador de la plataforma no asume ninguna responsabilidad por transacciones realizadas por menores de edad.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 18: Modificaciones ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">18</span>
                Modificaciones a los términos y condiciones
              </h2>
              <p>
                El operador se reserva el derecho de modificar, actualizar, complementar o reemplazar los presentes términos y condiciones en cualquier momento y sin necesidad de notificación previa individual a cada usuario. Las modificaciones entrarán en vigencia inmediatamente después de su publicación en la plataforma. El uso continuado de la plataforma por parte del usuario después de la publicación de cualquier modificación constituirá aceptación automática e irrevocable de los nuevos términos. Es responsabilidad exclusiva del usuario revisar periódicamente estos términos para mantenerse informado sobre los cambios. La fecha de última actualización indicada al final de este documento permite al usuario verificar cuándo fue la última revisión.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 19: Suspensión y terminación ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">19</span>
                Suspensión y terminación del servicio
              </h2>
              <p>
                El operador se reserva el derecho de suspender o terminar el acceso de cualquier usuario a la plataforma, con o sin previo aviso, por cualquier razón que el operador considere suficiente, incluyendo pero sin limitarse al incumplimiento de los presentes términos, el uso indebido de la plataforma, la conducta inapropiada, o simplemente por decisión unilateral del operador. La suspensión o terminación del acceso no genera ningún derecho a compensación, reembolso o indemnización de ningún tipo.
              </p>
              <p>
                El operador también se reserva el derecho de discontinuar permanentemente la operación de la plataforma en cualquier momento, por cualquier razón y sin previo aviso, sin que esto genere ninguna obligación de compensación hacia los usuarios. Los usuarios no tienen ningún derecho adquirido sobre la disponibilidad continua del servicio.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 20: Ausencia de relación ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">20</span>
                Ausencia de relación de franquicia, asociación o representación
              </h2>
              <p>
                Nada en los presentes términos y condiciones, ni en el uso de la plataforma por parte del usuario, ni en las comunicaciones entre el usuario y el negocio, debe interpretarse como la creación de una relación de franquicia, asociación, empresa conjunta, agencia, mandato o empleo entre el usuario y el operador de la plataforma, entre el usuario y el desarrollador del sistema, o entre cualesquiera de las partes involucradas. El operador de la plataforma no actúa como agente ni como representante del usuario en ningún sentido, ni el usuario actúa como agente o representante del operador.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 21: Resolución de disputas ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">21</span>
                Resolución de disputas y jurisdicción aplicable
              </h2>
              <p>
                Cualquier disputa, controversia o reclamación que surja de o esté relacionada con los presentes términos y condiciones, con el uso de la plataforma, o con las transacciones realizadas a través de ella, se resolverá en primera instancia mediante negociación directa de buena fe entre las partes. Si la negociación directa no produce un acuerdo satisfactorio en un plazo razonable, la disputa se someterá a la jurisdicción exclusiva de los tribunales competentes de la República de El Salvador, aplicando la legislación salvadoreña. El usuario renuncia expresamente a cualquier otra jurisdicción que pudiera corresponderle por razón de su domicilio, nacionalidad o lugar de acceso a la plataforma.
              </p>
              <p>
                Para la resolución de disputas menores y de carácter informal, el usuario puede contactar a la administración del negocio a través del formulario de contacto disponible en la plataforma o a través de WhatsApp, antes de iniciar cualquier acción formal. El operador se compromete a responder a las consultas y reclamaciones en un plazo razonable y a intentar resolverlas de manera amistosa cuando sea posible y razonable.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 22: Divisibilidad ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">22</span>
                Divisibilidad de las cláusulas
              </h2>
              <p>
                Si alguna cláusula o parte de los presentes términos y condiciones fuera declarada nula, inválida, inaplicable o contraria a la legislación aplicable por cualquier tribunal o autoridad competente, dicha declaración no afectará la validez ni la aplicabilidad del resto de las cláusulas, que continuarán plenamente vigentes. La cláusula declarada inválida o inaplicable se entenderá reemplazada por la disposición válida y aplicable que más se aproxime a la intención original de la cláusula original.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 23: Renuncia a derechos ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">23</span>
                Renuncia a derechos
              </h2>
              <p>
                El hecho de que el operador no ejerza o haga valer en un momento determinado cualquiera de los derechos o disposiciones contenidos en los presentes términos no constituirá una renuncia a dicho derecho o disposición para el futuro. Ninguna renuncia por parte del operador a cualquier derecho derivado de estos términos será efectiva a menos que conste por escrito firmado por un representante autorizado del operador.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 24: Fuerza mayor ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">24</span>
                Fuerza mayor
              </h2>
              <p>
                El operador no será responsable por ningún incumplimiento o retraso en el cumplimiento de sus obligaciones bajo estos términos cuando dicho incumplimiento o retraso sea causado por circunstancias fuera del control razonable del operador, incluyendo pero sin limitarse a desastres naturales, pandemias, conflictos armados, actos de gobierno, interrupciones de servicios de internet o de infraestructura tecnológica, fallas en los servicios de terceros de los que depende la plataforma, cortes de energía eléctrica, o cualquier otra causa de fuerza mayor o caso fortuito reconocida por la legislación salvadoreña.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 25: Integridad ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">25</span>
                Integridad del acuerdo
              </h2>
              <p>
                Los presentes términos y condiciones, junto con la Política de Privacidad publicada en la plataforma, constituyen el acuerdo completo e íntegro entre el usuario y el operador respecto al uso de la plataforma, y sustituyen cualquier comunicación, negociación, representación o acuerdo previo, ya sea verbal o escrito, relacionado con el mismo objeto. Ninguna representación verbal o escrita realizada por empleados, agentes o colaboradores del operador fuera del marco de estos documentos formará parte del acuerdo ni tendrá carácter vinculante, salvo que conste en una modificación formal de estos términos debidamente publicada en la plataforma.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 26: Comunicaciones ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">26</span>
                Comunicaciones y notificaciones
              </h2>
              <p>
                Para cualquier consulta, reclamación, ejercicio de derechos o comunicación formal relacionada con los presentes términos, el usuario puede dirigirse al operador a través del formulario de contacto disponible en la plataforma o a través del número de WhatsApp habilitado para comunicación comercial. El operador no garantiza un tiempo de respuesta específico, aunque se compromete a atender las comunicaciones en un plazo razonable. Las comunicaciones enviadas por canales distintos a los indicados no se considerarán recibidas por el operador a ningún efecto legal.
              </p>
            </section>

            {/* ── Footer ── */}
            <div className="mt-[var(--space-2xl)] p-[var(--space-md)] bg-gray-50 dark:bg-white/5 rounded-xl text-sm italic">
              Los presentes Términos y Condiciones de Uso están vigentes desde su publicación y son aplicables a todos los usuarios de la plataforma PaGe's Detalles &amp; Más. Última actualización: Marzo 2026.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
