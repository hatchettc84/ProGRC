/**
 * Script to fix stuck pending tasks
 * Marks old pending/IN_PROCESS tasks as FAILED if they're older than 1 hour
 */

require('dotenv').config();
const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'progrc',
});

async function fixStuckTasks() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Find tasks that are PENDING or IN_PROCESS and older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const stuckTasks = await AppDataSource.query(`
      SELECT id, app_id, ops, status, entity_id, created_at, updated_at 
      FROM async_tasks 
      WHERE status IN ('PENDING', 'IN_PROCESS') 
        AND created_at < $1
      ORDER BY created_at DESC
    `, [oneHourAgo.toISOString()]);

    console.log(`\n📋 Found ${stuckTasks.length} stuck tasks:`);
    stuckTasks.forEach(task => {
      const age = Math.floor((Date.now() - new Date(task.created_at).getTime()) / 1000 / 60);
      console.log(`  - Task ${task.id}: ${task.status} (${age} minutes old, app_id: ${task.app_id}, ops: ${task.ops})`);
    });

    if (stuckTasks.length === 0) {
      console.log('\n✅ No stuck tasks found!');
      await AppDataSource.destroy();
      return;
    }

    // Update stuck tasks to FAILED status
    const result = await AppDataSource.query(`
      UPDATE async_tasks 
      SET status = 'FAILED', updated_at = NOW()
      WHERE status IN ('PENDING', 'IN_PROCESS') 
        AND created_at < $1
      RETURNING id, app_id, ops, status
    `, [oneHourAgo.toISOString()]);

    console.log(`\n✅ Updated ${result.length} stuck tasks to FAILED status`);
    result.forEach(task => {
      console.log(`  - Task ${task.id} (app_id: ${task.app_id}, ops: ${task.ops})`);
    });

    await AppDataSource.destroy();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixStuckTasks();




