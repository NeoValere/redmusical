import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting profile completeness update...');

  const musicians = await prisma.musician.findMany({
    include: {
      genres: true,
      instruments: true,
      skills: true,
      availability: true,
      preferences: true,
    },
  });

  console.log(`Found ${musicians.length} musicians to process.`);

  const fieldWeights = {
    // Personal Info (Weight: 30)
    fullName: 2,
    artisticName: 3,
    bio: 5,
    city: 2,
    province: 2,
    phoneNumber: 3,
    profileImageUrl: 8,
    websiteUrl: 5,

    // Professional Info (Weight: 40)
    experienceLevel: 5,
    hourlyRate: 5,
    servicesOffered: 5,
    influences: 5,
    gearHighlights: 5,
    lookingFor: 5,
    youtubeUrl: 2.5,
    soundcloudUrl: 2.5,
    instagramUrl: 2.5,
    pressKitUrl: 2.5,

    // Relational Data (Weight: 30)
    genres: 5,
    instruments: 10,
    skills: 5,
    availability: 5,
    preferences: 5,
  };

  const totalPossibleScore = Object.values(fieldWeights).reduce((sum, weight) => sum + weight, 0);

  for (const musician of musicians) {
    let score = 0;

    // Calculate score for direct fields
    if (musician.fullName && musician.fullName.trim() !== '') score += fieldWeights.fullName;
    if (musician.artisticName && musician.artisticName.trim() !== '') score += fieldWeights.artisticName;
    if (musician.bio && musician.bio.trim() !== '') score += fieldWeights.bio;
    if (musician.city && musician.city.trim() !== '') score += fieldWeights.city;
    if (musician.province && musician.province.trim() !== '') score += fieldWeights.province;
    if (musician.phoneNumber && musician.phoneNumber.trim() !== '') score += fieldWeights.phoneNumber;
    if (musician.profileImageUrl && musician.profileImageUrl.trim() !== '') score += fieldWeights.profileImageUrl;
    if (musician.websiteUrl && musician.websiteUrl.trim() !== '') score += fieldWeights.websiteUrl;
    if (musician.experienceLevel && musician.experienceLevel.trim() !== '') score += fieldWeights.experienceLevel;
    if (musician.hourlyRate) score += fieldWeights.hourlyRate;
    if (musician.youtubeUrl && musician.youtubeUrl.trim() !== '') score += fieldWeights.youtubeUrl;
    if (musician.soundcloudUrl && musician.soundcloudUrl.trim() !== '') score += fieldWeights.soundcloudUrl;
    if (musician.instagramUrl && musician.instagramUrl.trim() !== '') score += fieldWeights.instagramUrl;
    if (musician.pressKitUrl && musician.pressKitUrl.trim() !== '') score += fieldWeights.pressKitUrl;

    // Calculate score for array fields
    if (musician.servicesOffered.length > 0) score += fieldWeights.servicesOffered;
    if (musician.influences.length > 0) score += fieldWeights.influences;
    if (musician.gearHighlights.length > 0) score += fieldWeights.gearHighlights;
    if (musician.lookingFor.length > 0) score += fieldWeights.lookingFor;

    // Calculate score for relational fields
    if (musician.genres.length > 0) score += fieldWeights.genres;
    if (musician.instruments.length > 0) score += fieldWeights.instruments;
    if (musician.skills.length > 0) score += fieldWeights.skills;
    if (musician.availability.length > 0) score += fieldWeights.availability;
    if (musician.preferences.length > 0) score += fieldWeights.preferences;

    const completenessPercentage = Math.round((score / totalPossibleScore) * 100);

    await prisma.musician.update({
      where: { id: musician.id },
      data: { profileCompleteness: completenessPercentage },
    });

    console.log(`Updated ${musician.artisticName || musician.fullName}: ${completenessPercentage}%`);
  }

  console.log('Profile completeness update finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
