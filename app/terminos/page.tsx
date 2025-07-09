import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const TerminosPage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Términos y Condiciones
        </Typography>
        <Typography variant="h6" gutterBottom>
          1. Introducción
        </Typography>
        <Typography paragraph>
          Bienvenido a RedMusical. Estos términos y condiciones describen las reglas y regulaciones para el uso de nuestro sitio web. Al acceder a este sitio web, asumimos que aceptas estos términos y condiciones en su totalidad. No continúes usando el sitio web de RedMusical si no aceptas todos los términos y condiciones establecidos en esta página.
        </Typography>
        <Typography variant="h6" gutterBottom>
          2. Licencia
        </Typography>
        <Typography paragraph>
          A menos que se indique lo contrario, RedMusical y/o sus licenciantes poseen los derechos de propiedad intelectual de todo el material en RedMusical. Todos los derechos de propiedad intelectual están reservados. Puedes ver y/o imprimir páginas desde https://redmusical.app para tu propio uso personal sujeto a las restricciones establecidas en estos términos and condiciones.
        </Typography>
        <Typography paragraph>
          No debes:
        </Typography>
        <ul>
          <li><Typography>Volver a publicar material de https://redmusical.app</Typography></li>
          <li><Typography>Vender, alquilar o sub-licenciar material de https://redmusical.app</Typography></li>
          <li><Typography>Reproducir, duplicar o copiar material de https://redmusical.app</Typography></li>
          <li><Typography>Redistribuir contenido de RedMusical (a menos que el contenido se haga específicamente para la redistribución).</Typography></li>
        </ul>
        <Typography variant="h6" gutterBottom>
          3. Cuentas de usuario
        </Typography>
        <Typography paragraph>
          Cuando creas una cuenta con nosotros, garantizas que la información que nos proporcionas es precisa, completa y actual en todo momento. La información inexacta, incompleta u obsoleta puede resultar en la terminación inmediata de tu cuenta en nuestro servicio.
        </Typography>
        <Typography variant="h6" gutterBottom>
          4. Limitación de responsabilidad
        </Typography>
        <Typography paragraph>
          En ningún caso RedMusical, ni ninguno de sus directores y empleados, será responsable de nada que surja de o esté relacionado de alguna manera con tu uso de este sitio web, ya sea que dicha responsabilidad esté bajo contrato, agravio o de otra manera, y RedMusical, incluidos sus directores y empleados, no será responsable de ninguna responsabilidad indirecta, consecuente o especial que surja de o esté relacionada de alguna manera con tu uso de este sitio web.
        </Typography>
        <Typography variant="h6" gutterBottom>
          5. Cambios en los términos
        </Typography>
        <Typography paragraph>
          Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso de al menos 30 días antes de que entren en vigencia los nuevos términos. Lo que constituye un cambio material se determinará a nuestra sola discreción.
        </Typography>
        <Typography variant="h6" gutterBottom>
          6. Contáctanos
        </Typography>
        <Typography paragraph>
          Si tienes alguna pregunta sobre estos Términos, por favor contáctanos.
        </Typography>
      </Box>
    </Container>
  );
};

export default TerminosPage;
