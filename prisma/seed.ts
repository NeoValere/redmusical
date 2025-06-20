import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Comenzando el sembrado de datos...`);

  // Sembrar Géneros
  const genres = [
    { name: 'Rock' }, { name: 'Pop' }, { name: 'Jazz' }, { name: 'Clásica' },
    { name: 'Electrónica' }, { name: 'Hip Hop/Rap' }, { name: 'Blues' }, { name: 'Reggae' },
    { name: 'Folk/Acústico' }, { name: 'Metal' }, { name: 'Funk' }, { name: 'Soul' },
    { name: 'R&B' }, { name: 'Latina (Salsa, Merengue, Cumbia, etc.)' }, { name: 'Reggaetón' },
    { name: 'Tango' }, { name: 'Flamenco' }, { name: 'Country' }, { name: 'Indie/Alternativo' },
    { name: 'Música del Mundo' }, { name: 'Experimental' }, { name: 'Ambiental' },
    { name: 'Bandas Sonoras (Cine/TV/Videojuegos)' }, { name: 'Infantil' }, { name: 'Gospel/Religiosa' }
  ];
  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { name: genre.name },
      update: {},
      create: genre,
    });
  }
  console.log('Géneros sembrados');

  // Sembrar Instrumentos
  const instruments = [
    { name: 'Guitarra Acústica' }, { name: 'Guitarra Eléctrica' }, { name: 'Piano' }, { name: 'Teclado/Sintetizador' },
    { name: 'Batería Acústica' }, { name: 'Batería Electrónica' }, { name: 'Bajo Eléctrico' }, { name: 'Contrabajo' },
    { name: 'Violín' }, { name: 'Viola' }, { name: 'Cello' }, { name: 'Saxofón (Alto, Tenor, Soprano, Barítono)' },
    { name: 'Trompeta' }, { name: 'Trombón' }, { name: 'Flauta Traversa' }, { name: 'Clarinete' },
    { name: 'Voz (Cantante Principal)' }, { name: 'Coros/Segunda Voz' }, { name: 'Ukelele' }, { name: 'Banjo' },
    { name: 'Mandolina' }, { name: 'Armónica' }, { name: 'Acordeón' }, { name: 'Percusión Latina (Congas, Bongos, Timbales)' },
    { name: 'Percusión Africana (Djembe, etc.)' }, { name: 'Gaita' }, { name: 'Bandoneón' }, { name: 'Charango' },
    { name: 'Quena/Sikus' }, { name: 'Arpa' }, { name: 'DJ Set/Controladores' }
  ];
  for (const instrument of instruments) {
    await prisma.instrument.upsert({
      where: { name: instrument.name },
      update: {},
      create: instrument,
    });
  }
  console.log('Instrumentos sembrados');

  // Sembrar Habilidades
  const skills = [
    { name: 'Composición' }, { name: 'Producción Musical' }, { name: 'Arreglos Musicales' },
    { name: 'Interpretación en Vivo' }, { name: 'Improvisación' }, { name: 'Lectura a Primera Vista (Partituras)' },
    { name: 'Teoría Musical Avanzada' }, { name: 'Enseñanza/Clases de Música' }, { name: 'Ingeniería de Sonido (Grabación/Mezcla/Masterización)' },
    { name: 'DJing/Mezcla en Vivo' }, { name: 'Letrista/Escritura de Canciones' }, { name: 'Dirección Musical/Orquestal' },
    { name: 'Técnico de Sonido en Vivo' }, { name: 'Luthier/Mantenimiento de Instrumentos' }, { name: 'Gestión de Proyectos Musicales' },
    { name: 'Marketing Musical/Promoción' }, { name: 'Creación de Contenido Audiovisual para Música' }, { name: 'Looping en Vivo' },
    { name: 'Beatmaking' }, { name: 'Diseño de Sonido' }
  ];
  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }
  console.log('Habilidades sembradas');

  // Sembrar Disponibilidad
  const availabilities = [
    { name: 'Días de Semana (Horario Diurno)' }, { name: 'Días de Semana (Horario Nocturno)' },
    { name: 'Fines de Semana (Horario Diurno)' }, { name: 'Fines de Semana (Horario Nocturno)' },
    { name: 'Tiempo Completo' }, { name: 'Medio Tiempo' }, { name: 'Flexible (Consultar)' },
    { name: 'Disponible para Giras Cortas' }, { name: 'Disponible para Giras Largas' }, { name: 'Proyectos Puntuales' },
    { name: 'Residencias Artísticas' }
  ];
  for (const availability of availabilities) {
    await prisma.availability.upsert({
      where: { name: availability.name },
      update: {},
      create: availability,
    });
  }
  console.log('Disponibilidades sembradas');

  // Sembrar Preferencias de Trabajo
  const preferences = [
    { name: 'Trabajo en Estudio (Grabación/Producción)' }, { name: 'Conciertos/Presentaciones en Vivo' },
    { name: 'Giras Nacionales' }, { name: 'Giras Internacionales' }, { name: 'Colaboraciones con Otros Artistas' },
    { name: 'Enseñanza/Talleres Musicales' }, { name: 'Sesiones Online (Grabación/Clases)' },
    { name: 'Eventos Corporativos' }, { name: 'Eventos Privados (Bodas, Fiestas, etc.)' },
    { name: 'Composición para Cine/TV/Videojuegos' }, { name: 'Teatro Musical' }, { name: 'Bandas Tributo' },
    { name: 'Proyectos Originales' }, { name: 'Música para Publicidad' }
  ];
  for (const preference of preferences) {
    await prisma.preference.upsert({
      where: { name: preference.name },
      update: {},
      create: preference,
    });
  }
  console.log('Preferencias de trabajo sembradas');

  console.log(`Sembrado de datos finalizado.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
