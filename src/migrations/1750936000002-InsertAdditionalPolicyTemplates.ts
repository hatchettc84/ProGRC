import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertAdditionalPolicyTemplates1750936000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const templates = [
                {
                    name: 'Acceptable Use Policy',
                    content: {
                        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Acceptable Use Policy</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2 {
            color: #2c3e50;
        }
        .section {
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h1>Acceptable Use Policy</h1>
    <div class="section">
        <h2>Purpose</h2>
        <p>This policy defines acceptable use of information technology resources at [Organization Name].</p>
    </div>
    <div class="section">
        <h2>Scope</h2>
        <p>This policy applies to all employees, contractors, and authorized users of [Organization Name]'s information technology resources.</p>
    </div>
    <div class="section">
        <h2>Policy</h2>
        <p>Users must:</p>
        <ul>
            <li>Use resources for authorized purposes only</li>
            <li>Protect sensitive information</li>
            <li>Report security incidents</li>
            <li>Follow all applicable laws and regulations</li>
        </ul>
    </div>
</body>
</html>`
                    }
                },
                {
                    name: 'Password Policy',
                    content: {
                        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Policy</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2 {
            color: #2c3e50;
        }
        .section {
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h1>Password Policy</h1>
    <div class="section">
        <h2>Purpose</h2>
        <p>This policy establishes requirements for creating and managing passwords at [Organization Name].</p>
    </div>
    <div class="section">
        <h2>Requirements</h2>
        <ul>
            <li>Minimum length: 12 characters</li>
            <li>Must include uppercase and lowercase letters</li>
            <li>Must include numbers and special characters</li>
            <li>Must be changed every 90 days</li>
            <li>Cannot reuse last 5 passwords</li>
        </ul>
    </div>
</body>
</html>`
                    }
                },
                {
                    name: 'Remote Access Policy',
                    content: {
                        htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Remote Access Policy</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2 {
            color: #2c3e50;
        }
        .section {
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h1>Remote Access Policy</h1>
    <div class="section">
        <h2>Purpose</h2>
        <p>This policy defines requirements for remote access to [Organization Name]'s information systems.</p>
    </div>
    <div class="section">
        <h2>Requirements</h2>
        <ul>
            <li>Must use approved VPN or secure remote access solution</li>
            <li>Must use multi-factor authentication</li>
            <li>Must use encrypted connections</li>
            <li>Must follow security best practices</li>
            <li>Must report security incidents</li>
        </ul>
    </div>
</body>
</html>`
                    }
                }
            ];

            for (const template of templates) {
                await queryRunner.query(`
                    INSERT INTO policy_template (name, content, created_at, updated_at)
                    VALUES ($1, $2::jsonb, NOW(), NOW())
                `, [template.name, JSON.stringify(template.content)]);
            }
        } catch (error) {
            console.error('Error in migration:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const templateNames = [
                'Acceptable Use Policy',
                'Password Policy',
                'Remote Access Policy'
            ];

            for (const name of templateNames) {
                await queryRunner.query(`
                    DELETE FROM policy_template
                    WHERE name = $1
                `, [name]);
            }
        } catch (error) {
            console.error('Error in migration rollback:', error);
            throw error;
        }
    }
} 