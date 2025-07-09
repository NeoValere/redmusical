import { Container, Typography, Box } from '@mui/material';

export default function PrivacyPolicy() {
  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Política de Privacidad
        </Typography>
        <Typography variant="body1" paragraph>
          Fecha de última actualización: 09 de Julio de 2025
        </Typography>
        <Typography variant="body1" paragraph>
          Bienvenido a RedMusical, una plataforma dedicada a conectar músicos. Tu privacidad es de suma importancia para nosotros. Esta Política de Privacidad describe cómo recopilamos, usamos, procesamos y divulgamos tu información, incluida la información personal, en conjunto con tu acceso y uso de la plataforma RedMusical.
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom>
          1. Información que Recopilamos
        </Typography>
        <Typography variant="body1" paragraph>
          Recopilamos tres categorías generales de información.
        </Typography>
        <Typography variant="h6" component="h3">
          1.1. Información que nos proporcionas.
        </Typography>
        <Typography variant="body1" paragraph>
          - **Información de la cuenta:** Cuando te registras en RedMusical, requerimos cierta información como tu nombre, apellido, dirección de correo electrónico y fecha de nacimiento.
        </Typography>
        <Typography variant="body1" paragraph>
          - **Información del perfil y del anuncio:** Para utilizar ciertas funciones de la Plataforma RedMusical, podemos pedirte que proporciones información adicional, que puede incluir tu dirección, número de teléfono y una foto de perfil.
        </Typography>
        <Typography variant="body1" paragraph>
          - **Información de pago:** Para utilizar ciertas funciones de la Plataforma RedMusical (como nuestros planes de suscripción), podemos requerir que proporciones cierta información financiera (como los detalles de tu cuenta bancaria o tarjeta de crédito) para facilitar el procesamiento de los pagos.
        </Typography>

        <Typography variant="h6" component="h3">
          1.2. Información que recopilamos automáticamente de tu uso de la Plataforma RedMusical.
        </Typography>
        <Typography variant="body1" paragraph>
          - **Información de geolocalización:** Cuando utilizas ciertas funciones de la Plataforma RedMusical, podemos recopilar información sobre tu ubicación precisa o aproximada, determinada a través de datos como tu dirección IP o el GPS de tu dispositivo móvil.
        </Typography>
        <Typography variant="body1" paragraph>
          - **Información de uso:** Recopilamos información sobre tus interacciones con la Plataforma RedMusical, como las páginas o el contenido que ves, tus búsquedas de Anuncios, las reservas que has realizado y otras acciones en la Plataforma RedMusical.
        </Typography>
        <Typography variant="body1" paragraph>
          - **Datos de registro e información del dispositivo:** Recopilamos automáticamente datos de registro e información del dispositivo cuando accedes y utilizas la Plataforma RedMusical, incluso si no has creado una cuenta en RedMusical o no has iniciado sesión.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom>
          2. Cómo utilizamos la información que recopilamos
        </Typography>
        <Typography variant="body1" paragraph>
          Utilizamos, almacenamos y procesamos información, incluida la información personal, sobre ti para proporcionar, comprender, mejorar y desarrollar la Plataforma RedMusical, crear y mantener un entorno de confianza y más seguro y cumplir con nuestras obligaciones legales.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom>
          3. Compartir y Divulgar
        </Typography>
        <Typography variant="body1" paragraph>
          No compartiremos tu información con terceros, excepto cuando sea necesario para proporcionar los servicios de la plataforma, cumplir con la ley o con tu consentimiento explícito.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom>
          4. Tus Derechos
        </Typography>
        <Typography variant="body1" paragraph>
          Puedes ejercer cualquiera de los derechos descritos en esta sección a través de la configuración de tu cuenta de RedMusical. Ten en cuenta que podemos pedirte que verifiques tu identidad antes de tomar medidas adicionales sobre tu solicitud.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom>
          5. Seguridad
        </Typography>
        <Typography variant="body1" paragraph>
          Estamos continuamente implementando y actualizando medidas de seguridad administrativas, técnicas y físicas para ayudar a proteger tu información contra el acceso no autorizado, la pérdida, la destrucción o la alteración.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom>
          6. Cambios a esta Política de Privacidad
        </Typography>
        <Typography variant="body1" paragraph>
          RedMusical se reserva el derecho de modificar esta Política de Privacidad en cualquier momento de acuerdo con esta disposición. Si realizamos cambios a esta Política de Privacidad, publicaremos la Política de Privacidad revisada en la Plataforma RedMusical y actualizaremos la fecha de "Última actualización" en la parte superior de esta Política de Privacidad.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom>
          7. Contacto
        </Typography>
        <Typography variant="body1" paragraph>
          Si tienes alguna pregunta o queja sobre esta Política de Privacidad o las prácticas de manejo de información de RedMusical, puedes enviarnos un correo electrónico a las direcciones de correo electrónico que se proporcionan en la sección correspondiente.
        </Typography>
      </Box>
    </Container>
  );
}
