import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { Control } from "src/entities/compliance/control.entity";
import { StandardControlMapping } from "src/entities/compliance/standardControlMapping.entity";
import { Repository } from "typeorm";


@Injectable()
export class GetControlDetailsService {
    constructor(
        @InjectRepository(Control) private readonly controlRepo: Repository<Control>,
        @InjectRepository(StandardControlMapping) private readonly standardControlMapping: Repository<StandardControlMapping>,
        @InjectRepository(ApplicationControlMapping) private readonly applicationControlMapping: Repository<ApplicationControlMapping>,
    ) { }

    async getControlDetails(userInfo: any, appId: number, standardId: number, controlId: number): Promise<any> {
        const appControlMappings = await this.applicationControlMapping.findOne({
            where: {
                app_id: appId,
                id: controlId,
            },
            relations: ["control"],
        });

        const standardControlMappings = await this.standardControlMapping.findOne({ where: { standard_id: standardId,
             control_id: appControlMappings.control_id } });

             return {
                controlText: appControlMappings.control.control_text,
                discussion: appControlMappings.control.control_discussion,
                user_additional_parameter: appControlMappings.user_additional_parameter ? true : false,
                additionalParameters: appControlMappings.user_additional_parameter || standardControlMappings.additional_selection_parameters,
            };

    }

}
