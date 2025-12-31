#!/usr/bin/env tsx

/**
 * Database Initialization Script
 * Run this script to set up MongoDB indexes
 * 
 * Usage:
 *   npm run db:init
 *   or
 *   npx tsx scripts/init-database.ts
 */

import { getDatabase } from '../lib/mongodb';
import { createIndexes } from '../lib/mongodb-indexes';

async function initDatabase() {
  try {
    console.log('🚀 Starting database initialization...\n');

    // Get database connection
    const db = await getDatabase();
    console.log('✅ Connected to MongoDB\n');

    // Create indexes
    await createIndexes(db);

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\nCollections created:');
    console.log('  - projects');
    console.log('  - tasks');
    console.log('  - clients');
    console.log('  - conversations');
    console.log('  - artifacts');
    console.log('  - events');
    console.log('  - agent_execution_logs');
    console.log('  - workflow_executions');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the initialization
initDatabase();

