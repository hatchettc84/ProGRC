import { Column, Entity, PrimaryColumn } from "typeorm";

// please sync with src/common/metadata.ts
export enum UserRole {
    SuperAdmin = 1,
    SuperAdminReadOnly = 2,
    CSM = 5,

    OrgAdmin = 3,
    OrgMember = 4,
    AUDITOR = 7,
    CSM_AUDITOR = 6,

}

@Entity("user_roles")
export class UserRoles {
    @PrimaryColumn("int")
    id: number;

    @Column()
    role_name: string;

    @Column({ default: true })
    is_org_role: boolean;

    static getInternalRoles(): UserRole[] {
        return [UserRole.SuperAdmin, UserRole.SuperAdminReadOnly, UserRole.CSM, UserRole.CSM_AUDITOR];
    }

    static getInternalRolesIds(): number[] {
        return [Number(UserRole.SuperAdmin), Number(UserRole.SuperAdminReadOnly), Number(UserRole.CSM), Number(UserRole.CSM_AUDITOR)];
    }

    static getCustomerRoles(): UserRole[] {
        return [UserRole.OrgAdmin, UserRole.OrgMember, UserRole.AUDITOR];
    }

    static getCustomerRolesIds(): number[] {
        return [Number(UserRole.OrgAdmin), Number(UserRole.OrgMember), Number(UserRole.AUDITOR)];
    }
}
