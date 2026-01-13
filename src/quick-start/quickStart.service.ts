import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CheckList } from 'src/entities/quickStart.entity';
import { Repository } from 'typeorm';
import { date } from 'zod';

export enum CheckListItem {
    // Org Setup
    ONBOARDING_COMPLETED = "ONBOARDING_COMPLETED",
    MEMBER_ADDED = "MEMBER_ADDED",
    APP_ADDED = "APP_ADDED",
  
    // Source Mgmt
    SOURCE_UPLOADED = "SOURCE_UPLOADED",
    SOURCE_VISITED = "SOURCE_VISITED",
  
    // Compliance Mgmt
    COMPLIANCE_STARTED = "COMPLIANCE_STARTED", // NOT PRIORITY
    COMPLIANCE_FINISHED = "COMPLIANCE_FINISHED",
    CONTROL_VISITED = "CONTROL_VISITED",
  
    // Assessment Mgmt
    ASSESSMENT_GENERATED = "ASSESSMENT_GENERATED",
    ASSESSMENT_VISITED = "ASSESSMENT_VISITED",
  
    // Trusted Doc
    DOC_EXPORTED = "DOC_EXPORTED",
    DOC_VISITED = "DOC_VISITED",
  
    // Help center
    HELP_CENTER_VISITED = "HELP_CENTER_VISITED",
  }
  

  
@Injectable()
export class QuickStartService {
    constructor(
        @InjectRepository(CheckList)
        private readonly checkListRepo: Repository<CheckList>,
      ) {}


      async getCheckListItems(userData: any,): Promise<CheckList[]> {
        const customerId = userData['customerId'];

        return await this.checkListRepo.find({
          where:{
            customer_id: customerId,
          }
        });
      }

      async updateCheckList(userData: any, appId: number | null, checkListData: { checkListItem: CheckListItem }) {
        const customerId = userData['customerId'];
        const userEmail = userData['userEmail'];
        const { checkListItem } = checkListData;
    
        if (!Object.values(CheckListItem).includes(checkListItem)) {
            throw new BadRequestException('Invalid check list item');
        }
    
        const existingCheckList = await this.checkListRepo.findOne({
            where: {
                customer_id: customerId,
                check_list_item: checkListItem,
                ...(appId !== null && { app_id: appId }),
            },
        });
    
        if (existingCheckList) {
            existingCheckList.updated_at = new Date();
            await this.checkListRepo.save(existingCheckList);
            return "Data updated successfully";
        } else {
            const checkList = this.checkListRepo.create({
                customer_id: customerId,
                user_email: userEmail,
                check_list_item: checkListItem,
                app_id: appId,
                created_at: new Date(),
                updated_at: new Date(),
            });
    
            await this.checkListRepo.save(checkList);
            return "Data saved successfully";
        }
    }
}