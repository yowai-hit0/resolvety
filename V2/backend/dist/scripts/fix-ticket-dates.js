"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pg_1 = __importDefault(require("pg"));
const { Client } = pg_1.default;
const oldDbClient = new Client({
    connectionString: process.env.OLD_DATABASE_URL || 'postgresql://neondb_owner:npg_Smq0sbr4eKGN@ep-damp-bread-agyxow1t.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});
const newDb = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'postgresql://admin:Zoea2025Secure@172.16.40.61:5432/resolveit',
        },
    },
});
async function fixTicketDates() {
    console.log('🔧 Starting ticket date fix...\n');
    try {
        await oldDbClient.connect();
        console.log('✅ Connected to old database\n');
        console.log('📊 Fetching tickets from old database...');
        const oldTicketsResult = await oldDbClient.query(`
      SELECT 
        ticket_code,
        created_at,
        updated_at,
        resolved_at,
        closed_at
      FROM tickets
      ORDER BY id
    `);
        console.log(`  📈 Found ${oldTicketsResult.rows.length} tickets in old database\n`);
        console.log('📊 Fetching tickets from new database...');
        const newTickets = await newDb.ticket.findMany({
            select: {
                id: true,
                ticket_code: true,
                created_at: true,
                updated_at: true,
            },
        });
        console.log(`  📈 Found ${newTickets.length} tickets in new database\n`);
        const oldTicketMap = new Map();
        for (const oldTicket of oldTicketsResult.rows) {
            oldTicketMap.set(oldTicket.ticket_code, oldTicket);
        }
        console.log('🔄 Updating ticket dates...');
        let updated = 0;
        let notFound = 0;
        for (const newTicket of newTickets) {
            const oldTicket = oldTicketMap.get(newTicket.ticket_code);
            if (!oldTicket) {
                console.log(`  ⚠️  Ticket ${newTicket.ticket_code} not found in old database (might be new)`);
                notFound++;
                continue;
            }
            await newDb.ticket.update({
                where: { id: newTicket.id },
                data: {
                    created_at: new Date(oldTicket.created_at),
                    updated_at: new Date(oldTicket.updated_at),
                    resolved_at: oldTicket.resolved_at ? new Date(oldTicket.resolved_at) : null,
                    closed_at: oldTicket.closed_at ? new Date(oldTicket.closed_at) : null,
                },
            });
            updated++;
            if (updated % 10 === 0) {
                console.log(`  ✅ Updated ${updated} tickets...`);
            }
        }
        console.log(`\n✅ Date fix completed!`);
        console.log(`  📊 Updated: ${updated} tickets`);
        console.log(`  ⚠️  Not found in old DB: ${notFound} tickets (likely new tickets created after migration)`);
        console.log('\n🔍 Verifying dates...');
        const dateStats = await newDb.ticket.groupBy({
            by: ['created_at'],
            _count: true,
        });
        const uniqueDates = dateStats.length;
        const oldestTicket = await newDb.ticket.findFirst({
            orderBy: { created_at: 'asc' },
            select: { ticket_code: true, created_at: true },
        });
        const newestTicket = await newDb.ticket.findFirst({
            orderBy: { created_at: 'desc' },
            select: { ticket_code: true, created_at: true },
        });
        console.log(`  📅 Unique dates: ${uniqueDates}`);
        if (oldestTicket) {
            console.log(`  📅 Oldest ticket: ${oldestTicket.ticket_code} - ${oldestTicket.created_at}`);
        }
        if (newestTicket) {
            console.log(`  📅 Newest ticket: ${newestTicket.ticket_code} - ${newestTicket.created_at}`);
        }
    }
    catch (error) {
        console.error('❌ Error fixing ticket dates:', error);
        throw error;
    }
    finally {
        await oldDbClient.end();
        await newDb.$disconnect();
    }
}
fixTicketDates()
    .then(() => {
    console.log('\n✅ Ticket date fix completed successfully!');
    process.exit(0);
})
    .catch((error) => {
    console.error('\n❌ Ticket date fix failed:', error);
    process.exit(1);
});
//# sourceMappingURL=fix-ticket-dates.js.map