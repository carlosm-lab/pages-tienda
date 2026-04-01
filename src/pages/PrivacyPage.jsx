import { Helmet } from 'react-helmet-async';
import { BASE_URL, SITE_NAME } from '@/config/constants';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 pt-[calc(var(--navbar-height)*0.5)] pb-[var(--space-3xl)]">
      <Helmet>
        <title>Política de Privacidad | {SITE_NAME}</title>
        <meta property="og:url" content={`${BASE_URL}/privacy`} />
        <meta property="og:image" content={`${BASE_URL}/og-image.png`} />
        <meta name="description" content={`Política de privacidad y manejo de datos personales de ${SITE_NAME}. Información sobre recopilación, uso, almacenamiento y protección de tu información.`} />
      </Helmet>

      <div className="container mx-auto px-[var(--space-md)] sm:px-[var(--space-lg)] max-w-4xl">
        <div className="bg-white dark:bg-white/5 rounded-3xl px-[var(--space-xl)] pb-[var(--space-xl)] pt-[var(--space-2xl)] sm:px-[var(--space-3xl)] sm:pb-[var(--space-3xl)] sm:pt-[var(--space-3xl)] shadow-360 dark:shadow-none border border-slate-100 dark:border-white/5">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-[var(--space-md)]">Política de Privacidad</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-[var(--space-xl)]">{SITE_NAME}</p>

          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-[var(--space-lg)]">

            {/* ── Sección 1: Introducción ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">1</span>
                Introducción y ámbito de aplicación
              </h2>
              <p>
                PaGe's Detalles &amp; Más es un servicio de catálogo comercial en línea operado desde El Salvador que permite a sus visitantes explorar productos, guardar favoritos, gestionar un carrito de compras y comunicarse con la administración del negocio a través del formulario de contacto integrado en la plataforma. Esta política describe de manera exhaustiva qué información recopila el servicio, cómo la utiliza, dónde la almacena, durante cuánto tiempo la conserva, con qué terceros la comparte, y qué derechos tiene usted como usuario sobre sus propios datos. La política aplica a todas las personas que accedan a la plataforma, independientemente de si han creado una cuenta o si navegan como visitantes anónimos, y cubre tanto la información recopilada activamente a través de formularios e interacciones como la información recopilada de forma pasiva a través del funcionamiento técnico del servicio.
              </p>
              <p>
                Al utilizar este servicio usted acepta las prácticas descritas en este documento. Si no está de acuerdo con alguna de ellas, le recomendamos no utilizar las funcionalidades que impliquen la recopilación de datos personales. Las funcionalidades de navegación y visualización del catálogo están disponibles sin necesidad de proporcionar ningún dato personal.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 2: Responsable del tratamiento ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">2</span>
                Responsable del tratamiento de datos
              </h2>
              <p>
                El responsable del tratamiento de los datos personales recopilados a través de esta plataforma es PaGe's Detalles &amp; Más, negocio de venta directa operado en El Salvador. Las consultas relacionadas con el tratamiento de datos personales pueden dirigirse a través del formulario de contacto disponible en la plataforma o mediante el número de WhatsApp habilitado para comunicación comercial.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 3: Qué información recopilamos ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">3</span>
                Qué información recopilamos y cómo
              </h2>

              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mt-[var(--space-md)]">
                Información que usted nos proporciona directamente
              </h3>
              <p>
                La plataforma recopila información que usted proporciona de manera activa en tres contextos distintos. El primero es el proceso de creación de cuenta mediante Google OAuth. Cuando usted elige iniciar sesión a través de su cuenta de Google, Google transfiere a nuestra plataforma su nombre completo, su dirección de correo electrónico y la URL de su fotografía de perfil tal como están configurados en su cuenta de Google. No solicitamos ni tenemos acceso a su contraseña de Google ni a ningún otro dato de su cuenta más allá de la información de identificación básica descrita. Esta información se almacena en nuestra base de datos en la tabla de perfiles de usuario, asociada a un identificador único generado por el sistema de autenticación. El segundo contexto es el formulario de contacto, que solicita su nombre, dirección de correo electrónico, el asunto de su consulta y el texto del mensaje que desea enviarnos. Esta información se almacena en nuestra base de datos y puede ser leída únicamente por la administración del negocio. El tercero es cualquier nota personalizada que usted agregue voluntariamente en la página de detalle de un producto antes de añadirlo al carrito, que se incluye en el mensaje generado para WhatsApp y por lo tanto viaja fuera de nuestra plataforma hacia la aplicación de mensajería.
              </p>

              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mt-[var(--space-md)]">
                Información generada por su actividad en la plataforma
              </h3>
              <p>
                Cuando usted interactúa con la plataforma, el sistema genera y almacena información derivada de esa actividad. Si usted agrega productos al carrito, el sistema guarda en el almacenamiento local de su navegador un registro con los identificadores de los productos seleccionados, sus nombres, sus precios en el momento del agregado y las cantidades elegidas. Si usted inicia sesión, este registro del carrito se sincroniza adicionalmente con nuestra base de datos y queda asociado a su cuenta. Si usted marca productos como favoritos, los identificadores de esos productos se guardan también en el almacenamiento local de su navegador y, cuando hay una sesión activa, se sincronizan con nuestra base de datos en una tabla que asocia su identificador de usuario con cada identificador de producto marcado. El sistema registra una marca de tiempo de la última vez que se modificó su carrito, utilizada exclusivamente para gestionar la expiración automática descrita más adelante en este documento.
              </p>

              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mt-[var(--space-md)]">
                Información técnica recopilada automáticamente
              </h3>
              <p>
                El servicio utiliza Supabase como proveedor de infraestructura de base de datos y autenticación. Como parte del funcionamiento normal de ese servicio, se registran ciertos datos técnicos asociados a las conexiones y operaciones realizadas, incluyendo potencialmente direcciones IP y marcas de tiempo de las solicitudes. Esta información es gestionada por Supabase según sus propias políticas de privacidad y retención de datos, que son independientes de las de PaGe's Detalles &amp; Más. Los errores técnicos que se producen durante el uso de la plataforma se envían a nuestra base de datos en una tabla de registros del sistema que contiene el nivel de severidad del error, un mensaje descriptivo, información de contexto técnico y la marca de tiempo del evento. Esta información se utiliza exclusivamente para la detección y corrección de problemas técnicos y no contiene datos de identificación personal de los usuarios salvo que esos datos formen accidentalmente parte del mensaje de error.
              </p>

              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mt-[var(--space-md)]">
                Información que no recopilamos
              </h3>
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-[var(--space-md)]">
                <p className="text-emerald-800 dark:text-emerald-200/90">
                  Esta plataforma no recopila datos de pago de ningún tipo, ya que no existe ninguna pasarela de procesamiento de transacciones financieras. No almacena números de tarjetas de crédito, datos bancarios ni ninguna otra información financiera. No realiza seguimiento del comportamiento de navegación con fines publicitarios. No utiliza cookies de terceros para rastreo entre sitios. No vende ni comercializa datos de usuarios. No recopila datos de geolocalización del dispositivo del usuario durante la navegación, aunque cualquier fotografía de producto subida por la administración del negocio a través del panel administrativo pasa por un proceso de compresión de imágenes que elimina automáticamente cualquier metadata de geolocalización que pudiera estar incorporada en el archivo original.
                </p>
              </div>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 4: Cómo utilizamos la información ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">4</span>
                Cómo utilizamos la información recopilada
              </h2>
              <p>
                La información de su perfil, consistente en su nombre, correo electrónico y fotografía obtenidos de Google, se utiliza para identificarle dentro de la plataforma, mostrar su avatar en la interfaz de usuario, y determinar si su cuenta tiene privilegios de administración. Su dirección de correo electrónico no se utiliza para el envío de comunicaciones comerciales ni boletines informativos a menos que usted inicie ese contacto. Los datos del carrito de compras se utilizan para mantener la consistencia de su selección de productos entre sesiones y dispositivos, para verificar periódicamente que los precios almacenados corresponden a los precios vigentes en el catálogo, y para generar el mensaje pre-formateado que se transmite a WhatsApp cuando usted decide proceder con su pedido. Los datos de favoritos se utilizan para mostrarle su lista de productos guardados y para permitirle acceder rápidamente a los productos que ha marcado en sesiones anteriores. Los mensajes enviados a través del formulario de contacto se utilizan exclusivamente para responder a su consulta y no se utilizan para ningún otro propósito comercial o analítico. Los datos de error técnico registrados en el sistema se utilizan exclusivamente para el mantenimiento y mejora de la plataforma.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 5: Bases legales ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">5</span>
                Bases legales para el tratamiento de datos
              </h2>
              <p>
                El tratamiento de sus datos de perfil e historial de actividad descansa sobre la ejecución del contrato de prestación del servicio que se establece cuando usted crea una cuenta, ya que esos datos son necesarios para que el servicio funcione como se describe. El tratamiento de los datos del formulario de contacto descansa sobre su consentimiento explícito expresado al completar y enviar dicho formulario. El tratamiento de datos técnicos para el mantenimiento del servicio descansa sobre el interés legítimo de la plataforma en garantizar la seguridad y el correcto funcionamiento del sistema.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 6: Con quién compartimos ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">6</span>
                Con quién compartimos su información
              </h2>
              <p>
                La plataforma comparte información con un número limitado de proveedores de servicios técnicos que son necesarios para su funcionamiento. Supabase, proveedor estadounidense de servicios de base de datos e infraestructura en la nube, procesa y almacena todos los datos de la plataforma en sus servidores. Supabase actúa como encargado del tratamiento bajo las instrucciones de PaGe's Detalles &amp; Más y opera bajo sus propias certificaciones de seguridad y cumplimiento. Google, como proveedor del sistema de autenticación OAuth, recibe la solicitud de autenticación cuando usted elige iniciar sesión y transfiere a la plataforma la información de perfil descrita anteriormente, pero no recibe de vuelta información sobre su actividad dentro de la plataforma. Cloudflare, proveedor del sistema de verificación antispam Turnstile utilizado en el formulario de contacto, procesa información técnica del navegador para determinar si el envío del formulario proviene de un usuario humano. Vercel, proveedor de servicios de alojamiento web, sirve la aplicación desde sus servidores de distribución de contenido y puede registrar información técnica de las solicitudes HTTP según sus propias políticas. La plataforma no comparte datos personales con ningún otro tercero, no vende datos a anunciantes, y no transfiere información a plataformas de análisis de comportamiento de usuarios.
              </p>
              <p>
                Cuando usted decide proceder con un pedido y el sistema abre WhatsApp con el mensaje pre-formateado, ese mensaje abandona el entorno de la plataforma y pasa a ser procesado por WhatsApp según las políticas de privacidad de Meta Platforms. La plataforma no tiene control sobre el tratamiento que WhatsApp realiza de esa información una vez que el mensaje sale de la interfaz web.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 7: Cómo protegemos ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">7</span>
                Cómo protegemos su información
              </h2>
              <p>
                La plataforma implementa múltiples capas de protección técnica para los datos almacenados y transmitidos. Todas las comunicaciones entre su navegador y los servidores de la plataforma se realizan mediante conexiones cifradas con el protocolo HTTPS. El acceso a los datos en la base de datos está controlado por políticas de seguridad a nivel de fila que se evalúan en el servidor de base de datos para cada operación individual, garantizando que cada usuario solo puede acceder a sus propios datos y que ningún usuario no autorizado puede leer, modificar o eliminar registros que no le pertenecen. Los datos del catálogo de productos y las categorías son de acceso público por diseño, ya que son la información que la plataforma tiene como propósito exhibir. Los datos de perfil de usuario, historial de favoritos, carrito y mensajes de contacto están protegidos por estas políticas de acceso y solo pueden ser leídos por el usuario propietario o por la administración del negocio en el caso de los mensajes de contacto. Los formularios de entrada de datos aplican sanitización que elimina cualquier código HTML o script que pudiera estar contenido en los campos antes de almacenarlos, protegiendo contra ataques de inyección de contenido. Los encabezados HTTP de seguridad configurados en el servidor de distribución restringen los dominios desde los cuales el navegador puede cargar recursos externos, limitando la superficie de ataque para inyección de contenido malicioso. El acceso al panel de administración está protegido por verificación de rol tanto en el lado del cliente como en el lado del servidor de base de datos, de modo que incluso si la verificación del cliente fuera comprometida, las operaciones de escritura seguirían siendo rechazadas por la base de datos.
              </p>
              <p>
                A pesar de estas medidas, ningún sistema de seguridad es infalible. En caso de que se produzca una brecha de seguridad que afecte a datos personales, nos comprometemos a notificar a los usuarios afectados a través de los canales de contacto disponibles en un plazo razonable.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 8: Almacenamiento local ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">8</span>
                Almacenamiento local en su navegador
              </h2>
              <p>
                La plataforma hace uso del almacenamiento local del navegador, conocido como localStorage, para persistir información que le permite disfrutar de una experiencia continua sin necesidad de iniciar sesión. En ese almacenamiento local se guardan los items de su carrito de compras bajo la clave de identificación del servicio, una marca de tiempo de la última modificación del carrito, los identificadores de los productos que ha marcado como favoritos, su preferencia de modo visual oscuro o claro, y un registro de si ha aceptado el aviso de cookies mostrado al acceder por primera vez. El carrito almacenado en el navegador se elimina automáticamente cuando han transcurrido siete días desde su última modificación, momento en el cual la plataforma le muestra una notificación informándole de esa eliminación. La información almacenada en localStorage permanece en su dispositivo hasta que usted la borre manualmente, hasta que expire según los mecanismos descritos, o hasta que usted utilice las herramientas de su navegador para limpiar los datos de sitios web. La plataforma también utiliza sessionStorage, una forma de almacenamiento temporal que se elimina cuando cierra la pestaña del navegador, para guardar una copia de sus datos de sesión durante un máximo de una hora con el fin de evitar consultas de red innecesarias al recargar la página.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 9: Cookies ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">9</span>
                Cookies
              </h2>
              <p>
                Esta plataforma no utiliza cookies de seguimiento, cookies de publicidad ni cookies de terceros para rastreo entre sitios. El único dato relacionado con el consentimiento de cookies que se almacena es un registro binario en el almacenamiento local del navegador que indica si usted ha interactuado con el aviso informativo mostrado al acceder por primera vez, utilizado exclusivamente para no volver a mostrar ese aviso en visitas posteriores. El funcionamiento técnico de la autenticación de Supabase puede implicar el uso de mecanismos de almacenamiento del navegador para gestionar los tokens de sesión, lo cual es necesario para mantener su sesión iniciada entre páginas y recargas.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 10: Retención de datos ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">10</span>
                Retención de datos
              </h2>
              <p>
                Los datos de su perfil de usuario se conservan mientras su cuenta permanezca activa en el sistema. Los datos de su carrito sincronizado con la base de datos se conservan mientras tenga una cuenta activa o hasta que sean sobreescritos por una sincronización posterior. Los favoritos guardados en la base de datos se conservan hasta que usted los elimine individualmente o hasta que su cuenta sea eliminada. Los mensajes enviados a través del formulario de contacto se conservan en la base de datos hasta que la administración del negocio los elimine manualmente desde el panel de administración. Los registros de error técnico se conservan por el tiempo que la administración del negocio considere necesario para el diagnóstico de problemas, sin un período de retención máximo fijo establecido actualmente. La información almacenada en el almacenamiento local de su navegador se conserva según los mecanismos descritos en la sección anterior.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 11: Sus derechos ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">11</span>
                Sus derechos sobre sus datos
              </h2>
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-[var(--space-md)]">
                <p className="text-blue-800 dark:text-blue-200/90">
                  Usted tiene derecho a solicitar acceso a los datos personales que la plataforma tiene sobre usted, a solicitar la corrección de datos inexactos, a solicitar la eliminación de su cuenta y los datos asociados, y a revocar el acceso que ha otorgado a la plataforma a través de Google OAuth mediante la configuración de permisos de su cuenta de Google. Para ejercer cualquiera de estos derechos puede ponerse en contacto con nosotros a través del formulario de contacto disponible en la plataforma o mediante el número de WhatsApp del negocio. Responderemos a su solicitud en un plazo razonable.
                </p>
              </div>
              <p>
                Tenga en cuenta que la eliminación de su cuenta implica la eliminación de su perfil, su historial de favoritos en la base de datos y el carrito sincronizado, pero no afecta a los mensajes que haya enviado a través del formulario de contacto, que pueden ser retenidos por razones de registro de comunicaciones. Los datos almacenados en el dispositivo de su navegador deben ser eliminados por usted directamente a través de las herramientas de gestión de datos de su navegador.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 12: Menores de edad ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">12</span>
                Menores de edad
              </h2>
              <p>
                Esta plataforma no está dirigida a personas menores de dieciocho años y no recopila deliberadamente información personal de menores. Si usted es padre, madre o tutor legal y tiene conocimiento de que un menor bajo su responsabilidad ha proporcionado información personal a través de esta plataforma, le rogamos que se ponga en contacto con nosotros para que podamos proceder a la eliminación de esos datos.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 13: Transferencias internacionales ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">13</span>
                Transferencias internacionales de datos
              </h2>
              <p>
                Los datos recopilados por esta plataforma son procesados y almacenados por Supabase, cuya infraestructura puede estar ubicada en servidores situados fuera de El Salvador, incluyendo potencialmente servidores en los Estados Unidos de América o en otras jurisdicciones. Al utilizar esta plataforma usted acepta que sus datos pueden ser transferidos y procesados en esas jurisdicciones, que pueden tener leyes de protección de datos distintas a las de su país de residencia. Vercel, como proveedor de distribución de contenido, también opera una red de servidores distribuida globalmente. PaGe's Detalles &amp; Más selecciona proveedores que ofrecen garantías contractuales razonables sobre la protección de los datos que procesan en su nombre.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 14: Cambios en esta política ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">14</span>
                Cambios en esta política
              </h2>
              <p>
                Esta política puede ser actualizada periódicamente para reflejar cambios en las prácticas de tratamiento de datos, cambios en los servicios ofrecidos, o cambios en los requisitos legales aplicables. Cuando se realicen cambios sustanciales, lo comunicaremos a través de un aviso visible en la plataforma. La fecha de última actualización indicada al final de este documento refleja cuándo fue revisada por última vez. Le recomendamos revisar esta política periódicamente para mantenerse informado sobre cómo protegemos su información.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 15: Protección en contexto del modelo de negocio ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">15</span>
                Protección de datos en el contexto del modelo de negocio
              </h2>
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-[var(--space-md)]">
                <p className="font-semibold text-amber-800 dark:text-amber-300 mb-2">⚠️ Aviso importante sobre WhatsApp</p>
                <p className="text-amber-700 dark:text-amber-200/80">
                  Es importante destacar un aspecto particular del modelo de negocio de PaGe's Detalles &amp; Más que tiene implicaciones directas sobre la privacidad. A diferencia de un ecommerce convencional donde toda la transacción ocurre dentro del sistema y los datos del pedido quedan bajo el control exclusivo del operador de la plataforma, el cierre de cada venta en este servicio ocurre a través de WhatsApp, que es una plataforma de terceros con sus propias políticas de privacidad y condiciones de uso.
                </p>
              </div>
              <p>
                Cuando usted confirma un pedido y el sistema abre WhatsApp con el mensaje pre-formateado, ese mensaje contiene la lista de productos seleccionados, las cantidades, los precios y cualquier nota personalizada que usted haya añadido. A partir de ese momento, esa información queda sujeta a las políticas de Meta Platforms y de WhatsApp, sobre las cuales PaGe's Detalles &amp; Más no tiene ningún control ni responsabilidad. Si usted tiene preocupaciones sobre el tratamiento de sus datos por parte de WhatsApp, le recomendamos consultar las políticas de privacidad de esa plataforma antes de proceder con el envío del mensaje. La plataforma no almacena el contenido de los mensajes enviados por WhatsApp ni tiene acceso a la conversación que se desarrolla a partir de ese punto.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 16: Seguridad de imágenes ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">16</span>
                Seguridad específica de las imágenes subidas por la administración
              </h2>
              <p>
                El sistema incluye un mecanismo técnico que elimina automáticamente toda la metadata incrustada en las imágenes de productos en el momento de su subida al servidor. Esta metadata, conocida técnicamente como EXIF, puede contener información sensible como las coordenadas GPS del lugar donde fue tomada la fotografía, el modelo y número de serie del dispositivo utilizado, y la fecha y hora exacta de la captura. Al procesar cada imagen a través de un proceso de recompresión antes de almacenarla, el sistema garantiza que ninguna imagen visible en el catálogo público pueda revelar inadvertidamente la ubicación física de quien la fotografió. Este mecanismo protege la privacidad de la administradora del negocio, quien típicamente fotografía los productos desde su entorno personal o profesional.
              </p>
            </section>

            <hr className="border-slate-200 dark:border-white/10" />

            {/* ── Sección 17: Protección formulario de contacto ── */}
            <section className="space-y-[var(--space-sm)]">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-start gap-3">
                <span className="flex items-center justify-center rounded-lg aspect-square w-[clamp(2rem,5vw,2.5rem)] bg-slate-100 dark:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 font-black shrink-0 transition-colors mt-0.5">17</span>
                Mecanismos de protección contra uso abusivo del formulario de contacto
              </h2>
              <p>
                El formulario de contacto implementa tres mecanismos técnicos de protección que implican el tratamiento de cierta información con el único propósito de distinguir envíos legítimos de intentos de abuso automatizado.
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  El sistema Cloudflare Turnstile, que analiza características técnicas del navegador y del patrón de interacción con la página para generar un token de verificación que se envía junto con el formulario. Esta verificación no requiere que usted realice ninguna acción visual como seleccionar imágenes o resolver acertijos, pero implica que Cloudflare procesa información técnica de su navegador según sus propias políticas de privacidad.
                </li>
                <li>
                  Un campo oculto en el formulario que los usuarios humanos nunca ven ni completan, pero que los sistemas automatizados de envío masivo típicamente rellenan. Si ese campo contiene cualquier contenido cuando el formulario se envía, el envío se descarta automáticamente y silenciosamente.
                </li>
                <li>
                  Un registro en el almacenamiento local de su navegador de la marca de tiempo del último envío exitoso del formulario, utilizado para impedir envíos en intervalos inferiores a sesenta segundos.
                </li>
              </ol>
              <p>
                Ninguno de estos mecanismos recopila información de identificación personal adicional a la que usted proporciona voluntariamente en los campos del formulario.
              </p>
            </section>

            {/* ── Footer ── */}
            <div className="mt-[var(--space-2xl)] p-[var(--space-md)] bg-gray-50 dark:bg-white/5 rounded-xl text-sm italic">
              Esta política de privacidad está vigente desde su publicación y refleja las prácticas de tratamiento de datos implementadas en la versión actual de la plataforma PaGe's Detalles &amp; Más. Última actualización: Marzo 2026.
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
