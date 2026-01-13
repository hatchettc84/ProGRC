const userRoles = {
  //ProGRC Users
  'super_admin': 1,
  'super_admin_readonly': 2,
  'csm': 5,

  //Org Users
  'org_admin': 3,
  'org_member': 4,
  'auditor': 7,
  'csm_auditor': 6,
};
exports.userRoles = userRoles;
exports.userRolesArray = [
  { id: userRoles.super_admin, role_name: 'Super Admin', is_org_role: false },
  { id: userRoles.super_admin_readonly, role_name: 'Readonly Admin', is_org_role: false },
  { id: userRoles.org_admin, role_name: 'Admin', is_org_role: true },
  { id: userRoles.org_member, role_name: 'Member', is_org_role: true },
  { id: userRoles.csm, role_name: 'CSM', is_org_role: false },
];

export const someValue = '';//ignore


exports.inviteStatus = {
  'not_needed': 'NOT_NEEDED',//for super-admin
  'not_sent': 'NOT_SENT',
  'sent': 'SENT',
  'resent': 'RESENT',
  'joined': 'Joined',
  'invited': 'Invited',
  'reset_password': 'RESET_PASSWORD',
};

exports.fileTypes = {
  'profile_pic': 'profile_picture',
  'template': 'template_document',
  'assessment': 'assessment_document',
};

const standardNames = {
  'ISO_9001': 'ISO_9001',
  'ISO_14001': 'ISO_14001',
  'ISO_27001': 'ISO_27001',
  'ISO_45001': 'ISO_45001',
  'GDPR': 'GDPR'
};

exports.standardNames = standardNames;
exports.standardDataArray = [
  { name: standardNames.ISO_9001, location: 'Location 1' },
  { name: standardNames.ISO_14001, location: 'Location 2' },
  { name: standardNames.ISO_27001, location: 'Location 3' },
  { name: standardNames.ISO_45001, location: 'Location 4' },
  { name: standardNames.GDPR, location: 'Location 5' },
];

const templateName = {
  'template_1': 'TEMPLATE_1',
  'template_2': 'TEMPLATE_1',
  'template_3': 'TEMPLATE_1',
  'template_4': 'TEMPLATE_1'
};

exports.templateName = templateName;
exports.templateDataArray = [
  { name: templateName.template_1, location: 'Location 1' },
  { name: templateName.template_1, location: 'Location 2' },
  { name: templateName.template_1, location: 'Location 3' },
  { name: templateName.template_1, location: 'Location 4' }
];

const appSourceTypes = {
  github: 1,
  aws: 2,
  kubernetes: 3,
  azure: 4,
  vmware: 5,
  gitlab: 6,
  terraform: 7,
  ms_365: 8,
  slack: 9,
  google_workspace: 10,
  splunk: 11,
  cisco: 12,
  db: 13,
  files: 14,
  identity_svc: 15,
};
exports.appSourceTypes = appSourceTypes;
exports.appSourceTypesArray = [
  { id: appSourceTypes.github, name: 'GitHub' },
  { id: appSourceTypes.aws, name: 'AWS' },
  { id: appSourceTypes.kubernetes, name: 'Kubernetes' },
  { id: appSourceTypes.azure, name: 'Azure' },
  { id: appSourceTypes.vmware, name: 'VMware' },
  { id: appSourceTypes.gitlab, name: 'GitLab' },
  { id: appSourceTypes.terraform, name: 'Terraform' },
  { id: appSourceTypes.ms_365, name: 'Microsoft 365' },
  { id: appSourceTypes.slack, name: 'Slack' },
  { id: appSourceTypes.google_workspace, name: 'Google Workspace' },
  { id: appSourceTypes.splunk, name: 'Splunk' },
  { id: appSourceTypes.cisco, name: 'Cisco' },
  { id: appSourceTypes.db, name: 'Database' },
  { id: appSourceTypes.files, name: 'Files' },
  { id: appSourceTypes.identity_svc, name: 'Identity Services' },
];

