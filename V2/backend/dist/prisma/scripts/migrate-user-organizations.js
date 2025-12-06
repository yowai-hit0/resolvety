"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function migrateUserOrganizations() {
    console.log('Starting migration of user organizations...');
    try {
        const usersWithOrg = await prisma.user.findMany({
            where: {
                organization_id: { not: null },
            },
            select: {
                id: true,
                organization_id: true,
                created_at: true,
            },
        });
        console.log(`Found ${usersWithOrg.length} users with organization_id`);
        let migrated = 0;
        let skipped = 0;
        for (const user of usersWithOrg) {
            if (!user.organization_id)
                continue;
            try {
                const existing = await prisma.userOrganization.findUnique({
                    where: {
                        user_id_organization_id: {
                            user_id: user.id,
                            organization_id: user.organization_id,
                        },
                    },
                });
                if (existing) {
                    console.log(`  Skipping user ${user.id} - relationship already exists`);
                    skipped++;
                    continue;
                }
                await prisma.userOrganization.create({
                    data: {
                        user_id: user.id,
                        organization_id: user.organization_id,
                        is_primary: true,
                        created_at: user.created_at,
                    },
                });
                migrated++;
                console.log(`  Migrated user ${user.id} -> organization ${user.organization_id}`);
            }
            catch (error) {
                if (error.code === 'P2002') {
                    skipped++;
                    console.log(`  Skipping user ${user.id} - relationship already exists`);
                }
                else {
                    console.error(`  Error migrating user ${user.id}:`, error.message);
                }
            }
        }
        console.log(`\nMigration complete!`);
        console.log(`  Migrated: ${migrated}`);
        console.log(`  Skipped: ${skipped}`);
        console.log(`  Total: ${usersWithOrg.length}`);
    }
    catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
migrateUserOrganizations()
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=migrate-user-organizations.js.map