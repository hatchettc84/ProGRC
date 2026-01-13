require('dotenv').config({ path: '.env' });
const { DataSource } = require('typeorm');

async function fixStuckTasks() {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'progrc_user',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'progrc',
  });

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const stuckTasks = await AppDataSource.query(
      `SELECT id, app_id, ops, status, entity_id, created_at 
       FROM async_tasks 
       WHERE status IN ('PENDING', 'IN_PROCESS') 
         AND created_at < $1 
       ORDER BY created_at DESC`,
      [oneHourAgo.toISOString()]
    );

    console.log(`\n📋 Found ${stuckTasks.length} stuck tasks`);
    
    if (stuckTasks.length === 0) {
      console.log('✅ No stuck tasks found!');
      await AppDataSource.destroy();
      return;
    }

    stuckTasks.forEach(task => {
      const age = Math.floor((Date.now() - new Date(task.created_at).getTime()) / 1000 / 60);
      console.log(`  - Task ${task.id}: ${task.status} (${age} minutes old, app_id: ${task.app_id}, ops: ${task.ops})`);
    });

    const result = await AppDataSource.query(
      `UPDATE async_tasks 
       SET status = 'FAILED', updated_at = NOW() 
       WHERE status IN ('PENDING', 'IN_PROCESS') 
         AND created_at < $1 
       RETURNING id, app_id, ops`,
      [oneHourAgo.toISOString()]
    );

    console.log(`\n✅ Fixed ${result.length} stuck tasks:`);
    result.forEach(task => {
      console.log(`  - Task ${task.id} (app_id: ${task.app_id}, ops: ${task.ops})`);
    });

    await AppDataSource.destroy();
    console.log('\n✅ Done! You can now create sources.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixStuckTasks();




