import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import puppeteer from "puppeteer";
import { AssessmentHistory } from "src/entities/assessments/assessmentHistory.entity";
import { AssessmentOutline } from "src/entities/assessments/assessmentOutline.entity";
import { AssessmentSections } from "src/entities/assessments/assessmentSections.entity";
import { LoggerService } from "src/logger/logger.service";
import { Repository } from "typeorm";

@Injectable()
export class AssessmentToPDF {
	constructor(
		@InjectRepository(AssessmentSections) private readonly assessmentSectionRepo: Repository<AssessmentSections>,
		@InjectRepository(AssessmentOutline) private readonly assessmentOutlineRepo: Repository<AssessmentOutline>,
		@InjectRepository(AssessmentHistory) private readonly assessmentHistoryRepo: Repository<AssessmentHistory>,
		private readonly logger: LoggerService,
	) { }

	async generatePDF(assessmentId: number, appId: number, outlineVersion: number): Promise<Uint8Array> {
		let assessmentOutline: AssessmentOutline | AssessmentHistory = await this.assessmentOutlineRepo.findOneOrFail({
			where: { assessment_id: assessmentId, app_id: appId, is_deleted: false },
		});

		if (assessmentOutline.version !== outlineVersion) {
			assessmentOutline = await this.assessmentHistoryRepo.findOneOrFail({
				where: { assessment_id: assessmentId, app_id: appId, version: outlineVersion, is_deleted: false },
			});
		}

		let combinedHTML = `
        <html>
        <head>
        <style>
        body {
  font-family:Helvetica,Arial,sans-serif; font-size:14px; margin-left: 4rem;margin-right: 4rem;
  line-height: 1.4;
  margin: 1rem;
}
table {
  border-collapse: collapse;
}
/* Apply a default padding if legacy cellpadding attribute is missing */
table:not([cellpadding]) th,
table:not([cellpadding]) td {
  padding: 0.4rem;
}
/* Set default table styles if a table has a positive border attribute
   and no inline css */
table[border]:not([border="0"]):not([style*="border-width"]) th,
table[border]:not([border="0"]):not([style*="border-width"]) td {
  border-width: 1px;
}
/* Set default table styles if a table has a positive border attribute
   and no inline css */
table[border]:not([border="0"]):not([style*="border-style"]) th,
table[border]:not([border="0"]):not([style*="border-style"]) td {
  border-style: solid;
}
/* Set default table styles if a table has a positive border attribute
   and no inline css */
table[border]:not([border="0"]):not([style*="border-color"]) th,
table[border]:not([border="0"]):not([style*="border-color"]) td {
  border-color: #ccc;
}
figure {
  display: table;
  margin: 1rem auto;
}
figure figcaption {
  color: #999;
  display: block;
  margin-top: 0.25rem;
  text-align: center;
}
hr {
  border-color: #ccc;
  border-style: solid;
  border-width: 1px 0 0 0;
}
code {
  background-color: #e8e8e8;
  border-radius: 3px;
  padding: 0.1rem 0.2rem;
}
.mce-content-body:not([dir=rtl]) blockquote {
  border-left: 2px solid #ccc;
  margin-left: 1.5rem;
  padding-left: 1rem;
}
.mce-content-body[dir=rtl] blockquote {
  border-right: 2px solid #ccc;
  margin-right: 1.5rem;
  padding-right: 1rem;
}

          table {
            width: 100%; /* Full width table */
            border-collapse: collapse; /* Remove spacing between cells */
            margin: 0 auto; /* Center the table */
            margin-bottom: 12px;
          }

          /* Column styling */
          colgroup col {
            width: auto; /* Default column width */
          }

          thead tr > th {
            background-color: #ccecfc; /* Light blue background */
            border: 1px solid #969996; /* Border color */
            padding: 0.05in 0.08in; /* Padding inside cells */
            font-weight: bold; /* Bold text */
            text-align: left; /* Align text to the left */
          }

          tbody td {
            border: 1px solid #969996; /* Border color */
            padding: 0.05in 0.08in; /* Padding inside cells */
            text-align: left; /* Align text to the left */
          }

          tbody td:first-child:last-child:empty {
            height: 2rem;
          }

          table.striped tbody tr:nth-child(odd) td {
            background-color: #f0f0f0;
            /* Light gray background for odd rows */
          }
          .unstyled-pre{
            font-family: Helvetica,Arial,sans-serif !important;
			white-space: pre-wrap;
          }
		.page-break {
  		    page-break-before: always;
			padding-top: 0;
      		margin-top: 0;
		}
  </style>
  </head>
  <body class="mce-content-body">`;

		const allSections = await this.getSectionsRecursive(assessmentOutline.outline);

		const sectionIdsWithVersions: { sectionId: string; version: number }[] = allSections.map(section => ({
			sectionId: section.section_id,
			version: section.version,
		}));

		for (let i = 0; i < sectionIdsWithVersions.length; i++) {
			const section = await this.getSection(assessmentId, sectionIdsWithVersions[i].sectionId, sectionIdsWithVersions[i].version);
			let sectionContent = section.content?.htmlContent || section.content;

			if (sectionContent) {
				if (i > 0 && sectionContent.includes('<h1 ><h1 >')) {
					// Insert a div with page-break before the h1 tag
					sectionContent = sectionContent.replace(/<h1 ><h1 /g, '<h1 class="page-break"> <h1 ');
				} else if (i > 0 && sectionContent.includes('<h1 id=')) {
					sectionContent = sectionContent.replace(
						/(<h1[^>]*>)(?=.*<h1)/g,
						'<h1 class="page-break"$1'
					);
				}
				combinedHTML += sectionContent;
			}
		}

		combinedHTML += '</body></html>';

		return await this.createPDFFromHTML(combinedHTML, assessmentOutline);
	}

	// Recursive function to traverse sections and collect all children sections
	async getSectionsRecursive(sections) {
		let allSections = [];
		for (const section of sections) {
			allSections.push(section);
			if (section.children && section.children.length > 0) {
				const childSections = await this.getSectionsRecursive(section.children);
				allSections = allSections.concat(childSections);
			}
		}
		return allSections;
	}

	// Function to create a PDF from the combined HTML using Puppeteer
	async createPDFFromHTML(htmlContent: string, assessmentOutline: AssessmentOutline | AssessmentHistory): Promise<Uint8Array> {
		const puppeteerOptions: { [key: string]: any } = {
			timeout: 0,
			headless: 'new',
			protocolTimeout: 300000,
			args: ['--no-sandbox', '--disable-setuid-sandbox',  '--disable-dev-shm-usage', '--disable-gpu', '--no-zygote', '--single-process'],
		};
		if (process.env.CHROMIUM_PATH) {
			puppeteerOptions.executablePath = process.env.CHROMIUM_PATH;
		}
		const browser = await puppeteer.launch(puppeteerOptions);
		const page = await browser.newPage();
		page.setDefaultNavigationTimeout(180000);
		page.setDefaultTimeout(180000);

		this.logger.info('Opening blank page...');
		await page.goto('about:blank', { waitUntil: 'load' });

		this.logger.info('Setting content...');
		await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

		const pdfBuffer: Uint8Array = await page.pdf({
			format: 'A4',                   // Set the page format
			printBackground: true,          // Ensure background images are included
			margin: { top: '20mm', bottom: '20mm', left: '10mm', right: '10mm' },
			displayHeaderFooter: true,
			headerTemplate: '<div></div>',
			footerTemplate: `<div style="font-size: 10px; margin: auto; width: 80%; display: grid;     grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; item-align:center;justify-content: space-between;">
  <div style="text-align: left;">Created At: ${assessmentOutline.created_on.toLocaleString()}</div>
   <div style="text-align: center;">Page <span class="pageNumber">1</span> of <span class="totalPages">1</span>
  </div>
  <div style="text-align: right;">Version: ${assessmentOutline.version}</div>
</div>`
		});

		await browser.close();
		this.logger.info('PDF generated successfully, browser closed');
		return pdfBuffer;
	}

	private async getSection(assessmentId: number, sectionId: string, version: number): Promise<AssessmentSections> {
		const sectionRow = await this.assessmentSectionRepo.query(`
			SELECT content::TEXT from assessment_sections WHERE section_id = $1 AND assessment_id = $2 AND version = $3 AND is_deleted = false
			UNION
			SELECT content::TEXT from assessment_sections_history WHERE section_id = $1 AND assessment_id = $2 AND version = $3 AND is_deleted = false
		`, [sectionId, assessmentId, version]);

		if (sectionRow.length === 0) {
			return new AssessmentSections();
		}

		const parsedContent = JSON.parse(sectionRow[0].content);
		const assessmentSection = new AssessmentSections();
		assessmentSection.content = parsedContent;
		return assessmentSection;
	}
}
