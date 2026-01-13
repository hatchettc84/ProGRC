import { MigrationInterface, QueryRunner } from "typeorm";
const fs = require('fs');

function convert_to_tree(sections, search_key = "", key_index = 0, is_outline = false) {
    const tree = [];

    for (const section of sections) {
        key_index += 1;

        let children = [];
        const current_search_key = search_key + key_index;

        // Recursively process children
        if (section?.children && section.children.length > 0) {
            children = convert_to_tree(section.children, current_search_key + "_", 0, is_outline);
        }

        const section_path = `./src/public/sections/${section.id}.txt`;
        let section_data = '';

        try {
            section_data = fs.readFileSync(section_path, 'utf8');
        } catch (err) {
            console.log(err);
            if (err.code === 'ENOENT') {
                section_data = ''; // No file exists, set empty string
            } else {
                throw err;
            }
        }

        const entry = {
            template_id: 1, // default for template FedRAMP
            title: section.label,
            section_id: section.id,
            outline_search_key: current_search_key,
            level: section.level,
            s3_path: `/templates/1/sections/${section.id}.txt`,
            children,
            html_content: section_data || null
        };

        if (!is_outline) {
            tree.push(entry);
        } else {
            tree.push({
                section_id: section.id,
                children,
                level: section.level,
                search_key: current_search_key,
                version: 0
            });
        }
    }

    return JSON.parse(JSON.stringify(tree));
}

const read_template_and_generate_tree = (is_outline) => {
    const filePath = './src/public/outline.json';
    let jsonData = {};
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        jsonData = JSON.parse(data);
    } catch (err) {
        console.error("Error reading or parsing the file:", err);
    }

    let search_key = "";
    let key_index = -1;
    return convert_to_tree(jsonData, search_key, key_index, is_outline);
}

const getValuesFromTree = (template_sections) => {
    const sections = [];

    const getRecursiveValues = (sectionsTree) => {
        sectionsTree.forEach(section => {
            let llm_parsing = { 'isLLMParsing': false }
            if (section.outline_search_key.startsWith("14")) {
                llm_parsing = { 'isLLMParsing': true }
            }

            sections.push([
                section.template_id,
                section.title,
                section.section_id,
                section.outline_search_key,
                section.html_content,
                section.description,
                section.s3_path,
                section.level,
                llm_parsing

            ]);

            if (section.children && section.children.length > 0) {
                getRecursiveValues(section.children);
            }
        });
    };

    getRecursiveValues(template_sections);
    return sections;
};

export class CreateTemplateSections1730028578136 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`select 1`);
        // queryRunner.manager.connection.setOptions(
        //     {
        //         logging: false,
        //     }
        // );

        // await queryRunner.query(`
        //     DROP TABLE IF EXISTS templates_section;
        // `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name='templates' AND column_name='outline'
                ) THEN
                    ALTER TABLE templates ADD COLUMN outline JSON;
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS templates_section (
                id SERIAL PRIMARY KEY,
                template_id INT NOT NULL,
                title TEXT NOT NULL,
                level INT,
                section_id VARCHAR(36) NOT NULL,
                outline_search_key VARCHAR(200),
                html_content TEXT,
                description TEXT DEFAULT NULL,
                s3_path VARCHAR(250) DEFAULT NULL,
                metadata JSON DEFAULT '{"isLLMParsing": false}',
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT true,
                CONSTRAINT unique_template_section UNIQUE (template_id, section_id)
            );
        `);

        // const outline = JSON.stringify(read_template_and_generate_tree(true));
        // await queryRunner.query(`UPDATE templates SET outline = $1 WHERE id = 1`, [outline]);

        // const template_sections = read_template_and_generate_tree(false);
        // const values = getValuesFromTree(template_sections);

        // Insert data using parameterized query
        // const insertQuery = `
        //     INSERT INTO templates_section 
        //     (template_id, title, section_id, outline_search_key, html_content, description, s3_path, level, metadata)
        //     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        // `;

        // for (const valueSet of values) {
        //     await queryRunner.query(insertQuery, valueSet);
        // }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`select 1`);
        // await queryRunner.query(`ALTER TABLE templates DROP COLUMN outline;`);
        // await queryRunner.query(`DELETE FROM templates_section WHERE template_id = 1;`);
        // await queryRunner.query(`DROP TABLE templates_section;`);
    }
}