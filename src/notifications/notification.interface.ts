export interface Notification {
    id: string;
    author: UserDTO;
    action: string;
    time: string;
    applicationId: number;
    sourceFileName?: string;
    operation: NotificationAction;
    status: NotificationStatus;
}
export interface UserDTO {
    id: string;
    name: string;
    email: string;
    role_id: number;
    mobile: string;
    profile_image_key: string | null;

}


export enum NotificationAction {
    CREDENTIALS_UPLOAD = "Credentials Upload",
    DOCUMENTS_UPLOAD = "Documents Upload",
    AWS_CONFIG_UPLOAD = "AWS Config Upload",
    SOURCE_CODE_UPLOAD = "Source Code Upload",
    CREATE_ASSETS = 'create assets',
    CREATE_ASSESSMENTS = 'create assessments',
    UPDATE_ASSETS = 'update assets',
    UPDATE_ASSESSMENTS = 'update assessments',
    UPDATE_COMPLIANCE = 'update compliance',
    EXPORT_TRUST_CENTER = 'export assessment to trust center',
    CONTROL_EVALUATION = 'control evaluation',
    CREATE_POLICY = 'Create Policy',
    GENERATE_POAM = 'Generate POAM',
    SYNC_JIRA = 'Sync Jira',
    UPDATE_POLICY = 'Update Policy',
    PROCESS_CRM = 'Process CRM',
    CLONE_APPLICATION = 'Clone Application',
}

export enum NotificationStatus {
    PENDING = "PENDING",
    PROCESSED = "PROCESSED",
    FAILED = "FAILED",
    IN_PROCESS = "IN_PROCESS",
    CANCELLED = "CANCELLED",
}
