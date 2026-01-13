import { MigrationInterface, QueryRunner } from "typeorm";

export class NewAskAiChattables1744206970074 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // chat_conversations table
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS chat_conversations (
            id SERIAL PRIMARY KEY,
            session_id VARCHAR(100) NOT NULL,
            conversation_id VARCHAR(100) NOT NULL,
            app_id INTEGER NOT NULL,
            customer_id VARCHAR(100) NOT NULL,
            framework_id INTEGER,
            standard_id INTEGER,
            control_id INTEGER,
            message TEXT NOT NULL,
            response TEXT NOT NULL,
            sources JSONB,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (conversation_id, session_id)
          );
        `);
    
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_chat_conversations_lookup 
          ON chat_conversations(conversation_id, session_id);
        `);
    
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_chat_conversations_customer 
          ON chat_conversations(customer_id);
        `);
    
        // chat_votes table
        await queryRunner.query(`
          CREATE TABLE IF NOT EXISTS chat_votes (
            id SERIAL PRIMARY KEY,
            conversation_id VARCHAR(100) NOT NULL,
            session_id VARCHAR(100) NOT NULL,
            vote INTEGER NOT NULL CHECK (vote IN (-1, 1)),
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (conversation_id, session_id)
          );
        `);
    
        await queryRunner.query(`
          CREATE INDEX IF NOT EXISTS idx_chat_votes_lookup 
          ON chat_votes(conversation_id, session_id);
        `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_chat_votes_lookup`);
        await queryRunner.query(`DROP TABLE IF EXISTS chat_votes`);
    
        await queryRunner.query(`DROP INDEX IF EXISTS idx_chat_conversations_customer`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_chat_conversations_lookup`);
        await queryRunner.query(`DROP TABLE IF EXISTS chat_conversations`);
      }
}
