import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewTemplate21734086901373 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`select 1`);
        // await queryRunner.query(`
        //     INSERT INTO public.templates
        //     (id, "name", "location", standard_id, upload_date, update_date, outline)
        //     VALUES
        //     (
        //       2,
        //       'FedRAMP-High-Moderate-Low-LI-SaaS-Baseline-System-Security-Plan-(SSP)',
        //       'https://example.com/template1.pdf',
        //       5,
        //       now(),
        //       now(),
        //       '[{"section_id":"a789c12d-ed93-498b-9838-83c3537b07e5","children":[],"level":1,"search_key":"0","version":0},{"section_id":"83cfd31c-202e-4b5d-9032-76ddd86bc5a8","children":[],"level":1,"search_key":"1","version":0},{"section_id":"f217b1e9-bfce-422a-bde5-f75357605db9","children":[],"level":1,"search_key":"2","version":0},{"section_id":"388a34b4-0845-41fd-8aa6-2802dc80a112","children":[],"level":1,"search_key":"3","version":0},{"section_id":"aec80e1a-17b0-4dd4-8e3d-c534c874dbd5","children":[],"level":1,"search_key":"4","version":0},{"section_id":"ec78afcb-9eec-4cf8-8051-c0ac171e3337","children":[],"level":1,"search_key":"5","version":0},{"section_id":"12f9c00f-0912-4258-8c48-50584d8c662d","children":[],"level":1,"search_key":"6","version":0},{"section_id":"33150ae7-8fd4-4e0c-9d37-345adf49cf7a","children":[],"level":1,"search_key":"7","version":0},{"section_id":"76d85428-7fc3-4c03-852f-21c649201fc3","children":[],"level":1,"search_key":"8","version":0},{"section_id":"8c042e71-9def-439b-bf5c-0450f46b7113","children":[],"level":1,"search_key":"9","version":0},{"section_id":"6ab585de-af89-4e90-bc06-d7c59bc81b4c","children":[],"level":1,"search_key":"10","version":0},{"section_id":"4b3a8fd3-2693-4b70-b43f-7376804f3fd6","children":[],"level":1,"search_key":"11","version":0},{"section_id":"5def1a17-f5a7-40eb-96d5-a6709b1ce9a3","children":[],"level":2,"search_key":"12","version":0},{"section_id":"4727aed6-e8f3-4efc-a71f-d1566c1d124d","children":[],"level":2,"search_key":"13","version":0},{"section_id":"948b96e1-8288-4ee9-b216-96faf1f651a1","children":[],"level":1,"search_key":"14","version":0},{"section_id":"13e1e9ed-57cc-4fc3-b344-2fe1c336e9d6","children":[],"level":1,"search_key":"15","version":0},{"section_id":"e148c250-ea30-4872-b8af-d0eb73088c74","children":[],"level":1,"search_key":"16","version":0},{"section_id":"3ce1468d-827b-4648-9a3f-a82bfd481b1a","children":[{"section_id":"6845895f-eb78-4dc6-9c3f-199aa5e1567e","children":[],"level":2,"search_key":"18","version":0},{"section_id":"dea68186-84a6-4135-ba5e-b0e6eb3467d0","children":[],"level":2,"search_key":"19","version":0},{"section_id":"0be2bef5-62fc-47e5-8691-b5769fd50dee","children":[],"level":2,"search_key":"20","version":0},{"section_id":"39c33f4d-a157-49ee-ae5e-ff887e904d99","children":[],"level":2,"search_key":"21","version":0},{"section_id":"8d9d1a4f-ec6a-4dee-a68c-8534fad75cae","children":[],"level":2,"search_key":"22","version":0},{"section_id":"12834ee7-6ada-469d-bc8a-cc43cc224b3e","children":[],"level":2,"search_key":"23","version":0},{"section_id":"958dcf32-d89d-43a2-aef2-9e12e502ad1a","children":[],"level":2,"search_key":"24","version":0},{"section_id":"b0815335-d50a-490a-818e-aa1fab4ebb9f","children":[],"level":2,"search_key":"25","version":0},{"section_id":"d0a0f23a-00ba-4603-abfd-3cf76f00c3c7","children":[],"level":2,"search_key":"26","version":0},{"section_id":"fa2b0261-9763-4f74-92ac-b5f7348c9ba8","children":[],"level":2,"search_key":"27","version":0},{"section_id":"630ec626-6c96-4c34-80fd-6517695d2b74","children":[],"level":2,"search_key":"28","version":0},{"section_id":"dc6ca1dd-7a96-4157-8699-957ab605f0ad","children":[],"level":2,"search_key":"29","version":0},{"section_id":"89cc29e3-7045-4a7c-8af8-76cadf86d896","children":[],"level":2,"search_key":"30","version":0},{"section_id":"0245b0db-f4c1-4297-bd8e-8bc00d41515c","children":[],"level":2,"search_key":"31","version":0},{"section_id":"e651beda-2a49-4b4e-ad89-86f352dca41f","children":[],"level":2,"search_key":"32","version":0},{"section_id":"239d8b1f-1240-422a-8e5c-aca87d2bf18f","children":[],"level":2,"search_key":"33","version":0},{"section_id":"a29d1362-e2ca-4b81-aad4-e5c4db25e9d5","children":[],"level":2,"search_key":"34","version":0}],"level":1,"search_key":"17","version":0}]'
        //     );
        //   `);
      
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`select 1`);
        // await queryRunner.query(`
        //     DELETE FROM public.templates WHERE id = 2;
        //   `);
    }

}
