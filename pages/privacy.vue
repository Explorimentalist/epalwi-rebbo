<template>
  <div class="privacy-page">
    <nav-bar />
    
    <div class="page-container">
      <div class="page-header">
        <h1 class="ds-text-display-lg">Política de Privacidad</h1>
      </div>
      
      <div class="privacy-content">
        <section>
          <h2 class="ds-text-display-sm">1. Información que Recopilamos</h2>
          <p>En epàlwi-rèbbo recopilamos únicamente la información necesaria para proporcionar nuestros servicios de diccionario español-ndowe:</p>
          <ul>
            <li><strong>Dirección de correo electrónico:</strong> Para la autenticación mediante enlaces mágicos y comunicaciones del servicio</li>
            <li><strong>Datos de suscripción:</strong> Información de facturación procesada de forma segura por Stripe</li>
            <li><strong>Comentarios y sugerencias:</strong> Feedback voluntario que envías para mejorar el diccionario</li>
            <li><strong>Datos de uso:</strong> Palabras consultadas y patrones de búsqueda para mejorar nuestros servicios</li>
            <li><strong>Datos técnicos:</strong> Información de cache local y preferencias para funcionalidad offline</li>
          </ul>
        </section>

        <section>
          <h2 class="ds-text-display-sm">2. Cómo Utilizamos tu Información</h2>
          <p>Utilizamos la información recopilada exclusivamente para:</p>
          <ol>
            <li>Gestionar tu cuenta y procesos de autenticación</li>
            <li>Procesar suscripciones y gestionar facturación</li>
            <li>Proporcionar funcionalidad offline del diccionario</li>
            <li>Mejorar el contenido y las funciones del diccionario</li>
            <li>Enviar comunicaciones relacionadas con el servicio</li>
            <li>Responder a consultas y proporcionar soporte técnico</li>
          </ol>
        </section>

        <section>
          <h2 class="ds-text-display-sm">3. Almacenamiento y Seguridad</h2>
          <p>Nos comprometemos a proteger tu información mediante las siguientes medidas:</p>
          <ul>
            <li><strong>Firebase/Firestore:</strong> Tus datos de cuenta se almacenan de forma segura en la infraestructura de Google</li>
            <li><strong>Stripe:</strong> Los datos de pago son procesados directamente por Stripe sin almacenarse en nuestros servidores</li>
            <li><strong>Cache local:</strong> El contenido del diccionario se almacena localmente en tu dispositivo para uso offline</li>
            <li><strong>Cifrado:</strong> Todas las comunicaciones están protegidas mediante HTTPS</li>
          </ul>
        </section>

        <section>
          <h2 class="ds-text-display-sm">4. Compartir Información con Terceros</h2>
          <p>Compartimos información limitada únicamente con proveedores de servicios esenciales:</p>
          <ul>
            <li><strong>Stripe:</strong> Para el procesamiento seguro de pagos y suscripciones</li>
            <li><strong>MailerSend:</strong> Para el envío de enlaces de autenticación por correo electrónico</li>
            <li><strong>Google Sheets:</strong> Para almacenar feedback y sugerencias de mejora</li>
          </ul>
          <p>Nunca vendemos, alquilamos o compartimos tu información personal con terceros para fines comerciales.</p>
        </section>

        <section>
          <h2 class="ds-text-display-sm">5. Tus Derechos</h2>
          <p>Como usuario de epàlwi-rèbbo, tienes derecho a:</p>
          <ul>
            <li><strong>Acceso:</strong> Solicitar una copia de los datos personales que tenemos sobre ti</li>
            <li><strong>Corrección:</strong> Solicitar la corrección de información inexacta</li>
            <li><strong>Eliminación:</strong> Solicitar la eliminación de tu cuenta y datos asociados</li>
            <li><strong>Portabilidad:</strong> Solicitar una copia de tus datos en formato estructurado</li>
            <li><strong>Cancelación:</strong> Cancelar tu suscripción en cualquier momento</li>
          </ul>
          <p>Para ejercer estos derechos, contáctanos en el correo proporcionado al final de esta política.</p>
        </section>

        <section>
          <h2 class="ds-text-display-sm">6. Tecnologías y Cookies</h2>
          <p>epàlwi-rèbbo utiliza las siguientes tecnologías para mejorar tu experiencia:</p>
          <ul>
            <li><strong>Service Workers:</strong> Para habilitar funcionalidad offline y mejorar el rendimiento</li>
            <li><strong>IndexedDB:</strong> Para almacenar el diccionario localmente en tu dispositivo</li>
            <li><strong>Tokens de autenticación:</strong> Para mantener tu sesión activa de forma segura</li>
            <li><strong>Local Storage:</strong> Para guardar preferencias y configuraciones de la aplicación</li>
          </ul>
          <p>Estas tecnologías son esenciales para el funcionamiento de la aplicación y no recopilan información personal identificable.</p>
        </section>

        <section>
          <h2 class="ds-text-display-sm">7. Retención de Datos</h2>
          <p>Conservamos tu información durante los siguientes períodos:</p>
          <ul>
            <li><strong>Datos de cuenta:</strong> Mientras mantengas una cuenta activa</li>
            <li><strong>Datos de suscripción:</strong> Según los requisitos legales de facturación (7 años)</li>
            <li><strong>Datos de uso:</strong> De forma agregada y anónima para mejoras del servicio</li>
            <li><strong>Cache local:</strong> Hasta que elimines la aplicación de tu dispositivo</li>
          </ul>
          <p>Tras la eliminación de tu cuenta, procederemos a eliminar todos los datos personales asociados en un plazo de 30 días.</p>
        </section>

        <section>
          <h2 class="ds-text-display-sm">8. Cambios en esta Política</h2>
          <p>Nos reservamos el derecho de actualizar esta política de privacidad ocasionalmente. Te notificaremos de cualquier cambio significativo mediante:</p>
          <ul>
            <li>Correo electrónico a la dirección asociada con tu cuenta</li>
            <li>Notificación dentro de la aplicación</li>
            <li>Actualización de la fecha de "última modificación" en esta página</li>
          </ul>
        </section>

        <section>
          <h2 class="ds-text-display-sm">9. Contacto</h2>
          <p>Si tienes preguntas sobre esta política de privacidad o sobre el tratamiento de tus datos personales, puedes contactarnos en:</p>
          <p><strong>Email:</strong> ngatye@hey-oko.com</p>
          <p class="last-updated">Última actualización: Octubre 2025</p>
        </section>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Política de Privacidad | epàlwi-rèbbo',
  meta: [
    { 
      name: 'description', 
      content: 'Política de privacidad de epàlwi-rèbbo' 
    }
  ]
})
</script>

<style lang="scss" scoped>
.privacy-page {
  min-height: 100vh;
  background: var(--ds-background);
}

.page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--ds-spacing-4) var(--ds-spacing-2);
}

.page-header {
  text-align: center;
  margin-bottom: var(--ds-spacing-4);
  padding: var(--ds-spacing-8) var(--ds-spacing-3) 0;
  
  .page-title {
    font-size: var(--ds-font-size-l);
    font-weight: 700;
    color: var(--ds-foreground);
    margin-bottom: var(--ds-spacing-1);
  }
  
  .page-subtitle {
    font-size: var(--ds-font-size-s);
    color: var(--ds-muted-foreground);
  }
}

.privacy-content {
  section {
    margin-bottom: var(--ds-spacing-4);
    
    h2 {
      color: var(--ds-foreground);
      margin-bottom: var(--ds-spacing-2);
    }
    
    p {
      color: var(--ds-muted-foreground);
      line-height: 1.6;
      margin-bottom: var(--ds-spacing-2);
      
      &.last-updated {
        color: var(--ds-muted-foreground);
        font-size: var(--ds-font-size-sm);
        margin-top: var(--ds-spacing-3);
        font-style: italic;
      }
    }
    
    ul, ol {
      margin: var(--ds-spacing-2) 0;
      padding-left: var(--ds-spacing-4);
      
      li {
        color: var(--ds-muted-foreground);
        line-height: 1.6;
        margin-bottom: var(--ds-spacing-1);
        
        strong {
          color: var(--ds-foreground);
          font-weight: 600;
        }
      }
    }
    
    ol {
      list-style-type: decimal;
      
      li {
        display: list-item;
        list-style-position: outside;
      }
    }
    
    strong {
      color: var(--ds-foreground);
      font-weight: 600;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>