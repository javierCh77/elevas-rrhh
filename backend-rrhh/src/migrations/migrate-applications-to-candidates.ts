import { QueryRunner } from 'typeorm';

export async function migrateApplicationsToCandidate(queryRunner: QueryRunner) {
  // Step 1: Get all applications with their candidate data
  const applications = await queryRunner.query(`
    SELECT id, "firstName", "lastName", email, phone, "linkedinUrl", "portfolioUrl", "resumeUrl"
    FROM applications
    WHERE "firstName" IS NOT NULL AND "lastName" IS NOT NULL AND email IS NOT NULL
  `);

  console.log(`Found ${applications.length} applications to migrate`);

  // Step 2: For each application, create or find candidate
  for (const app of applications) {
    try {
      // Check if candidate already exists by email
      let candidate = await queryRunner.query(`
        SELECT id FROM candidates WHERE email = $1
      `, [app.email]);

      let candidateId;

      if (candidate.length === 0) {
        // Create new candidate
        const newCandidate = await queryRunner.query(`
          INSERT INTO candidates ("firstName", "lastName", email, phone, "linkedinUrl", "portfolioUrl", "resumeUrl", status, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', NOW(), NOW())
          RETURNING id
        `, [
          app.firstName,
          app.lastName,
          app.email,
          app.phone,
          app.linkedinUrl,
          app.portfolioUrl,
          app.resumeUrl
        ]);

        candidateId = newCandidate[0].id;
        console.log(`Created new candidate ${candidateId} for ${app.email}`);
      } else {
        candidateId = candidate[0].id;
        console.log(`Found existing candidate ${candidateId} for ${app.email}`);
      }

      // Update application with candidateId
      await queryRunner.query(`
        UPDATE applications
        SET "candidateId" = $1
        WHERE id = $2
      `, [candidateId, app.id]);

    } catch (error) {
      console.error(`Error processing application ${app.id}:`, error);
    }
  }

  console.log('Migration completed successfully');
}