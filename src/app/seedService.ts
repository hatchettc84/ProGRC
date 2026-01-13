import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import * as metadata from '../common/metadata';
import { UserRoles } from "src/masterData/userRoles.entity";
import { SourceType } from "src/entities/source/sourceType.entity";
import { LoggerService } from "src/logger/logger.service";

const masterDataMappinginfo = [
    {
        dataArrayName: 'userRolesArray',
        dbObjName: 'UserRoles'
    },
    {
        dataArrayName: 'appSourceTypesArray',
        dbObjName: 'AppSourceTypes'
    },
];
@Injectable()
export class SeedService {
    constructor(
        @InjectRepository(UserRoles) private UserRoles: Repository<UserRoles>,
        @InjectRepository(SourceType) private AppSourceTypes: Repository<SourceType>,
        private readonly logger: LoggerService
    ) { }

    dropTableAndInsertData = async (repoName: string, dataArray: any) => {
        const qryBuilder = await this[repoName].createQueryBuilder();
        //delete records 
        await qryBuilder.delete().where([]).execute();
        this.logger.info(`all from ${repoName} deleted`);
        //insert records
        await qryBuilder.insert().values(dataArray).execute();
        this.logger.info(`done inserting in ${repoName}`);
    }

    insertUpdateData = async (repoName: string, dataArray: any) => {
        const toUpdate = [];
        const toInsert = [];
        const idMap = {};
        if (Array.isArray(dataArray)) {
            if (dataArray.length) {
                dataArray.forEach(ele => {
                    idMap[ele.id] = ele;
                })
            }
        } else {
            return this.dropTableAndInsertData(repoName, dataArray);
        }
        const qryBuilder = this[repoName].createQueryBuilder();
        const existingData = await this[repoName].find();
        existingData.forEach(dbRow => {
            if (idMap[dbRow.id]) {//already existing found
                const incomingData = idMap[dbRow.id];
                const existingData = dbRow;
                let anyNonMatchFound = false;
                //check if any diff, then add to update
                Object.keys(incomingData).forEach(key => {
                    if (key !== 'id') {//no need to check id
                        if (existingData[key] == incomingData[key]) {
                            //do nothing
                        } else {
                            this.logger.info(`non matching data found....`)
                            this.logger.info(`existingData[${key}] !== incomingData[${key}] =>>`)
                            this.logger.info(`${existingData[key]} !== ${incomingData[key]}`)
                            anyNonMatchFound = true;
                        }
                    }
                });
                if (anyNonMatchFound) {
                    toUpdate.push(incomingData);
                }
                delete idMap[dbRow.id];//it is already considered either to update or do noting (in case exact same data already exists)
            }
        });
        toInsert.push(...Object.values(idMap));
       
        if (toInsert.length == 0 && toUpdate.length == 0) {
            this.logger.info('Noting to update/insert');
        } else {
            if (toInsert.length) {
                this.logger.info(`inserting records...: `, toInsert);
                //insert records
                await qryBuilder.insert().values(toInsert).execute();
                this.logger.info(`done inserting in ${repoName}`);
            }
            if (toUpdate.length) {
                this.logger.info(`updating records...: `, toUpdate);
                //update records
                toUpdate.forEach(async (data) => {
                    const id = data.id;
                    delete data.id;
                    await qryBuilder.update().set({ ...data }).where("id = :id", { id: id }).execute();
                    this.logger.info(`Updated record of ${repoName}, with record id = ${id}`);
                });
            }
        }
    }

    seedData() {
        this.logger.info(`seeding data in service...`);
        masterDataMappinginfo.forEach(async (info) => {
            const repoObjName = info.dbObjName;
            const dataArray = metadata[info.dataArrayName];
            await this.insertUpdateData(repoObjName, dataArray);
        });
        return true;
    }
}