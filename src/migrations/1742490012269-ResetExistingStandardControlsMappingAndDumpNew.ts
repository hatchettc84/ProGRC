import { MigrationInterface, QueryRunner } from "typeorm";

export class ResetExistingStandardControlsMappingAndDumpNew1751707734269 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         // Delete all existing data from standard_control_mapping table
         await queryRunner.query(`DELETE FROM public.standard_control_mapping`);
        
         // Reset the sequence back to 1
         await queryRunner.query(`ALTER SEQUENCE public.standard_control_mapping_id_seq RESTART WITH 1`);

         // Insert new standard_control_mapping data
         await queryRunner.query(`
            INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,1,'AC-1 (c)(1) [at least annually]
 AC-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,2,'AC-2 (h)(1) [twenty-four(24) hours]
 AC-2 (h)(2) [eight(8) hours]
 AC-2 (h)(3) [eight(8) hours]
 AC-2 (j) [monthly for privileged accessed, every six(6) months for non-privileged access]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,3,'AC-2(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,4,'AC-2(2) [Selection: disables] 
 [Assignment: no more than 24 hours from last use]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,5,'AC-2(3) [24 hours for user accounts]
 AC-2(3) (d) [thirty-five(35) days] (See additional requirements and guidance.)','AC-2(3) Requirement: The service provider defines the time period for non-user accounts (e.g., accounts associated with devices). The time periods are approved and accepted by the JAB/AO. Where user management is a function of the service, reports of activity of consumer users shall be made available.
 AC-2(3) (d) Requirement: The service provider defines the time period of inactivity for device identifiers.
 Guidance: For DoD clouds, see DoD cloud website for specific DoD requirements that go above and beyond FedRAMP https://public.cyber.mil/dccs/.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,6,'AC-2(4)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,7,'AC-2(5) [inactivity is anticipated to exceed Fifteen(15) minutes]','AC-2(5) Guidance: Should use a shorter timeframe than AC-12.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,9,'AC-2(7)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,11,'AC-2(9) [organization-defined need with justification statement that explains why such accounts are necessary]','AC-2(9) Requirement: Required if shared/group accounts are deployed','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,13,'AC-2(11)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,14,'AC-2(12) (b)[at a minimum, the ISSO and/or similar role within the organization]','AC-2(12) (a) Requirement: Required for privileged accounts.
 AC-2(12) (b) Requirement: Required for privileged accounts.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,15,'AC-2(13)-1 [one(1) hour]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,16,'AC-3',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,18,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,20,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,32,'AC-4',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,36,'AC-4(4)-1 [intrusion detection mechanisms]','AC-4(4) Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf) and M-22-9 (https://www.whitehouse.gov/wp-content/uploads/2022/01/M-22-9.pdf).','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,53,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,65,'AC-5','AC-5 Guidance: CSPs have the option to provide a separation of duties matrix as an attachment to the SSP.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,66,'AC-6',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,67,'AC-6(1) (a) [all functions not publicly accessible]
 AC-6(1) (b) [all security-relevant information not publicly available]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,68,'AC-6(2) [all security functions]','AC-6(2) Guidance: Examples of security functions include but are not limited to: establishing system accounts, configuring access authorizations (i.e., permissions, privileges), setting events to be audited, and setting intrusion detection parameters, system programming, system and security administration, other privileged functions.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,69,'AC-6(3)-1 [all privileged commands]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,71,'AC-6(5)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,73,'AC-6(7) (a)-1 [at a minimum, annually]
 AC-6(7) (a)-2 [all users with privileges]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,74,'AC-6(8) [any software except software explicitly documented]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,75,'AC-6(9)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,76,'AC-6 (10)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,77,'AC-7
For privileged users, DOD limits to three unsuccessful attempts and requires an administrator to unlock. For nonprivileged users, if rate limiting, DOD will allow 10 attempts with the account automatically unlocked after 30 minutes. If rate limiting is not used, normal DSPAV will be required.','AC-7 Requirement: In alignment with NIST SP 800-63B','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,82,'AC-8 (a) [see additional Requirements and Guidance]
 AC-8 (c)(1) [see additional Requirements and Guidance]','AC-8 Requirement: The service provider shall determine elements of the cloud environment that require the System Use Notification control. The elements of the cloud environment that require System Use Notification are approved and accepted by the JAB/AO. 
 
 Requirement: The service provider shall determine how System Use Notification is going to be verified and provide appropriate periodicity of the check. The System Use Notification verification and periodicity are approved and accepted by the JAB/AO.
 
 Requirement: If not performed as part of a Configuration Baseline check, then there must be documented agreement on how to provide results of verification and the necessary periodicity of the verification by the service provider. The documented agreement on how to provide verification of the results are approved and accepted by the JAB/AO.
 
 Guidance: If performed as part of a Configuration Baseline check, then the % of items requiring setting that are checked and that pass (or fail) check can be provided.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,88,'AC-10-2 [three(3) sessions for privileged access and two(2) sessions for non-privileged access]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,89,'AC-11 (a) [fifteen(15) minutes]; requiring the user to initiate a device lock before leaving the system unattended',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,90,'AC-11(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,91,'AC-12',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,92,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,93,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,96,'AC-14',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,99,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,104,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,105,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,106,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,110,'AC-17',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,111,'AC-17(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,112,'AC-17(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,113,'AC-17(3)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,114,'AC-17(4)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,116,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,119,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,120,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,121,'AC-18',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,122,'AC-18(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,124,'AC-18(3)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,125,'AC-18(4)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,126,'AC-18(5)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,127,'AC-19',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,131,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,132,'AC-19(5)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (6,1068,'SI-4(4) (b)-1 [continuously]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (8,133,'AC-20','AC-20 Guidance: The interrelated controls of AC-20, CA-3, and SA-9 should be differentiated as follows:
 AC-20 describes system access to and from external systems.
 CA-3 describes documentation of an agreement between the respective system owners when data is exchanged between the CSO and an external system.
 SA-9 describes the responsibilities of external system owners. These responsibilities would typically be captured in the agreement required by CA-3.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,134,'AC-20(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,135,'AC-20(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,136,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,137,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,139,'AC-21',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,142,'AC-22 (d) [at least quarterly]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,143,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,148,'AT-1 (c)(1) [at least annually]
 AT-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,149,'AT-2 (a)(1) [at least annually]
 AT-2 (c) [at least annually]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,151,'AT-2(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,152,'AT-2(3)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,153,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,154,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,155,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,156,'AT-3 (a)(1) [at least annually]
 AT-3 (b) [at least annually]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,157,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,158,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,162,'AT-4 (b) [five(5) years or 5 years after completion of a specific training program]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,164,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,165,'AU-1 (c)(1) [at least annually]
 AU-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,166,'AU-2 (a) [successful and unsuccessful account logon events, account management events, object access, policy change, privilege functions, process tracking, and system events. For Web applications: all administrator activity, authentication checks, authorization checks, data deletions, data access, data changes, and permission changes]
 AU-2 (c) [organization-defined subset of the auditable events defined in AU-2a to be audited continually for each identified event].
 AU-2 (e) [annually and whenever there is a change in the threat environment]','AU-2 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO.
 AU-2 (e) Guidance: Annually or whenever changes in the threat environment are communicated to the service provider by the JAB/AO.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,171,'AU-3',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,172,'AU-3(1) [session, connection, transaction, or activity duration; for client-server transactions, the number of bytes received and bytes sent; additional informational messages to diagnose or identify the event; characteristics that describe or identify the object or resource being acted upon; individual identities of group account users; full-text of privileged commands]','AU-3(1) Guidance: For client-server transactions, the number of bytes sent and received gives bidirectional transfer information that can be helpful during an investigation or inquiry.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,175,'AU-4',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,177,'AU-5 (b) [overwrite oldest record]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,178,'AU-5(1)-3 [75%, or one month before expected negative impact]
CSP/CSO may use FedRAMP value.',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,179,'AU-5(2)-1 [real-time] 
 AU-5(2)-2 [service provider personnel with authority to address failed audit events] 
 AU-5(2)-3 [audit failure events requiring real-time alerts, as defined by organization audit policy].',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,183,'AU-6 (a)-1 [at least weekly]','AU-6 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO. In multi-tenant environments, capability and means for providing review, analysis, and reporting to consumer for data pertaining to consumer shall be documented.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,184,'AU-6(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,186,'AU-6(3)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,187,'AU-6(4)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,188,'AU-6(5) [Selection (one or more): vulnerability scanning information; performance data; information system monitoring information; penetration test data; [Organization -defined data/information collected from other sources]]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,189,'AU-6(6)','AU-6(6) Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,190,'AU-6(7) [information system process; role; user]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,191,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,192,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,194,'AU-7',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,195,'AU-7(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,197,'AU-8 (b) [one second granularity of time measurement]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,200,'AU-9',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,202,'AU-9(2) [at least weekly]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,203,'AU-9(3)','AU-9(3) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,204,'AU-9(4)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,205,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,206,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,208,'AU-10 [minimum actions including the addition, modification, deletion, approval, sending, or receiving of data]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,214,'AU-11 [a time period in compliance with M-21-31]','AU-11 Requirement: The service provider retains audit records on-line for at least ninety days and further preserves audit records off-line for a period that is in accordance with NARA requirements. 
 AU-11 Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf)
 AU-11 Guidance: The service provider is encouraged to align with M-21-31 where possible','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,216,'AU-12 (a) [all information system and network components where audit capability is deployed/available]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,217,'AU-12(1)-1 [all network, data storage, and computing devices]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,219,'AU-12(3)-1 [service provider-defined individuals or roles with audit configuration responsibilities] 
 AU-12(3)-2 [all network, data storage, and computing devices]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,225,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,226,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,228,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,230,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,231,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,232,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,234,'CA-1 (c)(1) [at least annually]
 CA-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,235,'CA-2 (d) [at least annually] 
 CA-2 (f) [individuals or roles to include FedRAMP PMO]','CA-2 Guidance: Reference FedRAMP Annual Assessment Guidance.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,236,NULL,'CA-2(1) Requirement: For JAB Authorization, must use an accredited 3PAO.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,237,'CA-2(2) [at least annually]','CA-2(2) Requirement: To include ''announced'', ''vulnerability scanning''','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,238,'CA-2(3)-1 [any FedRAMP Accredited 3PAO]
 CA-2(3)-3 [the conditions of the JAB/AO in the FedRAMP Repository]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,239,'CA-3 (c) [at least annually and on input from JAB/AO]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,245,'CA-3(6)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,248,'CA-5 (b) [at least monthly]','CA-5 Requirement: POA&Ms must be provided at least monthly.
 CA-5 Guidance: Reference FedRAMP-POAM-Template','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,250,'CA-6 (e) [in accordance with OMB A-130 requirements or when a significant change occurs]','CA-6 (e) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F and according to FedRAMP Significant Change Policies and Procedures. The service provider describes the types of changes to the information system or the environment of operations that would impact the risk posture. The types of changes are approved and accepted by the JAB/AO.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,253,'CA-7 (g)-1 [to include JAB/AO]','CA-7 Requirement: Operating System, Database, Web Application, Container, and Service Configuration Scans: at least monthly. All scans performed by Independent Assessor: at least annually.
 CA-7 Requirement: CSOs with more than one agency ATO must implement a collaborative Continuous Monitoring (ConMon) approach described in the FedRAMP Guide for Multi-Agency Continuous Monitoring. This requirement applies to CSOs authorized via the Agency path as each agency customer is responsible for performing ConMon oversight. It does not apply to CSOs authorized via the JAB path because the JAB performs ConMon oversight.
 CA-7 Guidance: FedRAMP does not provide a template for the Continuous Monitoring Plan. CSPs should reference the FedRAMP Continuous Monitoring Strategy Guide when developing the Continuous Monitoring Plan.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,254,'CA-7(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,256,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,257,'CA-7(4)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,258,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,259,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,260,'CA-8-1 [at least annually]','CA-8 Guidance: Reference the FedRAMP Penetration Test Guidance.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,261,'CA-8(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,262,'CA-8(2)','CA-8(2) Guidance: See the FedRAMP Documents page> Penetration Test Guidance 
 https://www.FedRAMP.gov/documents/','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,263,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,264,'CA-9 (d) [at least annually]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,266,'CM-1 (c)(1) [at least annually]
 CM-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,267,'CM-2 (b)(1) [at least annually and when a significant change occurs]
 CM-2 (b)(2) [to include when directed by the JAB]','CM-2 (b)(1) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,269,'CM-2(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,270,'CM-2(3) [organization-defined number of previous versions of baseline configurations of the previously approved baseline configuration of IS components]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,274,'CM-2(7)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,275,'CM-3','CM-3 Requirement: The service provider establishes a central means of communicating major changes to or developments in the information system or environment of operations that may affect its services to the federal government and associated service consumers (e.g., electronic bulletin board, web status page). The means of communication are approved and accepted by the JAB/AO.
 CM-3 (e) Guidance: In accordance with record retention policies and procedures.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,276,'CM-3(1) (c) [organization agreed upon time period] 
 CM-3(1) (f) [organization defined configuration management approval authorities]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,277,'CM-3(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,279,'CM-3(4)-2 [Configuration control board (CCB) or similar (as defined in CM-3)]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,280,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,281,'CM-3(6) All security safeguards that rely on cryptography',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,282,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,283,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,284,'CM-4',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,285,'CM-4(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,286,'CM-4(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,287,'CM-5',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,288,'CM-5(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,292,'CM-5(5) (b) [at least quarterly]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,293,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,295,'CM-6','CM-6 (a) Requirement 1: The service provider shall use the DoD STIGs to establish configuration settings; Center for Internet Security up to Level 2 (CIS Level 2) guidelines shall be used if STIGs are not available; Custom baselines shall be used if CIS is not available.
 CM-6 (a) Requirement 2: The service provider shall ensure that checklists for configuration settings are Security Content Automation Protocol (SCAP) validated or SCAP compatible (if validated checklists are not available).
 
 CM-6 Guidance: Compliance checks are used to evaluate configuration settings and provide general insight into the overall effectiveness of configuration management activities. CSPs and 3PAOs typically combine compliance check findings into a single CM-6 finding, which is acceptable. However, for initial assessments, annual assessments, and significant change requests, FedRAMP requires a clear understanding, on a per-control basis, where risks exist. Therefore, 3PAOs must also analyze compliance check findings as part of the controls assessment. Where a direct mapping exists, the 3PAO must document additional findings per control in the corresponding SAR Risk Exposure Table (RET), which are then documented in the CSP’s Plan of Action and Milestones (POA&M). This will likely result in the details of individual control findings overlapping with those in the combined CM-6 finding, which is acceptable.
 During monthly continuous monitoring, new findings from CSP compliance checks may be combined into a single CM-6 POA&M item. CSPs are not required to map the findings to specific controls because controls are only assessed during initial assessments, annual assessments, and significant change requests.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,296,'CM-6(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,297,'CM-6(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (6,1069,'SI-4(5)','SI-4(5) Guidance: In accordance with the incident response plan.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (8,300,'CM-7','CM-7 (b) Requirement: The service provider shall use Security guidelines (See CM-6) to establish list of prohibited or restricted functions, ports, protocols, and/or services or establishes its own list of prohibited or restricted functions, ports, protocols, and/or services if STIGs or CIS is not available.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,301,'CM-7(1) (a) [at least annually]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,302,'CM-7(2)','CM-7(2) Guidance: This control refers to software deployment by CSP personnel into the production environment. The control requires a policy that states conditions for deploying software. This control shall be implemented in a technical manner on the information system to only allow programs to run that adhere to the policy (i.e. allow-listing). This control is not to be based off of strictly written policy on what is allowed or not allowed to run.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,303,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,305,'CM-7(5) (c) [at least quarterly or when there is a change]
DSPAV must be used.',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,308,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,309,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,310,'CM-8 (b) [at least monthly]','CM-8 Requirement: must be provided at least monthly or when there is a change.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,311,'CM-8(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,312,'CM-8(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,313,'CM-8(3) (a)-1 [automated mechanisms with a maximum five-minute delay in detection.] 
 CM-8(3) (a)-2 [continuously]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,314,'CM-8(4) [position and role]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,320,'CM-9','CM-9 Guidance: FedRAMP does not provide a template for the Configuration Management Plan. However, NIST SP 800-128, Guide for Security-Focused Configuration Management of Information Systems, provides guidelines for the implementation of CM controls as well as a sample CMP outline in Appendix D of the Guide','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,322,'CM-10',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,323,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,324,'CM-11 (c) [Continuously (via CM-7(5))]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,326,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,328,'CM-12','CM-12 Requirement: According to FedRAMP Authorization Boundary Guidance','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,329,'CM-12(1)-1: [Federal data and system data that must be protected at the High or Moderate impact levels]','CM-12(1) Requirement: According to FedRAMP Authorization Boundary Guidance.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,331,'CM-14','CM-14 Guidance: If digital signatures/certificates are unavailable, alternative cryptographic integrity checks (hashes, self-signed certs, etc.) can be utilized.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,332,'CP-1 (c)(1) [at least annually]
 CP-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,333,'CP-2 (d) [at least annually]','CP-2 Requirement: For JAB authorizations the contingency lists include designated FedRAMP personnel.
 
 CP-2 Requirement: CSPs must use the FedRAMP Information System Contingency Plan (ISCP) Template (available on the fedramp.gov: https://www.fedramp.gov/assets/resources/templates/SSP-A06-FedRAMP-ISCP-Template.docx).','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,334,'CP-2(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,335,'CP-2(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,336,'CP-2(3)-1 [all]
 CP-2(3)-2 [time period defined in service provider and organization SLA]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,338,'CP-2(5) [essential]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,341,'CP-2(8)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,342,'CP-3 (a)(1) [*See Additional Requirements]
 CP-3 (a)(3) [at least annually]
 CP-3 (b) [at least annually]','CP-3 (a) Requirement: Privileged admins and engineers must take the basic contingency training within 10 days. Consideration must be given for those privileged admins and engineers with critical contingency-related roles, to gain enough system context and situational awareness to understand the full impact of contingency training as it applies to their respective level. Newly hired critical contingency personnel must take this more in-depth training within 60 days of hire date when the training will have more impact.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,343,'CP-3(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,345,'CP-4 (a)-1 [at least annually] 
 CP-4 (a)-2 [functional exercises]','CP-4 (a) Requirement: The service provider develops test plans in accordance with NIST Special Publication 800-34 (as amended); plans are approved by the JAB/AO prior to initiating testing.
 
 CP-4 (b) Requirement: The service provider must include the Contingency Plan test results with the security package within the Contingency Plan-designated appendix (Appendix G, Contingency Plan Test Report).','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,346,'CP-4(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,347,'CP-4(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,352,'CP-6',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,353,'CP-6(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,354,'CP-6(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,355,'CP-6(3)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,356,'CP-7','CP-7 (a) Requirement: The service provider defines a time period consistent with the recovery time objectives and business impact analysis.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,357,'CP-7(1)','CP-7(1) Guidance: The service provider may determine what is considered a sufficient degree of separation between the primary and alternate processing sites, based on the types of threats that are of concern. For one particular type of threat (i.e., hostile cyber attack), the degree of separation between sites will be less relevant.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,358,'CP-7(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,359,'CP-7(3)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,360,'CP-7(4)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,363,'CP-8','CP-8 Requirement: The service provider defines a time period consistent with the recovery time objectives and business impact analysis.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,364,'CP-8(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,365,'CP-8(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,366,'CP-8(3)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,367,'CP-8(4) (c) [annually]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (6,1074,'SI-4 (10)','SI-4(10) Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf) and M-22-9 (https://www.whitehouse.gov/wp-content/uploads/2022/01/M-22-9.pdf).','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1075,'SI-4(11)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1076,'SI-4(12)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1078,'SI-4(14)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1080,'SI-4(16)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,1082,NULL,NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1083,'SI-4 (19)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1084,'SI-4 (20)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1086,'SI-4 (22)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (8,369,'CP-9 (a)-2 [daily incremental; weekly full]
 CP-9 (b) [daily incremental; weekly full]
 CP-9 (c) [daily incremental; weekly full]','CP-9 Requirement: The service provider shall determine what elements of the cloud environment require the Information System Backup control. The service provider shall determine how Information System Backup is going to be verified and appropriate periodicity of the check.
 CP-9 (a) Requirement: The service provider maintains at least three backup copies of user-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (b) Requirement: The service provider maintains at least three backup copies of system-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (c) Requirement: The service provider maintains at least three backup copies of information system documentation including security information (at least one of which is available online) or provides an equivalent alternative.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,370,'CP-9(1) [at least monthly]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,371,'CP-9(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,372,'CP-9(3)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,374,'CP-9(5) [time period and transfer rate consistent with the recovery time and recovery point objectives defined in the service provider and organization SLA].',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,377,'CP-9(8) [all backup files]','CP-9(8) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,378,'CP-10',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,380,'CP-10(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,382,'CP-10(4) [time period consistent with the restoration time-periods defined in the service provider and organization SLA]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,388,'IA-1 (c)(1) [at least annually]
 IA-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,389,'IA-2','IA-2 Requirement: For all control enhancements that specify multifactor authentication, the implementation must adhere to the Digital Identity Guidelines specified in NIST Special Publication 800-63B.
 
 IA-2 Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2 Requirement: All uses of encrypted virtual private networks must meet all applicable Federal requirements and architecture, dataflow, and security and privacy controls must be documented, assessed, and authorized to operate.
 
 IA-2 Guidance: “Phishing-resistant" authentication refers to authentication processes designed to detect and prevent disclosure of authentication secrets and outputs to a website or application masquerading as a legitimate system.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,390,'IA-2(1)','IA-2(1) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(1) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(1) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,391,'IA-2(2)','IA-2(2) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(2) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(2) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,394,'IA-2(5)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,395,'IA-2(6)-1 [local, network and remote]
 IA-2(6)-2 [privileged accounts; non-privileged accounts]
 IA-2(6) (b) [FIPS-validated or NSA-approved cryptography]','IA-2(6) Guidance: PIV=separate device. Please refer to NIST SP 800-157 Guidelines for Derived Personal Identity Verification (PIV) Credentials.
 
 IA-2(6) Guidance: See SC-13 Guidance for more information on FIPS-validated or NSA-approved cryptography.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,397,'IA-2(8) [privileged accounts; non-privileged accounts]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,401,'IA-2(12)','IA-2(12) Guidance: Include Common Access Card (CAC), i.e., the DoD technical implementation of PIV/FIPS 201/HSPD-12.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,403,'IA-3',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,404,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,408,'IA-4 (a) [at a minimum, the ISSO (or similar role within the organization)] 
 IA-4 (d) [at least two(2) years]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,412,'IA-4(4) [contractors; foreign nationals]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,417,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,418,'IA-5','IA-5 Requirement: Authenticators must be compliant with NIST SP 800-63-3 Digital Identity Guidelines IAL, AAL, FAL level 3. Link https://pages.nist.gov/800-63-3
 
 IA-5 Guidance: SP 800-63C Section 6.2.3 Encrypted Assertion requires that authentication assertions be encrypted when passed through third parties, such as a browser. For example, a SAML assertion can be encrypted using XML-Encryption, or an OpenID Connect ID Token can be encrypted using JSON Web Encryption (JWE).','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,419,'IA-5(1)
DSPAV must be used.','IA-5(1) Requirement: Password policies must be compliant with NIST SP 800-63B for all memorized, lookup, out-of-band, or One-Time-Passwords (OTP). Password policies shall not enforce special character or minimum password rotation requirements for memorized secrets of users.
 
 IA-5(1) (h) Requirement: For cases where technology doesn’t allow multi-factor authentication, these rules should be enforced: must have a minimum length of 14 characters and must support all printable ASCII characters.
  
 For emergency use accounts, these rules should be enforced: must have a minimum length of 14 characters, must support all printable ASCII characters, and passwords must be changed if used. 
 
 IA-5(1) Guidance: Note that (c) and (d) require the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,420,'IA-5(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,424,'IA-5(6)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,425,'IA-5(7)','IA-5(7) Guidance: In this context, prohibited static storage refers to any storage where unencrypted authenticators, such as passwords, persist beyond the time required to complete the access process.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,426,'IA-5(8) [different authenticators in different user authentication domains]','IA-5(8) Guidance: If a single user authentication domain is used to access multiple systems, such as in single-sign-on, then only a single authenticator is required.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,431,'IA-5(13)','IA-5(13) Guidance: For components subject to configuration baseline(s) (such as STIG or CIS,) the time period should conform to the baseline standard.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,432,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,434,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,437,'IA-6',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,438,'IA-7',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,439,'IA-8',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,440,'IA-8(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,441,'IA-8(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,443,'IA-8(4)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,446,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,449,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,450,'IA-11','IA-11 Guidance:
 The fixed time period cannot exceed the limits set in SP 800-63. At this writing they are:
 - AAL3 (high baseline)
  -- 12 hours or
  -- 15 minutes of inactivity','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,451,'IA-12','IA-12 Additional FedRAMP Requirements and Guidance:
 Guidance: In accordance with NIST SP 800-63A Enrollment and Identity Proofing','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,452,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,453,'IA-12(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,454,'IA-12(3)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,455,'IA-12(4)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,456,'IA-12(5)','IA-12(5) Additional FedRAMP Requirements and Guidance:
 Guidance: In accordance with NIST SP 800-63A Enrollment and Identity Proofing','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,458,'IR-1 (c)(1) [at least annually]
 IR-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,459,'IR-2 (a)(1) [ten(10) days for privileged users, thirty(30) days for Incident Response roles]
 IR-2 (a)(3) [at least annually]
 IR-2 (b) [at least annually]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,460,'IR-2(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,461,'IR-2(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,463,'IR-3-1 [at least every six(6) months, including functional at least annually]','IR-3-2 Requirement: The service provider defines tests and/or exercises in accordance with NIST Special Publication 800-61 (as amended). Functional testing must occur prior to testing for initial authorization. Annual functional testing may be concurrent with required penetration tests (see CA-8). The service provider provides test plans to the JAB/AO annually. Test plans are approved and accepted by the JAB/AO prior to test commencing.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,465,'IR-3(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,467,'IR-4','IR-4 Requirement: The FISMA definition of "incident" shall be used: "An occurrence that actually or imminently jeopardizes, without lawful authority, the confidentiality, integrity, or availability of information or an information system; or constitutes a violation or imminent threat of violation of law, security policies, security procedures, or acceptable use policies."
 
 IR-4 Requirement: The service provider ensures that individuals conducting incident handling meet personnel security requirements commensurate with the criticality/sensitivity of the information being processed, stored, and transmitted by the information system.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,468,'IR-4(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,469,'IR-4(2)-1 [all network, data storage, and computing devices]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,470,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,471,'IR-4(4)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,473,'IR-4(6)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,474,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,475,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,477,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,478,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,479,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,480,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,481,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,483,'IR-5',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,484,'IR-5(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,485,'IR-6 (a) [US-CERT incident reporting timelines as specified in NIST Special Publication 800-61 (as amended)]','IR-6 Requirement: Reports security incident information according to FedRAMP Incident Communications Procedure.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,486,'IR-6(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,487,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,488,'IR-6(3)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,489,'IR-7',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,490,'IR-7(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,491,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,492,'IR-8 (a)(9)-2 [at least annually]
 IR-8 (b) [see additional FedRAMP Requirements and Guidance]
 IR-8 (d) [see additional FedRAMP Requirements and Guidance]','IR-8 (b) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.
 IR-8 (d) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,494,'IR-9',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,496,'IR-9(2) [at least annually]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,497,'IR-9(3)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,498,'IR-9(4)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,500,'MA-1 (c)(1) [at least annually]
 MA-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,501,'MA-2',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,504,'MA-3 (b) [at least annually]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,505,'MA-3(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,506,'MA-3(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,507,'MA-3(3) (d) [the information owner]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,508,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,509,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,510,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,511,'MA-4',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,512,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,514,'MA-4(3)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,515,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,517,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,518,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,519,'MA-5',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,520,'MA-5(1)
DSPAV must be used.','MA-5(1) Requirement: Only MA-5(1) (a)(1) is required by FedRAMP Moderate Baseline','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,521,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,522,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,523,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,524,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,525,'MA-6-2 [a timeframe to support advertised uptime and availability]
CSP/CSO may use FedRAMP value.',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,530,'MP-1 (c)(1) [at least annually]
 MP-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,531,'MP-2-1 [all types of digital and/or non-digital media containing sensitive information]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,534,'MP-3 (b)-1 [no removable media types]
 MP-3 (b)-2 [organization-defined security safeguards not applicable]','MP-3 (b) Guidance: Second parameter not-applicable','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,535,'MP-4 (a)-1 [all types of digital and non-digital media with sensitive information] 
 MP-4 (a)-2 [see additional FedRAMP requirements and guidance]','MP-4 (a) Requirement: The service provider defines controlled areas within facilities where the information and information system reside.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,789,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,538,'MP-5 (a) [all media with sensitive information] [prior to leaving secure/controlled environment: for digital media, encryption in compliance with Federal requirements and utilizes FIPS validated or NSA approved cryptography (see SC-13.); for non-digital media, secured in locked container]','MP-5 (a) Requirement: The service provider defines security measures to protect digital and non-digital media in transport. The security measures are approved and accepted by the JAB/AO.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,541,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,543,'MP-6 (a)-2 [techniques and procedures IAW NIST SP 800-88 Section 4: Reuse and Disposal of Storage Media and Hardware]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,544,'MP-6(1)','MP-6(1) Requirement: Must comply with NIST SP 800-88','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,545,'MP-6(2) [at least every six(6) months]','MP-6(2) Guidance: Equipment and procedures may be tested or validated for effectiveness','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,546,'MP-6(3)','MP-6(3) Requirement: Must comply with NIST SP 800-88','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,552,'MP-7',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,555,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,556,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,557,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,559,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,560,'PE-1 (c)(1) [at least annually]
 PE-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,561,'PE-2 (c) [at least every ninety(90) days]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,564,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,565,'PE-3 (a)(2) [CSP defined physical access control systems/devices AND guards]
 PE-3 (d) [in all circumstances within restricted access area where the information system resides]
 PE-3 (f)-2 [at least annually]
 PE-3 (g) [at least annually or earlier as required by a security relevant event.]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,566,'PE-3(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,567,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,568,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,574,'PE-4',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,575,'PE-5',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,579,'PE-6 (b)-1 [at least monthly]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,580,'PE-6(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,583,'PE-6(4)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,585,'PE-8 (a) [for a minimum of one(1) year]
 PE-8 (b) [at least monthly]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,586,'PE-8(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,588,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,589,'PE-9',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,592,'PE-10 (b) [near more than one egress point of the IT area and ensures it is labeled and protected by a cover to prevent accidental shut-off]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,594,'PE-11',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,595,'PE-11(1) [automatically]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,597,'PE-12',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,599,'PE-13',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,600,'PE-13(1) -1 [service provider building maintenance/physical security personnel]
 PE-13(1) -2 [service provider emergency responders with incident response responsibilities]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,601,'PE-13(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,604,'PE-14 (a) [consistent with American Society of Heating, Refrigerating and Air-conditioning Engineers (ASHRAE) document entitled Thermal Guidelines for Data Processing Environments]
 
 PE-14 (b) [continuously]','PE-14 (a) Requirement: The service provider measures temperature at server inlets and humidity levels by dew point.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,606,'PE-14(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,607,'PE-15
DSPAV must be used.',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,608,'PE-15(1)-1 [service provider building maintenance/physical security personnel]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,609,'PE-16 (a) [all information system components]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,610,'PE-17',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,611,'PE-18 [physical and environmental hazards identified during threat assessment]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,613,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,614,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,617,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,619,'PL-1 (c)(1) [at least annually]
 PL-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,620,'PL-2 (a)(14) [to include chief privacy and ISSO and/or similar role or designees]
 PL-2 (b) [to include chief privacy and ISSO and/or similar role]
 PL-2 (c) [at least annually]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,625,'PL-4 (c) [at least annually]
 PL-4 (d) [at least annually and when the rules are revised or changed]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,626,'PL-4(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,629,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,630,'PL-8 (b) [at least annually and when a significant change occurs]','PL-8 (b) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,631,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,632,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,633,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,634,'PL-10','PL-10 Requirement: Select the appropriate FedRAMP Baseline','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,635,'PL-11',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,649,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,673,'PS-1 (c)(1) [at least annually]
 PS-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,674,'PS-2 (c) [at least annually]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,675,'PS-3 (b) [for national security clearances; a reinvestigation is required during the fifth(5th) year for top secret security clearance, the tenth(10th) year for secret security clearance, and fifteenth(15th) year for confidential security clearance.
 
 For moderate risk law enforcement and high impact public trust level, a reinvestigation is required during the fifth(5th) year. There is no reinvestigation for other moderate risk positions or any low risk positions]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,676,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,679,'All information systems.
 Users: U.S. citizens, U.S. nationals, or U.S. persons, foreign personnel as allowed by current DOD polices with AO approval.
 Administrators: U.S. citizens, U.S. nationals, or U.S. persons.',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,680,'PS-4 (a) [one(1) hour]
CSP/CSO may use FedRAMP value.',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,681,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,682,'PS-4(2)-2 Notify [access control personnel responsible for disabling access to the system]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,683,'PS-5 (b)-2 [twenty-four(24) hours] 
 PS-5 (d)-1 [including access control personnel responsible for the system]
 PS-5 (d)-2 [twenty-four(24) hours]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,790,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,791,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,684,'PS-6 (b) [at least annually]
 PS-6 (c)(2) [at least annually and any time there is a change to the user''s level of access]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,686,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,687,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,688,'PS-7 (d)-1 [including access control personnel responsible for the system and/or facilities, as appropriate]
 PS-7 (d)-2 [terminations: immediately; transfers: within twenty-four(24) hours]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,689,'PS-8 (b)-1 [to include the ISSO and/or similar role within the organization]
 PS-8 (b)-2 [24 hours]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,690,'PS-9',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,712,'RA-1 (c)(1) [at least annually]
 RA-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,713,'RA-2',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,715,'RA-3 (c) [security assessment report]
  
 RA-3 (d) [at least annually and whenever a significant change occurs]
  
 RA-3 (f) [annually]','RA-3 Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.
 RA-3 (e) Requirement: Include all Authorizing Officials; for JAB authorizations to include FedRAMP.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,716,'RA-3(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,717,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,718,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,721,'RA-5 (a) [monthly operating system/infrastructure; monthly web applications (including APIs) and databases]
 RA-5 (d) [high-risk vulnerabilities mitigated within thirty(30) days from date of discovery; moderate-risk vulnerabilities mitigated within ninety(90) days from date of discovery; low risk vulnerabilities mitigated within one hundred and eighty(180) days from date of discovery]','RA-5 Guidance: See the FedRAMP Documents page> Vulnerability Scanning Requirements 
 https://www.FedRAMP.gov/documents/
 RA-5 (a) Requirement: an accredited independent assessor scans operating systems/infrastructure, web applications, and databases once annually.
 RA-5 (d) Requirement: If a vulnerability is listed among the CISA Known Exploited Vulnerability (KEV) Catalog (https://www.cisa.gov/known-exploited-vulnerabilities-catalog) the KEV remediation date supersedes the FedRAMP parameter requirement.
 RA-5 (e) Requirement: to include all Authorizing Officials; for JAB authorizations to include FedRAMP
 
 RA-5 Guidance: Informational findings from a scanner are detailed as a returned result that holds no vulnerability risk or severity and for FedRAMP does not require an entry onto the POA&M or entry onto the RET during any assessment phase.
 Warning findings, on the other hand, are given a risk rating (low, moderate, high or critical) by the scanning solution and should be treated like any other finding with a risk or severity rating for tracking purposes onto either the POA&M or RET depending on when the findings originated (during assessments or during monthly continuous monitoring). If a warning is received during scanning, but further validation turns up no actual issue then this item should be categorized as a false positive. If this situation presents itself during an assessment phase (initial assessment, annual assessment or any SCR), follow guidance on how to report false positives in the Security Assessment Report (SAR). If this situation happens during monthly continuous monitoring, a deviation request will need to be submitted per the FedRAMP Vulnerability Deviation Request Form.
 Warnings are commonly associated with scanning solutions that also perform compliance scans, and if the scanner reports a “warning” as part of the compliance scanning of a CSO, follow guidance surrounding the tracking of compliance findings during either the assessment phases (initial assessment, annual assessment or any SCR) or monthly continuous monitoring as it applies. Guidance on compliance scan findings can be found by searching on “Tracking of Compliance Scans” in FAQs.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,723,'RA-5(2) [within 24 hours prior to
 running scans]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,724,'RA-5(3)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,725,'RA-5(4) [notify appropriate service provider personnel and follow procedures for organization and service provider-defined corrective actions]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,726,'RA-5(5)-1 [all components that support authentication] 
 RA-5(5)-2 [all scans]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,729,'RA-5(8)','RA-5(8) Requirement: This enhancement is required for all high (or critical) vulnerability scan findings.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,731,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,732,'RA-5(11)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,733,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,734,'RA-7',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,736,'RA-9',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,737,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,738,'SA-1 (c)(1) [at least annually]
 SA-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,739,'SA-2',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,740,'SA-3',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,741,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,742,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,744,'SA-4','SA-4 Requirement: The service provider must comply with Federal Acquisition Regulation (FAR) Subpart 7.103, and Section 889 of the John S. McCain National Defense Authorization Act (NDAA) for Fiscal Year 2019 (Pub. L. 115-232), and FAR Subpart 4.21, which implements Section 889 (as well as any added updates related to FISMA to address security concerns in the system acquisitions process).
 
 SA-4 Guidance: The use of Common Criteria (ISO/IEC 15408) evaluated products is strongly preferred.
 See https://www.niap-ccevs.org/Product/index.cfm or https://www.commoncriteriaportal.org/products/.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,745,'SA-4(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,746,'SA-4(2)-1 [at a minimum to include security-relevant external system interfaces; high-level design; low-level design; source code or network and data flow diagram; [organization-defined design/implementation information]]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,747,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,749,'SA-4(5) (a) The service provider shall use the DoD STIGs to establish configuration settings; Center for Internet Security up to Level 2 (CIS Level 2) guidelines shall be used if STIGs are not available; Custom baselines shall be used if CIS is not available.
DSPAV must be used.',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,750,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,751,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,753,'SA-4(9)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,754,'SA-4 (10)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,757,'SA-5 (d) [at a minimum, the ISSO (or similar role within the organization)]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,765,'SA-8',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,766,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,767,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,768,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,769,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,770,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,771,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,772,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,773,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,774,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,775,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,776,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,777,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,778,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,779,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,780,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,781,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,782,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,783,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,784,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,785,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,786,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,787,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,788,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,792,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,793,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,794,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,795,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,796,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,797,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,799,'SA-9 (a) [Appropriate FedRAMP Security Controls Baseline (s) if Federal information is processed or stored within the external system]
 SA-9 (c) [Federal/FedRAMP Continuous Monitoring requirements must be met for external systems where Federal information is processed or stored]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,800,'SA-9(1)
DSPAV must be used.',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,801,'SA-9(2) [all external systems where Federal information is processed or stored]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,802,'DSPAV must be used.',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,804,'SA-9(5)-1 [information processing, information or data, AND system services]
 SA-9(5)-2 [U.S./U.S. Territories or geographic locations where there is U.S. jurisdiction]
 SA-9(5)-3 [all High impact data, systems, or services]
SA-9 (5)-1 [information processing, information or data, AND system services].
 SA-9 (5)-2 [U.S./U.S. Territories or geographic locations where there is U.S. jurisdiction].
 SA-9 (5)-3 [all data, systems, or services].',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,805,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,806,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,807,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,808,'SA-10 (a) [development, implementation, AND operation]','SA-10 (e) Requirement: track security flaws and flaw resolution within the system, component, or service and report findings to organization-defined personnel, to include FedRAMP.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,809,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,811,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,815,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,816,'SA-11',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,817,'SA-11(1)','SA-11(1) Requirement: The service provider must document its methodology for reviewing newly developed code for the Service in its Continuous Monitoring Plan.
 
 If Static code analysis cannot be performed (for example, when the source code is not available), then dynamic code analysis must be performed (see SA-11(8))','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,818,'SA-11(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,845,'SA-15 (b)-1 [frequency as before first use and annually thereafter]
 SA-15 (b)-2 [FedRAMP Security Authorization requirements]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,848,'SA-15(3)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,852,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,858,'SA-16',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,859,'SA-17',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,878,'SA-21',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,880,'SA-22',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,883,'SC-1 (c)(1) [at least annually]
 SC-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,884,'SC-2',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,887,'SC-3',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,893,'SC-4',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,896,'SC-5 (a)-1 [Protect against] 
 SC-5 (a)-2 [at a minimum: ICMP (ping) flood, SYN flood, slowloris, buffer overflow attack, and volume attack]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,901,'SC-7','SC-7 (b) Guidance: SC-7 (b) should be met by subnet isolation. A subnetwork (subnet) is a physically or logically segmented section of a larger network defined at TCP/IP Layer 3, to both minimize traffic and, important for a FedRAMP Authorization, add a crucial layer of network isolation. Subnets are distinct from VLANs (Layer 2), security groups, and VPCs and are specifically required to satisfy SC-7 part b and other controls. See the FedRAMP Subnets White Paper (https://www.fedramp.gov/assets/resources/documents/FedRAMP_subnets_white_paper.pdf) for additional information.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,904,'SC-7(3)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,905,'SC-7(4) (e) [at least every ninety(90) days or whenever there is a change in the threat environment that warrants a review of the exceptions]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,906,'SC-7(5) [any systems]','SC-7(5) Guidance: For JAB Authorization, CSPs shall include details of this control in their Architecture Briefing','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,908,'SC-7(7)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,909,'SC-7(8)-2 [any network outside of organizational control and any network outside the authorization boundary]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,910,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,911,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,912,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,913,'SC-7(12)-1 [Host Intrusion Prevention System (HIPS), Host Intrusion Detection System (HIDS), or minimally a host-based firewall]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,914,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,915,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,916,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,919,'SC-7(18)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,921,'SC-7 (20)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,922,'SC-7 (21)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,926,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,927,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,929,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,930,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,931,'SC-8 [confidentiality AND integrity]','SC-8 Guidance:
 For each instance of data in transit, confidentiality AND integrity should be through cryptography as specified in SC-8(1), physical means as specified in SC-8(5), or in combination.
 
 For clarity, this control applies to all data in transit. Examples include the following data flows:
  - Crossing the system boundary
  - Between compute instances - including containers
  - From a compute instance to storage
  - Replication between availability zones
  - Transmission of backups to storage
  - From a load balancer to a compute instance
  - Flows from management tools required for their work – e.g. log collection, scanning, etc.
 
 The following applies only when choosing SC-8(5) in lieu of SC-8(1).
 FedRAMP-Defined Assignment / Selection Parameters 
 SC-8(5)-1 [a hardened or alarmed carrier Protective Distribution System (PDS) when outside of Controlled Access Area (CAA)]
 SC-8(5)-2 [prevent unauthorized disclosure of information AND detect changes to information] 
 
 SC-8 Guidance:
 SC-8(5) applies when physical protection has been selected as the method to protect confidentiality and integrity. For physical protection, data in transit must be in either a Controlled Access Area (CAA), or a Hardened or alarmed PDS.
 
 Hardened or alarmed PDS: Shall be as defined in SECTION X - CATEGORY 2 PDS INSTALLATION GUIDANCE of CNSSI No.7003, titled PROTECTED DISTRIBUTION SYSTEMS (PDS). Per the CNSSI No. 7003 Section VIII, PDS must originate and terminate in a Controlled Access Area (CAA). 
 
 Controlled Access Area (CAA): Data will be considered physically protected, and in a CAA if it meets Section 2.3 of the DHS’s Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies. CSPs can meet Section 2.3 of the DHS’ recommended practice by satisfactory implementation of the following controls PE-2(1), PE-2(2), PE-2(3), PE-3(2), PE-3(3), PE-6(2), and PE-6(3).
 
 Note: When selecting SC-8(5), the above SC-8(5), and the above referenced PE controls must be added to the SSP.
 
 CNSSI No.7003 can be accessed here:
 https://www.dcsa.mil/Portals/91/documents/ctp/nao/CNSSI_7003_PDS_September_2015.pdf 
 
 DHS Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies can be accessed here:
 https://us-cert.cisa.gov/sites/default/files/FactSheets/NCCIC%20ICS_FactSheet_Defense_in_Depth_Strategies_S508C.pdf','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (6,1087,'SI-4 (23)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (8,1124,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1125,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (5,626,'PL-4(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (8,932,'SC-8(1) [prevent unauthorized disclosure of information AND detect changes to information]','SC-8(1) Requirement: Please ensure SSP Section 10.3 Cryptographic Modules Implemented for Data At Rest (DAR) and Data In Transit (DIT) is fully populated for reference in this control.
 
 SC-8(1) Guidance:
 See M-22-9, including "Agencies encrypt all DNS requests and HTTP traffic within their environment"
 
 SC-8(1) applies when encryption has been selected as the method to protect confidentiality and integrity. Otherwise refer to SC-8(5). SC-8(1) is strongly encouraged.
 
 SC-8(1) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)
 
 SC-8(1) Guidance: When leveraging encryption from the underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,933,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,934,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,935,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,938,'SC-10 [no longer than ten(10) minutes for privileged sessions and no longer than fifteen(15) minutes for user sessions]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,941,'SC-12 [In accordance with Federal requirements]','SC-12 Guidance: See references in NIST 800-53 documentation.
 
 SC-12 Guidance: Must meet applicable Federal Cryptographic Requirements. See References Section of control.
 
 SC-12 Guidance: Wildcard certificates may be used internally within the system, but are not permitted for external customer access to the system.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,942,'SC-12(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,943,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,944,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,947,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,948,'SC-13 (b) [FIPS-validated or NSA-approved cryptography]','SC-13 Guidance:
 This control applies to all use of cryptography. In addition to encryption, this includes functions such as hashing, random number generation, and key generation. Examples include the following:
  - Encryption of data
  - Decryption of data
  - Generation of one time passwords (OTPs) for MFA
  - Protocols such as TLS, SSH, and HTTPS
 
 The requirement for FIPS 140 validation, as well as timelines for acceptance of FIPS 140-2, and 140-3 can be found at the NIST Cryptographic Module Validation Program (CMVP).
 https://csrc.nist.gov/projects/cryptographic-module-validation-program 
 
 SC-13 Guidance: For NSA-approved cryptography, the National Information Assurance Partnership (NIAP) oversees a national program to evaluate Commercial IT Products for Use in National Security Systems. The NIAP Product Compliant List can be found at the following location:
 https://www.niap-ccevs.org/Product/index.cfm 
 
 SC-13 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-13 Guidance:
 Moving to non-FIPS CM or product is acceptable when:
 - FIPS validated version has a known vulnerability
 - Feature with vulnerability is in use
 - Non-FIPS version fixes the vulnerability
 - Non-FIPS version is submitted to NIST for FIPS validation
 - POA&M is added to track approval, and deployment when ready
 
 SC-13 Guidance: At a minimum, this control applies to cryptography in use for the following controls: AU-9(3), CP-9(8), IA-2(6), IA-5(1), MP-5, SC-8(1), and SC-28(1).','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,954,'SC-15 (a) [no exceptions for computing devices]','SC-15 Requirement: The information system provides disablement (instead of physical disconnect) of collaborative computing devices in a manner that supports ease of use.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,957,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,959,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,960,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,961,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,962,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,963,'SC-17
DODI 8520.02, Public Key Infrastructure (PKI) and Public Key Enabling (PKE).',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,964,'SC-18',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,965,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,966,'DSPAV must be used.',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,967,'Supplemental guidance:
 For the protection of the infrastructure supporting a CSO, CSPs should apply this control to their organizational IT systems and the infrastructure supporting their CSO(s).
 For the protection of Mission Owners, their end users, and networks, CSP CSOs must not support the downloading of mobile code, which is deemed unacceptable to DOD.
 Refer to Section 5.11, Mobile Code, for more information.',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,968,'Software applications such as but not limited to email, scriptable document/file editing applications that support documents with embedded code (e.g., Microsoft Office applications/documents), etc. Prompting the user for permission.',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,971,'SC-20','SC-20 Requirement:
 Control Description should include how DNSSEC is implemented on authoritative DNS servers to supply valid responses to external DNSSEC requests.
 
 SC-20 Requirement: Authoritative DNS servers must be geolocated in accordance with SA-9(5).
 
 SC-20 Guidance: SC-20 applies to use of external authoritative DNS to access a CSO from outside the boundary.
 
 SC-20 Guidance:
 External authoritative DNS servers may be located outside an authorized environment. Positioning these servers inside an authorized boundary is encouraged.
 
 SC-20 Guidance: CSPs are recommended to self-check DNSSEC configuration through one of many available analyzers such as Sandia National Labs (https://dnsviz.net)','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,974,'SC-21','SC-21 Requirement:
 Control description should include how DNSSEC is implemented on recursive DNS servers to make DNSSEC requests when resolving DNS requests from internal components to domains external to the CSO boundary.
 - If the reply is signed, and fails DNSSEC, do not use the reply
 - If the reply is unsigned:
  -- CSP chooses the policy to apply
 
 SC-21 Requirement:
 Internal recursive DNS servers must be located inside an authorized environment. It is typically within the boundary, or leveraged from an underlying IaaS/PaaS.
 
 SC-21 Guidance: Accepting an unsigned reply is acceptable
 
 SC-21 Guidance:
 SC-21 applies to use of internal recursive DNS to access a domain outside the boundary by a component inside the boundary.
 - DNSSEC resolution to access a component inside the boundary is excluded.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,976,'SC-22',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,977,'SC-23',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,978,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,980,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,982,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,983,'SC-24
DSPAV must be used.',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (10,1299,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (10,1227,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1307,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1250,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1280,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1246,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (8,988,'SC-28 [confidentiality AND integrity]','SC-28 Guidance: The organization supports the capability to use cryptographic mechanisms to protect information at rest. 
 
 SC-28 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-28 Guidance: Note that this enhancement requires the use of cryptography in accordance with SC-13.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,989,'SC-28(1)-1 [all information system components storing Federal data or system data that must be protected at the High or Moderate impact levels]','SC-28(1) Guidance: 
 Organizations should select a mode of protection that is targeted towards the relevant threat scenarios. 
 Examples:
 A. Organizations may apply full disk encryption (FDE) to a mobile device where the primary threat is loss of the device while storage is locked. 
 B. For a database application housing data for a single customer, encryption at the file system level would often provide more protection than FDE against the more likely threat of an intruder on the operating system accessing the storage.
 C. For a database application housing data for multiple customers, encryption with unique keys for each customer at the database record level may be more appropriate.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,991,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1017,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1018,'SC-39',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,1026,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1027,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1035,'SC-45',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1036,'SC-45(1) (a) [At least hourly] [http://tf.nist.gov/tf-cgi/servers.cgi] 
 SC-45(1) (b) [any difference]','SC-45(1) Requirement: The service provider selects primary and secondary time servers used by the NIST Internet time service. The secondary server is selected from a different geographic region than the primary server.
 SC-45(1) Requirement: The service provider synchronizes the system clocks of network computers that run operating systems other than Windows to the Windows Server Domain Controller emulator or to the same time source for that server.
 SC-45(1) Guidance: Synchronization of system clocks improves the accuracy of log analysis.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1038,'DSPAV must be used.',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1045,'SI-1 (c)(1) [at least annually]
 SI-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1046,'SI-2 (c) [within thirty(30) days of release of updates]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1048,'SI-2(2)-2 [at least monthly]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1049,'SI-2(3)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1050,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,1052,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1053,'SI-3 (a) [signature based and non-signature based]
 SI-3 (c)(1)-1 [at least weekly] 
 SI-3 (c)(1)-2 [to include endpoints and network entry and exit points]
 SI-3 (c)(2)-1 [to include blocking and quarantining malicious code]
 SI-3 (c)(2)-2 [administrator or defined security personnel near-realtime]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1063,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1064,'SI-4','SI-4 Guidance: See US-CERT Incident Response Reporting Guidelines.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1065,'SI-4(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1066,'SI-4(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1068,'SI-4(4) (b)-1 [continuously]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1069,'SI-4(5)','SI-4(5) Guidance: In accordance with the incident response plan.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1074,'SI-4 (10)','SI-4(10) Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf) and M-22-9 (https://www.whitehouse.gov/wp-content/uploads/2022/01/M-22-9.pdf).','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1075,'SI-4(11)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,1076,'SI-4(12)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1078,'SI-4(14)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1079,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1080,'SI-4(16)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1082,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1083,'SI-4 (19)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1084,'SI-4 (20)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1085,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1086,'SI-4 (22)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1087,'SI-4 (23)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,1088,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1089,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1090,'SI-5 (a) [to include US-CERT and Cybersecurity and Infrastructure Security Agency (CISA) Directives]
 SI-5 (c) [to include system security personnel and administrators with configuration/patch-management responsibilities]','SI-5 Requirement: Service Providers must address the CISA Emergency and Binding Operational Directives applicable to their cloud service offering per FedRAMP guidance. This includes listing the applicable directives and stating compliance status.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1091,'SI-5(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1092,'SI-6 (b) -1 [to include upon system startup and/or restart] -2 [at least monthly]
 SI-6 (c) [to include system administrators and security personnel]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1096,'SI-7',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1097,'SI-7(1)-2 [selection to include security relevant events] 
 SI-7(1)-3 [at least monthly]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1098,'SI-7(2) [to include the ISSO and/or similar role within the organization]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1101,'SI-7(5)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1103,'SI-7(7)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,1104,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1105,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1106,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1111,'SI-7(15) [to include all software and firmware inside the boundary]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1113,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1114,'SI-8','SI-8 Guidance: 
 When CSO sends email on behalf of the government as part of the business offering, Control Description should include implementation of Domain-based Message Authentication, Reporting & Conformance (DMARC) on the sending domain for outgoing messages as described in DHS Binding Operational Directive (BOD) 18-1.
 https://cyber.dhs.gov/bod/18-1/ 
 
 SI-8 Guidance: CSPs should confirm DMARC configuration (where appropriate) to ensure that policy=reject and the rua parameter includes reports@dmarc.cyber.dhs.gov. DMARC compliance should be documented in the SI-8 control implementation solution description, and list the FROM: domain(s) that will be seen by email recipients.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1116,'SI-8(2)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1119,'SI-10','SI-10 Requirement: Validate all information inputs and document any exceptions','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1122,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1126,'SI-11 (b) [to include the ISSO and/or similar role within the organization]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,1127,'SI-12',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1130,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1141,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1142,'SI-16',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1159,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1160,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1163,'SR-1 (a) [to include chief privacy and ISSO and/or similar role or designees]
 SR-1 (c)(1) [at least annually]
 SR-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1164,'SR-2 (b) [at least annually]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1165,'SR-2(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1166,'SR-3','SR-3 Requirement: CSO must document and maintain the supply chain custody, including replacement devices, to ensure the integrity of the devices before being introduced to the boundary.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,1167,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1168,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1169,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1170,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1175,'SR-5',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1176,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1177,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1178,'SR-6 [at least annually]','SR-6 Requirement: CSOs must ensure that their supply chain vendors build and test their systems in alignment with NIST SP 800-171 or a commensurate security and compliance framework. CSOs must ensure that vendors are compliant with physical facility access and logical access controls to supplied products.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1179,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1180,NULL,NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (8,1181,'SR-8-1 [notification of supply chain compromises and results of assessment or audits]','SR-8 Requirement: CSOs must ensure and document how they receive notifications from their supply chain vendor of newly discovered vulnerabilities including zero-day vulnerabilities.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1182,'SR-9','SR-9 Requirement: CSOs must ensure vendors provide authenticity of software and patches supplied to the service provider including documenting the safeguards in place.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1183,'SR-9(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1184,'SR-10',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1185,'SR-11','SR-11 Requirement: CSOs must ensure that their supply chain vendors provide authenticity of software and patches and the vendor must have a plan to protect the development pipeline.','2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1186,'SR-11(1)',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1187,'SR-11(2) [all]',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (8,1189,'SR-12',NULL,'2025-01-13 15:16:58.420796','2025-01-13 15:16:58.420796'),
	 (6,1090,'SI-5 (a) [to include US-CERT and Cybersecurity and Infrastructure Security Agency (CISA) Directives]
 SI-5 (c) [to include system security personnel and administrators with configuration/patch-management responsibilities]','SI-5 Requirement: Service Providers must address the CISA Emergency and Binding Operational Directives applicable to their cloud service offering per FedRAMP guidance. This includes listing the applicable directives and stating compliance status.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1091,'SI-5(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,1092,'SI-6 (b) -1 [to include upon system startup and/or restart] -2 [at least monthly]
 SI-6 (c) [to include system administrators and security personnel]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1096,'SI-7',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1097,'SI-7(1)-2 [selection to include security relevant events] 
 SI-7(1)-3 [at least monthly]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1098,'SI-7(2) [to include the ISSO and/or similar role within the organization]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1101,'SI-7(5)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1103,'SI-7(7)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1111,'SI-7(15) [to include all software and firmware inside the boundary]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1114,'SI-8','SI-8 Guidance: 
 When CSO sends email on behalf of the government as part of the business offering, Control Description should include implementation of Domain-based Message Authentication, Reporting & Conformance (DMARC) on the sending domain for outgoing messages as described in DHS Binding Operational Directive (BOD) 18-1.
 https://cyber.dhs.gov/bod/18-1/ 
 
 SI-8 Guidance: CSPs should confirm DMARC configuration (where appropriate) to ensure that policy=reject and the rua parameter includes reports@dmarc.cyber.dhs.gov. DMARC compliance should be documented in the SI-8 control implementation solution description, and list the FROM: domain(s) that will be seen by email recipients.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1116,'SI-8(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1119,'SI-10','SI-10 Requirement: Validate all information inputs and document any exceptions','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,1126,'SI-11 (b) [to include the ISSO and/or similar role within the organization]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1127,'SI-12',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1142,'SI-16',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1163,'SR-1 (a) [to include chief privacy and ISSO and/or similar role or designees]
 SR-1 (c)(1) [at least annually]
 SR-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1164,'SR-2 (b) [at least annually]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1165,'SR-2(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1166,'SR-3','SR-3 Requirement: CSO must document and maintain the supply chain custody, including replacement devices, to ensure the integrity of the devices before being introduced to the boundary.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1175,'SR-5',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1178,'SR-6 [at least annually]','SR-6 Requirement: CSOs must ensure that their supply chain vendors build and test their systems in alignment with NIST SP 800-171 or a commensurate security and compliance framework. CSOs must ensure that vendors are compliant with physical facility access and logical access controls to supplied products.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1181,'SR-8-1 [notification of supply chain compromises and results of assessment or audits]','SR-8 Requirement: CSOs must ensure and document how they receive notifications from their supply chain vendor of newly discovered vulnerabilities including zero-day vulnerabilities.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,1182,'SR-9','SR-9 Requirement: CSOs must ensure vendors provide authenticity of software and patches supplied to the service provider including documenting the safeguards in place.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1183,'SR-9(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1184,'SR-10',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (10,1273,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1235,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1254,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (6,1,'AC-1 (c)(1) [at least annually]
 AC-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,486,'IR-6(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,2,'AC-2 (h)(1) [twenty-four(24) hours]
 AC-2 (h)(2) [eight(8) hours]
 AC-2 (h)(3) [eight(8) hours]
 AC-2 (j) [monthly for privileged accessed, every six(6) months for non-privileged access]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,3,'AC-2(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,4,'AC-2(2) [Selection: disables] 
 [Assignment: no more than 24 hours from last use]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,5,'AC-2(3) [24 hours for user accounts]
 AC-2(3) (d) [thirty-five(35) days] (See additional requirements and guidance.)','AC-2(3) Requirement: The service provider defines the time period for non-user accounts (e.g., accounts associated with devices). The time periods are approved and accepted by the JAB/AO. Where user management is a function of the service, reports of activity of consumer users shall be made available.
 AC-2(3) (d) Requirement: The service provider defines the time period of inactivity for device identifiers.
 Guidance: For DoD clouds, see DoD cloud website for specific DoD requirements that go above and beyond FedRAMP https://public.cyber.mil/dccs/.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,6,'AC-2(4)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,7,'AC-2(5) [inactivity is anticipated to exceed Fifteen(15) minutes]','AC-2(5) Guidance: Should use a shorter timeframe than AC-12.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,9,'AC-2(7)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,11,'AC-2(9) [organization-defined need with justification statement that explains why such accounts are necessary]','AC-2(9) Requirement: Required if shared/group accounts are deployed','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,13,'AC-2(11)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,14,'AC-2(12) (b)[at a minimum, the ISSO and/or similar role within the organization]','AC-2(12) (a) Requirement: Required for privileged accounts.
 AC-2(12) (b) Requirement: Required for privileged accounts.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,15,'AC-2(13)-1 [one(1) hour]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,16,'AC-3',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,32,'AC-4',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,36,'AC-4(4)-1 [intrusion detection mechanisms]','AC-4(4) Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf) and M-22-9 (https://www.whitehouse.gov/wp-content/uploads/2022/01/M-22-9.pdf).','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,53,NULL,NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,65,'AC-5','AC-5 Guidance: CSPs have the option to provide a separation of duties matrix as an attachment to the SSP.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,66,'AC-6',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,67,'AC-6(1) (a) [all functions not publicly accessible]
 AC-6(1) (b) [all security-relevant information not publicly available]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,68,'AC-6(2) [all security functions]','AC-6(2) Guidance: Examples of security functions include but are not limited to: establishing system accounts, configuring access authorizations (i.e., permissions, privileges), setting events to be audited, and setting intrusion detection parameters, system programming, system and security administration, other privileged functions.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,69,'AC-6(3)-1 [all privileged commands]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,71,'AC-6(5)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,73,'AC-6(7) (a)-1 [at a minimum, annually]
 AC-6(7) (a)-2 [all users with privileges]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,74,'AC-6(8) [any software except software explicitly documented]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,75,'AC-6(9)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,76,'AC-6 (10)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,77,'AC-7
For privileged users, DOD limits to three unsuccessful attempts and requires an administrator to unlock. For nonprivileged users, if rate limiting, DOD will allow 10 attempts with the account automatically unlocked after 30 minutes. If rate limiting is not used, normal DSPAV will be required.','AC-7 Requirement: In alignment with NIST SP 800-63B','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,82,'AC-8 (a) [see additional Requirements and Guidance]
 AC-8 (c)(1) [see additional Requirements and Guidance]','AC-8 Requirement: The service provider shall determine elements of the cloud environment that require the System Use Notification control. The elements of the cloud environment that require System Use Notification are approved and accepted by the JAB/AO. 
 
 Requirement: The service provider shall determine how System Use Notification is going to be verified and provide appropriate periodicity of the check. The System Use Notification verification and periodicity are approved and accepted by the JAB/AO.
 
 Requirement: If not performed as part of a Configuration Baseline check, then there must be documented agreement on how to provide results of verification and the necessary periodicity of the verification by the service provider. The documented agreement on how to provide verification of the results are approved and accepted by the JAB/AO.
 
 Guidance: If performed as part of a Configuration Baseline check, then the % of items requiring setting that are checked and that pass (or fail) check can be provided.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,88,'AC-10-2 [three(3) sessions for privileged access and two(2) sessions for non-privileged access]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,89,'AC-11 (a) [fifteen(15) minutes]; requiring the user to initiate a device lock before leaving the system unattended',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,90,'AC-11(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,91,'AC-12',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,96,'AC-14',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,110,'AC-17',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,111,'AC-17(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,112,'AC-17(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,113,'AC-17(3)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,114,'AC-17(4)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,121,'AC-18',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,122,'AC-18(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,124,'AC-18(3)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,125,'AC-18(4)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,126,'AC-18(5)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,127,'AC-19',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,132,'AC-19(5)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,133,'AC-20','AC-20 Guidance: The interrelated controls of AC-20, CA-3, and SA-9 should be differentiated as follows:
 AC-20 describes system access to and from external systems.
 CA-3 describes documentation of an agreement between the respective system owners when data is exchanged between the CSO and an external system.
 SA-9 describes the responsibilities of external system owners. These responsibilities would typically be captured in the agreement required by CA-3.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,134,'AC-20(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,135,'AC-20(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (7,114,'AC-17(4)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (6,139,'AC-21',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,142,'AC-22 (d) [at least quarterly]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,488,'IR-6(3)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,148,'AT-1 (c)(1) [at least annually]
 AT-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,149,'AT-2 (a)(1) [at least annually]
 AT-2 (c) [at least annually]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,151,'AT-2(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,152,'AT-2(3)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,156,'AT-3 (a)(1) [at least annually]
 AT-3 (b) [at least annually]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,162,'AT-4 (b) [five(5) years or 5 years after completion of a specific training program]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,165,'AU-1 (c)(1) [at least annually]
 AU-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,166,'AU-2 (a) [successful and unsuccessful account logon events, account management events, object access, policy change, privilege functions, process tracking, and system events. For Web applications: all administrator activity, authentication checks, authorization checks, data deletions, data access, data changes, and permission changes]
 AU-2 (c) [organization-defined subset of the auditable events defined in AU-2a to be audited continually for each identified event].
 AU-2 (e) [annually and whenever there is a change in the threat environment]','AU-2 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO.
 AU-2 (e) Guidance: Annually or whenever changes in the threat environment are communicated to the service provider by the JAB/AO.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,171,'AU-3',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,172,'AU-3(1) [session, connection, transaction, or activity duration; for client-server transactions, the number of bytes received and bytes sent; additional informational messages to diagnose or identify the event; characteristics that describe or identify the object or resource being acted upon; individual identities of group account users; full-text of privileged commands]','AU-3(1) Guidance: For client-server transactions, the number of bytes sent and received gives bidirectional transfer information that can be helpful during an investigation or inquiry.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,175,'AU-4',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,177,'AU-5 (b) [overwrite oldest record]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,178,'AU-5(1)-3 [75%, or one month before expected negative impact]
CSP/CSO may use FedRAMP value.',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,179,'AU-5(2)-1 [real-time] 
 AU-5(2)-2 [service provider personnel with authority to address failed audit events] 
 AU-5(2)-3 [audit failure events requiring real-time alerts, as defined by organization audit policy].',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,183,'AU-6 (a)-1 [at least weekly]','AU-6 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO. In multi-tenant environments, capability and means for providing review, analysis, and reporting to consumer for data pertaining to consumer shall be documented.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,184,'AU-6(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,186,'AU-6(3)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,187,'AU-6(4)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,188,'AU-6(5) [Selection (one or more): vulnerability scanning information; performance data; information system monitoring information; penetration test data; [Organization -defined data/information collected from other sources]]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,189,'AU-6(6)','AU-6(6) Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,190,'AU-6(7) [information system process; role; user]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,194,'AU-7',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,195,'AU-7(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,197,'AU-8 (b) [one second granularity of time measurement]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,200,'AU-9',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,202,'AU-9(2) [at least weekly]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,203,'AU-9(3)','AU-9(3) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,204,'AU-9(4)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,208,'AU-10 [minimum actions including the addition, modification, deletion, approval, sending, or receiving of data]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,214,'AU-11 [a time period in compliance with M-21-31]','AU-11 Requirement: The service provider retains audit records on-line for at least ninety days and further preserves audit records off-line for a period that is in accordance with NARA requirements. 
 AU-11 Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf)
 AU-11 Guidance: The service provider is encouraged to align with M-21-31 where possible','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,216,'AU-12 (a) [all information system and network components where audit capability is deployed/available]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,217,'AU-12(1)-1 [all network, data storage, and computing devices]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,219,'AU-12(3)-1 [service provider-defined individuals or roles with audit configuration responsibilities] 
 AU-12(3)-2 [all network, data storage, and computing devices]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,234,'CA-1 (c)(1) [at least annually]
 CA-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,235,'CA-2 (d) [at least annually] 
 CA-2 (f) [individuals or roles to include FedRAMP PMO]','CA-2 Guidance: Reference FedRAMP Annual Assessment Guidance.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,236,NULL,'CA-2(1) Requirement: For JAB Authorization, must use an accredited 3PAO.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,237,'CA-2(2) [at least annually]','CA-2(2) Requirement: To include ''announced'', ''vulnerability scanning''','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,238,'CA-2(3)-1 [any FedRAMP Accredited 3PAO]
 CA-2(3)-3 [the conditions of the JAB/AO in the FedRAMP Repository]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,239,'CA-3 (c) [at least annually and on input from JAB/AO]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,245,'CA-3(6)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,248,'CA-5 (b) [at least monthly]','CA-5 Requirement: POA&Ms must be provided at least monthly.
 CA-5 Guidance: Reference FedRAMP-POAM-Template','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,250,'CA-6 (e) [in accordance with OMB A-130 requirements or when a significant change occurs]','CA-6 (e) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F and according to FedRAMP Significant Change Policies and Procedures. The service provider describes the types of changes to the information system or the environment of operations that would impact the risk posture. The types of changes are approved and accepted by the JAB/AO.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,489,'IR-7',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,490,'IR-7(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (5,805,NULL,NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (6,253,'CA-7 (g)-1 [to include JAB/AO]','CA-7 Requirement: Operating System, Database, Web Application, Container, and Service Configuration Scans: at least monthly. All scans performed by Independent Assessor: at least annually.
 CA-7 Requirement: CSOs with more than one agency ATO must implement a collaborative Continuous Monitoring (ConMon) approach described in the FedRAMP Guide for Multi-Agency Continuous Monitoring. This requirement applies to CSOs authorized via the Agency path as each agency customer is responsible for performing ConMon oversight. It does not apply to CSOs authorized via the JAB path because the JAB performs ConMon oversight.
 CA-7 Guidance: FedRAMP does not provide a template for the Continuous Monitoring Plan. CSPs should reference the FedRAMP Continuous Monitoring Strategy Guide when developing the Continuous Monitoring Plan.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,254,'CA-7(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,257,'CA-7(4)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,260,'CA-8-1 [at least annually]','CA-8 Guidance: Reference the FedRAMP Penetration Test Guidance.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,261,'CA-8(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,262,'CA-8(2)','CA-8(2) Guidance: See the FedRAMP Documents page> Penetration Test Guidance 
 https://www.FedRAMP.gov/documents/','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,264,'CA-9 (d) [at least annually]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,266,'CM-1 (c)(1) [at least annually]
 CM-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,267,'CM-2 (b)(1) [at least annually and when a significant change occurs]
 CM-2 (b)(2) [to include when directed by the JAB]','CM-2 (b)(1) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,269,'CM-2(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,270,'CM-2(3) [organization-defined number of previous versions of baseline configurations of the previously approved baseline configuration of IS components]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,274,'CM-2(7)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,275,'CM-3','CM-3 Requirement: The service provider establishes a central means of communicating major changes to or developments in the information system or environment of operations that may affect its services to the federal government and associated service consumers (e.g., electronic bulletin board, web status page). The means of communication are approved and accepted by the JAB/AO.
 CM-3 (e) Guidance: In accordance with record retention policies and procedures.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,276,'CM-3(1) (c) [organization agreed upon time period] 
 CM-3(1) (f) [organization defined configuration management approval authorities]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,277,'CM-3(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,279,'CM-3(4)-2 [Configuration control board (CCB) or similar (as defined in CM-3)]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,281,'CM-3(6) All security safeguards that rely on cryptography',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,284,'CM-4',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,285,'CM-4(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,286,'CM-4(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,287,'CM-5',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,288,'CM-5(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,292,'CM-5(5) (b) [at least quarterly]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,295,'CM-6','CM-6 (a) Requirement 1: The service provider shall use the DoD STIGs to establish configuration settings; Center for Internet Security up to Level 2 (CIS Level 2) guidelines shall be used if STIGs are not available; Custom baselines shall be used if CIS is not available.
 CM-6 (a) Requirement 2: The service provider shall ensure that checklists for configuration settings are Security Content Automation Protocol (SCAP) validated or SCAP compatible (if validated checklists are not available).
 
 CM-6 Guidance: Compliance checks are used to evaluate configuration settings and provide general insight into the overall effectiveness of configuration management activities. CSPs and 3PAOs typically combine compliance check findings into a single CM-6 finding, which is acceptable. However, for initial assessments, annual assessments, and significant change requests, FedRAMP requires a clear understanding, on a per-control basis, where risks exist. Therefore, 3PAOs must also analyze compliance check findings as part of the controls assessment. Where a direct mapping exists, the 3PAO must document additional findings per control in the corresponding SAR Risk Exposure Table (RET), which are then documented in the CSP’s Plan of Action and Milestones (POA&M). This will likely result in the details of individual control findings overlapping with those in the combined CM-6 finding, which is acceptable.
 During monthly continuous monitoring, new findings from CSP compliance checks may be combined into a single CM-6 POA&M item. CSPs are not required to map the findings to specific controls because controls are only assessed during initial assessments, annual assessments, and significant change requests.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,296,'CM-6(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,297,'CM-6(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,300,'CM-7','CM-7 (b) Requirement: The service provider shall use Security guidelines (See CM-6) to establish list of prohibited or restricted functions, ports, protocols, and/or services or establishes its own list of prohibited or restricted functions, ports, protocols, and/or services if STIGs or CIS is not available.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,301,'CM-7(1) (a) [at least annually]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,302,'CM-7(2)','CM-7(2) Guidance: This control refers to software deployment by CSP personnel into the production environment. The control requires a policy that states conditions for deploying software. This control shall be implemented in a technical manner on the information system to only allow programs to run that adhere to the policy (i.e. allow-listing). This control is not to be based off of strictly written policy on what is allowed or not allowed to run.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,305,'CM-7(5) (c) [at least quarterly or when there is a change]
DSPAV must be used.',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,310,'CM-8 (b) [at least monthly]','CM-8 Requirement: must be provided at least monthly or when there is a change.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,311,'CM-8(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,312,'CM-8(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,313,'CM-8(3) (a)-1 [automated mechanisms with a maximum five-minute delay in detection.] 
 CM-8(3) (a)-2 [continuously]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,314,'CM-8(4) [position and role]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,320,'CM-9','CM-9 Guidance: FedRAMP does not provide a template for the Configuration Management Plan. However, NIST SP 800-128, Guide for Security-Focused Configuration Management of Information Systems, provides guidelines for the implementation of CM controls as well as a sample CMP outline in Appendix D of the Guide','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,322,'CM-10',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,324,'CM-11 (c) [Continuously (via CM-7(5))]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,328,'CM-12','CM-12 Requirement: According to FedRAMP Authorization Boundary Guidance','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,329,'CM-12(1)-1: [Federal data and system data that must be protected at the High or Moderate impact levels]','CM-12(1) Requirement: According to FedRAMP Authorization Boundary Guidance.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,331,'CM-14','CM-14 Guidance: If digital signatures/certificates are unavailable, alternative cryptographic integrity checks (hashes, self-signed certs, etc.) can be utilized.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,332,'CP-1 (c)(1) [at least annually]
 CP-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,333,'CP-2 (d) [at least annually]','CP-2 Requirement: For JAB authorizations the contingency lists include designated FedRAMP personnel.
 
 CP-2 Requirement: CSPs must use the FedRAMP Information System Contingency Plan (ISCP) Template (available on the fedramp.gov: https://www.fedramp.gov/assets/resources/templates/SSP-A06-FedRAMP-ISCP-Template.docx).','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,334,'CP-2(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,335,'CP-2(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,336,'CP-2(3)-1 [all]
 CP-2(3)-2 [time period defined in service provider and organization SLA]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,338,'CP-2(5) [essential]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,341,'CP-2(8)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,342,'CP-3 (a)(1) [*See Additional Requirements]
 CP-3 (a)(3) [at least annually]
 CP-3 (b) [at least annually]','CP-3 (a) Requirement: Privileged admins and engineers must take the basic contingency training within 10 days. Consideration must be given for those privileged admins and engineers with critical contingency-related roles, to gain enough system context and situational awareness to understand the full impact of contingency training as it applies to their respective level. Newly hired critical contingency personnel must take this more in-depth training within 60 days of hire date when the training will have more impact.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,343,'CP-3(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,345,'CP-4 (a)-1 [at least annually] 
 CP-4 (a)-2 [functional exercises]','CP-4 (a) Requirement: The service provider develops test plans in accordance with NIST Special Publication 800-34 (as amended); plans are approved by the JAB/AO prior to initiating testing.
 
 CP-4 (b) Requirement: The service provider must include the Contingency Plan test results with the security package within the Contingency Plan-designated appendix (Appendix G, Contingency Plan Test Report).','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,346,'CP-4(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,347,'CP-4(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,352,'CP-6',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,353,'CP-6(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,354,'CP-6(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,355,'CP-6(3)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,356,'CP-7','CP-7 (a) Requirement: The service provider defines a time period consistent with the recovery time objectives and business impact analysis.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,357,'CP-7(1)','CP-7(1) Guidance: The service provider may determine what is considered a sufficient degree of separation between the primary and alternate processing sites, based on the types of threats that are of concern. For one particular type of threat (i.e., hostile cyber attack), the degree of separation between sites will be less relevant.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,358,'CP-7(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,359,'CP-7(3)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,360,'CP-7(4)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,363,'CP-8','CP-8 Requirement: The service provider defines a time period consistent with the recovery time objectives and business impact analysis.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,364,'CP-8(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,365,'CP-8(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,366,'CP-8(3)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,367,'CP-8(4) (c) [annually]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,369,'CP-9 (a)-2 [daily incremental; weekly full]
 CP-9 (b) [daily incremental; weekly full]
 CP-9 (c) [daily incremental; weekly full]','CP-9 Requirement: The service provider shall determine what elements of the cloud environment require the Information System Backup control. The service provider shall determine how Information System Backup is going to be verified and appropriate periodicity of the check.
 CP-9 (a) Requirement: The service provider maintains at least three backup copies of user-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (b) Requirement: The service provider maintains at least three backup copies of system-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (c) Requirement: The service provider maintains at least three backup copies of information system documentation including security information (at least one of which is available online) or provides an equivalent alternative.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,370,'CP-9(1) [at least monthly]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,371,'CP-9(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,372,'CP-9(3)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,374,'CP-9(5) [time period and transfer rate consistent with the recovery time and recovery point objectives defined in the service provider and organization SLA].',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,377,'CP-9(8) [all backup files]','CP-9(8) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,378,'CP-10',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,380,'CP-10(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,382,'CP-10(4) [time period consistent with the restoration time-periods defined in the service provider and organization SLA]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,388,'IA-1 (c)(1) [at least annually]
 IA-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,389,'IA-2','IA-2 Requirement: For all control enhancements that specify multifactor authentication, the implementation must adhere to the Digital Identity Guidelines specified in NIST Special Publication 800-63B.
 
 IA-2 Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2 Requirement: All uses of encrypted virtual private networks must meet all applicable Federal requirements and architecture, dataflow, and security and privacy controls must be documented, assessed, and authorized to operate.
 
 IA-2 Guidance: “Phishing-resistant" authentication refers to authentication processes designed to detect and prevent disclosure of authentication secrets and outputs to a website or application masquerading as a legitimate system.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,390,'IA-2(1)','IA-2(1) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(1) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(1) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (10,1233,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (7,116,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (10,1278,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (6,391,'IA-2(2)','IA-2(2) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(2) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(2) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,394,'IA-2(5)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,395,'IA-2(6)-1 [local, network and remote]
 IA-2(6)-2 [privileged accounts; non-privileged accounts]
 IA-2(6) (b) [FIPS-validated or NSA-approved cryptography]','IA-2(6) Guidance: PIV=separate device. Please refer to NIST SP 800-157 Guidelines for Derived Personal Identity Verification (PIV) Credentials.
 
 IA-2(6) Guidance: See SC-13 Guidance for more information on FIPS-validated or NSA-approved cryptography.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,397,NULL,NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,401,'IA-2(12)','IA-2(12) Guidance: Include Common Access Card (CAC), i.e., the DoD technical implementation of PIV/FIPS 201/HSPD-12.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,403,'IA-3',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,408,'IA-4 (a) [at a minimum, the ISSO (or similar role within the organization)] 
 IA-4 (d) [at least two(2) years]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,412,'IA-4(4) [contractors; foreign nationals]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,418,'IA-5','IA-5 Requirement: Authenticators must be compliant with NIST SP 800-63-3 Digital Identity Guidelines IAL, AAL, FAL level 3. Link https://pages.nist.gov/800-63-3
 
 IA-5 Guidance: SP 800-63C Section 6.2.3 Encrypted Assertion requires that authentication assertions be encrypted when passed through third parties, such as a browser. For example, a SAML assertion can be encrypted using XML-Encryption, or an OpenID Connect ID Token can be encrypted using JSON Web Encryption (JWE).','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,419,'IA-5(1)
DSPAV must be used.','IA-5(1) Requirement: Password policies must be compliant with NIST SP 800-63B for all memorized, lookup, out-of-band, or One-Time-Passwords (OTP). Password policies shall not enforce special character or minimum password rotation requirements for memorized secrets of users.
 
 IA-5(1) (h) Requirement: For cases where technology doesn’t allow multi-factor authentication, these rules should be enforced: must have a minimum length of 14 characters and must support all printable ASCII characters.
  
 For emergency use accounts, these rules should be enforced: must have a minimum length of 14 characters, must support all printable ASCII characters, and passwords must be changed if used. 
 
 IA-5(1) Guidance: Note that (c) and (d) require the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,420,'IA-5(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,424,'IA-5(6)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,425,'IA-5(7)','IA-5(7) Guidance: In this context, prohibited static storage refers to any storage where unencrypted authenticators, such as passwords, persist beyond the time required to complete the access process.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,426,'IA-5(8) [different authenticators in different user authentication domains]','IA-5(8) Guidance: If a single user authentication domain is used to access multiple systems, such as in single-sign-on, then only a single authenticator is required.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,431,'IA-5(13)','IA-5(13) Guidance: For components subject to configuration baseline(s) (such as STIG or CIS,) the time period should conform to the baseline standard.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,437,'IA-6',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,438,'IA-7',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,439,'IA-8',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,440,'IA-8(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,441,'IA-8(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,443,'IA-8(4)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,450,'IA-11','IA-11 Guidance:
 The fixed time period cannot exceed the limits set in SP 800-63. At this writing they are:
 - AAL3 (high baseline)
  -- 12 hours or
  -- 15 minutes of inactivity','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,451,'IA-12','IA-12 Additional FedRAMP Requirements and Guidance:
 Guidance: In accordance with NIST SP 800-63A Enrollment and Identity Proofing','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,453,'IA-12(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,454,'IA-12(3)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,455,'IA-12(4)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,456,'IA-12(5)','IA-12(5) Additional FedRAMP Requirements and Guidance:
 Guidance: In accordance with NIST SP 800-63A Enrollment and Identity Proofing','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,458,'IR-1 (c)(1) [at least annually]
 IR-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,459,'IR-2 (a)(1) [ten(10) days for privileged users, thirty(30) days for Incident Response roles]
 IR-2 (a)(3) [at least annually]
 IR-2 (b) [at least annually]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,460,'IR-2(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,461,'IR-2(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,463,'IR-3-1 [at least every six(6) months, including functional at least annually]','IR-3-2 Requirement: The service provider defines tests and/or exercises in accordance with NIST Special Publication 800-61 (as amended). Functional testing must occur prior to testing for initial authorization. Annual functional testing may be concurrent with required penetration tests (see CA-8). The service provider provides test plans to the JAB/AO annually. Test plans are approved and accepted by the JAB/AO prior to test commencing.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,465,'IR-3(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,467,'IR-4','IR-4 Requirement: The FISMA definition of "incident" shall be used: "An occurrence that actually or imminently jeopardizes, without lawful authority, the confidentiality, integrity, or availability of information or an information system; or constitutes a violation or imminent threat of violation of law, security policies, security procedures, or acceptable use policies."
 
 IR-4 Requirement: The service provider ensures that individuals conducting incident handling meet personnel security requirements commensurate with the criticality/sensitivity of the information being processed, stored, and transmitted by the information system.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,468,'IR-4(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,469,'IR-4(2)-1 [all network, data storage, and computing devices]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,471,'IR-4(4)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,473,'IR-4(6)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,478,NULL,NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,483,'IR-5',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,484,'IR-5(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,485,'IR-6 (a) [US-CERT incident reporting timelines as specified in NIST Special Publication 800-61 (as amended)]','IR-6 Requirement: Reports security incident information according to FedRAMP Incident Communications Procedure.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (7,119,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,120,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,121,'AC-18',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (6,492,'IR-8 (a)(9)-2 [at least annually]
 IR-8 (b) [see additional FedRAMP Requirements and Guidance]
 IR-8 (d) [see additional FedRAMP Requirements and Guidance]','IR-8 (b) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.
 IR-8 (d) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,494,'IR-9',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,496,'IR-9(2) [at least annually]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,497,'IR-9(3)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,498,'IR-9(4)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,500,'MA-1 (c)(1) [at least annually]
 MA-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,501,'MA-2',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,504,'MA-3 (b) [at least annually]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,505,'MA-3(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,506,'MA-3(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,507,'MA-3(3) (d) [the information owner]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,511,'MA-4',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,514,'MA-4(3)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,519,'MA-5',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,520,'MA-5(1)
DSPAV must be used.','MA-5(1) Requirement: Only MA-5(1) (a)(1) is required by FedRAMP Moderate Baseline','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,524,NULL,NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,525,'MA-6-2 [a timeframe to support advertised uptime and availability]
CSP/CSO may use FedRAMP value.',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,530,'MP-1 (c)(1) [at least annually]
 MP-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,531,'MP-2-1 [all types of digital and/or non-digital media containing sensitive information]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,534,'MP-3 (b)-1 [no removable media types]
 MP-3 (b)-2 [organization-defined security safeguards not applicable]','MP-3 (b) Guidance: Second parameter not-applicable','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,535,'MP-4 (a)-1 [all types of digital and non-digital media with sensitive information] 
 MP-4 (a)-2 [see additional FedRAMP requirements and guidance]','MP-4 (a) Requirement: The service provider defines controlled areas within facilities where the information and information system reside.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,538,'MP-5 (a) [all media with sensitive information] [prior to leaving secure/controlled environment: for digital media, encryption in compliance with Federal requirements and utilizes FIPS validated or NSA approved cryptography (see SC-13.); for non-digital media, secured in locked container]','MP-5 (a) Requirement: The service provider defines security measures to protect digital and non-digital media in transport. The security measures are approved and accepted by the JAB/AO.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,543,'MP-6 (a)-2 [techniques and procedures IAW NIST SP 800-88 Section 4: Reuse and Disposal of Storage Media and Hardware]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,544,'MP-6(1)','MP-6(1) Requirement: Must comply with NIST SP 800-88','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,545,'MP-6(2) [at least every six(6) months]','MP-6(2) Guidance: Equipment and procedures may be tested or validated for effectiveness','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,546,'MP-6(3)','MP-6(3) Requirement: Must comply with NIST SP 800-88','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,552,'MP-7',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,560,'PE-1 (c)(1) [at least annually]
 PE-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,561,'PE-2 (c) [at least every ninety(90) days]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,565,'PE-3 (a)(2) [CSP defined physical access control systems/devices AND guards]
 PE-3 (d) [in all circumstances within restricted access area where the information system resides]
 PE-3 (f)-2 [at least annually]
 PE-3 (g) [at least annually or earlier as required by a security relevant event.]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,566,'PE-3(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,574,'PE-4',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,575,'PE-5',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,579,'PE-6 (b)-1 [at least monthly]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,580,'PE-6(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,583,'PE-6(4)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,585,'PE-8 (a) [for a minimum of one(1) year]
 PE-8 (b) [at least monthly]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (7,122,'AC-18(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (6,586,'PE-8(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,589,'PE-9',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,592,'PE-10 (b) [near more than one egress point of the IT area and ensures it is labeled and protected by a cover to prevent accidental shut-off]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,594,'PE-11',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,595,'PE-11(1) [automatically]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,597,'PE-12',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,599,'PE-13',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,600,'PE-13(1) -1 [service provider building maintenance/physical security personnel]
 PE-13(1) -2 [service provider emergency responders with incident response responsibilities]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,601,'PE-13(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,604,'PE-14 (a) [consistent with American Society of Heating, Refrigerating and Air-conditioning Engineers (ASHRAE) document entitled Thermal Guidelines for Data Processing Environments]
 
 PE-14 (b) [continuously]','PE-14 (a) Requirement: The service provider measures temperature at server inlets and humidity levels by dew point.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,606,'PE-14(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,607,'PE-15
DSPAV must be used.',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,608,'PE-15(1)-1 [service provider building maintenance/physical security personnel]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,609,'PE-16 (a) [all information system components]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,610,'PE-17',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,611,'PE-18 [physical and environmental hazards identified during threat assessment]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,619,'PL-1 (c)(1) [at least annually]
 PL-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,620,'PL-2 (a)(14) [to include chief privacy and ISSO and/or similar role or designees]
 PL-2 (b) [to include chief privacy and ISSO and/or similar role]
 PL-2 (c) [at least annually]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (10,1265,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1260,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (6,625,'PL-4 (c) [at least annually]
 PL-4 (d) [at least annually and when the rules are revised or changed]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,626,'PL-4(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (7,132,'AC-19(5)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (6,630,'PL-8 (b) [at least annually and when a significant change occurs]','PL-8 (b) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,634,'PL-10','PL-10 Requirement: Select the appropriate FedRAMP Baseline','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,635,'PL-11',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,673,'PS-1 (c)(1) [at least annually]
 PS-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,674,'PS-2 (c) [at least annually]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,675,'PS-3 (b) [for national security clearances; a reinvestigation is required during the fifth(5th) year for top secret security clearance, the tenth(10th) year for secret security clearance, and fifteenth(15th) year for confidential security clearance.
 
 For moderate risk law enforcement and high impact public trust level, a reinvestigation is required during the fifth(5th) year. There is no reinvestigation for other moderate risk positions or any low risk positions]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,679,'All information systems.
 Users: U.S. citizens, U.S. nationals, or U.S. persons, foreign personnel as allowed by current DOD polices with AO approval.
 Administrators: U.S. citizens, U.S. nationals, or U.S. persons.',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,680,'PS-4 (a) [one(1) hour]
CSP/CSO may use FedRAMP value.',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,682,'PS-4(2)-2 Notify [access control personnel responsible for disabling access to the system]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,683,'PS-5 (b)-2 [twenty-four(24) hours] 
 PS-5 (d)-1 [including access control personnel responsible for the system]
 PS-5 (d)-2 [twenty-four(24) hours]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,684,'PS-6 (b) [at least annually]
 PS-6 (c)(2) [at least annually and any time there is a change to the user''s level of access]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,688,'PS-7 (d)-1 [including access control personnel responsible for the system and/or facilities, as appropriate]
 PS-7 (d)-2 [terminations: immediately; transfers: within twenty-four(24) hours]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,689,'PS-8 (b)-1 [to include the ISSO and/or similar role within the organization]
 PS-8 (b)-2 [24 hours]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,690,'PS-9',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,712,'RA-1 (c)(1) [at least annually]
 RA-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,713,'RA-2',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,715,'RA-3 (c) [security assessment report]
  
 RA-3 (d) [at least annually and whenever a significant change occurs]
  
 RA-3 (f) [annually]','RA-3 Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.
 RA-3 (e) Requirement: Include all Authorizing Officials; for JAB authorizations to include FedRAMP.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,716,'RA-3(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,721,'RA-5 (a) [monthly operating system/infrastructure; monthly web applications (including APIs) and databases]
 RA-5 (d) [high-risk vulnerabilities mitigated within thirty(30) days from date of discovery; moderate-risk vulnerabilities mitigated within ninety(90) days from date of discovery; low risk vulnerabilities mitigated within one hundred and eighty(180) days from date of discovery]','RA-5 Guidance: See the FedRAMP Documents page> Vulnerability Scanning Requirements 
 https://www.FedRAMP.gov/documents/
 RA-5 (a) Requirement: an accredited independent assessor scans operating systems/infrastructure, web applications, and databases once annually.
 RA-5 (d) Requirement: If a vulnerability is listed among the CISA Known Exploited Vulnerability (KEV) Catalog (https://www.cisa.gov/known-exploited-vulnerabilities-catalog) the KEV remediation date supersedes the FedRAMP parameter requirement.
 RA-5 (e) Requirement: to include all Authorizing Officials; for JAB authorizations to include FedRAMP
 
 RA-5 Guidance: Informational findings from a scanner are detailed as a returned result that holds no vulnerability risk or severity and for FedRAMP does not require an entry onto the POA&M or entry onto the RET during any assessment phase.
 Warning findings, on the other hand, are given a risk rating (low, moderate, high or critical) by the scanning solution and should be treated like any other finding with a risk or severity rating for tracking purposes onto either the POA&M or RET depending on when the findings originated (during assessments or during monthly continuous monitoring). If a warning is received during scanning, but further validation turns up no actual issue then this item should be categorized as a false positive. If this situation presents itself during an assessment phase (initial assessment, annual assessment or any SCR), follow guidance on how to report false positives in the Security Assessment Report (SAR). If this situation happens during monthly continuous monitoring, a deviation request will need to be submitted per the FedRAMP Vulnerability Deviation Request Form.
 Warnings are commonly associated with scanning solutions that also perform compliance scans, and if the scanner reports a “warning” as part of the compliance scanning of a CSO, follow guidance surrounding the tracking of compliance findings during either the assessment phases (initial assessment, annual assessment or any SCR) or monthly continuous monitoring as it applies. Guidance on compliance scan findings can be found by searching on “Tracking of Compliance Scans” in FAQs.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,723,'RA-5(2) [within 24 hours prior to
 running scans]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,724,'RA-5(3)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,725,'RA-5(4) [notify appropriate service provider personnel and follow procedures for organization and service provider-defined corrective actions]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,726,'RA-5(5)-1 [all components that support authentication] 
 RA-5(5)-2 [all scans]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,729,'RA-5(8)','RA-5(8) Requirement: This enhancement is required for all high (or critical) vulnerability scan findings.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,732,'RA-5(11)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,734,'RA-7',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,736,'RA-9',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,738,'SA-1 (c)(1) [at least annually]
 SA-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,739,'SA-2',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,740,'SA-3',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,744,'SA-4','SA-4 Requirement: The service provider must comply with Federal Acquisition Regulation (FAR) Subpart 7.103, and Section 889 of the John S. McCain National Defense Authorization Act (NDAA) for Fiscal Year 2019 (Pub. L. 115-232), and FAR Subpart 4.21, which implements Section 889 (as well as any added updates related to FISMA to address security concerns in the system acquisitions process).
 
 SA-4 Guidance: The use of Common Criteria (ISO/IEC 15408) evaluated products is strongly preferred.
 See https://www.niap-ccevs.org/Product/index.cfm or https://www.commoncriteriaportal.org/products/.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,745,'SA-4(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,746,'SA-4(2)-1 [at a minimum to include security-relevant external system interfaces; high-level design; low-level design; source code or network and data flow diagram; [organization-defined design/implementation information]]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (10,1300,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1269,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1213,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1259,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1215,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,124,'AC-18(3)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,125,'AC-18(4)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,126,'AC-18(5)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,127,'AC-19',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,234,'CA-1 (c)(1) [at least annually]
 CA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (5,806,NULL,NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,807,NULL,NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (6,749,'SA-4(5) (a) The service provider shall use the DoD STIGs to establish configuration settings; Center for Internet Security up to Level 2 (CIS Level 2) guidelines shall be used if STIGs are not available; Custom baselines shall be used if CIS is not available.
DSPAV must be used.',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,753,'SA-4(9)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,754,'SA-4 (10)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,757,'SA-5 (d) [at a minimum, the ISSO (or similar role within the organization)]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,765,'SA-8',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,799,'SA-9 (a) [Appropriate FedRAMP Security Controls Baseline (s) if Federal information is processed or stored within the external system]
 SA-9 (c) [Federal/FedRAMP Continuous Monitoring requirements must be met for external systems where Federal information is processed or stored]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,800,'SA-9(1)
DSPAV must be used.',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,801,'SA-9(2) [all external systems where Federal information is processed or stored]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,802,'DSPAV must be used.',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,804,'SA-9(5)-1 [information processing, information or data, AND system services]
 SA-9(5)-2 [U.S./U.S. Territories or geographic locations where there is U.S. jurisdiction]
 SA-9(5)-3 [all High impact data, systems, or services]
SA-9 (5)-1 [information processing, information or data, AND system services].
 SA-9 (5)-2 [U.S./U.S. Territories or geographic locations where there is U.S. jurisdiction].
 SA-9 (5)-3 [all data, systems, or services].',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,805,NULL,NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,806,NULL,NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,807,NULL,NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,808,'SA-10 (a) [development, implementation, AND operation]','SA-10 (e) Requirement: track security flaws and flaw resolution within the system, component, or service and report findings to organization-defined personnel, to include FedRAMP.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,816,'SA-11',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,817,'SA-11(1)','SA-11(1) Requirement: The service provider must document its methodology for reviewing newly developed code for the Service in its Continuous Monitoring Plan.
 
 If Static code analysis cannot be performed (for example, when the source code is not available), then dynamic code analysis must be performed (see SA-11(8))','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,818,'SA-11(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,845,'SA-15 (b)-1 [frequency as before first use and annually thereafter]
 SA-15 (b)-2 [FedRAMP Security Authorization requirements]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,848,'SA-15(3)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,858,'SA-16',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,859,'SA-17',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,878,'SA-21',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,880,'SA-22',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,883,'SC-1 (c)(1) [at least annually]
 SC-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,884,'SC-2',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,887,'SC-3',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,893,'SC-4',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,896,'SC-5 (a)-1 [Protect against] 
 SC-5 (a)-2 [at a minimum: ICMP (ping) flood, SYN flood, slowloris, buffer overflow attack, and volume attack]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,901,'SC-7','SC-7 (b) Guidance: SC-7 (b) should be met by subnet isolation. A subnetwork (subnet) is a physically or logically segmented section of a larger network defined at TCP/IP Layer 3, to both minimize traffic and, important for a FedRAMP Authorization, add a crucial layer of network isolation. Subnets are distinct from VLANs (Layer 2), security groups, and VPCs and are specifically required to satisfy SC-7 part b and other controls. See the FedRAMP Subnets White Paper (https://www.fedramp.gov/assets/resources/documents/FedRAMP_subnets_white_paper.pdf) for additional information.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,904,'SC-7(3)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,905,'SC-7(4) (e) [at least every ninety(90) days or whenever there is a change in the threat environment that warrants a review of the exceptions]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,906,'SC-7(5) [any systems]','SC-7(5) Guidance: For JAB Authorization, CSPs shall include details of this control in their Architecture Briefing','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,908,'SC-7(7)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,909,'SC-7(8)-2 [any network outside of organizational control and any network outside the authorization boundary]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,911,NULL,NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,913,'SC-7(12)-1 [Host Intrusion Prevention System (HIPS), Host Intrusion Detection System (HIDS), or minimally a host-based firewall]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,919,'SC-7(18)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,921,'SC-7 (20)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,922,'SC-7 (21)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,931,'SC-8 [confidentiality AND integrity]','SC-8 Guidance:
 For each instance of data in transit, confidentiality AND integrity should be through cryptography as specified in SC-8(1), physical means as specified in SC-8(5), or in combination.
 
 For clarity, this control applies to all data in transit. Examples include the following data flows:
  - Crossing the system boundary
  - Between compute instances - including containers
  - From a compute instance to storage
  - Replication between availability zones
  - Transmission of backups to storage
  - From a load balancer to a compute instance
  - Flows from management tools required for their work – e.g. log collection, scanning, etc.
 
 The following applies only when choosing SC-8(5) in lieu of SC-8(1).
 FedRAMP-Defined Assignment / Selection Parameters 
 SC-8(5)-1 [a hardened or alarmed carrier Protective Distribution System (PDS) when outside of Controlled Access Area (CAA)]
 SC-8(5)-2 [prevent unauthorized disclosure of information AND detect changes to information] 
 
 SC-8 Guidance:
 SC-8(5) applies when physical protection has been selected as the method to protect confidentiality and integrity. For physical protection, data in transit must be in either a Controlled Access Area (CAA), or a Hardened or alarmed PDS.
 
 Hardened or alarmed PDS: Shall be as defined in SECTION X - CATEGORY 2 PDS INSTALLATION GUIDANCE of CNSSI No.7003, titled PROTECTED DISTRIBUTION SYSTEMS (PDS). Per the CNSSI No. 7003 Section VIII, PDS must originate and terminate in a Controlled Access Area (CAA). 
 
 Controlled Access Area (CAA): Data will be considered physically protected, and in a CAA if it meets Section 2.3 of the DHS’s Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies. CSPs can meet Section 2.3 of the DHS’ recommended practice by satisfactory implementation of the following controls PE-2(1), PE-2(2), PE-2(3), PE-3(2), PE-3(3), PE-6(2), and PE-6(3).
 
 Note: When selecting SC-8(5), the above SC-8(5), and the above referenced PE controls must be added to the SSP.
 
 CNSSI No.7003 can be accessed here:
 https://www.dcsa.mil/Portals/91/documents/ctp/nao/CNSSI_7003_PDS_September_2015.pdf 
 
 DHS Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies can be accessed here:
 https://us-cert.cisa.gov/sites/default/files/FactSheets/NCCIC%20ICS_FactSheet_Defense_in_Depth_Strategies_S508C.pdf','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1185,'SR-11','SR-11 Requirement: CSOs must ensure that their supply chain vendors provide authenticity of software and patches and the vendor must have a plan to protect the development pipeline.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1186,'SR-11(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1187,'SR-11(2) [all]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,1189,'SR-12',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (10,1282,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1291,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1266,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1218,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (6,932,'SC-8(1) [prevent unauthorized disclosure of information AND detect changes to information]','SC-8(1) Requirement: Please ensure SSP Section 10.3 Cryptographic Modules Implemented for Data At Rest (DAR) and Data In Transit (DIT) is fully populated for reference in this control.
 
 SC-8(1) Guidance:
 See M-22-9, including "Agencies encrypt all DNS requests and HTTP traffic within their environment"
 
 SC-8(1) applies when encryption has been selected as the method to protect confidentiality and integrity. Otherwise refer to SC-8(5). SC-8(1) is strongly encouraged.
 
 SC-8(1) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)
 
 SC-8(1) Guidance: When leveraging encryption from the underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,938,'SC-10 [no longer than ten(10) minutes for privileged sessions and no longer than fifteen(15) minutes for user sessions]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,941,'SC-12 [In accordance with Federal requirements]','SC-12 Guidance: See references in NIST 800-53 documentation.
 
 SC-12 Guidance: Must meet applicable Federal Cryptographic Requirements. See References Section of control.
 
 SC-12 Guidance: Wildcard certificates may be used internally within the system, but are not permitted for external customer access to the system.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,942,'SC-12(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,947,NULL,NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,948,'SC-13 (b) [FIPS-validated or NSA-approved cryptography]','SC-13 Guidance:
 This control applies to all use of cryptography. In addition to encryption, this includes functions such as hashing, random number generation, and key generation. Examples include the following:
  - Encryption of data
  - Decryption of data
  - Generation of one time passwords (OTPs) for MFA
  - Protocols such as TLS, SSH, and HTTPS
 
 The requirement for FIPS 140 validation, as well as timelines for acceptance of FIPS 140-2, and 140-3 can be found at the NIST Cryptographic Module Validation Program (CMVP).
 https://csrc.nist.gov/projects/cryptographic-module-validation-program 
 
 SC-13 Guidance: For NSA-approved cryptography, the National Information Assurance Partnership (NIAP) oversees a national program to evaluate Commercial IT Products for Use in National Security Systems. The NIAP Product Compliant List can be found at the following location:
 https://www.niap-ccevs.org/Product/index.cfm 
 
 SC-13 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-13 Guidance:
 Moving to non-FIPS CM or product is acceptable when:
 - FIPS validated version has a known vulnerability
 - Feature with vulnerability is in use
 - Non-FIPS version fixes the vulnerability
 - Non-FIPS version is submitted to NIST for FIPS validation
 - POA&M is added to track approval, and deployment when ready
 
 SC-13 Guidance: At a minimum, this control applies to cryptography in use for the following controls: AU-9(3), CP-9(8), IA-2(6), IA-5(1), MP-5, SC-8(1), and SC-28(1).','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,954,'SC-15 (a) [no exceptions for computing devices]','SC-15 Requirement: The information system provides disablement (instead of physical disconnect) of collaborative computing devices in a manner that supports ease of use.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,963,'SC-17
DODI 8520.02, Public Key Infrastructure (PKI) and Public Key Enabling (PKE).',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,964,'SC-18',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,966,'DSPAV must be used.',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,967,'Supplemental guidance:
 For the protection of the infrastructure supporting a CSO, CSPs should apply this control to their organizational IT systems and the infrastructure supporting their CSO(s).
 For the protection of Mission Owners, their end users, and networks, CSP CSOs must not support the downloading of mobile code, which is deemed unacceptable to DOD.
 Refer to Section 5.11, Mobile Code, for more information.',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,968,'Software applications such as but not limited to email, scriptable document/file editing applications that support documents with embedded code (e.g., Microsoft Office applications/documents), etc. Prompting the user for permission.',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,971,'SC-20','SC-20 Requirement:
 Control Description should include how DNSSEC is implemented on authoritative DNS servers to supply valid responses to external DNSSEC requests.
 
 SC-20 Requirement: Authoritative DNS servers must be geolocated in accordance with SA-9(5).
 
 SC-20 Guidance: SC-20 applies to use of external authoritative DNS to access a CSO from outside the boundary.
 
 SC-20 Guidance:
 External authoritative DNS servers may be located outside an authorized environment. Positioning these servers inside an authorized boundary is encouraged.
 
 SC-20 Guidance: CSPs are recommended to self-check DNSSEC configuration through one of many available analyzers such as Sandia National Labs (https://dnsviz.net)','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,974,'SC-21','SC-21 Requirement:
 Control description should include how DNSSEC is implemented on recursive DNS servers to make DNSSEC requests when resolving DNS requests from internal components to domains external to the CSO boundary.
 - If the reply is signed, and fails DNSSEC, do not use the reply
 - If the reply is unsigned:
  -- CSP chooses the policy to apply
 
 SC-21 Requirement:
 Internal recursive DNS servers must be located inside an authorized environment. It is typically within the boundary, or leveraged from an underlying IaaS/PaaS.
 
 SC-21 Guidance: Accepting an unsigned reply is acceptable
 
 SC-21 Guidance:
 SC-21 applies to use of internal recursive DNS to access a domain outside the boundary by a component inside the boundary.
 - DNSSEC resolution to access a component inside the boundary is excluded.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,976,'SC-22',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,977,'SC-23',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,983,'SC-24
DSPAV must be used.',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,988,'SC-28 [confidentiality AND integrity]','SC-28 Guidance: The organization supports the capability to use cryptographic mechanisms to protect information at rest. 
 
 SC-28 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-28 Guidance: Note that this enhancement requires the use of cryptography in accordance with SC-13.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (10,1243,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1241,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1230,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1277,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1228,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (7,111,'AC-17(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,112,'AC-17(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,113,'AC-17(3)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,561,'PE-2 (c) [at least every ninety(90) days]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (6,989,'SC-28(1)-1 [all information system components storing Federal data or system data that must be protected at the High or Moderate impact levels]','SC-28(1) Guidance: 
 Organizations should select a mode of protection that is targeted towards the relevant threat scenarios. 
 Examples:
 A. Organizations may apply full disk encryption (FDE) to a mobile device where the primary threat is loss of the device while storage is locked. 
 B. For a database application housing data for a single customer, encryption at the file system level would often provide more protection than FDE against the more likely threat of an intruder on the operating system accessing the storage.
 C. For a database application housing data for multiple customers, encryption with unique keys for each customer at the database record level may be more appropriate.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1018,'SC-39',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1035,'SC-45',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (10,1272,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1216,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (7,1,'AC-1 (c)(1) [at least annually]
 AC-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,2,'AC-2 (h)(1) [twenty-four(24) hours]
 AC-2 (h)(2) [eight(8) hours]
 AC-2 (h)(3) [eight(8) hours]
 AC-2 (j) [monthly for privileged accessed, every six(6) months for non-privileged access]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,3,'AC-2(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,4,'AC-2(2) [Selection: disables] 
 [Assignment: no more than 24 hours from last use]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,5,'AC-2(3) [24 hours for user accounts]
 AC-2(3) (d) [thirty-five(35) days] (See additional requirements and guidance.)','AC-2(3) Requirement: The service provider defines the time period for non-user accounts (e.g., accounts associated with devices). The time periods are approved and accepted by the JAB/AO. Where user management is a function of the service, reports of activity of consumer users shall be made available.
 AC-2(3) (d) Requirement: The service provider defines the time period of inactivity for device identifiers.
 Guidance: For DoD clouds, see DoD cloud website for specific DoD requirements that go above and beyond FedRAMP https://public.cyber.mil/dccs/.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,6,'AC-2(4)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,7,'AC-2(5) [inactivity is anticipated to exceed Fifteen(15) minutes]','AC-2(5) Guidance: Should use a shorter timeframe than AC-12.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,9,'AC-2(7)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,11,'AC-2(9) [organization-defined need with justification statement that explains why such accounts are necessary]','AC-2(9) Requirement: Required if shared/group accounts are deployed','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,13,'AC-2(11)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,14,'AC-2(12) (b)[at a minimum, the ISSO and/or similar role within the organization]','AC-2(12) (a) Requirement: Required for privileged accounts.
 AC-2(12) (b) Requirement: Required for privileged accounts.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,15,'AC-2(13)-1 [one(1) hour]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,16,'AC-3',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,20,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,32,'AC-4',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,36,'AC-4(4)-1 [intrusion detection mechanisms]','AC-4(4) Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf) and M-22-9 (https://www.whitehouse.gov/wp-content/uploads/2022/01/M-22-9.pdf).','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,53,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,65,'AC-5','AC-5 Guidance: CSPs have the option to provide a separation of duties matrix as an attachment to the SSP.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,66,'AC-6',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,67,'AC-6(1) (a) [all functions not publicly accessible]
 AC-6(1) (b) [all security-relevant information not publicly available]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,68,'AC-6(2) [all security functions]','AC-6(2) Guidance: Examples of security functions include but are not limited to: establishing system accounts, configuring access authorizations (i.e., permissions, privileges), setting events to be audited, and setting intrusion detection parameters, system programming, system and security administration, other privileged functions.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,69,'AC-6(3)-1 [all privileged commands]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,71,'AC-6(5)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,73,'AC-6(7) (a)-1 [at a minimum, annually]
 AC-6(7) (a)-2 [all users with privileges]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,74,'AC-6(8) [any software except software explicitly documented]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,75,'AC-6(9)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,76,'AC-6 (10)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,77,'AC-7
For privileged users, DOD limits to three unsuccessful attempts and requires an administrator to unlock. For nonprivileged users, if rate limiting, DOD will allow 10 attempts with the account automatically unlocked after 30 minutes. If rate limiting is not used, normal DSPAV will be required.','AC-7 Requirement: In alignment with NIST SP 800-63B','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,82,'AC-8 (a) [see additional Requirements and Guidance]
 AC-8 (c)(1) [see additional Requirements and Guidance]','AC-8 Requirement: The service provider shall determine elements of the cloud environment that require the System Use Notification control. The elements of the cloud environment that require System Use Notification are approved and accepted by the JAB/AO. 
 
 Requirement: The service provider shall determine how System Use Notification is going to be verified and provide appropriate periodicity of the check. The System Use Notification verification and periodicity are approved and accepted by the JAB/AO.
 
 Requirement: If not performed as part of a Configuration Baseline check, then there must be documented agreement on how to provide results of verification and the necessary periodicity of the verification by the service provider. The documented agreement on how to provide verification of the results are approved and accepted by the JAB/AO.
 
 Guidance: If performed as part of a Configuration Baseline check, then the % of items requiring setting that are checked and that pass (or fail) check can be provided.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,88,'AC-10-2 [three(3) sessions for privileged access and two(2) sessions for non-privileged access]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,89,'AC-11 (a) [fifteen(15) minutes]; requiring the user to initiate a device lock before leaving the system unattended',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,90,'AC-11(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,91,'AC-12',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,92,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,93,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,96,'AC-14',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,99,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,105,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,106,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,110,'AC-17',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,133,'AC-20','AC-20 Guidance: The interrelated controls of AC-20, CA-3, and SA-9 should be differentiated as follows:
 AC-20 describes system access to and from external systems.
 CA-3 describes documentation of an agreement between the respective system owners when data is exchanged between the CSO and an external system.
 SA-9 describes the responsibilities of external system owners. These responsibilities would typically be captured in the agreement required by CA-3.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,134,'AC-20(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,135,'AC-20(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,136,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,139,'AC-21',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,142,'AC-22 (d) [at least quarterly]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,143,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,148,'AT-1 (c)(1) [at least annually]
 AT-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,149,'AT-2 (a)(1) [at least annually]
 AT-2 (c) [at least annually]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,151,'AT-2(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,152,'AT-2(3)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,153,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,154,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,155,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,156,'AT-3 (a)(1) [at least annually]
 AT-3 (b) [at least annually]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,157,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,158,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,162,'AT-4 (b) [five(5) years or 5 years after completion of a specific training program]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,164,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,165,'AU-1 (c)(1) [at least annually]
 AU-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,166,'AU-2 (a) [successful and unsuccessful account logon events, account management events, object access, policy change, privilege functions, process tracking, and system events. For Web applications: all administrator activity, authentication checks, authorization checks, data deletions, data access, data changes, and permission changes]
 AU-2 (c) [organization-defined subset of the auditable events defined in AU-2a to be audited continually for each identified event].
 AU-2 (e) [annually and whenever there is a change in the threat environment]','AU-2 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO.
 AU-2 (e) Guidance: Annually or whenever changes in the threat environment are communicated to the service provider by the JAB/AO.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,171,'AU-3',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,172,'AU-3(1) [session, connection, transaction, or activity duration; for client-server transactions, the number of bytes received and bytes sent; additional informational messages to diagnose or identify the event; characteristics that describe or identify the object or resource being acted upon; individual identities of group account users; full-text of privileged commands]','AU-3(1) Guidance: For client-server transactions, the number of bytes sent and received gives bidirectional transfer information that can be helpful during an investigation or inquiry.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,175,'AU-4',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,177,'AU-5 (b) [overwrite oldest record]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,178,'AU-5(1)-3 [75%, or one month before expected negative impact]
CSP/CSO may use FedRAMP value.',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,179,'AU-5(2)-1 [real-time] 
 AU-5(2)-2 [service provider personnel with authority to address failed audit events] 
 AU-5(2)-3 [audit failure events requiring real-time alerts, as defined by organization audit policy].',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,183,'AU-6 (a)-1 [at least weekly]','AU-6 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO. In multi-tenant environments, capability and means for providing review, analysis, and reporting to consumer for data pertaining to consumer shall be documented.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,184,'AU-6(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,186,'AU-6(3)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,187,'AU-6(4)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,188,'AU-6(5) [Selection (one or more): vulnerability scanning information; performance data; information system monitoring information; penetration test data; [Organization -defined data/information collected from other sources]]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,189,'AU-6(6)','AU-6(6) Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,190,'AU-6(7) [information system process; role; user]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,194,'AU-7',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,195,'AU-7(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,197,'AU-8 (b) [one second granularity of time measurement]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,200,'AU-9',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,202,'AU-9(2) [at least weekly]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,203,'AU-9(3)','AU-9(3) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,204,'AU-9(4)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,205,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,206,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,208,'AU-10 [minimum actions including the addition, modification, deletion, approval, sending, or receiving of data]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,214,'AU-11 [a time period in compliance with M-21-31]','AU-11 Requirement: The service provider retains audit records on-line for at least ninety days and further preserves audit records off-line for a period that is in accordance with NARA requirements. 
 AU-11 Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf)
 AU-11 Guidance: The service provider is encouraged to align with M-21-31 where possible','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,216,'AU-12 (a) [all information system and network components where audit capability is deployed/available]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,217,'AU-12(1)-1 [all network, data storage, and computing devices]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,219,'AU-12(3)-1 [service provider-defined individuals or roles with audit configuration responsibilities] 
 AU-12(3)-2 [all network, data storage, and computing devices]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,225,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,226,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,228,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,230,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,231,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,232,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,816,'SA-11',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (10,1283,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (7,235,'CA-2 (d) [at least annually] 
 CA-2 (f) [individuals or roles to include FedRAMP PMO]','CA-2 Guidance: Reference FedRAMP Annual Assessment Guidance.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,236,NULL,'CA-2(1) Requirement: For JAB Authorization, must use an accredited 3PAO.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,237,'CA-2(2) [at least annually]','CA-2(2) Requirement: To include ''announced'', ''vulnerability scanning''','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,238,'CA-2(3)-1 [any FedRAMP Accredited 3PAO]
 CA-2(3)-3 [the conditions of the JAB/AO in the FedRAMP Repository]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,239,'CA-3 (c) [at least annually and on input from JAB/AO]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,245,'CA-3(6)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,248,'CA-5 (b) [at least monthly]','CA-5 Requirement: POA&Ms must be provided at least monthly.
 CA-5 Guidance: Reference FedRAMP-POAM-Template','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,250,'CA-6 (e) [in accordance with OMB A-130 requirements or when a significant change occurs]','CA-6 (e) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F and according to FedRAMP Significant Change Policies and Procedures. The service provider describes the types of changes to the information system or the environment of operations that would impact the risk posture. The types of changes are approved and accepted by the JAB/AO.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,253,'CA-7 (g)-1 [to include JAB/AO]','CA-7 Requirement: Operating System, Database, Web Application, Container, and Service Configuration Scans: at least monthly. All scans performed by Independent Assessor: at least annually.
 CA-7 Requirement: CSOs with more than one agency ATO must implement a collaborative Continuous Monitoring (ConMon) approach described in the FedRAMP Guide for Multi-Agency Continuous Monitoring. This requirement applies to CSOs authorized via the Agency path as each agency customer is responsible for performing ConMon oversight. It does not apply to CSOs authorized via the JAB path because the JAB performs ConMon oversight.
 CA-7 Guidance: FedRAMP does not provide a template for the Continuous Monitoring Plan. CSPs should reference the FedRAMP Continuous Monitoring Strategy Guide when developing the Continuous Monitoring Plan.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,254,'CA-7(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,256,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,257,'CA-7(4)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,258,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,259,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,260,'CA-8-1 [at least annually]','CA-8 Guidance: Reference the FedRAMP Penetration Test Guidance.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,261,'CA-8(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,262,'CA-8(2)','CA-8(2) Guidance: See the FedRAMP Documents page> Penetration Test Guidance 
 https://www.FedRAMP.gov/documents/','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,263,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,264,'CA-9 (d) [at least annually]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,266,'CM-1 (c)(1) [at least annually]
 CM-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,267,'CM-2 (b)(1) [at least annually and when a significant change occurs]
 CM-2 (b)(2) [to include when directed by the JAB]','CM-2 (b)(1) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,269,'CM-2(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,270,'CM-2(3) [organization-defined number of previous versions of baseline configurations of the previously approved baseline configuration of IS components]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,274,'CM-2(7)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,275,'CM-3','CM-3 Requirement: The service provider establishes a central means of communicating major changes to or developments in the information system or environment of operations that may affect its services to the federal government and associated service consumers (e.g., electronic bulletin board, web status page). The means of communication are approved and accepted by the JAB/AO.
 CM-3 (e) Guidance: In accordance with record retention policies and procedures.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,276,'CM-3(1) (c) [organization agreed upon time period] 
 CM-3(1) (f) [organization defined configuration management approval authorities]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,277,'CM-3(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,279,'CM-3(4)-2 [Configuration control board (CCB) or similar (as defined in CM-3)]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,280,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,281,'CM-3(6) All security safeguards that rely on cryptography',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,282,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,283,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,284,'CM-4',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,285,'CM-4(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,286,'CM-4(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,287,'CM-5',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,288,'CM-5(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,292,'CM-5(5) (b) [at least quarterly]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,293,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,295,'CM-6','CM-6 (a) Requirement 1: The service provider shall use the DoD STIGs to establish configuration settings; Center for Internet Security up to Level 2 (CIS Level 2) guidelines shall be used if STIGs are not available; Custom baselines shall be used if CIS is not available.
 CM-6 (a) Requirement 2: The service provider shall ensure that checklists for configuration settings are Security Content Automation Protocol (SCAP) validated or SCAP compatible (if validated checklists are not available).
 
 CM-6 Guidance: Compliance checks are used to evaluate configuration settings and provide general insight into the overall effectiveness of configuration management activities. CSPs and 3PAOs typically combine compliance check findings into a single CM-6 finding, which is acceptable. However, for initial assessments, annual assessments, and significant change requests, FedRAMP requires a clear understanding, on a per-control basis, where risks exist. Therefore, 3PAOs must also analyze compliance check findings as part of the controls assessment. Where a direct mapping exists, the 3PAO must document additional findings per control in the corresponding SAR Risk Exposure Table (RET), which are then documented in the CSP’s Plan of Action and Milestones (POA&M). This will likely result in the details of individual control findings overlapping with those in the combined CM-6 finding, which is acceptable.
 During monthly continuous monitoring, new findings from CSP compliance checks may be combined into a single CM-6 POA&M item. CSPs are not required to map the findings to specific controls because controls are only assessed during initial assessments, annual assessments, and significant change requests.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,296,'CM-6(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,297,'CM-6(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,458,'IR-1 (c)(1) [at least annually]
 IR-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1189,'SR-12',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (2,239,'CA-3 (c) [at least annually and on input from JAB/AO]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (7,300,'CM-7','CM-7 (b) Requirement: The service provider shall use Security guidelines (See CM-6) to establish list of prohibited or restricted functions, ports, protocols, and/or services or establishes its own list of prohibited or restricted functions, ports, protocols, and/or services if STIGs or CIS is not available.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,301,'CM-7(1) (a) [at least annually]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,302,'CM-7(2)','CM-7(2) Guidance: This control refers to software deployment by CSP personnel into the production environment. The control requires a policy that states conditions for deploying software. This control shall be implemented in a technical manner on the information system to only allow programs to run that adhere to the policy (i.e. allow-listing). This control is not to be based off of strictly written policy on what is allowed or not allowed to run.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,303,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,305,'CM-7(5) (c) [at least quarterly or when there is a change]
DSPAV must be used.',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,308,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,309,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,310,'CM-8 (b) [at least monthly]','CM-8 Requirement: must be provided at least monthly or when there is a change.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,311,'CM-8(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,312,'CM-8(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,313,'CM-8(3) (a)-1 [automated mechanisms with a maximum five-minute delay in detection.] 
 CM-8(3) (a)-2 [continuously]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,314,'CM-8(4) [position and role]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,320,'CM-9','CM-9 Guidance: FedRAMP does not provide a template for the Configuration Management Plan. However, NIST SP 800-128, Guide for Security-Focused Configuration Management of Information Systems, provides guidelines for the implementation of CM controls as well as a sample CMP outline in Appendix D of the Guide','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,322,'CM-10',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,323,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,324,'CM-11 (c) [Continuously (via CM-7(5))]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,326,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,328,'CM-12','CM-12 Requirement: According to FedRAMP Authorization Boundary Guidance','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,329,'CM-12(1)-1: [Federal data and system data that must be protected at the High or Moderate impact levels]','CM-12(1) Requirement: According to FedRAMP Authorization Boundary Guidance.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,331,'CM-14','CM-14 Guidance: If digital signatures/certificates are unavailable, alternative cryptographic integrity checks (hashes, self-signed certs, etc.) can be utilized.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,332,'CP-1 (c)(1) [at least annually]
 CP-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,333,'CP-2 (d) [at least annually]','CP-2 Requirement: For JAB authorizations the contingency lists include designated FedRAMP personnel.
 
 CP-2 Requirement: CSPs must use the FedRAMP Information System Contingency Plan (ISCP) Template (available on the fedramp.gov: https://www.fedramp.gov/assets/resources/templates/SSP-A06-FedRAMP-ISCP-Template.docx).','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,334,'CP-2(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,335,'CP-2(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,336,'CP-2(3)-1 [all]
 CP-2(3)-2 [time period defined in service provider and organization SLA]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,338,'CP-2(5) [essential]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,341,'CP-2(8)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,342,'CP-3 (a)(1) [*See Additional Requirements]
 CP-3 (a)(3) [at least annually]
 CP-3 (b) [at least annually]','CP-3 (a) Requirement: Privileged admins and engineers must take the basic contingency training within 10 days. Consideration must be given for those privileged admins and engineers with critical contingency-related roles, to gain enough system context and situational awareness to understand the full impact of contingency training as it applies to their respective level. Newly hired critical contingency personnel must take this more in-depth training within 60 days of hire date when the training will have more impact.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,343,'CP-3(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,345,'CP-4 (a)-1 [at least annually] 
 CP-4 (a)-2 [functional exercises]','CP-4 (a) Requirement: The service provider develops test plans in accordance with NIST Special Publication 800-34 (as amended); plans are approved by the JAB/AO prior to initiating testing.
 
 CP-4 (b) Requirement: The service provider must include the Contingency Plan test results with the security package within the Contingency Plan-designated appendix (Appendix G, Contingency Plan Test Report).','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,346,'CP-4(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,347,'CP-4(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,352,'CP-6',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,353,'CP-6(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,354,'CP-6(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,355,'CP-6(3)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,356,'CP-7','CP-7 (a) Requirement: The service provider defines a time period consistent with the recovery time objectives and business impact analysis.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,357,'CP-7(1)','CP-7(1) Guidance: The service provider may determine what is considered a sufficient degree of separation between the primary and alternate processing sites, based on the types of threats that are of concern. For one particular type of threat (i.e., hostile cyber attack), the degree of separation between sites will be less relevant.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,358,'CP-7(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,359,'CP-7(3)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,360,'CP-7(4)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,363,'CP-8','CP-8 Requirement: The service provider defines a time period consistent with the recovery time objectives and business impact analysis.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,364,'CP-8(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,365,'CP-8(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,366,'CP-8(3)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,367,'CP-8(4) (c) [annually]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,450,'IA-11','IA-11 Guidance:
 The fixed time period cannot exceed the limits set in SP 800-63. At this writing they are:
 - AAL3 (high baseline)
  -- 12 hours or
  -- 15 minutes of inactivity','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,451,'IA-12','IA-12 Additional FedRAMP Requirements and Guidance:
 Guidance: In accordance with NIST SP 800-63A Enrollment and Identity Proofing','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,452,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,453,'IA-12(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,454,'IA-12(3)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,455,'IA-12(4)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,456,'IA-12(5)','IA-12(5) Additional FedRAMP Requirements and Guidance:
 Guidance: In accordance with NIST SP 800-63A Enrollment and Identity Proofing','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,805,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,369,'CP-9 (a)-2 [daily incremental; weekly full]
 CP-9 (b) [daily incremental; weekly full]
 CP-9 (c) [daily incremental; weekly full]','CP-9 Requirement: The service provider shall determine what elements of the cloud environment require the Information System Backup control. The service provider shall determine how Information System Backup is going to be verified and appropriate periodicity of the check.
 CP-9 (a) Requirement: The service provider maintains at least three backup copies of user-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (b) Requirement: The service provider maintains at least three backup copies of system-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (c) Requirement: The service provider maintains at least three backup copies of information system documentation including security information (at least one of which is available online) or provides an equivalent alternative.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,370,'CP-9(1) [at least monthly]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,371,'CP-9(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,372,'CP-9(3)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,374,'CP-9(5) [time period and transfer rate consistent with the recovery time and recovery point objectives defined in the service provider and organization SLA].',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,377,'CP-9(8) [all backup files]','CP-9(8) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,378,'CP-10',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,380,'CP-10(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,382,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,388,'IA-1 (c)(1) [at least annually]
 IA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,389,'IA-2','IA-2 Requirement: For all control enhancements that specify multifactor authentication, the implementation must adhere to the Digital Identity Guidelines specified in NIST Special Publication 800-63B.
 
 IA-2 Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2 Requirement: All uses of encrypted virtual private networks must meet all applicable Federal requirements and architecture, dataflow, and security and privacy controls must be documented, assessed, and authorized to operate.
 
 IA-2 Guidance: “Phishing-resistant" authentication refers to authentication processes designed to detect and prevent disclosure of authentication secrets and outputs to a website or application masquerading as a legitimate system.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,390,'IA-2(1)','IA-2(1) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(1) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(1) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,391,'IA-2(2)','IA-2(2) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(2) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(2) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,394,'IA-2(5)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,395,'IA-2(6)-1 [local, network and remote]
 IA-2(6)-2 [privileged accounts; non-privileged accounts]
 IA-2(6) (b) [FIPS-validated or NSA-approved cryptography]','IA-2(6) Guidance: PIV=separate device. Please refer to NIST SP 800-157 Guidelines for Derived Personal Identity Verification (PIV) Credentials.
 
 IA-2(6) Guidance: See SC-13 Guidance for more information on FIPS-validated or NSA-approved cryptography.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,397,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,401,'IA-2(12)','IA-2(12) Guidance: Include Common Access Card (CAC), i.e., the DoD technical implementation of PIV/FIPS 201/HSPD-12.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,403,'IA-3',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,404,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,408,'IA-4 (a) [at a minimum, the ISSO (or similar role within the organization)] 
 IA-4 (d) [at least two(2) years]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,412,'IA-4(4) [contractors; foreign nationals]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,417,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,418,'IA-5','IA-5 Requirement: Authenticators must be compliant with NIST SP 800-63-3 Digital Identity Guidelines IAL, AAL, FAL level 3. Link https://pages.nist.gov/800-63-3
 
 IA-5 Guidance: SP 800-63C Section 6.2.3 Encrypted Assertion requires that authentication assertions be encrypted when passed through third parties, such as a browser. For example, a SAML assertion can be encrypted using XML-Encryption, or an OpenID Connect ID Token can be encrypted using JSON Web Encryption (JWE).','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,419,'IA-5(1)
DSPAV must be used.','IA-5(1) Requirement: Password policies must be compliant with NIST SP 800-63B for all memorized, lookup, out-of-band, or One-Time-Passwords (OTP). Password policies shall not enforce special character or minimum password rotation requirements for memorized secrets of users.
 
 IA-5(1) (h) Requirement: For cases where technology doesn’t allow multi-factor authentication, these rules should be enforced: must have a minimum length of 14 characters and must support all printable ASCII characters.
  
 For emergency use accounts, these rules should be enforced: must have a minimum length of 14 characters, must support all printable ASCII characters, and passwords must be changed if used. 
 
 IA-5(1) Guidance: Note that (c) and (d) require the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,420,'IA-5(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,424,'IA-5(6)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,425,'IA-5(7)','IA-5(7) Guidance: In this context, prohibited static storage refers to any storage where unencrypted authenticators, such as passwords, persist beyond the time required to complete the access process.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,426,'IA-5(8) [different authenticators in different user authentication domains]','IA-5(8) Guidance: If a single user authentication domain is used to access multiple systems, such as in single-sign-on, then only a single authenticator is required.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,431,'IA-5(13)','IA-5(13) Guidance: For components subject to configuration baseline(s) (such as STIG or CIS,) the time period should conform to the baseline standard.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,432,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,434,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,437,'IA-6',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,438,'IA-7',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,439,'IA-8',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,440,'IA-8(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,441,'IA-8(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,443,'IA-8(4)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,446,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,449,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,806,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,459,'IR-2 (a)(1) [ten(10) days for privileged users, thirty(30) days for Incident Response roles]
 IR-2 (a)(3) [at least annually]
 IR-2 (b) [at least annually]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,460,'IR-2(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,461,'IR-2(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,463,'IR-3-1 [at least every six(6) months, including functional at least annually]','IR-3-2 Requirement: The service provider defines tests and/or exercises in accordance with NIST Special Publication 800-61 (as amended). Functional testing must occur prior to testing for initial authorization. Annual functional testing may be concurrent with required penetration tests (see CA-8). The service provider provides test plans to the JAB/AO annually. Test plans are approved and accepted by the JAB/AO prior to test commencing.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,465,'IR-3(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,467,'IR-4','IR-4 Requirement: The FISMA definition of "incident" shall be used: "An occurrence that actually or imminently jeopardizes, without lawful authority, the confidentiality, integrity, or availability of information or an information system; or constitutes a violation or imminent threat of violation of law, security policies, security procedures, or acceptable use policies."
 
 IR-4 Requirement: The service provider ensures that individuals conducting incident handling meet personnel security requirements commensurate with the criticality/sensitivity of the information being processed, stored, and transmitted by the information system.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,468,'IR-4(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,469,'IR-4(2)-1 [all network, data storage, and computing devices]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,470,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,471,'IR-4(4)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,473,'IR-4(6)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,474,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,475,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,477,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,478,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,479,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,480,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,481,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,483,'IR-5',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,484,'IR-5(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,485,'IR-6 (a) [US-CERT incident reporting timelines as specified in NIST Special Publication 800-61 (as amended)]','IR-6 Requirement: Reports security incident information according to FedRAMP Incident Communications Procedure.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,486,'IR-6(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,487,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,488,'IR-6(3)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,489,'IR-7',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,490,'IR-7(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,491,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,492,'IR-8 (a)(9)-2 [at least annually]
 IR-8 (b) [see additional FedRAMP Requirements and Guidance]
 IR-8 (d) [see additional FedRAMP Requirements and Guidance]','IR-8 (b) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.
 IR-8 (d) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,494,'IR-9',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,496,'IR-9(2) [at least annually]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,497,'IR-9(3)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,498,'IR-9(4)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,500,'MA-1 (c)(1) [at least annually]
 MA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,501,'MA-2',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,504,'MA-3 (b) [at least annually]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,505,'MA-3(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,506,'MA-3(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,507,'MA-3(3) (d) [the information owner]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,508,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,509,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,510,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,511,'MA-4',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,512,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,514,'MA-4(3)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,515,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,517,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,518,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,519,'MA-5',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,520,'MA-5(1)
DSPAV must be used.','MA-5(1) Requirement: Only MA-5(1) (a)(1) is required by FedRAMP Moderate Baseline','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,524,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,525,'MA-6-2 [a timeframe to support advertised uptime and availability]
CSP/CSO may use FedRAMP value.',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,530,'MP-1 (c)(1) [at least annually]
 MP-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,531,'MP-2-1 [all types of digital and/or non-digital media containing sensitive information]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,534,'MP-3 (b)-1 [no removable media types]
 MP-3 (b)-2 [organization-defined security safeguards not applicable]','MP-3 (b) Guidance: Second parameter not-applicable','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,535,'MP-4 (a)-1 [all types of digital and non-digital media with sensitive information] 
 MP-4 (a)-2 [see additional FedRAMP requirements and guidance]','MP-4 (a) Requirement: The service provider defines controlled areas within facilities where the information and information system reside.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,538,'MP-5 (a) [all media with sensitive information] [prior to leaving secure/controlled environment: for digital media, encryption in compliance with Federal requirements and utilizes FIPS validated or NSA approved cryptography (see SC-13.); for non-digital media, secured in locked container]','MP-5 (a) Requirement: The service provider defines security measures to protect digital and non-digital media in transport. The security measures are approved and accepted by the JAB/AO.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,543,'MP-6 (a)-2 [techniques and procedures IAW NIST SP 800-88 Section 4: Reuse and Disposal of Storage Media and Hardware]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,544,'MP-6(1)','MP-6(1) Requirement: Must comply with NIST SP 800-88','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,545,'MP-6(2) [at least every six(6) months]','MP-6(2) Guidance: Equipment and procedures may be tested or validated for effectiveness','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,546,'MP-6(3)','MP-6(3) Requirement: Must comply with NIST SP 800-88','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,552,'MP-7',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,560,'PE-1 (c)(1) [at least annually]
 PE-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (10,1304,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (7,565,'PE-3 (a)(2) [CSP defined physical access control systems/devices AND guards]
 PE-3 (d) [in all circumstances within restricted access area where the information system resides]
 PE-3 (f)-2 [at least annually]
 PE-3 (g) [at least annually or earlier as required by a security relevant event.]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,566,'PE-3(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,574,'PE-4',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,575,'PE-5',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,579,'PE-6 (b)-1 [at least monthly]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,580,'PE-6(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,583,'PE-6(4)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,585,'PE-8 (a) [for a minimum of one(1) year]
 PE-8 (b) [at least monthly]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,586,'PE-8(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,588,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,589,'PE-9',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,592,'PE-10 (b) [near more than one egress point of the IT area and ensures it is labeled and protected by a cover to prevent accidental shut-off]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,594,'PE-11',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,595,'PE-11(1) [automatically]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,597,'PE-12',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,599,'PE-13',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,600,'PE-13(1) -1 [service provider building maintenance/physical security personnel]
 PE-13(1) -2 [service provider emergency responders with incident response responsibilities]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,601,'PE-13(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,604,'PE-14 (a) [consistent with American Society of Heating, Refrigerating and Air-conditioning Engineers (ASHRAE) document entitled Thermal Guidelines for Data Processing Environments]
 
 PE-14 (b) [continuously]','PE-14 (a) Requirement: The service provider measures temperature at server inlets and humidity levels by dew point.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,606,'PE-14(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,607,'PE-15
DSPAV must be used.',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,608,'PE-15(1)-1 [service provider building maintenance/physical security personnel]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,609,'PE-16 (a) [all information system components]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,610,'PE-17',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,611,'PE-18 [physical and environmental hazards identified during threat assessment]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,617,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,619,'PL-1 (c)(1) [at least annually]
 PL-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,620,'PL-2 (a)(14) [to include chief privacy and ISSO and/or similar role or designees]
 PL-2 (b) [to include chief privacy and ISSO and/or similar role]
 PL-2 (c) [at least annually]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,625,'PL-4 (c) [at least annually]
 PL-4 (d) [at least annually and when the rules are revised or changed]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,626,'PL-4(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,629,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,630,'PL-8 (b) [at least annually and when a significant change occurs]','PL-8 (b) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,631,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,632,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,633,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,634,'PL-10','PL-10 Requirement: Select the appropriate FedRAMP Baseline','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,635,'PL-11',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,673,'PS-1 (c)(1) [at least annually]
 PS-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,674,'PS-2 (c) [at least annually]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,675,'PS-3 (b) [for national security clearances; a reinvestigation is required during the fifth(5th) year for top secret security clearance, the tenth(10th) year for secret security clearance, and fifteenth(15th) year for confidential security clearance.
 
 For moderate risk law enforcement and high impact public trust level, a reinvestigation is required during the fifth(5th) year. There is no reinvestigation for other moderate risk positions or any low risk positions]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,679,'All information systems.
 Users: U.S. citizens, U.S. nationals, or U.S. persons, foreign personnel as allowed by current DOD polices with AO approval.
 Administrators: U.S. citizens, U.S. nationals, or U.S. persons.',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,680,'PS-4 (a) [one(1) hour]
CSP/CSO may use FedRAMP value.',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,681,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,682,'PS-4(2)-2 Notify [access control personnel responsible for disabling access to the system]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,683,'PS-5 (b)-2 [twenty-four(24) hours] 
 PS-5 (d)-1 [including access control personnel responsible for the system]
 PS-5 (d)-2 [twenty-four(24) hours]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,684,'PS-6 (b) [at least annually]
 PS-6 (c)(2) [at least annually and any time there is a change to the user''s level of access]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,687,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,688,'PS-7 (d)-1 [including access control personnel responsible for the system and/or facilities, as appropriate]
 PS-7 (d)-2 [terminations: immediately; transfers: within twenty-four(24) hours]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,689,'PS-8 (b)-1 [to include the ISSO and/or similar role within the organization]
 PS-8 (b)-2 [24 hours]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,690,'PS-9',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,712,'RA-1 (c)(1) [at least annually]
 RA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,713,'RA-2',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,715,'RA-3 (c) [security assessment report]
  
 RA-3 (d) [at least annually and whenever a significant change occurs]
  
 RA-3 (f) [annually]','RA-3 Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.
 RA-3 (e) Requirement: Include all Authorizing Officials; for JAB authorizations to include FedRAMP.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,716,'RA-3(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,717,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,718,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,807,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,808,'SA-10 (a) [development, implementation, AND operation]','SA-10 (e) Requirement: track security flaws and flaw resolution within the system, component, or service and report findings to organization-defined personnel, to include FedRAMP.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,809,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,811,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,815,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (5,1,'AC-1 (c)(1) [at least every 3 years] 
 AC-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (10,1222,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (7,721,'RA-5 (a) [monthly operating system/infrastructure; monthly web applications (including APIs) and databases]
 RA-5 (d) [high-risk vulnerabilities mitigated within thirty(30) days from date of discovery; moderate-risk vulnerabilities mitigated within ninety(90) days from date of discovery; low risk vulnerabilities mitigated within one hundred and eighty(180) days from date of discovery]','RA-5 Guidance: See the FedRAMP Documents page> Vulnerability Scanning Requirements 
 https://www.FedRAMP.gov/documents/
 RA-5 (a) Requirement: an accredited independent assessor scans operating systems/infrastructure, web applications, and databases once annually.
 RA-5 (d) Requirement: If a vulnerability is listed among the CISA Known Exploited Vulnerability (KEV) Catalog (https://www.cisa.gov/known-exploited-vulnerabilities-catalog) the KEV remediation date supersedes the FedRAMP parameter requirement.
 RA-5 (e) Requirement: to include all Authorizing Officials; for JAB authorizations to include FedRAMP
 
 RA-5 Guidance: Informational findings from a scanner are detailed as a returned result that holds no vulnerability risk or severity and for FedRAMP does not require an entry onto the POA&M or entry onto the RET during any assessment phase.
 Warning findings, on the other hand, are given a risk rating (low, moderate, high or critical) by the scanning solution and should be treated like any other finding with a risk or severity rating for tracking purposes onto either the POA&M or RET depending on when the findings originated (during assessments or during monthly continuous monitoring). If a warning is received during scanning, but further validation turns up no actual issue then this item should be categorized as a false positive. If this situation presents itself during an assessment phase (initial assessment, annual assessment or any SCR), follow guidance on how to report false positives in the Security Assessment Report (SAR). If this situation happens during monthly continuous monitoring, a deviation request will need to be submitted per the FedRAMP Vulnerability Deviation Request Form.
 Warnings are commonly associated with scanning solutions that also perform compliance scans, and if the scanner reports a “warning” as part of the compliance scanning of a CSO, follow guidance surrounding the tracking of compliance findings during either the assessment phases (initial assessment, annual assessment or any SCR) or monthly continuous monitoring as it applies. Guidance on compliance scan findings can be found by searching on “Tracking of Compliance Scans” in FAQs.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,723,'RA-5(2) [within 24 hours prior to
 running scans]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,724,'RA-5(3)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,725,'RA-5(4) [notify appropriate service provider personnel and follow procedures for organization and service provider-defined corrective actions]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,726,'RA-5(5)-1 [all components that support authentication] 
 RA-5(5)-2 [all scans]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,729,'RA-5(8)','RA-5(8) Requirement: This enhancement is required for all high (or critical) vulnerability scan findings.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,731,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,732,'RA-5(11)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,734,'RA-7',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,736,'RA-9',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,737,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,738,'SA-1 (c)(1) [at least annually]
 SA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,739,'SA-2',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,740,'SA-3',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,741,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,742,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,744,'SA-4','SA-4 Requirement: The service provider must comply with Federal Acquisition Regulation (FAR) Subpart 7.103, and Section 889 of the John S. McCain National Defense Authorization Act (NDAA) for Fiscal Year 2019 (Pub. L. 115-232), and FAR Subpart 4.21, which implements Section 889 (as well as any added updates related to FISMA to address security concerns in the system acquisitions process).
 
 SA-4 Guidance: The use of Common Criteria (ISO/IEC 15408) evaluated products is strongly preferred.
 See https://www.niap-ccevs.org/Product/index.cfm or https://www.commoncriteriaportal.org/products/.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,745,'SA-4(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,746,'SA-4(2)-1 [at a minimum to include security-relevant external system interfaces; high-level design; low-level design; source code or network and data flow diagram; [organization-defined design/implementation information]]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,747,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,749,'SA-4(5) (a) The service provider shall use the DoD STIGs to establish configuration settings; Center for Internet Security up to Level 2 (CIS Level 2) guidelines shall be used if STIGs are not available; Custom baselines shall be used if CIS is not available.
DSPAV must be used.',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,751,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,753,'SA-4(9)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,754,'SA-4 (10)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,757,'SA-5 (d) [at a minimum, the ISSO (or similar role within the organization)]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,765,'SA-8',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,766,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,767,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,768,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,769,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,770,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,771,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,772,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,773,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,774,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,775,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,776,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,777,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,778,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,779,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,780,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,781,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,782,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,783,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,784,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,785,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,786,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,787,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,788,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,789,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,790,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,791,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,792,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,793,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,794,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,795,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,796,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,797,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,799,'SA-9 (a) [Appropriate FedRAMP Security Controls Baseline (s) if Federal information is processed or stored within the external system]
 SA-9 (c) [Federal/FedRAMP Continuous Monitoring requirements must be met for external systems where Federal information is processed or stored]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,800,'SA-9(1)
DSPAV must be used.',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,801,'SA-9(2) [all external systems where Federal information is processed or stored]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,802,'DSPAV must be used.',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,804,'SA-9(5)-1 [information processing, information or data, AND system services]
 SA-9(5)-2 [U.S./U.S. Territories or geographic locations where there is U.S. jurisdiction]
 SA-9(5)-3 [all High impact data, systems, or services]
SA-9 (5)-1 [information processing, information or data, AND system services].
 SA-9 (5)-2 [U.S./U.S. Territories or geographic locations where there is U.S. jurisdiction].
 SA-9 (5)-3 [all data, systems, or services].',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,817,'SA-11(1)','SA-11(1) Requirement: The service provider must document its methodology for reviewing newly developed code for the Service in its Continuous Monitoring Plan.
 
 If Static code analysis cannot be performed (for example, when the source code is not available), then dynamic code analysis must be performed (see SA-11(8))','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,818,'SA-11(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,845,'SA-15 (b)-1 [frequency as before first use and annually thereafter]
 SA-15 (b)-2 [FedRAMP Security Authorization requirements]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,848,'SA-15(3)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,852,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,858,'SA-16',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,859,'SA-17',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,878,'SA-21',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,880,'SA-22',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,883,'SC-1 (c)(1) [at least annually]
 SC-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,884,'SC-2',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,887,'SC-3',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,893,'SC-4',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,896,'SC-5 (a)-1 [Protect against] 
 SC-5 (a)-2 [at a minimum: ICMP (ping) flood, SYN flood, slowloris, buffer overflow attack, and volume attack]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,901,'SC-7','SC-7 (b) Guidance: SC-7 (b) should be met by subnet isolation. A subnetwork (subnet) is a physically or logically segmented section of a larger network defined at TCP/IP Layer 3, to both minimize traffic and, important for a FedRAMP Authorization, add a crucial layer of network isolation. Subnets are distinct from VLANs (Layer 2), security groups, and VPCs and are specifically required to satisfy SC-7 part b and other controls. See the FedRAMP Subnets White Paper (https://www.fedramp.gov/assets/resources/documents/FedRAMP_subnets_white_paper.pdf) for additional information.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,904,'SC-7(3)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,905,'SC-7(4) (e) [at least every ninety(90) days or whenever there is a change in the threat environment that warrants a review of the exceptions]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,906,'SC-7(5) [any systems]','SC-7(5) Guidance: For JAB Authorization, CSPs shall include details of this control in their Architecture Briefing','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,908,'SC-7(7)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,909,'SC-7(8)-2 [any network outside of organizational control and any network outside the authorization boundary]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,910,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,911,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,912,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,913,'SC-7(12)-1 [Host Intrusion Prevention System (HIPS), Host Intrusion Detection System (HIDS), or minimally a host-based firewall]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,914,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,915,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,916,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,919,'SC-7(18)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,921,'SC-7 (20)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,922,'SC-7 (21)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,926,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,929,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,930,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,931,'SC-8 [confidentiality AND integrity]','SC-8 Guidance:
 For each instance of data in transit, confidentiality AND integrity should be through cryptography as specified in SC-8(1), physical means as specified in SC-8(5), or in combination.
 
 For clarity, this control applies to all data in transit. Examples include the following data flows:
  - Crossing the system boundary
  - Between compute instances - including containers
  - From a compute instance to storage
  - Replication between availability zones
  - Transmission of backups to storage
  - From a load balancer to a compute instance
  - Flows from management tools required for their work – e.g. log collection, scanning, etc.
 
 The following applies only when choosing SC-8(5) in lieu of SC-8(1).
 FedRAMP-Defined Assignment / Selection Parameters 
 SC-8(5)-1 [a hardened or alarmed carrier Protective Distribution System (PDS) when outside of Controlled Access Area (CAA)]
 SC-8(5)-2 [prevent unauthorized disclosure of information AND detect changes to information] 
 
 SC-8 Guidance:
 SC-8(5) applies when physical protection has been selected as the method to protect confidentiality and integrity. For physical protection, data in transit must be in either a Controlled Access Area (CAA), or a Hardened or alarmed PDS.
 
 Hardened or alarmed PDS: Shall be as defined in SECTION X - CATEGORY 2 PDS INSTALLATION GUIDANCE of CNSSI No.7003, titled PROTECTED DISTRIBUTION SYSTEMS (PDS). Per the CNSSI No. 7003 Section VIII, PDS must originate and terminate in a Controlled Access Area (CAA). 
 
 Controlled Access Area (CAA): Data will be considered physically protected, and in a CAA if it meets Section 2.3 of the DHS’s Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies. CSPs can meet Section 2.3 of the DHS’ recommended practice by satisfactory implementation of the following controls PE-2(1), PE-2(2), PE-2(3), PE-3(2), PE-3(3), PE-6(2), and PE-6(3).
 
 Note: When selecting SC-8(5), the above SC-8(5), and the above referenced PE controls must be added to the SSP.
 
 CNSSI No.7003 can be accessed here:
 https://www.dcsa.mil/Portals/91/documents/ctp/nao/CNSSI_7003_PDS_September_2015.pdf 
 
 DHS Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies can be accessed here:
 https://us-cert.cisa.gov/sites/default/files/FactSheets/NCCIC%20ICS_FactSheet_Defense_in_Depth_Strategies_S508C.pdf','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,932,'SC-8(1) [prevent unauthorized disclosure of information AND detect changes to information]','SC-8(1) Requirement: Please ensure SSP Section 10.3 Cryptographic Modules Implemented for Data At Rest (DAR) and Data In Transit (DIT) is fully populated for reference in this control.
 
 SC-8(1) Guidance:
 See M-22-9, including "Agencies encrypt all DNS requests and HTTP traffic within their environment"
 
 SC-8(1) applies when encryption has been selected as the method to protect confidentiality and integrity. Otherwise refer to SC-8(5). SC-8(1) is strongly encouraged.
 
 SC-8(1) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)
 
 SC-8(1) Guidance: When leveraging encryption from the underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,933,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,938,'SC-10 [no longer than ten(10) minutes for privileged sessions and no longer than fifteen(15) minutes for user sessions]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,941,'SC-12 [In accordance with Federal requirements]','SC-12 Guidance: See references in NIST 800-53 documentation.
 
 SC-12 Guidance: Must meet applicable Federal Cryptographic Requirements. See References Section of control.
 
 SC-12 Guidance: Wildcard certificates may be used internally within the system, but are not permitted for external customer access to the system.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,942,'SC-12(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,947,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1045,'SI-1 (c)(1) [at least annually]
 SI-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1046,'SI-2 (c) [within thirty(30) days of release of updates]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1048,'SI-2(2)-2 [at least monthly]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1049,'SI-2(3)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1050,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1052,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (5,287,'CM-5',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (7,948,'SC-13 (b) [FIPS-validated or NSA-approved cryptography]','SC-13 Guidance:
 This control applies to all use of cryptography. In addition to encryption, this includes functions such as hashing, random number generation, and key generation. Examples include the following:
  - Encryption of data
  - Decryption of data
  - Generation of one time passwords (OTPs) for MFA
  - Protocols such as TLS, SSH, and HTTPS
 
 The requirement for FIPS 140 validation, as well as timelines for acceptance of FIPS 140-2, and 140-3 can be found at the NIST Cryptographic Module Validation Program (CMVP).
 https://csrc.nist.gov/projects/cryptographic-module-validation-program 
 
 SC-13 Guidance: For NSA-approved cryptography, the National Information Assurance Partnership (NIAP) oversees a national program to evaluate Commercial IT Products for Use in National Security Systems. The NIAP Product Compliant List can be found at the following location:
 https://www.niap-ccevs.org/Product/index.cfm 
 
 SC-13 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-13 Guidance:
 Moving to non-FIPS CM or product is acceptable when:
 - FIPS validated version has a known vulnerability
 - Feature with vulnerability is in use
 - Non-FIPS version fixes the vulnerability
 - Non-FIPS version is submitted to NIST for FIPS validation
 - POA&M is added to track approval, and deployment when ready
 
 SC-13 Guidance: At a minimum, this control applies to cryptography in use for the following controls: AU-9(3), CP-9(8), IA-2(6), IA-5(1), MP-5, SC-8(1), and SC-28(1).','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,954,'SC-15 (a) [no exceptions for computing devices]','SC-15 Requirement: The information system provides disablement (instead of physical disconnect) of collaborative computing devices in a manner that supports ease of use.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,959,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,960,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,961,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,962,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,963,'SC-17
DODI 8520.02, Public Key Infrastructure (PKI) and Public Key Enabling (PKE).',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,964,'SC-18',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,965,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,966,'DSPAV must be used.',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,967,'Supplemental guidance:
 For the protection of the infrastructure supporting a CSO, CSPs should apply this control to their organizational IT systems and the infrastructure supporting their CSO(s).
 For the protection of Mission Owners, their end users, and networks, CSP CSOs must not support the downloading of mobile code, which is deemed unacceptable to DOD.
 Refer to Section 5.11, Mobile Code, for more information.',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,968,'Software applications such as but not limited to email, scriptable document/file editing applications that support documents with embedded code (e.g., Microsoft Office applications/documents), etc. Prompting the user for permission.',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,971,'SC-20','SC-20 Requirement:
 Control Description should include how DNSSEC is implemented on authoritative DNS servers to supply valid responses to external DNSSEC requests.
 
 SC-20 Requirement: Authoritative DNS servers must be geolocated in accordance with SA-9(5).
 
 SC-20 Guidance: SC-20 applies to use of external authoritative DNS to access a CSO from outside the boundary.
 
 SC-20 Guidance:
 External authoritative DNS servers may be located outside an authorized environment. Positioning these servers inside an authorized boundary is encouraged.
 
 SC-20 Guidance: CSPs are recommended to self-check DNSSEC configuration through one of many available analyzers such as Sandia National Labs (https://dnsviz.net)','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,974,'SC-21','SC-21 Requirement:
 Control description should include how DNSSEC is implemented on recursive DNS servers to make DNSSEC requests when resolving DNS requests from internal components to domains external to the CSO boundary.
 - If the reply is signed, and fails DNSSEC, do not use the reply
 - If the reply is unsigned:
  -- CSP chooses the policy to apply
 
 SC-21 Requirement:
 Internal recursive DNS servers must be located inside an authorized environment. It is typically within the boundary, or leveraged from an underlying IaaS/PaaS.
 
 SC-21 Guidance: Accepting an unsigned reply is acceptable
 
 SC-21 Guidance:
 SC-21 applies to use of internal recursive DNS to access a domain outside the boundary by a component inside the boundary.
 - DNSSEC resolution to access a component inside the boundary is excluded.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,976,'SC-22',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,977,'SC-23',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,978,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,980,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,982,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,983,'SC-24
DSPAV must be used.',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,988,'SC-28 [confidentiality AND integrity]','SC-28 Guidance: The organization supports the capability to use cryptographic mechanisms to protect information at rest. 
 
 SC-28 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-28 Guidance: Note that this enhancement requires the use of cryptography in accordance with SC-13.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,989,'SC-28(1)-1 [all information system components storing Federal data or system data that must be protected at the High or Moderate impact levels]','SC-28(1) Guidance: 
 Organizations should select a mode of protection that is targeted towards the relevant threat scenarios. 
 Examples:
 A. Organizations may apply full disk encryption (FDE) to a mobile device where the primary threat is loss of the device while storage is locked. 
 B. For a database application housing data for a single customer, encryption at the file system level would often provide more protection than FDE against the more likely threat of an intruder on the operating system accessing the storage.
 C. For a database application housing data for multiple customers, encryption with unique keys for each customer at the database record level may be more appropriate.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,991,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1017,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1018,'SC-39',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1035,'SC-45',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1036,'SC-45(1) (a) [At least hourly] [http://tf.nist.gov/tf-cgi/servers.cgi] 
 SC-45(1) (b) [any difference]','SC-45(1) Requirement: The service provider selects primary and secondary time servers used by the NIST Internet time service. The secondary server is selected from a different geographic region than the primary server.
 SC-45(1) Requirement: The service provider synchronizes the system clocks of network computers that run operating systems other than Windows to the Windows Server Domain Controller emulator or to the same time source for that server.
 SC-45(1) Guidance: Synchronization of system clocks improves the accuracy of log analysis.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1038,'DSPAV must be used.',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1053,'SI-3 (a) [signature based and non-signature based]
 SI-3 (c)(1)-1 [at least weekly] 
 SI-3 (c)(1)-2 [to include endpoints and network entry and exit points]
 SI-3 (c)(2)-1 [to include blocking and quarantining malicious code]
 SI-3 (c)(2)-2 [administrator or defined security personnel near-realtime]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1063,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1064,'SI-4','SI-4 Guidance: See US-CERT Incident Response Reporting Guidelines.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1065,'SI-4(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,1066,'SI-4(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1068,'SI-4(4) (b)-1 [continuously]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1069,'SI-4(5)','SI-4(5) Guidance: In accordance with the incident response plan.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1074,'SI-4 (10)','SI-4(10) Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf) and M-22-9 (https://www.whitehouse.gov/wp-content/uploads/2022/01/M-22-9.pdf).','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1075,'SI-4(11)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1076,'SI-4(12)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1078,'SI-4(14)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1079,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1080,'SI-4(16)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1082,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,1083,'SI-4 (19)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1084,'SI-4 (20)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1086,'SI-4 (22)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1087,'SI-4 (23)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1088,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1089,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1090,'SI-5 (a) [to include US-CERT and Cybersecurity and Infrastructure Security Agency (CISA) Directives]
 SI-5 (c) [to include system security personnel and administrators with configuration/patch-management responsibilities]','SI-5 Requirement: Service Providers must address the CISA Emergency and Binding Operational Directives applicable to their cloud service offering per FedRAMP guidance. This includes listing the applicable directives and stating compliance status.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1091,'SI-5(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1092,'SI-6 (b) -1 [to include upon system startup and/or restart] -2 [at least monthly]
 SI-6 (c) [to include system administrators and security personnel]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1096,'SI-7',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,1097,'SI-7(1)-2 [selection to include security relevant events] 
 SI-7(1)-3 [at least monthly]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1098,'SI-7(2) [to include the ISSO and/or similar role within the organization]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1101,'SI-7(5)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1103,'SI-7(7)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1104,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1105,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1106,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1111,'SI-7(15) [to include all software and firmware inside the boundary]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1113,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1114,'SI-8','SI-8 Guidance: 
 When CSO sends email on behalf of the government as part of the business offering, Control Description should include implementation of Domain-based Message Authentication, Reporting & Conformance (DMARC) on the sending domain for outgoing messages as described in DHS Binding Operational Directive (BOD) 18-1.
 https://cyber.dhs.gov/bod/18-1/ 
 
 SI-8 Guidance: CSPs should confirm DMARC configuration (where appropriate) to ensure that policy=reject and the rua parameter includes reports@dmarc.cyber.dhs.gov. DMARC compliance should be documented in the SI-8 control implementation solution description, and list the FROM: domain(s) that will be seen by email recipients.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,1116,'SI-8(2)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1119,'SI-10','SI-10 Requirement: Validate all information inputs and document any exceptions','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1122,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1124,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1125,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1126,'SI-11 (b) [to include the ISSO and/or similar role within the organization]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1127,'SI-12',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1130,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1141,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1142,'SI-16',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,1160,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1163,'SR-1 (a) [to include chief privacy and ISSO and/or similar role or designees]
 SR-1 (c)(1) [at least annually]
 SR-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1164,'SR-2 (b) [at least annually]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1165,'SR-2(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1166,'SR-3','SR-3 Requirement: CSO must document and maintain the supply chain custody, including replacement devices, to ensure the integrity of the devices before being introduced to the boundary.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1167,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1168,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1169,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1170,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1175,'SR-5',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,1176,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1177,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1178,'SR-6 [at least annually]','SR-6 Requirement: CSOs must ensure that their supply chain vendors build and test their systems in alignment with NIST SP 800-171 or a commensurate security and compliance framework. CSOs must ensure that vendors are compliant with physical facility access and logical access controls to supplied products.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1179,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1180,NULL,NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1181,'SR-8-1 [notification of supply chain compromises and results of assessment or audits]','SR-8 Requirement: CSOs must ensure and document how they receive notifications from their supply chain vendor of newly discovered vulnerabilities including zero-day vulnerabilities.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1182,'SR-9','SR-9 Requirement: CSOs must ensure vendors provide authenticity of software and patches supplied to the service provider including documenting the safeguards in place.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1183,'SR-9(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1184,'SR-10',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1185,'SR-11','SR-11 Requirement: CSOs must ensure that their supply chain vendors provide authenticity of software and patches and the vendor must have a plan to protect the development pipeline.','2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (7,1186,'SR-11(1)',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (7,1187,'SR-11(2) [all]',NULL,'2024-12-23 15:34:01.702601','2024-12-23 15:34:01.702601'),
	 (5,2,'AC-2 (h)(1) [twenty-four(24) hours]
 AC-2 (h)(2) [eight(8) hours]
 AC-2 (h)(3) [eight(8) hours]
 AC-2 (j) [quarterly for privileged access, annually for non-privileged access]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,3,'AC-2(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,4,'AC-2(2) [Selection: disables] 
 [Assignment: no more than 96 hours from last use]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,5,'AC-2(3) [24 hours for user accounts]
 AC-2(3) (d) [ninety(90) days] (See additional requirements and guidance.)','AC-2(3) Requirement: The service provider defines the time period for non-user accounts (e.g., accounts associated with devices). The time periods are approved and accepted by the JAB/AO. Where user management is a function of the service, reports of activity of consumer users shall be made available.
 AC-2(3) (d) Requirement: The service provider defines the time period of inactivity for device identifiers.
 Guidance: For DoD clouds, see DoD cloud website for specific DoD requirements that go above and beyond FedRAMP https://public.cyber.mil/dccs/.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,6,'AC-2(4)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,7,'AC-2(5) [for privileged users, it is the end of a user''s standard work period]','AC-2(5) Guidance: Should use a shorter timeframe than AC-12.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,9,'AC-2(7)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,11,'AC-2(9) [organization-defined need with justification statement that explains why such accounts are necessary]','AC-2(9) Requirement: Required if shared/group accounts are deployed','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,14,'AC-2(12) (b)[at a minimum, the ISSO and/or similar role within the organization]','AC-2(12) (a) Requirement: Required for privileged accounts.
 AC-2(12) (b) Requirement: Required for privileged accounts.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,15,'AC-2(13)-1 [one(1) hour]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,16,'AC-3',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,32,'AC-4',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,53,NULL,NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,65,'AC-5','AC-5 Guidance: CSPs have the option to provide a separation of duties matrix as an attachment to the SSP.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,66,'AC-6',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,67,'AC-6(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,68,'AC-6(2) [all security functions]','AC-6(2) Guidance: Examples of security functions include but are not limited to: establishing system accounts, configuring access authorizations (i.e., permissions, privileges), setting events to be audited, and setting intrusion detection parameters, system programming, system and security administration, other privileged functions.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,71,'AC-6(5)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,73,'AC-6(7) (a)-1 [at a minimum, annually]
 AC-6(7) (a)-2 [all users with privileges]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,75,'AC-6(9)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,76,'AC-6 (10)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,77,'AC-7
For privileged users, DOD limits to three unsuccessful attempts and requires an administrator to unlock. For nonprivileged users, if rate limiting, DOD will allow 10 attempts with the account automatically unlocked after 30 minutes. If rate limiting is not used, normal DSPAV will be required.','AC-7 Requirement: In alignment with NIST SP 800-63B','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,82,'AC-8 (a) [see additional Requirements and Guidance]
 AC-8 (c)(1) [see additional Requirements and Guidance]','AC-8 Requirement: The service provider shall determine elements of the cloud environment that require the System Use Notification control. The elements of the cloud environment that require System Use Notification are approved and accepted by the JAB/AO. 
 
 Requirement: The service provider shall determine how System Use Notification is going to be verified and provide appropriate periodicity of the check. The System Use Notification verification and periodicity are approved and accepted by the JAB/AO.
 
 Requirement: If not performed as part of a Configuration Baseline check, then there must be documented agreement on how to provide results of verification and the necessary periodicity of the verification by the service provider. The documented agreement on how to provide verification of the results are approved and accepted by the JAB/AO.
 
 Guidance: If performed as part of a Configuration Baseline check, then the % of items requiring setting that are checked and that pass (or fail) check can be provided.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,89,'AC-11 (a) [fifteen(15) minutes]; requiring the user to initiate a device lock before leaving the system unattended',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,90,'AC-11(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,91,'AC-12',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,96,'AC-14',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,110,'AC-17',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,111,'AC-17(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,112,'AC-17(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,113,'AC-17(3)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,114,'AC-17(4)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,121,'AC-18',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,122,'AC-18(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,124,'AC-18(3)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,127,'AC-19',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,132,'AC-19(5)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,133,'AC-20','AC-20 Guidance: The interrelated controls of AC-20, CA-3, and SA-9 should be differentiated as follows:
 AC-20 describes system access to and from external systems.
 CA-3 describes documentation of an agreement between the respective system owners when data is exchanged between the CSO and an external system.
 SA-9 describes the responsibilities of external system owners. These responsibilities would typically be captured in the agreement required by CA-3.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,134,'AC-20(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,135,'AC-20(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,139,'AC-21',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,142,'AC-22 (d) [at least quarterly]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,148,'AT-1 (c)(1) [at least every 3 years] 
 AT-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,149,'AT-2 (a)(1) [at least annually]
 AT-2 (c) [at least annually]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,151,'AT-2(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,152,'AT-2(3)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,156,'AT-3 (a)(1) [at least annually]
 AT-3 (b) [at least annually]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,162,'AT-4 (b) [at least one(1) year or 1 year after completion of a specific training program]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,165,'AU-1 (c)(1) [at least every 3 years] 
 AU-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,288,'CM-5(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,292,'CM-5(5) (b) [at least quarterly]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (4,75,'AC-6(9)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,76,'AC-6 (10)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (5,625,'PL-4 (c) [at least every 3 years]
 PL-4 (d) [at least annually and when the rules are revised or changed]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,166,'AU-2 (a) [successful and unsuccessful account logon events, account management events, object access, policy change, privilege functions, process tracking, and system events. For Web applications: all administrator activity, authentication checks, authorization checks, data deletions, data access, data changes, and permission changes]
 AU-2 (c) [organization-defined subset of the auditable events defined in AU-2a to be audited continually for each identified event].
 AU-2 (e) [annually and whenever there is a change in the threat environment]','AU-2 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO.
 AU-2 (e) Guidance: Annually or whenever changes in the threat environment are communicated to the service provider by the JAB/AO.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,171,'AU-3',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,172,'AU-3(1) [session, connection, transaction, or activity duration; for client-server transactions, the number of bytes received and bytes sent; additional informational messages to diagnose or identify the event; characteristics that describe or identify the object or resource being acted upon; individual identities of group account users; full-text of privileged commands]','AU-3(1) Guidance: For client-server transactions, the number of bytes sent and received gives bidirectional transfer information that can be helpful during an investigation or inquiry.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,175,'AU-4',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,177,'AU-5 (b) [overwrite oldest record]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,178,'CSP/CSO may use FedRAMP value.',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,183,'AU-6 (a)-1 [at least weekly]','AU-6 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO. In multi-tenant environments, capability and means for providing review, analysis, and reporting to consumer for data pertaining to consumer shall be documented.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,184,'AU-6(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,186,'AU-6(3)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,194,'AU-7',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,195,'AU-7(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,197,'AU-8 (b) [one second granularity of time measurement]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,200,'AU-9',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,204,'AU-9(4)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,214,'AU-11 [a time period in compliance with M-21-31]','AU-11 Requirement: The service provider retains audit records on-line for at least ninety days and further preserves audit records off-line for a period that is in accordance with NARA requirements. 
 AU-11 Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf)
 AU-11 Guidance: The service provider is encouraged to align with M-21-31 where possible','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,216,'AU-12 (a) [all information system and network components where audit capability is deployed/available]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,234,'CA-1 (c)(1) [at least every 3 years] 
 CA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,235,'CA-2 (d) [at least annually] 
 CA-2 (f) [individuals or roles to include FedRAMP PMO]','CA-2 Guidance: Reference FedRAMP Annual Assessment Guidance.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,236,'CA-2(1)','CA-2(1) Requirement: For JAB Authorization, must use an accredited 3PAO.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,238,'CA-2(3)-1 [any FedRAMP Accredited 3PAO]
 CA-2(3)-3 [the conditions of the JAB/AO in the FedRAMP Repository]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,239,'CA-3 (c) [at least annually and on input from JAB/AO]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,248,'CA-5 (b) [at least monthly]','CA-5 Requirement: POA&Ms must be provided at least monthly.
 CA-5 Guidance: Reference FedRAMP-POAM-Template','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,250,'CA-6 (e) [in accordance with OMB A-130 requirements or when a significant change occurs]','CA-6 (e) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F and according to FedRAMP Significant Change Policies and Procedures. The service provider describes the types of changes to the information system or the environment of operations that would impact the risk posture. The types of changes are approved and accepted by the JAB/AO.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,253,'CA-7 (g)-1 [to include JAB/AO]','CA-7 Requirement: Operating System, Database, Web Application, Container, and Service Configuration Scans: at least monthly. All scans performed by Independent Assessor: at least annually.
 CA-7 Requirement: CSOs with more than one agency ATO must implement a collaborative Continuous Monitoring (ConMon) approach described in the FedRAMP Guide for Multi-Agency Continuous Monitoring. This requirement applies to CSOs authorized via the Agency path as each agency customer is responsible for performing ConMon oversight. It does not apply to CSOs authorized via the JAB path because the JAB performs ConMon oversight.
 CA-7 Guidance: FedRAMP does not provide a template for the Continuous Monitoring Plan. CSPs should reference the FedRAMP Continuous Monitoring Strategy Guide when developing the Continuous Monitoring Plan.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,254,'CA-7(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,257,'CA-7(4)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,260,'CA-8-1 [at least annually]','CA-8 Guidance: Reference the FedRAMP Penetration Test Guidance.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,261,'CA-8(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,262,'CA-8(2)','CA-8(2) Guidance: See the FedRAMP Documents page> Penetration Test Guidance 
 https://www.FedRAMP.gov/documents/','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,264,'CA-9 (d) [at least annually]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,266,'CM-1 (c)(1) [at least every 3 years] 
 CM-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,267,'CM-2 (b)(1) [at least annually and when a significant change occurs]
 CM-2 (b)(2) [to include when directed by the JAB]','CM-2 (b)(1) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,269,'CM-2(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,270,'CM-2(3)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,274,'CM-2(7)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,275,'CM-3','CM-3 Requirement: The service provider establishes a central means of communicating major changes to or developments in the information system or environment of operations that may affect its services to the federal government and associated service consumers (e.g., electronic bulletin board, web status page). The means of communication are approved and accepted by the JAB/AO.
 CM-3 (e) Guidance: In accordance with record retention policies and procedures.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,277,'CM-3(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,279,'CM-3(4)-2 [Configuration control board (CCB) or similar (as defined in CM-3)]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,284,'CM-4',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,286,'CM-4(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,295,'CM-6','CM-6 (a) Requirement 1: The service provider shall use the DoD STIGs to establish configuration settings; Center for Internet Security up to Level 2 (CIS Level 2) guidelines shall be used if STIGs are not available; Custom baselines shall be used if CIS is not available.
 CM-6 (a) Requirement 2: The service provider shall ensure that checklists for configuration settings are Security Content Automation Protocol (SCAP) validated or SCAP compatible (if validated checklists are not available).
 
 CM-6 Guidance: Compliance checks are used to evaluate configuration settings and provide general insight into the overall effectiveness of configuration management activities. CSPs and 3PAOs typically combine compliance check findings into a single CM-6 finding, which is acceptable. However, for initial assessments, annual assessments, and significant change requests, FedRAMP requires a clear understanding, on a per-control basis, where risks exist. Therefore, 3PAOs must also analyze compliance check findings as part of the controls assessment. Where a direct mapping exists, the 3PAO must document additional findings per control in the corresponding SAR Risk Exposure Table (RET), which are then documented in the CSP’s Plan of Action and Milestones (POA&M). This will likely result in the details of individual control findings overlapping with those in the combined CM-6 finding, which is acceptable.
 During monthly continuous monitoring, new findings from CSP compliance checks may be combined into a single CM-6 POA&M item. CSPs are not required to map the findings to specific controls because controls are only assessed during initial assessments, annual assessments, and significant change requests.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,296,'CM-6(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,300,'CM-7','CM-7 (b) Requirement: The service provider shall use Security guidelines (See CM-6) to establish list of prohibited or restricted functions, ports, protocols, and/or services or establishes its own list of prohibited or restricted functions, ports, protocols, and/or services if STIGs or CIS is not available.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,301,'CM-7(1) (a) [at least annually]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,302,'CM-7(2)','CM-7(2) Guidance: This control refers to software deployment by CSP personnel into the production environment. The control requires a policy that states conditions for deploying software. This control shall be implemented in a technical manner on the information system to only allow programs to run that adhere to the policy (i.e. allow-listing). This control is not to be based off of strictly written policy on what is allowed or not allowed to run.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,305,'CM-7(5) (c) [at least quarterly or when there is a change]
DSPAV must be used.',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,310,'CM-8 (b) [at least monthly]','CM-8 Requirement: must be provided at least monthly or when there is a change.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,311,'CM-8(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,313,'CM-8(3) (a)-1 [automated mechanisms with a maximum five-minute delay in detection.] 
 CM-8(3) (a)-2 [continuously]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,320,'CM-9','CM-9 Guidance: FedRAMP does not provide a template for the Configuration Management Plan. However, NIST SP 800-128, Guide for Security-Focused Configuration Management of Information Systems, provides guidelines for the implementation of CM controls as well as a sample CMP outline in Appendix D of the Guide','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,322,'CM-10',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,324,'CM-11 (c) [Continuously (via CM-7(5))]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,328,'CM-12','CM-12 Requirement: According to FedRAMP Authorization Boundary Guidance','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,329,'CM-12(1)-1: [Federal data and system data that must be protected at the High or Moderate impact levels]','CM-12(1) Requirement: According to FedRAMP Authorization Boundary Guidance.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,332,'CP-1 (c)(1) [at least every 3 years] 
 CP-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,333,'CP-2 (d) [at least annually]','CP-2 Requirement: For JAB authorizations the contingency lists include designated FedRAMP personnel.
 
 CP-2 Requirement: CSPs must use the FedRAMP Information System Contingency Plan (ISCP) Template (available on the fedramp.gov: https://www.fedramp.gov/assets/resources/templates/SSP-A06-FedRAMP-ISCP-Template.docx).','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,334,'CP-2(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,336,'CP-2(3)-1 [all]
 CP-2(3)-2 [time period defined in service provider and organization SLA]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,341,'CP-2(8)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,342,'CP-3 (a)(1) [*See Additional Requirements]
 CP-3 (a)(3) [at least annually]
 CP-3 (b) [at least annually]','CP-3 (a) Requirement: Privileged admins and engineers must take the basic contingency training within 10 days. Consideration must be given for those privileged admins and engineers with critical contingency-related roles, to gain enough system context and situational awareness to understand the full impact of contingency training as it applies to their respective level. Newly hired critical contingency personnel must take this more in-depth training within 60 days of hire date when the training will have more impact.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,345,'CP-4 (a)-1 [at least annually] 
 CP-4 (a)-2 [functional exercises]','CP-4 (a) Requirement: The service provider develops test plans in accordance with NIST Special Publication 800-34 (as amended); plans are approved by the JAB/AO prior to initiating testing.
 
 CP-4 (b) Requirement: The service provider must include the Contingency Plan test results with the security package within the Contingency Plan-designated appendix (Appendix G, Contingency Plan Test Report).','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,346,'CP-4(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,352,'CP-6',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,353,'CP-6(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,355,'CP-6(3)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,356,'CP-7','CP-7 (a) Requirement: The service provider defines a time period consistent with the recovery time objectives and business impact analysis.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,357,'CP-7(1)','CP-7(1) Guidance: The service provider may determine what is considered a sufficient degree of separation between the primary and alternate processing sites, based on the types of threats that are of concern. For one particular type of threat (i.e., hostile cyber attack), the degree of separation between sites will be less relevant.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,358,'CP-7(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,359,'CP-7(3)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,363,'CP-8','CP-8 Requirement: The service provider defines a time period consistent with the recovery time objectives and business impact analysis.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,364,'CP-8(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,365,'CP-8(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,619,'PL-1 (c)(1) [at least every 3 years] 
 PL-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,620,'PL-2 (a)(14) [to include chief privacy and ISSO and/or similar role or designees]
 PL-2 (b) [to include chief privacy and ISSO and/or similar role]
 PL-2 (c) [at least annually]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,369,'CP-9 (a)-2 [daily incremental; weekly full]
 CP-9 (b) [daily incremental; weekly full]
 CP-9 (c) [daily incremental; weekly full]','CP-9 Requirement: The service provider shall determine what elements of the cloud environment require the Information System Backup control. The service provider shall determine how Information System Backup is going to be verified and appropriate periodicity of the check.
 CP-9 (a) Requirement: The service provider maintains at least three backup copies of user-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (b) Requirement: The service provider maintains at least three backup copies of system-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (c) Requirement: The service provider maintains at least three backup copies of information system documentation including security information (at least one of which is available online) or provides an equivalent alternative.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,370,'CP-9(1) [at least annually]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,377,'CP-9(8) [all backup files]','CP-9(8) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,378,'CP-10',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,380,'CP-10(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,388,'IA-1 (c)(1) [at least every 3 years] 
 IA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,389,'IA-2','IA-2 Requirement: For all control enhancements that specify multifactor authentication, the implementation must adhere to the Digital Identity Guidelines specified in NIST Special Publication 800-63B.
 
 IA-2 Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2 Requirement: All uses of encrypted virtual private networks must meet all applicable Federal requirements and architecture, dataflow, and security and privacy controls must be documented, assessed, and authorized to operate.
 
 IA-2 Guidance: “Phishing-resistant" authentication refers to authentication processes designed to detect and prevent disclosure of authentication secrets and outputs to a website or application masquerading as a legitimate system.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,390,'IA-2(1)','IA-2(1) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(1) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(1) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,391,'IA-2(2)','IA-2(2) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(2) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(2) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,394,'IA-2(5)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,395,'IA-2(6)-1 [local, network and remote]
 IA-2(6)-2 [privileged accounts; non-privileged accounts]
 IA-2(6) (b) [FIPS-validated or NSA-approved cryptography]','IA-2(6) Guidance: PIV=separate device. Please refer to NIST SP 800-157 Guidelines for Derived Personal Identity Verification (PIV) Credentials.
 
 IA-2(6) Guidance: See SC-13 Guidance for more information on FIPS-validated or NSA-approved cryptography.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,397,'IA-2(8) [privileged accounts; non-privileged accounts]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,401,'IA-2(12)','IA-2(12) Guidance: Include Common Access Card (CAC), i.e., the DoD technical implementation of PIV/FIPS 201/HSPD-12.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,403,'IA-3',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,408,'IA-4 (a) [at a minimum, the ISSO (or similar role within the organization)] 
 IA-4 (d) [at least two(2) years]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,412,'IA-4(4) [contractors; foreign nationals]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,418,'IA-5','IA-5 Requirement: Authenticators must be compliant with NIST SP 800-63-3 Digital Identity Guidelines IAL, AAL, FAL level 3. Link https://pages.nist.gov/800-63-3
 
 IA-5 Guidance: SP 800-63C Section 6.2.3 Encrypted Assertion requires that authentication assertions be encrypted when passed through third parties, such as a browser. For example, a SAML assertion can be encrypted using XML-Encryption, or an OpenID Connect ID Token can be encrypted using JSON Web Encryption (JWE).','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,419,'IA-5(1)
DSPAV must be used.','IA-5(1) Requirement: Password policies must be compliant with NIST SP 800-63B for all memorized, lookup, out-of-band, or One-Time-Passwords (OTP). Password policies shall not enforce special character or minimum password rotation requirements for memorized secrets of users.
 
 IA-5(1) (h) Requirement: For cases where technology doesn’t allow multi-factor authentication, these rules should be enforced: must have a minimum length of 14 characters and must support all printable ASCII characters.
  
 For emergency use accounts, these rules should be enforced: must have a minimum length of 14 characters, must support all printable ASCII characters, and passwords must be changed if used. 
 
 IA-5(1) Guidance: Note that (c) and (d) require the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,420,'IA-5(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,424,'IA-5(6)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,425,'IA-5(7)','IA-5(7) Guidance: In this context, prohibited static storage refers to any storage where unencrypted authenticators, such as passwords, persist beyond the time required to complete the access process.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,437,'IA-6',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,438,'IA-7',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,439,'IA-8',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,440,'IA-8(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,441,'IA-8(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,443,'IA-8(4)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,450,'IA-11','IA-11 Guidance:
 The fixed time period cannot exceed the limits set in SP 800-63. At this writing they are:
 - AAL3 (high baseline)
  -- 12 hours or
  -- 15 minutes of inactivity','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,451,'IA-12','IA-12 Additional FedRAMP Requirements and Guidance:
 Guidance: In accordance with NIST SP 800-63A Enrollment and Identity Proofing','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,453,'IA-12(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,454,'IA-12(3)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,456,'IA-12(5)','IA-12(5) Additional FedRAMP Requirements and Guidance:
 Guidance: In accordance with NIST SP 800-63A Enrollment and Identity Proofing','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,458,'IR-1 (c)(1) [at least every 3 years] 
 IR-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,459,'IR-2 (a)(1) [ten(10) days for privileged users, thirty(30) days for Incident Response roles]
 IR-2 (a)(3) [at least annually]
 IR-2 (b) [at least annually]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,802,'DSPAV must be used.',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (4,359,'CP-7(3)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (5,463,'IR-3-1 [functional, at least annually]','IR-3-2 Requirement: The service provider defines tests and/or exercises in accordance with NIST Special Publication 800-61 (as amended). Functional testing must occur prior to testing for initial authorization. Annual functional testing may be concurrent with required penetration tests (see CA-8). The service provider provides test plans to the JAB/AO annually. Test plans are approved and accepted by the JAB/AO prior to test commencing.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,465,'IR-3(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,467,'IR-4','IR-4 Requirement: The FISMA definition of "incident" shall be used: "An occurrence that actually or imminently jeopardizes, without lawful authority, the confidentiality, integrity, or availability of information or an information system; or constitutes a violation or imminent threat of violation of law, security policies, security procedures, or acceptable use policies."
 
 IR-4 Requirement: The service provider ensures that individuals conducting incident handling meet personnel security requirements commensurate with the criticality/sensitivity of the information being processed, stored, and transmitted by the information system.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,468,'IR-4(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,483,'IR-5',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,485,'IR-6 (a) [US-CERT incident reporting timelines as specified in NIST Special Publication 800-61 (as amended)]','IR-6 Requirement: Reports security incident information according to FedRAMP Incident Communications Procedure.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,486,'IR-6(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,488,'IR-6(3)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,489,'IR-7',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,490,'IR-7(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,492,'IR-8 (a)(9)-2 [at least annually]
 IR-8 (b) [see additional FedRAMP Requirements and Guidance]
 IR-8 (d) [see additional FedRAMP Requirements and Guidance]','IR-8 (b) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.
 IR-8 (d) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,494,'IR-9',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,496,'IR-9(2) [at least annually]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,497,'IR-9(3)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,498,'IR-9(4)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,500,'MA-1 (c)(1) [at least every 3 years]
 MA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,501,'MA-2',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,504,'MA-3 (b) [at least annually]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,505,'MA-3(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,506,'MA-3(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,507,'MA-3(3) (d) [the information owner]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,511,'MA-4',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,519,'MA-5',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,520,'MA-5(1)
DSPAV must be used.','MA-5(1) Requirement: Only MA-5(1) (a)(1) is required by FedRAMP Moderate Baseline','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,524,NULL,NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,525,'MA-6-2 [a timeframe to support advertised uptime and availability]
CSP/CSO may use FedRAMP value.',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,530,'MP-1 (c)(1) [at least every 3 years] 
 MP-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,531,'MP-2-1 [all types of digital and/or non-digital media containing sensitive information]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,534,'MP-3 (b)-1 [no removable media types]
 MP-3 (b)-2 [organization-defined security safeguards not applicable]','MP-3 (b) Guidance: Second parameter not-applicable','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,535,'MP-4 (a)-1 [all types of digital and non-digital media with sensitive information] 
 MP-4 (a)-2 [see additional FedRAMP requirements and guidance]','MP-4 (a) Requirement: The service provider defines controlled areas within facilities where the information and information system reside.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,538,'MP-5 (a) [all media with sensitive information] [prior to leaving secure/controlled environment: for digital media, encryption in compliance with Federal requirements and utilizes FIPS validated or NSA approved cryptography (see SC-13.); for non-digital media, secured in locked container]','MP-5 (a) Requirement: The service provider defines security measures to protect digital and non-digital media in transport. The security measures are approved and accepted by the JAB/AO.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,543,'MP-6 (a)-2 [techniques and procedures IAW NIST SP 800-88 Section 4: Reuse and Disposal of Storage Media and Hardware]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,552,'MP-7',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,560,'PE-1 (c)(1) [at least every 3 years] 
 PE-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,561,'PE-2 (c) [at least annually]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,565,'PE-3 (a)(2) [CSP defined physical access control systems/devices AND guards]
 PE-3 (d) [in all circumstances within restricted access area where the information system resides]
 PE-3 (f)-2 [at least annually]
 PE-3 (g) [at least annually or earlier as required by a security relevant event.]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,574,'PE-4',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,575,'PE-5',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,579,'PE-6 (b)-1 [at least monthly]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,580,'PE-6(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,585,'PE-8 (a) [for a minimum of one(1) year]
 PE-8 (b) [at least monthly]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,589,'PE-9',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,592,'PE-10 (b) [near more than one egress point of the IT area and ensures it is labeled and protected by a cover to prevent accidental shut-off]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,594,'PE-11',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,597,'PE-12',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,599,'PE-13',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,600,'PE-13(1) -1 [service provider building maintenance/physical security personnel]
 PE-13(1) -2 [service provider emergency responders with incident response responsibilities]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,601,'PE-13(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,604,'PE-14 (a) [consistent with American Society of Heating, Refrigerating and Air-conditioning Engineers (ASHRAE) document entitled Thermal Guidelines for Data Processing Environments]
 
 PE-14 (b) [continuously]','PE-14 (a) Requirement: The service provider measures temperature at server inlets and humidity levels by dew point.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,607,'PE-15
DSPAV must be used.',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,609,'PE-16 (a) [all information system components]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,610,'PE-17',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,630,'PL-8 (b) [at least annually and when a significant change occurs]','PL-8 (b) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,634,'PL-10','PL-10 Requirement: Select the appropriate FedRAMP Baseline','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,635,'PL-11',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,673,'PS-1 (c)(1) [at least every 3 years] 
 PS-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,674,'PS-2 (c) [at least every three years]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,675,'PS-3 (b) [for national security clearances; a reinvestigation is required during the fifth(5th) year for top secret security clearance, the tenth(10th) year for secret security clearance, and fifteenth(15th) year for confidential security clearance.
 
 For moderate risk law enforcement and high impact public trust level, a reinvestigation is required during the fifth(5th) year. There is no reinvestigation for other moderate risk positions or any low risk positions]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,679,'All information systems.
 Users: U.S. citizens, U.S. nationals, or U.S. persons, foreign personnel as allowed by current DOD polices with AO approval.
 Administrators: U.S. citizens, U.S. nationals, or U.S. persons.',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,680,'PS-4 (a) [four(4) hours]
CSP/CSO may use FedRAMP value.',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,683,'PS-5 (b)-2 [twenty-four(24) hours] 
 PS-5 (d)-1 [including access control personnel responsible for the system]
 PS-5 (d)-2 [twenty-four(24) hours]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,684,'PS-6 (b) [at least annually]
 PS-6 (c)(2) [at least annually and any time there is a change to the user''s level of access]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,688,'PS-7 (d)-1 [including access control personnel responsible for the system and/or facilities, as appropriate]
 PS-7 (d)-2 [within twenty-four(24) hours]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,689,'PS-8 (b)-1 [to include the ISSO and/or similar role within the organization]
 PS-8 (b)-2 [24 hours]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,690,'PS-9',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,712,'RA-1 (c)(1) [at least every 3 years] 
 RA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,713,'RA-2',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,715,'RA-3 (c) [security assessment report]
 
 RA-3 (d) [at least every three(3) years and when a significant change occurs]
 
 RA-3 (f) [at least every three(3) years]','RA-3 Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.
 RA-3 (e) Requirement: Include all Authorizing Officials; for JAB authorizations to include FedRAMP.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,716,'RA-3(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,721,'RA-5 (a) [monthly operating system/infrastructure; monthly web applications (including APIs) and databases]
 RA-5 (d) [high-risk vulnerabilities mitigated within thirty(30) days from date of discovery; moderate-risk vulnerabilities mitigated within ninety(90) days from date of discovery; low risk vulnerabilities mitigated within one hundred and eighty(180) days from date of discovery]','RA-5 Guidance: See the FedRAMP Documents page> Vulnerability Scanning Requirements 
 https://www.FedRAMP.gov/documents/
 RA-5 (a) Requirement: an accredited independent assessor scans operating systems/infrastructure, web applications, and databases once annually.
 RA-5 (d) Requirement: If a vulnerability is listed among the CISA Known Exploited Vulnerability (KEV) Catalog (https://www.cisa.gov/known-exploited-vulnerabilities-catalog) the KEV remediation date supersedes the FedRAMP parameter requirement.
 RA-5 (e) Requirement: to include all Authorizing Officials; for JAB authorizations to include FedRAMP
 
 RA-5 Guidance: Informational findings from a scanner are detailed as a returned result that holds no vulnerability risk or severity and for FedRAMP does not require an entry onto the POA&M or entry onto the RET during any assessment phase.
 Warning findings, on the other hand, are given a risk rating (low, moderate, high or critical) by the scanning solution and should be treated like any other finding with a risk or severity rating for tracking purposes onto either the POA&M or RET depending on when the findings originated (during assessments or during monthly continuous monitoring). If a warning is received during scanning, but further validation turns up no actual issue then this item should be categorized as a false positive. If this situation presents itself during an assessment phase (initial assessment, annual assessment or any SCR), follow guidance on how to report false positives in the Security Assessment Report (SAR). If this situation happens during monthly continuous monitoring, a deviation request will need to be submitted per the FedRAMP Vulnerability Deviation Request Form.
 Warnings are commonly associated with scanning solutions that also perform compliance scans, and if the scanner reports a “warning” as part of the compliance scanning of a CSO, follow guidance surrounding the tracking of compliance findings during either the assessment phases (initial assessment, annual assessment or any SCR) or monthly continuous monitoring as it applies. Guidance on compliance scan findings can be found by searching on “Tracking of Compliance Scans” in FAQs.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,723,'RA-5(2) [within 24 hours prior to
 running scans]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,724,'RA-5(3)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,726,'RA-5(5)-1 [all components that support authentication] 
 RA-5(5)-2 [all scans]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,732,'RA-5(11)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,734,'RA-7',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,736,'RA-9',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,738,'SA-1 (c)(1) [at least every 3 years] 
 SA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,739,'SA-2',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,740,'SA-3',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,744,'SA-4','SA-4 Requirement: The service provider must comply with Federal Acquisition Regulation (FAR) Subpart 7.103, and Section 889 of the John S. McCain National Defense Authorization Act (NDAA) for Fiscal Year 2019 (Pub. L. 115-232), and FAR Subpart 4.21, which implements Section 889 (as well as any added updates related to FISMA to address security concerns in the system acquisitions process).
 
 SA-4 Guidance: The use of Common Criteria (ISO/IEC 15408) evaluated products is strongly preferred.
 See https://www.niap-ccevs.org/Product/index.cfm or https://www.commoncriteriaportal.org/products/.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,745,'SA-4(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,746,'SA-4(2)-1 [at a minimum to include security-relevant external system interfaces; high-level design; low-level design; source code or network and data flow diagram; [organization-defined design/implementation information]]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,749,'DSPAV must be used.',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,753,'SA-4(9)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,754,'SA-4 (10)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,757,'SA-5 (d) [at a minimum, the ISSO (or similar role within the organization)]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,765,'SA-8',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,799,'SA-9 (a) [Appropriate FedRAMP Security Controls Baseline (s) if Federal information is processed or stored within the external system]
 SA-9 (c) [Federal/FedRAMP Continuous Monitoring requirements must be met for external systems where Federal information is processed or stored]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,800,'SA-9(1)
DSPAV must be used.',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,801,'SA-9(2) [all external systems where Federal information is processed or stored]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,804,'SA-9(5)-1 [information processing, information or data, AND system services]
SA-9 (5)-1 [information processing, information or data, AND system services].
 SA-9 (5)-2 [U.S./U.S. Territories or geographic locations where there is U.S. jurisdiction].
 SA-9 (5)-3 [all data, systems, or services].',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,808,'SA-10 (a) [development, implementation, AND operation]','SA-10 (e) Requirement: track security flaws and flaw resolution within the system, component, or service and report findings to organization-defined personnel, to include FedRAMP.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,816,'SA-11',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,817,'SA-11(1)','SA-11(1) Requirement: The service provider must document its methodology for reviewing newly developed code for the Service in its Continuous Monitoring Plan.
 
 If Static code analysis cannot be performed (for example, when the source code is not available), then dynamic code analysis must be performed (see SA-11(8))','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,818,'SA-11(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,845,'SA-15 (b)-1 [frequency at least annually]
 SA-15 (b)-2 [FedRAMP Security Authorization requirements]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,848,'SA-15(3)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,880,'SA-22',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,883,'SC-1 (c)(1) [at least every 3 years] 
 SC-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,884,'SC-2',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,893,'SC-4',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,896,'SC-5 (a)-1 [Protect against] 
 SC-5 (a)-2 [at a minimum: ICMP (ping) flood, SYN flood, slowloris, buffer overflow attack, and volume attack]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,901,'SC-7','SC-7 (b) Guidance: SC-7 (b) should be met by subnet isolation. A subnetwork (subnet) is a physically or logically segmented section of a larger network defined at TCP/IP Layer 3, to both minimize traffic and, important for a FedRAMP Authorization, add a crucial layer of network isolation. Subnets are distinct from VLANs (Layer 2), security groups, and VPCs and are specifically required to satisfy SC-7 part b and other controls. See the FedRAMP Subnets White Paper (https://www.fedramp.gov/assets/resources/documents/FedRAMP_subnets_white_paper.pdf) for additional information.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,904,'SC-7(3)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,905,'SC-7(4) (e) [at least every 180 days or whenever there is a change in the threat environment that warrants a review of the exceptions]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,906,'SC-7(5) [any systems]','SC-7(5) Guidance: For JAB Authorization, CSPs shall include details of this control in their Architecture Briefing','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,908,'SC-7(7)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,909,'SC-7(8)-2 [any network outside of organizational control and any network outside the authorization boundary]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,913,'SC-7(12)-1 [Host Intrusion Prevention System (HIPS), Host Intrusion Detection System (HIDS), or minimally a host-based firewall]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,919,'SC-7(18)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,931,'SC-8 [confidentiality AND integrity]','SC-8 Guidance:
 For each instance of data in transit, confidentiality AND integrity should be through cryptography as specified in SC-8(1), physical means as specified in SC-8(5), or in combination.
 
 For clarity, this control applies to all data in transit. Examples include the following data flows:
  - Crossing the system boundary
  - Between compute instances - including containers
  - From a compute instance to storage
  - Replication between availability zones
  - Transmission of backups to storage
  - From a load balancer to a compute instance
  - Flows from management tools required for their work – e.g. log collection, scanning, etc.
 
 The following applies only when choosing SC-8(5) in lieu of SC-8(1).
 FedRAMP-Defined Assignment / Selection Parameters 
 SC-8(5)-1 [a hardened or alarmed carrier Protective Distribution System (PDS) when outside of Controlled Access Area (CAA)]
 SC-8(5)-2 [prevent unauthorized disclosure of information AND detect changes to information] 
 
 SC-8 Guidance:
 SC-8(5) applies when physical protection has been selected as the method to protect confidentiality and integrity. For physical protection, data in transit must be in either a Controlled Access Area (CAA), or a Hardened or alarmed PDS.
 
 Hardened or alarmed PDS: Shall be as defined in SECTION X - CATEGORY 2 PDS INSTALLATION GUIDANCE of CNSSI No.7003, titled PROTECTED DISTRIBUTION SYSTEMS (PDS). Per the CNSSI No. 7003 Section VIII, PDS must originate and terminate in a Controlled Access Area (CAA). 
 
 Controlled Access Area (CAA): Data will be considered physically protected, and in a CAA if it meets Section 2.3 of the DHS’s Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies. CSPs can meet Section 2.3 of the DHS’ recommended practice by satisfactory implementation of the following controls PE-2(1), PE-2(2), PE-2(3), PE-3(2), PE-3(3), PE-6(2), and PE-6(3).
 
 Note: When selecting SC-8(5), the above SC-8(5), and the above referenced PE controls must be added to the SSP.
 
 CNSSI No.7003 can be accessed here:
 https://www.dcsa.mil/Portals/91/documents/ctp/nao/CNSSI_7003_PDS_September_2015.pdf 
 
 DHS Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies can be accessed here:
 https://us-cert.cisa.gov/sites/default/files/FactSheets/NCCIC%20ICS_FactSheet_Defense_in_Depth_Strategies_S508C.pdf','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,932,'SC-8(1) [prevent unauthorized disclosure of information AND detect changes to information]','SC-8(1) Requirement: Please ensure SSP Section 10.3 Cryptographic Modules Implemented for Data At Rest (DAR) and Data In Transit (DIT) is fully populated for reference in this control.
 
 SC-8(1) Guidance:
 See M-22-9, including "Agencies encrypt all DNS requests and HTTP traffic within their environment"
 
 SC-8(1) applies when encryption has been selected as the method to protect confidentiality and integrity. Otherwise refer to SC-8(5). SC-8(1) is strongly encouraged.
 
 SC-8(1) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)
 
 SC-8(1) Guidance: When leveraging encryption from the underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,938,'SC-10 [no longer than ten(10) minutes for privileged sessions and no longer than fifteen(15) minutes for user sessions]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,941,'SC-12 [In accordance with Federal requirements]','SC-12 Guidance: See references in NIST 800-53 documentation.
 
 SC-12 Guidance: Must meet applicable Federal Cryptographic Requirements. See References Section of control.
 
 SC-12 Guidance: Wildcard certificates may be used internally within the system, but are not permitted for external customer access to the system.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,947,NULL,NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1087,'SI-4 (23)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1090,'SI-5 (a) [to include US-CERT and Cybersecurity and Infrastructure Security Agency (CISA) Directives]
 SI-5 (c) [to include system security personnel and administrators with configuration/patch-management responsibilities]','SI-5 Requirement: Service Providers must address the CISA Emergency and Binding Operational Directives applicable to their cloud service offering per FedRAMP guidance. This includes listing the applicable directives and stating compliance status.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1092,'SI-6 (b) -1 [to include upon system startup and/or restart] -2 [at least monthly]
 SI-6 (c) [to include system administrators and security personnel]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1096,'SI-7',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1097,'SI-7(1)-2 [selection to include security relevant events] 
 SI-7(1)-3 [at least monthly]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1103,'SI-7(7)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (4,203,'AU-9(3)','AU-9(3) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,204,'AU-9(4)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (5,948,'SC-13 (b) [FIPS-validated or NSA-approved cryptography]','SC-13 Guidance:
 This control applies to all use of cryptography. In addition to encryption, this includes functions such as hashing, random number generation, and key generation. Examples include the following:
  - Encryption of data
  - Decryption of data
  - Generation of one time passwords (OTPs) for MFA
  - Protocols such as TLS, SSH, and HTTPS
 
 The requirement for FIPS 140 validation, as well as timelines for acceptance of FIPS 140-2, and 140-3 can be found at the NIST Cryptographic Module Validation Program (CMVP).
 https://csrc.nist.gov/projects/cryptographic-module-validation-program 
 
 SC-13 Guidance: For NSA-approved cryptography, the National Information Assurance Partnership (NIAP) oversees a national program to evaluate Commercial IT Products for Use in National Security Systems. The NIAP Product Compliant List can be found at the following location:
 https://www.niap-ccevs.org/Product/index.cfm 
 
 SC-13 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-13 Guidance:
 Moving to non-FIPS CM or product is acceptable when:
 - FIPS validated version has a known vulnerability
 - Feature with vulnerability is in use
 - Non-FIPS version fixes the vulnerability
 - Non-FIPS version is submitted to NIST for FIPS validation
 - POA&M is added to track approval, and deployment when ready
 
 SC-13 Guidance: At a minimum, this control applies to cryptography in use for the following controls: AU-9(3), CP-9(8), IA-2(6), IA-5(1), MP-5, SC-8(1), and SC-28(1).','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,954,'SC-15 (a) [no exceptions for computing devices]','SC-15 Requirement: The information system provides disablement (instead of physical disconnect) of collaborative computing devices in a manner that supports ease of use.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,963,'SC-17
DODI 8520.02, Public Key Infrastructure (PKI) and Public Key Enabling (PKE).',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,964,'SC-18',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,966,'DSPAV must be used.',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,971,'SC-20','SC-20 Requirement:
 Control Description should include how DNSSEC is implemented on authoritative DNS servers to supply valid responses to external DNSSEC requests.
 
 SC-20 Requirement: Authoritative DNS servers must be geolocated in accordance with SA-9(5).
 
 SC-20 Guidance: SC-20 applies to use of external authoritative DNS to access a CSO from outside the boundary.
 
 SC-20 Guidance:
 External authoritative DNS servers may be located outside an authorized environment. Positioning these servers inside an authorized boundary is encouraged.
 
 SC-20 Guidance: CSPs are recommended to self-check DNSSEC configuration through one of many available analyzers such as Sandia National Labs (https://dnsviz.net)','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,974,'SC-21','SC-21 Requirement:
 Control description should include how DNSSEC is implemented on recursive DNS servers to make DNSSEC requests when resolving DNS requests from internal components to domains external to the CSO boundary.
 - If the reply is signed, and fails DNSSEC, do not use the reply
 - If the reply is unsigned:
  -- CSP chooses the policy to apply
 
 SC-21 Requirement:
 Internal recursive DNS servers must be located inside an authorized environment. It is typically within the boundary, or leveraged from an underlying IaaS/PaaS.
 
 SC-21 Guidance: Accepting an unsigned reply is acceptable
 
 SC-21 Guidance:
 SC-21 applies to use of internal recursive DNS to access a domain outside the boundary by a component inside the boundary.
 - DNSSEC resolution to access a component inside the boundary is excluded.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,976,'SC-22',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,977,'SC-23',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,983,'DSPAV must be used.',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,988,'SC-28 [confidentiality AND integrity]','SC-28 Guidance: The organization supports the capability to use cryptographic mechanisms to protect information at rest. 
 
 SC-28 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-28 Guidance: Note that this enhancement requires the use of cryptography in accordance with SC-13.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,989,'SC-28(1)-1 [all information system components storing Federal data or system data that must be protected at the High or Moderate impact levels]','SC-28(1) Guidance: 
 Organizations should select a mode of protection that is targeted towards the relevant threat scenarios. 
 Examples:
 A. Organizations may apply full disk encryption (FDE) to a mobile device where the primary threat is loss of the device while storage is locked. 
 B. For a database application housing data for a single customer, encryption at the file system level would often provide more protection than FDE against the more likely threat of an intruder on the operating system accessing the storage.
 C. For a database application housing data for multiple customers, encryption with unique keys for each customer at the database record level may be more appropriate.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1018,'SC-39',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1035,'SC-45',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1036,'SC-45(1) (a) [At least hourly] [http://tf.nist.gov/tf-cgi/servers.cgi] 
 SC-45(1) (b) [any difference]','SC-45(1) Requirement: The service provider selects primary and secondary time servers used by the NIST Internet time service. The secondary server is selected from a different geographic region than the primary server.
 SC-45(1) Requirement: The service provider synchronizes the system clocks of network computers that run operating systems other than Windows to the Windows Server Domain Controller emulator or to the same time source for that server.
 SC-45(1) Guidance: Synchronization of system clocks improves the accuracy of log analysis.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1038,'DSPAV must be used.',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1045,'SI-1 (c)(1) [at least every 3 years] 
 SI-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1046,'SI-2 (c) [within thirty(30) days of release of updates]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1048,'SI-2(2)-2 [at least monthly]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1049,'SI-2(3)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1053,'SI-3 (a) [signature based and non-signature based]
 SI-3 (c)(1)-1 [at least weekly] 
 SI-3 (c)(1)-2 [to include endpoints and network entry and exit points]
 SI-3 (c)(2)-1 [to include blocking and quarantining malicious code]
 SI-3 (c)(2)-2 [administrator or defined security personnel near-realtime]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,1064,'SI-4','SI-4 Guidance: See US-CERT Incident Response Reporting Guidelines.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1065,'SI-4(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1066,'SI-4(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1068,'SI-4(4) (b)-1 [continuously]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1069,'SI-4(5)','SI-4(5) Guidance: In accordance with the incident response plan.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1080,'SI-4(16)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1082,NULL,NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1114,'SI-8','SI-8 Guidance: 
 When CSO sends email on behalf of the government as part of the business offering, Control Description should include implementation of Domain-based Message Authentication, Reporting & Conformance (DMARC) on the sending domain for outgoing messages as described in DHS Binding Operational Directive (BOD) 18-1.
 https://cyber.dhs.gov/bod/18-1/ 
 
 SI-8 Guidance: CSPs should confirm DMARC configuration (where appropriate) to ensure that policy=reject and the rua parameter includes reports@dmarc.cyber.dhs.gov. DMARC compliance should be documented in the SI-8 control implementation solution description, and list the FROM: domain(s) that will be seen by email recipients.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1116,'SI-8(2)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1119,'SI-10','SI-10 Requirement: Validate all information inputs and document any exceptions','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,1126,'SI-11 (b) [to include the ISSO and/or similar role within the organization]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1127,'SI-12',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1142,'SI-16',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1163,'SR-1 (a) [to include chief privacy and ISSO and/or similar role or designees]
 SR-1 (c)(1) [at least every 3 years] 
 SR-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1164,'SR-2 (b) [at least annually]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1165,'SR-2(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1166,'SR-3','SR-3 Requirement: CSO must document and maintain the supply chain custody, including replacement devices, to ensure the integrity of the devices before being introduced to the boundary.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1175,'SR-5',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1178,'SR-6 [at least annually]','SR-6 Requirement: CSOs must ensure that their supply chain vendors build and test their systems in alignment with NIST SP 800-171 or a commensurate security and compliance framework. CSOs must ensure that vendors are compliant with physical facility access and logical access controls to supplied products.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1181,'SR-8-1 [notification of supply chain compromises and results of assessment or audits]','SR-8 Requirement: CSOs must ensure and document how they receive notifications from their supply chain vendor of newly discovered vulnerabilities including zero-day vulnerabilities.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,1184,'SR-10',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1185,'SR-11','SR-11 Requirement: CSOs must ensure that their supply chain vendors provide authenticity of software and patches and the vendor must have a plan to protect the development pipeline.','2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1186,'SR-11(1)',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1187,'SR-11(2) [all]',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1189,'SR-12',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1190,'GRR-1',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1191,'GRR-2',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1192,'GRR-3',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1193,'GRR-4',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (5,1194,'GRR-5',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (5,1199,'GRR-10',NULL,'2024-12-23 15:34:55.247468','2024-12-23 15:34:55.247468'),
	 (4,1,'AC-1 (c)(1) [at least annually]
 AC-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,2,'AC-2 (h)(1) [twenty-four(24) hours]
 AC-2 (h)(2) [eight(8) hours]
 AC-2 (h)(3) [eight(8) hours]
 AC-2 (j) [monthly for privileged accessed, every six(6) months for non-privileged access]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,3,'AC-2(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,4,'AC-2(2) [Selection: disables] 
 [Assignment: no more than 24 hours from last use]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,5,'AC-2(3) [24 hours for user accounts]
 AC-2(3) (d) [thirty-five(35) days] (See additional requirements and guidance.)','AC-2(3) Requirement: The service provider defines the time period for non-user accounts (e.g., accounts associated with devices). The time periods are approved and accepted by the JAB/AO. Where user management is a function of the service, reports of activity of consumer users shall be made available.
 AC-2(3) (d) Requirement: The service provider defines the time period of inactivity for device identifiers.
 Guidance: For DoD clouds, see DoD cloud website for specific DoD requirements that go above and beyond FedRAMP https://public.cyber.mil/dccs/.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,6,'AC-2(4)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,7,'AC-2(5) [inactivity is anticipated to exceed Fifteen(15) minutes]','AC-2(5) Guidance: Should use a shorter timeframe than AC-12.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,9,'AC-2(7)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,11,'AC-2(9) [organization-defined need with justification statement that explains why such accounts are necessary]','AC-2(9) Requirement: Required if shared/group accounts are deployed','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,13,'AC-2(11)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,14,'AC-2(12) (b)[at a minimum, the ISSO and/or similar role within the organization]','AC-2(12) (a) Requirement: Required for privileged accounts.
 AC-2(12) (b) Requirement: Required for privileged accounts.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,15,'AC-2(13)-1 [one(1) hour]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,16,'AC-3',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,32,'AC-4',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,36,'AC-4(4)-1 [intrusion detection mechanisms]','AC-4(4) Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf) and M-22-9 (https://www.whitehouse.gov/wp-content/uploads/2022/01/M-22-9.pdf).','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,53,NULL,NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,65,'AC-5','AC-5 Guidance: CSPs have the option to provide a separation of duties matrix as an attachment to the SSP.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,66,'AC-6',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,67,'AC-6(1) (a) [all functions not publicly accessible]
 AC-6(1) (b) [all security-relevant information not publicly available]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,68,'AC-6(2) [all security functions]','AC-6(2) Guidance: Examples of security functions include but are not limited to: establishing system accounts, configuring access authorizations (i.e., permissions, privileges), setting events to be audited, and setting intrusion detection parameters, system programming, system and security administration, other privileged functions.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,69,'AC-6(3)-1 [all privileged commands]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,71,'AC-6(5)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,73,'AC-6(7) (a)-1 [at a minimum, annually]
 AC-6(7) (a)-2 [all users with privileges]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,74,'AC-6(8) [any software except software explicitly documented]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,77,'AC-7','AC-7 Requirement: In alignment with NIST SP 800-63B','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (10,1302,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1239,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (4,82,'AC-8 (a) [see additional Requirements and Guidance]
 AC-8 (c)(1) [see additional Requirements and Guidance]','AC-8 Requirement: The service provider shall determine elements of the cloud environment that require the System Use Notification control. The elements of the cloud environment that require System Use Notification are approved and accepted by the JAB/AO. 
 
 Requirement: The service provider shall determine how System Use Notification is going to be verified and provide appropriate periodicity of the check. The System Use Notification verification and periodicity are approved and accepted by the JAB/AO.
 
 Requirement: If not performed as part of a Configuration Baseline check, then there must be documented agreement on how to provide results of verification and the necessary periodicity of the verification by the service provider. The documented agreement on how to provide verification of the results are approved and accepted by the JAB/AO.
 
 Guidance: If performed as part of a Configuration Baseline check, then the % of items requiring setting that are checked and that pass (or fail) check can be provided.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,88,'AC-10-2 [three(3) sessions for privileged access and two(2) sessions for non-privileged access]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,89,'AC-11 (a) [fifteen(15) minutes]; requiring the user to initiate a device lock before leaving the system unattended',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,90,'AC-11(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,91,'AC-12',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,96,'AC-14',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,110,'AC-17',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,111,'AC-17(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,112,'AC-17(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,113,'AC-17(3)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,114,'AC-17(4)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,121,'AC-18',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,122,'AC-18(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,124,'AC-18(3)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,125,'AC-18(4)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,126,'AC-18(5)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,127,'AC-19',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,132,'AC-19(5)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,133,'AC-20','AC-20 Guidance: The interrelated controls of AC-20, CA-3, and SA-9 should be differentiated as follows:
 AC-20 describes system access to and from external systems.
 CA-3 describes documentation of an agreement between the respective system owners when data is exchanged between the CSO and an external system.
 SA-9 describes the responsibilities of external system owners. These responsibilities would typically be captured in the agreement required by CA-3.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,134,'AC-20(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,135,'AC-20(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,139,'AC-21',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,142,'AC-22 (d) [at least quarterly]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,148,'AT-1 (c)(1) [at least annually]
 AT-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,149,'AT-2 (a)(1) [at least annually]
 AT-2 (c) [at least annually]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,151,'AT-2(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,152,'AT-2(3)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,156,'AT-3 (a)(1) [at least annually]
 AT-3 (b) [at least annually]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,162,'AT-4 (b) [five(5) years or 5 years after completion of a specific training program]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,165,'AU-1 (c)(1) [at least annually]
 AU-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,166,'AU-2 (a) [successful and unsuccessful account logon events, account management events, object access, policy change, privilege functions, process tracking, and system events. For Web applications: all administrator activity, authentication checks, authorization checks, data deletions, data access, data changes, and permission changes]
 AU-2 (c) [organization-defined subset of the auditable events defined in AU-2a to be audited continually for each identified event].
 AU-2 (e) [annually and whenever there is a change in the threat environment]','AU-2 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO.
 AU-2 (e) Guidance: Annually or whenever changes in the threat environment are communicated to the service provider by the JAB/AO.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,171,'AU-3',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,172,'AU-3(1) [session, connection, transaction, or activity duration; for client-server transactions, the number of bytes received and bytes sent; additional informational messages to diagnose or identify the event; characteristics that describe or identify the object or resource being acted upon; individual identities of group account users; full-text of privileged commands]','AU-3(1) Guidance: For client-server transactions, the number of bytes sent and received gives bidirectional transfer information that can be helpful during an investigation or inquiry.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,175,'AU-4',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,177,'AU-5 (b) [overwrite oldest record]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,178,'AU-5(1)-3 [75%, or one month before expected negative impact]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,179,'AU-5(2)-1 [real-time] 
 AU-5(2)-2 [service provider personnel with authority to address failed audit events] 
 AU-5(2)-3 [audit failure events requiring real-time alerts, as defined by organization audit policy].',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,183,'AU-6 (a)-1 [at least weekly]','AU-6 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO. In multi-tenant environments, capability and means for providing review, analysis, and reporting to consumer for data pertaining to consumer shall be documented.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,184,'AU-6(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,186,'AU-6(3)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,187,'AU-6(4)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,188,'AU-6(5) [Selection (one or more): vulnerability scanning information; performance data; information system monitoring information; penetration test data; [Organization -defined data/information collected from other sources]]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,189,'AU-6(6)','AU-6(6) Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,190,'AU-6(7) [information system process; role; user]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,194,'AU-7',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,195,'AU-7(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,197,'AU-8 (b) [one second granularity of time measurement]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,200,'AU-9',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,202,'AU-9(2) [at least weekly]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,360,'CP-7(4)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,579,'PE-6 (b)-1 [at least monthly]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (10,1240,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (10,1220,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (4,208,'AU-10 [minimum actions including the addition, modification, deletion, approval, sending, or receiving of data]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,214,'AU-11 [a time period in compliance with M-21-31]','AU-11 Requirement: The service provider retains audit records on-line for at least ninety days and further preserves audit records off-line for a period that is in accordance with NARA requirements. 
 AU-11 Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf)
 AU-11 Guidance: The service provider is encouraged to align with M-21-31 where possible','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,216,'AU-12 (a) [all information system and network components where audit capability is deployed/available]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,217,'AU-12(1)-1 [all network, data storage, and computing devices]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,219,'AU-12(3)-1 [service provider-defined individuals or roles with audit configuration responsibilities] 
 AU-12(3)-2 [all network, data storage, and computing devices]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,234,'CA-1 (c)(1) [at least annually]
 CA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,235,'CA-2 (d) [at least annually] 
 CA-2 (f) [individuals or roles to include FedRAMP PMO]','CA-2 Guidance: Reference FedRAMP Annual Assessment Guidance.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,236,NULL,'CA-2(1) Requirement: For JAB Authorization, must use an accredited 3PAO.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,237,'CA-2(2) [at least annually]','CA-2(2) Requirement: To include ''announced'', ''vulnerability scanning''','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,238,'CA-2(3)-1 [any FedRAMP Accredited 3PAO]
 CA-2(3)-3 [the conditions of the JAB/AO in the FedRAMP Repository]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,239,'CA-3 (c) [at least annually and on input from JAB/AO]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,245,'CA-3(6)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,248,'CA-5 (b) [at least monthly]','CA-5 Requirement: POA&Ms must be provided at least monthly.
 CA-5 Guidance: Reference FedRAMP-POAM-Template','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,250,'CA-6 (e) [in accordance with OMB A-130 requirements or when a significant change occurs]','CA-6 (e) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F and according to FedRAMP Significant Change Policies and Procedures. The service provider describes the types of changes to the information system or the environment of operations that would impact the risk posture. The types of changes are approved and accepted by the JAB/AO.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,253,'CA-7 (g)-1 [to include JAB/AO]','CA-7 Requirement: Operating System, Database, Web Application, Container, and Service Configuration Scans: at least monthly. All scans performed by Independent Assessor: at least annually.
 CA-7 Requirement: CSOs with more than one agency ATO must implement a collaborative Continuous Monitoring (ConMon) approach described in the FedRAMP Guide for Multi-Agency Continuous Monitoring. This requirement applies to CSOs authorized via the Agency path as each agency customer is responsible for performing ConMon oversight. It does not apply to CSOs authorized via the JAB path because the JAB performs ConMon oversight.
 CA-7 Guidance: FedRAMP does not provide a template for the Continuous Monitoring Plan. CSPs should reference the FedRAMP Continuous Monitoring Strategy Guide when developing the Continuous Monitoring Plan.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,254,'CA-7(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,257,'CA-7(4)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,260,'CA-8-1 [at least annually]','CA-8 Guidance: Reference the FedRAMP Penetration Test Guidance.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,261,'CA-8(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,262,'CA-8(2)','CA-8(2) Guidance: See the FedRAMP Documents page> Penetration Test Guidance 
 https://www.FedRAMP.gov/documents/','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,264,'CA-9 (d) [at least annually]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,266,'CM-1 (c)(1) [at least annually]
 CM-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,267,'CM-2 (b)(1) [at least annually and when a significant change occurs]
 CM-2 (b)(2) [to include when directed by the JAB]','CM-2 (b)(1) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,269,'CM-2(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,270,'CM-2(3) [organization-defined number of previous versions of baseline configurations of the previously approved baseline configuration of IS components]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,274,'CM-2(7)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,275,'CM-3','CM-3 Requirement: The service provider establishes a central means of communicating major changes to or developments in the information system or environment of operations that may affect its services to the federal government and associated service consumers (e.g., electronic bulletin board, web status page). The means of communication are approved and accepted by the JAB/AO.
 CM-3 (e) Guidance: In accordance with record retention policies and procedures.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,276,'CM-3(1) (c) [organization agreed upon time period] 
 CM-3(1) (f) [organization defined configuration management approval authorities]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,277,'CM-3(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,279,'CM-3(4)-2 [Configuration control board (CCB) or similar (as defined in CM-3)]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,281,'CM-3(6) All security safeguards that rely on cryptography',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,284,'CM-4',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,285,'CM-4(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,286,'CM-4(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,287,'CM-5',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,288,'CM-5(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,292,'CM-5(5) (b) [at least quarterly]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,363,'CP-8','CP-8 Requirement: The service provider defines a time period consistent with the recovery time objectives and business impact analysis.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,364,'CP-8(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,365,'CP-8(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,366,'CP-8(3)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,367,'CP-8(4) (c) [annually]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,451,'IA-12','IA-12 Additional FedRAMP Requirements and Guidance:
 Guidance: In accordance with NIST SP 800-63A Enrollment and Identity Proofing','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,453,'IA-12(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,454,'IA-12(3)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,455,'IA-12(4)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,456,'IA-12(5)','IA-12(5) Additional FedRAMP Requirements and Guidance:
 Guidance: In accordance with NIST SP 800-63A Enrollment and Identity Proofing','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,458,'IR-1 (c)(1) [at least annually]
 IR-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,295,'CM-6','CM-6 (a) Requirement 1: The service provider shall use the DoD STIGs to establish configuration settings; Center for Internet Security up to Level 2 (CIS Level 2) guidelines shall be used if STIGs are not available; Custom baselines shall be used if CIS is not available.
 CM-6 (a) Requirement 2: The service provider shall ensure that checklists for configuration settings are Security Content Automation Protocol (SCAP) validated or SCAP compatible (if validated checklists are not available).
 
 CM-6 Guidance: Compliance checks are used to evaluate configuration settings and provide general insight into the overall effectiveness of configuration management activities. CSPs and 3PAOs typically combine compliance check findings into a single CM-6 finding, which is acceptable. However, for initial assessments, annual assessments, and significant change requests, FedRAMP requires a clear understanding, on a per-control basis, where risks exist. Therefore, 3PAOs must also analyze compliance check findings as part of the controls assessment. Where a direct mapping exists, the 3PAO must document additional findings per control in the corresponding SAR Risk Exposure Table (RET), which are then documented in the CSP’s Plan of Action and Milestones (POA&M). This will likely result in the details of individual control findings overlapping with those in the combined CM-6 finding, which is acceptable.
 During monthly continuous monitoring, new findings from CSP compliance checks may be combined into a single CM-6 POA&M item. CSPs are not required to map the findings to specific controls because controls are only assessed during initial assessments, annual assessments, and significant change requests.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,296,'CM-6(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,297,'CM-6(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,300,'CM-7','CM-7 (b) Requirement: The service provider shall use Security guidelines (See CM-6) to establish list of prohibited or restricted functions, ports, protocols, and/or services or establishes its own list of prohibited or restricted functions, ports, protocols, and/or services if STIGs or CIS is not available.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,301,'CM-7(1) (a) [at least annually]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,302,'CM-7(2)','CM-7(2) Guidance: This control refers to software deployment by CSP personnel into the production environment. The control requires a policy that states conditions for deploying software. This control shall be implemented in a technical manner on the information system to only allow programs to run that adhere to the policy (i.e. allow-listing). This control is not to be based off of strictly written policy on what is allowed or not allowed to run.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,305,'CM-7(5) (c) [at least quarterly or when there is a change]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,310,'CM-8 (b) [at least monthly]','CM-8 Requirement: must be provided at least monthly or when there is a change.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,311,'CM-8(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,312,'CM-8(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,313,'CM-8(3) (a)-1 [automated mechanisms with a maximum five-minute delay in detection.] 
 CM-8(3) (a)-2 [continuously]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,314,'CM-8(4) [position and role]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,320,'CM-9','CM-9 Guidance: FedRAMP does not provide a template for the Configuration Management Plan. However, NIST SP 800-128, Guide for Security-Focused Configuration Management of Information Systems, provides guidelines for the implementation of CM controls as well as a sample CMP outline in Appendix D of the Guide','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,322,'CM-10',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,324,'CM-11 (c) [Continuously (via CM-7(5))]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,328,'CM-12','CM-12 Requirement: According to FedRAMP Authorization Boundary Guidance','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,329,'CM-12(1)-1: [Federal data and system data that must be protected at the High or Moderate impact levels]','CM-12(1) Requirement: According to FedRAMP Authorization Boundary Guidance.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,331,'CM-14','CM-14 Guidance: If digital signatures/certificates are unavailable, alternative cryptographic integrity checks (hashes, self-signed certs, etc.) can be utilized.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,332,'CP-1 (c)(1) [at least annually]
 CP-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,333,'CP-2 (d) [at least annually]','CP-2 Requirement: For JAB authorizations the contingency lists include designated FedRAMP personnel.
 
 CP-2 Requirement: CSPs must use the FedRAMP Information System Contingency Plan (ISCP) Template (available on the fedramp.gov: https://www.fedramp.gov/assets/resources/templates/SSP-A06-FedRAMP-ISCP-Template.docx).','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,334,'CP-2(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,335,'CP-2(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,336,'CP-2(3)-1 [all]
 CP-2(3)-2 [time period defined in service provider and organization SLA]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,338,'CP-2(5) [essential]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,341,'CP-2(8)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,342,'CP-3 (a)(1) [*See Additional Requirements]
 CP-3 (a)(3) [at least annually]
 CP-3 (b) [at least annually]','CP-3 (a) Requirement: Privileged admins and engineers must take the basic contingency training within 10 days. Consideration must be given for those privileged admins and engineers with critical contingency-related roles, to gain enough system context and situational awareness to understand the full impact of contingency training as it applies to their respective level. Newly hired critical contingency personnel must take this more in-depth training within 60 days of hire date when the training will have more impact.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,343,'CP-3(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,345,'CP-4 (a)-1 [at least annually] 
 CP-4 (a)-2 [functional exercises]','CP-4 (a) Requirement: The service provider develops test plans in accordance with NIST Special Publication 800-34 (as amended); plans are approved by the JAB/AO prior to initiating testing.
 
 CP-4 (b) Requirement: The service provider must include the Contingency Plan test results with the security package within the Contingency Plan-designated appendix (Appendix G, Contingency Plan Test Report).','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,346,'CP-4(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,347,'CP-4(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,352,'CP-6',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,353,'CP-6(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,354,'CP-6(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,355,'CP-6(3)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,356,'CP-7','CP-7 (a) Requirement: The service provider defines a time period consistent with the recovery time objectives and business impact analysis.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,357,'CP-7(1)','CP-7(1) Guidance: The service provider may determine what is considered a sufficient degree of separation between the primary and alternate processing sites, based on the types of threats that are of concern. For one particular type of threat (i.e., hostile cyber attack), the degree of separation between sites will be less relevant.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,358,'CP-7(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,369,'CP-9 (a)-2 [daily incremental; weekly full]
 CP-9 (b) [daily incremental; weekly full]
 CP-9 (c) [daily incremental; weekly full]','CP-9 Requirement: The service provider shall determine what elements of the cloud environment require the Information System Backup control. The service provider shall determine how Information System Backup is going to be verified and appropriate periodicity of the check.
 CP-9 (a) Requirement: The service provider maintains at least three backup copies of user-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (b) Requirement: The service provider maintains at least three backup copies of system-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (c) Requirement: The service provider maintains at least three backup copies of information system documentation including security information (at least one of which is available online) or provides an equivalent alternative.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,370,'CP-9(1) [at least monthly]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,371,'CP-9(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,372,'CP-9(3)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,374,'CP-9(5) [time period and transfer rate consistent with the recovery time and recovery point objectives defined in the service provider and organization SLA].',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,377,'CP-9(8) [all backup files]','CP-9(8) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,378,'CP-10',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,380,'CP-10(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,382,'CP-10(4) [time period consistent with the restoration time-periods defined in the service provider and organization SLA]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,388,'IA-1 (c)(1) [at least annually]
 IA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,389,'IA-2','IA-2 Requirement: For all control enhancements that specify multifactor authentication, the implementation must adhere to the Digital Identity Guidelines specified in NIST Special Publication 800-63B.
 
 IA-2 Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2 Requirement: All uses of encrypted virtual private networks must meet all applicable Federal requirements and architecture, dataflow, and security and privacy controls must be documented, assessed, and authorized to operate.
 
 IA-2 Guidance: “Phishing-resistant" authentication refers to authentication processes designed to detect and prevent disclosure of authentication secrets and outputs to a website or application masquerading as a legitimate system.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,390,'IA-2(1)','IA-2(1) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(1) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(1) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,391,'IA-2(2)','IA-2(2) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(2) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(2) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,394,'IA-2(5)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,395,'IA-2(6)-1 [local, network and remote]
 IA-2(6)-2 [privileged accounts; non-privileged accounts]
 IA-2(6) (b) [FIPS-validated or NSA-approved cryptography]','IA-2(6) Guidance: PIV=separate device. Please refer to NIST SP 800-157 Guidelines for Derived Personal Identity Verification (PIV) Credentials.
 
 IA-2(6) Guidance: See SC-13 Guidance for more information on FIPS-validated or NSA-approved cryptography.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,397,'IA-2(8) [privileged accounts; non-privileged accounts]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,401,'IA-2(12)','IA-2(12) Guidance: Include Common Access Card (CAC), i.e., the DoD technical implementation of PIV/FIPS 201/HSPD-12.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,403,'IA-3',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,408,'IA-4 (a) [at a minimum, the ISSO (or similar role within the organization)] 
 IA-4 (d) [at least two(2) years]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,412,'IA-4(4) [contractors; foreign nationals]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,418,'IA-5','IA-5 Requirement: Authenticators must be compliant with NIST SP 800-63-3 Digital Identity Guidelines IAL, AAL, FAL level 3. Link https://pages.nist.gov/800-63-3
 
 IA-5 Guidance: SP 800-63C Section 6.2.3 Encrypted Assertion requires that authentication assertions be encrypted when passed through third parties, such as a browser. For example, a SAML assertion can be encrypted using XML-Encryption, or an OpenID Connect ID Token can be encrypted using JSON Web Encryption (JWE).','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,419,'IA-5(1)','IA-5(1) Requirement: Password policies must be compliant with NIST SP 800-63B for all memorized, lookup, out-of-band, or One-Time-Passwords (OTP). Password policies shall not enforce special character or minimum password rotation requirements for memorized secrets of users.
 
 IA-5(1) (h) Requirement: For cases where technology doesn’t allow multi-factor authentication, these rules should be enforced: must have a minimum length of 14 characters and must support all printable ASCII characters.
  
 For emergency use accounts, these rules should be enforced: must have a minimum length of 14 characters, must support all printable ASCII characters, and passwords must be changed if used. 
 
 IA-5(1) Guidance: Note that (c) and (d) require the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,420,'IA-5(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,424,'IA-5(6)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,425,'IA-5(7)','IA-5(7) Guidance: In this context, prohibited static storage refers to any storage where unencrypted authenticators, such as passwords, persist beyond the time required to complete the access process.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,426,'IA-5(8) [different authenticators in different user authentication domains]','IA-5(8) Guidance: If a single user authentication domain is used to access multiple systems, such as in single-sign-on, then only a single authenticator is required.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,431,'IA-5(13)','IA-5(13) Guidance: For components subject to configuration baseline(s) (such as STIG or CIS,) the time period should conform to the baseline standard.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,437,'IA-6',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,438,'IA-7',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,439,'IA-8',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,440,'IA-8(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,441,'IA-8(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,443,'IA-8(4)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,450,'IA-11','IA-11 Guidance:
 The fixed time period cannot exceed the limits set in SP 800-63. At this writing they are:
 - AAL3 (high baseline)
  -- 12 hours or
  -- 15 minutes of inactivity','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,459,'IR-2 (a)(1) [ten(10) days for privileged users, thirty(30) days for Incident Response roles]
 IR-2 (a)(3) [at least annually]
 IR-2 (b) [at least annually]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,460,'IR-2(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,461,'IR-2(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,463,'IR-3-1 [at least every six(6) months, including functional at least annually]','IR-3-2 Requirement: The service provider defines tests and/or exercises in accordance with NIST Special Publication 800-61 (as amended). Functional testing must occur prior to testing for initial authorization. Annual functional testing may be concurrent with required penetration tests (see CA-8). The service provider provides test plans to the JAB/AO annually. Test plans are approved and accepted by the JAB/AO prior to test commencing.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,465,'IR-3(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,467,'IR-4','IR-4 Requirement: The FISMA definition of "incident" shall be used: "An occurrence that actually or imminently jeopardizes, without lawful authority, the confidentiality, integrity, or availability of information or an information system; or constitutes a violation or imminent threat of violation of law, security policies, security procedures, or acceptable use policies."
 
 IR-4 Requirement: The service provider ensures that individuals conducting incident handling meet personnel security requirements commensurate with the criticality/sensitivity of the information being processed, stored, and transmitted by the information system.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,468,'IR-4(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,469,'IR-4(2)-1 [all network, data storage, and computing devices]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,471,'IR-4(4)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,473,'IR-4(6)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,478,NULL,NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,483,'IR-5',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,484,'IR-5(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,485,'IR-6 (a) [US-CERT incident reporting timelines as specified in NIST Special Publication 800-61 (as amended)]','IR-6 Requirement: Reports security incident information according to FedRAMP Incident Communications Procedure.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,486,'IR-6(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,488,'IR-6(3)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,489,'IR-7',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,490,'IR-7(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,492,'IR-8 (a)(9)-2 [at least annually]
 IR-8 (b) [see additional FedRAMP Requirements and Guidance]
 IR-8 (d) [see additional FedRAMP Requirements and Guidance]','IR-8 (b) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.
 IR-8 (d) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,494,'IR-9',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,496,'IR-9(2) [at least annually]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,497,'IR-9(3)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,498,'IR-9(4)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,500,'MA-1 (c)(1) [at least annually]
 MA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,501,'MA-2',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,504,'MA-3 (b) [at least annually]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,505,'MA-3(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,506,'MA-3(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,507,'MA-3(3) (d) [the information owner]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,511,'MA-4',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,514,'MA-4(3)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,519,'MA-5',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,520,'MA-5(1)','MA-5(1) Requirement: Only MA-5(1) (a)(1) is required by FedRAMP Moderate Baseline','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,525,'MA-6-2 [a timeframe to support advertised uptime and availability]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,530,'MP-1 (c)(1) [at least annually]
 MP-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,531,'MP-2-1 [all types of digital and/or non-digital media containing sensitive information]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,534,'MP-3 (b)-1 [no removable media types]
 MP-3 (b)-2 [organization-defined security safeguards not applicable]','MP-3 (b) Guidance: Second parameter not-applicable','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,535,'MP-4 (a)-1 [all types of digital and non-digital media with sensitive information] 
 MP-4 (a)-2 [see additional FedRAMP requirements and guidance]','MP-4 (a) Requirement: The service provider defines controlled areas within facilities where the information and information system reside.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,538,'MP-5 (a) [all media with sensitive information] [prior to leaving secure/controlled environment: for digital media, encryption in compliance with Federal requirements and utilizes FIPS validated or NSA approved cryptography (see SC-13.); for non-digital media, secured in locked container]','MP-5 (a) Requirement: The service provider defines security measures to protect digital and non-digital media in transport. The security measures are approved and accepted by the JAB/AO.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,543,'MP-6 (a)-2 [techniques and procedures IAW NIST SP 800-88 Section 4: Reuse and Disposal of Storage Media and Hardware]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,544,'MP-6(1)','MP-6(1) Requirement: Must comply with NIST SP 800-88','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,545,'MP-6(2) [at least every six(6) months]','MP-6(2) Guidance: Equipment and procedures may be tested or validated for effectiveness','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,546,'MP-6(3)','MP-6(3) Requirement: Must comply with NIST SP 800-88','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,552,'MP-7',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,560,'PE-1 (c)(1) [at least annually]
 PE-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,561,'PE-2 (c) [at least every ninety(90) days]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,565,'PE-3 (a)(2) [CSP defined physical access control systems/devices AND guards]
 PE-3 (d) [in all circumstances within restricted access area where the information system resides]
 PE-3 (f)-2 [at least annually]
 PE-3 (g) [at least annually or earlier as required by a security relevant event.]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,566,'PE-3(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,574,'PE-4',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,575,'PE-5',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,580,'PE-6(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,583,'PE-6(4)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,585,'PE-8 (a) [for a minimum of one(1) year]
 PE-8 (b) [at least monthly]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,586,'PE-8(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,589,'PE-9',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (10,1203,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (4,592,'PE-10 (b) [near more than one egress point of the IT area and ensures it is labeled and protected by a cover to prevent accidental shut-off]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,594,'PE-11',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,595,'PE-11(1) [automatically]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,597,'PE-12',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,599,'PE-13',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,600,'PE-13(1) -1 [service provider building maintenance/physical security personnel]
 PE-13(1) -2 [service provider emergency responders with incident response responsibilities]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,601,'PE-13(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,604,'PE-14 (a) [consistent with American Society of Heating, Refrigerating and Air-conditioning Engineers (ASHRAE) document entitled Thermal Guidelines for Data Processing Environments]
 
 PE-14 (b) [continuously]','PE-14 (a) Requirement: The service provider measures temperature at server inlets and humidity levels by dew point.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,606,'PE-14(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,607,'PE-15',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,608,'PE-15(1)-1 [service provider building maintenance/physical security personnel]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,609,'PE-16 (a) [all information system components]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,610,'PE-17',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,611,'PE-18 [physical and environmental hazards identified during threat assessment]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,619,'PL-1 (c)(1) [at least annually]
 PL-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,620,'PL-2 (a)(14) [to include chief privacy and ISSO and/or similar role or designees]
 PL-2 (b) [to include chief privacy and ISSO and/or similar role]
 PL-2 (c) [at least annually]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,625,'PL-4 (c) [at least annually]
 PL-4 (d) [at least annually and when the rules are revised or changed]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,626,'PL-4(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,630,'PL-8 (b) [at least annually and when a significant change occurs]','PL-8 (b) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,634,'PL-10','PL-10 Requirement: Select the appropriate FedRAMP Baseline','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,635,'PL-11',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,673,'PS-1 (c)(1) [at least annually]
 PS-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,674,'PS-2 (c) [at least annually]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,675,'PS-3 (b) [for national security clearances; a reinvestigation is required during the fifth(5th) year for top secret security clearance, the tenth(10th) year for secret security clearance, and fifteenth(15th) year for confidential security clearance.
 
 For moderate risk law enforcement and high impact public trust level, a reinvestigation is required during the fifth(5th) year. There is no reinvestigation for other moderate risk positions or any low risk positions]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,680,'PS-4 (a) [one(1) hour]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,682,'PS-4(2)-2 Notify [access control personnel responsible for disabling access to the system]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,683,'PS-5 (b)-2 [twenty-four(24) hours] 
 PS-5 (d)-1 [including access control personnel responsible for the system]
 PS-5 (d)-2 [twenty-four(24) hours]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,684,'PS-6 (b) [at least annually]
 PS-6 (c)(2) [at least annually and any time there is a change to the user''s level of access]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,688,'PS-7 (d)-1 [including access control personnel responsible for the system and/or facilities, as appropriate]
 PS-7 (d)-2 [terminations: immediately; transfers: within twenty-four(24) hours]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,689,'PS-8 (b)-1 [to include the ISSO and/or similar role within the organization]
 PS-8 (b)-2 [24 hours]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,690,'PS-9',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,712,'RA-1 (c)(1) [at least annually]
 RA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,713,'RA-2',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,715,'RA-3 (c) [security assessment report]
  
 RA-3 (d) [at least annually and whenever a significant change occurs]
  
 RA-3 (f) [annually]','RA-3 Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.
 RA-3 (e) Requirement: Include all Authorizing Officials; for JAB authorizations to include FedRAMP.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,716,'RA-3(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,721,'RA-5 (a) [monthly operating system/infrastructure; monthly web applications (including APIs) and databases]
 RA-5 (d) [high-risk vulnerabilities mitigated within thirty(30) days from date of discovery; moderate-risk vulnerabilities mitigated within ninety(90) days from date of discovery; low risk vulnerabilities mitigated within one hundred and eighty(180) days from date of discovery]','RA-5 Guidance: See the FedRAMP Documents page> Vulnerability Scanning Requirements 
 https://www.FedRAMP.gov/documents/
 RA-5 (a) Requirement: an accredited independent assessor scans operating systems/infrastructure, web applications, and databases once annually.
 RA-5 (d) Requirement: If a vulnerability is listed among the CISA Known Exploited Vulnerability (KEV) Catalog (https://www.cisa.gov/known-exploited-vulnerabilities-catalog) the KEV remediation date supersedes the FedRAMP parameter requirement.
 RA-5 (e) Requirement: to include all Authorizing Officials; for JAB authorizations to include FedRAMP
 
 RA-5 Guidance: Informational findings from a scanner are detailed as a returned result that holds no vulnerability risk or severity and for FedRAMP does not require an entry onto the POA&M or entry onto the RET during any assessment phase.
 Warning findings, on the other hand, are given a risk rating (low, moderate, high or critical) by the scanning solution and should be treated like any other finding with a risk or severity rating for tracking purposes onto either the POA&M or RET depending on when the findings originated (during assessments or during monthly continuous monitoring). If a warning is received during scanning, but further validation turns up no actual issue then this item should be categorized as a false positive. If this situation presents itself during an assessment phase (initial assessment, annual assessment or any SCR), follow guidance on how to report false positives in the Security Assessment Report (SAR). If this situation happens during monthly continuous monitoring, a deviation request will need to be submitted per the FedRAMP Vulnerability Deviation Request Form.
 Warnings are commonly associated with scanning solutions that also perform compliance scans, and if the scanner reports a “warning” as part of the compliance scanning of a CSO, follow guidance surrounding the tracking of compliance findings during either the assessment phases (initial assessment, annual assessment or any SCR) or monthly continuous monitoring as it applies. Guidance on compliance scan findings can be found by searching on “Tracking of Compliance Scans” in FAQs.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,723,'RA-5(2) [within 24 hours prior to
 running scans]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,724,'RA-5(3)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,725,'RA-5(4) [notify appropriate service provider personnel and follow procedures for organization and service provider-defined corrective actions]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1183,'SR-9(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,726,'RA-5(5)-1 [all components that support authentication] 
 RA-5(5)-2 [all scans]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,729,'RA-5(8)','RA-5(8) Requirement: This enhancement is required for all high (or critical) vulnerability scan findings.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,732,'RA-5(11)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,734,'RA-7',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,736,'RA-9',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,738,'SA-1 (c)(1) [at least annually]
 SA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,739,'SA-2',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,740,'SA-3',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,744,'SA-4','SA-4 Requirement: The service provider must comply with Federal Acquisition Regulation (FAR) Subpart 7.103, and Section 889 of the John S. McCain National Defense Authorization Act (NDAA) for Fiscal Year 2019 (Pub. L. 115-232), and FAR Subpart 4.21, which implements Section 889 (as well as any added updates related to FISMA to address security concerns in the system acquisitions process).
 
 SA-4 Guidance: The use of Common Criteria (ISO/IEC 15408) evaluated products is strongly preferred.
 See https://www.niap-ccevs.org/Product/index.cfm or https://www.commoncriteriaportal.org/products/.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,745,'SA-4(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,746,'SA-4(2)-1 [at a minimum to include security-relevant external system interfaces; high-level design; low-level design; source code or network and data flow diagram; [organization-defined design/implementation information]]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,749,'SA-4(5) (a) The service provider shall use the DoD STIGs to establish configuration settings; Center for Internet Security up to Level 2 (CIS Level 2) guidelines shall be used if STIGs are not available; Custom baselines shall be used if CIS is not available.',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,753,'SA-4(9)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,754,'SA-4 (10)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,757,'SA-5 (d) [at a minimum, the ISSO (or similar role within the organization)]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,765,'SA-8',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,799,'SA-9 (a) [Appropriate FedRAMP Security Controls Baseline (s) if Federal information is processed or stored within the external system]
 SA-9 (c) [Federal/FedRAMP Continuous Monitoring requirements must be met for external systems where Federal information is processed or stored]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,800,'SA-9(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,801,'SA-9(2) [all external systems where Federal information is processed or stored]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,804,'SA-9(5)-1 [information processing, information or data, AND system services]
 SA-9(5)-2 [U.S./U.S. Territories or geographic locations where there is U.S. jurisdiction]
 SA-9(5)-3 [all High impact data, systems, or services]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,808,'SA-10 (a) [development, implementation, AND operation]','SA-10 (e) Requirement: track security flaws and flaw resolution within the system, component, or service and report findings to organization-defined personnel, to include FedRAMP.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,816,'SA-11',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,817,'SA-11(1)','SA-11(1) Requirement: The service provider must document its methodology for reviewing newly developed code for the Service in its Continuous Monitoring Plan.
 
 If Static code analysis cannot be performed (for example, when the source code is not available), then dynamic code analysis must be performed (see SA-11(8))','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,818,'SA-11(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,845,'SA-15 (b)-1 [frequency as before first use and annually thereafter]
 SA-15 (b)-2 [FedRAMP Security Authorization requirements]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,848,'SA-15(3)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,858,'SA-16',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,859,'SA-17',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,878,'SA-21',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,880,'SA-22',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,883,'SC-1 (c)(1) [at least annually]
 SC-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,884,'SC-2',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,887,'SC-3',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,893,'SC-4',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,896,'SC-5 (a)-1 [Protect against] 
 SC-5 (a)-2 [at a minimum: ICMP (ping) flood, SYN flood, slowloris, buffer overflow attack, and volume attack]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,901,'SC-7','SC-7 (b) Guidance: SC-7 (b) should be met by subnet isolation. A subnetwork (subnet) is a physically or logically segmented section of a larger network defined at TCP/IP Layer 3, to both minimize traffic and, important for a FedRAMP Authorization, add a crucial layer of network isolation. Subnets are distinct from VLANs (Layer 2), security groups, and VPCs and are specifically required to satisfy SC-7 part b and other controls. See the FedRAMP Subnets White Paper (https://www.fedramp.gov/assets/resources/documents/FedRAMP_subnets_white_paper.pdf) for additional information.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,904,'SC-7(3)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,905,'SC-7(4) (e) [at least every ninety(90) days or whenever there is a change in the threat environment that warrants a review of the exceptions]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,906,'SC-7(5) [any systems]','SC-7(5) Guidance: For JAB Authorization, CSPs shall include details of this control in their Architecture Briefing','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,908,'SC-7(7)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,909,'SC-7(8)-2 [any network outside of organizational control and any network outside the authorization boundary]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,911,NULL,NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,913,'SC-7(12)-1 [Host Intrusion Prevention System (HIPS), Host Intrusion Detection System (HIDS), or minimally a host-based firewall]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,919,'SC-7(18)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,921,'SC-7 (20)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,922,'SC-7 (21)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,988,'SC-28 [confidentiality AND integrity]','SC-28 Guidance: The organization supports the capability to use cryptographic mechanisms to protect information at rest. 
 
 SC-28 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-28 Guidance: Note that this enhancement requires the use of cryptography in accordance with SC-13.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1184,'SR-10',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1185,'SR-11','SR-11 Requirement: CSOs must ensure that their supply chain vendors provide authenticity of software and patches and the vendor must have a plan to protect the development pipeline.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1186,'SR-11(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1187,'SR-11(2) [all]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (3,2,'AC-2 (h)(1) [twenty-four(24) hours]
 AC-2 (h)(2) [eight(8) hours]
 AC-2 (h)(3) [eight(8) hours]
 AC-2 (j) [quarterly for privileged access, annually for non-privileged access]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,3,'AC-2(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,4,'AC-2(2) [Selection: disables] 
 [Assignment: no more than 96 hours from last use]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (10,1274,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1290,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (4,931,'SC-8 [confidentiality AND integrity]','SC-8 Guidance:
 For each instance of data in transit, confidentiality AND integrity should be through cryptography as specified in SC-8(1), physical means as specified in SC-8(5), or in combination.
 
 For clarity, this control applies to all data in transit. Examples include the following data flows:
  - Crossing the system boundary
  - Between compute instances - including containers
  - From a compute instance to storage
  - Replication between availability zones
  - Transmission of backups to storage
  - From a load balancer to a compute instance
  - Flows from management tools required for their work – e.g. log collection, scanning, etc.
 
 The following applies only when choosing SC-8(5) in lieu of SC-8(1).
 FedRAMP-Defined Assignment / Selection Parameters 
 SC-8(5)-1 [a hardened or alarmed carrier Protective Distribution System (PDS) when outside of Controlled Access Area (CAA)]
 SC-8(5)-2 [prevent unauthorized disclosure of information AND detect changes to information] 
 
 SC-8 Guidance:
 SC-8(5) applies when physical protection has been selected as the method to protect confidentiality and integrity. For physical protection, data in transit must be in either a Controlled Access Area (CAA), or a Hardened or alarmed PDS.
 
 Hardened or alarmed PDS: Shall be as defined in SECTION X - CATEGORY 2 PDS INSTALLATION GUIDANCE of CNSSI No.7003, titled PROTECTED DISTRIBUTION SYSTEMS (PDS). Per the CNSSI No. 7003 Section VIII, PDS must originate and terminate in a Controlled Access Area (CAA). 
 
 Controlled Access Area (CAA): Data will be considered physically protected, and in a CAA if it meets Section 2.3 of the DHS’s Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies. CSPs can meet Section 2.3 of the DHS’ recommended practice by satisfactory implementation of the following controls PE-2(1), PE-2(2), PE-2(3), PE-3(2), PE-3(3), PE-6(2), and PE-6(3).
 
 Note: When selecting SC-8(5), the above SC-8(5), and the above referenced PE controls must be added to the SSP.
 
 CNSSI No.7003 can be accessed here:
 https://www.dcsa.mil/Portals/91/documents/ctp/nao/CNSSI_7003_PDS_September_2015.pdf 
 
 DHS Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies can be accessed here:
 https://us-cert.cisa.gov/sites/default/files/FactSheets/NCCIC%20ICS_FactSheet_Defense_in_Depth_Strategies_S508C.pdf','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,932,'SC-8(1) [prevent unauthorized disclosure of information AND detect changes to information]','SC-8(1) Requirement: Please ensure SSP Section 10.3 Cryptographic Modules Implemented for Data At Rest (DAR) and Data In Transit (DIT) is fully populated for reference in this control.
 
 SC-8(1) Guidance:
 See M-22-9, including "Agencies encrypt all DNS requests and HTTP traffic within their environment"
 
 SC-8(1) applies when encryption has been selected as the method to protect confidentiality and integrity. Otherwise refer to SC-8(5). SC-8(1) is strongly encouraged.
 
 SC-8(1) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)
 
 SC-8(1) Guidance: When leveraging encryption from the underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,938,'SC-10 [no longer than ten(10) minutes for privileged sessions and no longer than fifteen(15) minutes for user sessions]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,941,'SC-12 [In accordance with Federal requirements]','SC-12 Guidance: See references in NIST 800-53 documentation.
 
 SC-12 Guidance: Must meet applicable Federal Cryptographic Requirements. See References Section of control.
 
 SC-12 Guidance: Wildcard certificates may be used internally within the system, but are not permitted for external customer access to the system.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,942,'SC-12(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,948,'SC-13 (b) [FIPS-validated or NSA-approved cryptography]','SC-13 Guidance:
 This control applies to all use of cryptography. In addition to encryption, this includes functions such as hashing, random number generation, and key generation. Examples include the following:
  - Encryption of data
  - Decryption of data
  - Generation of one time passwords (OTPs) for MFA
  - Protocols such as TLS, SSH, and HTTPS
 
 The requirement for FIPS 140 validation, as well as timelines for acceptance of FIPS 140-2, and 140-3 can be found at the NIST Cryptographic Module Validation Program (CMVP).
 https://csrc.nist.gov/projects/cryptographic-module-validation-program 
 
 SC-13 Guidance: For NSA-approved cryptography, the National Information Assurance Partnership (NIAP) oversees a national program to evaluate Commercial IT Products for Use in National Security Systems. The NIAP Product Compliant List can be found at the following location:
 https://www.niap-ccevs.org/Product/index.cfm 
 
 SC-13 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-13 Guidance:
 Moving to non-FIPS CM or product is acceptable when:
 - FIPS validated version has a known vulnerability
 - Feature with vulnerability is in use
 - Non-FIPS version fixes the vulnerability
 - Non-FIPS version is submitted to NIST for FIPS validation
 - POA&M is added to track approval, and deployment when ready
 
 SC-13 Guidance: At a minimum, this control applies to cryptography in use for the following controls: AU-9(3), CP-9(8), IA-2(6), IA-5(1), MP-5, SC-8(1), and SC-28(1).','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,954,'SC-15 (a) [no exceptions for computing devices]','SC-15 Requirement: The information system provides disablement (instead of physical disconnect) of collaborative computing devices in a manner that supports ease of use.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,963,'SC-17',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,964,'SC-18',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,971,'SC-20','SC-20 Requirement:
 Control Description should include how DNSSEC is implemented on authoritative DNS servers to supply valid responses to external DNSSEC requests.
 
 SC-20 Requirement: Authoritative DNS servers must be geolocated in accordance with SA-9(5).
 
 SC-20 Guidance: SC-20 applies to use of external authoritative DNS to access a CSO from outside the boundary.
 
 SC-20 Guidance:
 External authoritative DNS servers may be located outside an authorized environment. Positioning these servers inside an authorized boundary is encouraged.
 
 SC-20 Guidance: CSPs are recommended to self-check DNSSEC configuration through one of many available analyzers such as Sandia National Labs (https://dnsviz.net)','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,974,'SC-21','SC-21 Requirement:
 Control description should include how DNSSEC is implemented on recursive DNS servers to make DNSSEC requests when resolving DNS requests from internal components to domains external to the CSO boundary.
 - If the reply is signed, and fails DNSSEC, do not use the reply
 - If the reply is unsigned:
  -- CSP chooses the policy to apply
 
 SC-21 Requirement:
 Internal recursive DNS servers must be located inside an authorized environment. It is typically within the boundary, or leveraged from an underlying IaaS/PaaS.
 
 SC-21 Guidance: Accepting an unsigned reply is acceptable
 
 SC-21 Guidance:
 SC-21 applies to use of internal recursive DNS to access a domain outside the boundary by a component inside the boundary.
 - DNSSEC resolution to access a component inside the boundary is excluded.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,976,'SC-22',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,977,'SC-23',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,983,'SC-24',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1181,'SR-8-1 [notification of supply chain compromises and results of assessment or audits]','SR-8 Requirement: CSOs must ensure and document how they receive notifications from their supply chain vendor of newly discovered vulnerabilities including zero-day vulnerabilities.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1189,'SR-12',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (3,1,'AC-1 (c)(1) [at least every 3 years] 
 AC-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (4,989,'SC-28(1)-1 [all information system components storing Federal data or system data that must be protected at the High or Moderate impact levels]','SC-28(1) Guidance: 
 Organizations should select a mode of protection that is targeted towards the relevant threat scenarios. 
 Examples:
 A. Organizations may apply full disk encryption (FDE) to a mobile device where the primary threat is loss of the device while storage is locked. 
 B. For a database application housing data for a single customer, encryption at the file system level would often provide more protection than FDE against the more likely threat of an intruder on the operating system accessing the storage.
 C. For a database application housing data for multiple customers, encryption with unique keys for each customer at the database record level may be more appropriate.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,1018,'SC-39',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1035,'SC-45',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1036,'SC-45(1) (a) [At least hourly] [http://tf.nist.gov/tf-cgi/servers.cgi] 
 SC-45(1) (b) [any difference]','SC-45(1) Requirement: The service provider selects primary and secondary time servers used by the NIST Internet time service. The secondary server is selected from a different geographic region than the primary server.
 SC-45(1) Requirement: The service provider synchronizes the system clocks of network computers that run operating systems other than Windows to the Windows Server Domain Controller emulator or to the same time source for that server.
 SC-45(1) Guidance: Synchronization of system clocks improves the accuracy of log analysis.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1045,'SI-1 (c)(1) [at least annually]
 SI-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1046,'SI-2 (c) [within thirty(30) days of release of updates]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1048,'SI-2(2)-2 [at least monthly]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1049,'SI-2(3)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1053,'SI-3 (a) [signature based and non-signature based]
 SI-3 (c)(1)-1 [at least weekly] 
 SI-3 (c)(1)-2 [to include endpoints and network entry and exit points]
 SI-3 (c)(2)-1 [to include blocking and quarantining malicious code]
 SI-3 (c)(2)-2 [administrator or defined security personnel near-realtime]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1064,'SI-4','SI-4 Guidance: See US-CERT Incident Response Reporting Guidelines.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1065,'SI-4(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,1066,'SI-4(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1068,'SI-4(4) (b)-1 [continuously]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1069,'SI-4(5)','SI-4(5) Guidance: In accordance with the incident response plan.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1074,'SI-4 (10)','SI-4(10) Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf) and M-22-9 (https://www.whitehouse.gov/wp-content/uploads/2022/01/M-22-9.pdf).','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1075,'SI-4(11)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1076,'SI-4(12)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1078,'SI-4(14)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1080,'SI-4(16)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1082,NULL,NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1083,'SI-4 (19)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,1084,'SI-4 (20)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1086,'SI-4 (22)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1087,'SI-4 (23)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1090,'SI-5 (a) [to include US-CERT and Cybersecurity and Infrastructure Security Agency (CISA) Directives]
 SI-5 (c) [to include system security personnel and administrators with configuration/patch-management responsibilities]','SI-5 Requirement: Service Providers must address the CISA Emergency and Binding Operational Directives applicable to their cloud service offering per FedRAMP guidance. This includes listing the applicable directives and stating compliance status.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1091,'SI-5(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1092,'SI-6 (b) -1 [to include upon system startup and/or restart] -2 [at least monthly]
 SI-6 (c) [to include system administrators and security personnel]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1096,'SI-7',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1097,'SI-7(1)-2 [selection to include security relevant events] 
 SI-7(1)-3 [at least monthly]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1098,'SI-7(2) [to include the ISSO and/or similar role within the organization]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1101,'SI-7(5)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,1103,'SI-7(7)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1111,'SI-7(15) [to include all software and firmware inside the boundary]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1114,'SI-8','SI-8 Guidance: 
 When CSO sends email on behalf of the government as part of the business offering, Control Description should include implementation of Domain-based Message Authentication, Reporting & Conformance (DMARC) on the sending domain for outgoing messages as described in DHS Binding Operational Directive (BOD) 18-1.
 https://cyber.dhs.gov/bod/18-1/ 
 
 SI-8 Guidance: CSPs should confirm DMARC configuration (where appropriate) to ensure that policy=reject and the rua parameter includes reports@dmarc.cyber.dhs.gov. DMARC compliance should be documented in the SI-8 control implementation solution description, and list the FROM: domain(s) that will be seen by email recipients.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1116,'SI-8(2)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1119,'SI-10','SI-10 Requirement: Validate all information inputs and document any exceptions','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1126,'SI-11 (b) [to include the ISSO and/or similar role within the organization]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1127,'SI-12',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1142,'SI-16',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1163,'SR-1 (a) [to include chief privacy and ISSO and/or similar role or designees]
 SR-1 (c)(1) [at least annually]
 SR-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1164,'SR-2 (b) [at least annually]',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (4,1165,'SR-2(1)',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1166,'SR-3','SR-3 Requirement: CSO must document and maintain the supply chain custody, including replacement devices, to ensure the integrity of the devices before being introduced to the boundary.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1175,'SR-5',NULL,'2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1178,'SR-6 [at least annually]','SR-6 Requirement: CSOs must ensure that their supply chain vendors build and test their systems in alignment with NIST SP 800-171 or a commensurate security and compliance framework. CSOs must ensure that vendors are compliant with physical facility access and logical access controls to supplied products.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (4,1182,'SR-9','SR-9 Requirement: CSOs must ensure vendors provide authenticity of software and patches supplied to the service provider including documenting the safeguards in place.','2024-12-23 15:35:38.346775','2024-12-23 15:35:38.346775'),
	 (3,5,'AC-2(3) [24 hours for user accounts]
 AC-2(3) (d) [ninety(90) days] (See additional requirements and guidance.)','AC-2(3) Requirement: The service provider defines the time period for non-user accounts (e.g., accounts associated with devices). The time periods are approved and accepted by the JAB/AO. Where user management is a function of the service, reports of activity of consumer users shall be made available.
 AC-2(3) (d) Requirement: The service provider defines the time period of inactivity for device identifiers.
 Guidance: For DoD clouds, see DoD cloud website for specific DoD requirements that go above and beyond FedRAMP https://public.cyber.mil/dccs/.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,6,'AC-2(4)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,7,'AC-2(5) [for privileged users, it is the end of a user''s standard work period]','AC-2(5) Guidance: Should use a shorter timeframe than AC-12.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,9,'AC-2(7)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,11,'AC-2(9) [organization-defined need with justification statement that explains why such accounts are necessary]','AC-2(9) Requirement: Required if shared/group accounts are deployed','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,14,'AC-2(12) (b)[at a minimum, the ISSO and/or similar role within the organization]','AC-2(12) (a) Requirement: Required for privileged accounts.
 AC-2(12) (b) Requirement: Required for privileged accounts.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,15,'AC-2(13)-1 [one(1) hour]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,16,'AC-3',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,32,'AC-4',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,53,NULL,NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,65,'AC-5','AC-5 Guidance: CSPs have the option to provide a separation of duties matrix as an attachment to the SSP.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,66,'AC-6',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,67,'AC-6(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,68,'AC-6(2) [all security functions]','AC-6(2) Guidance: Examples of security functions include but are not limited to: establishing system accounts, configuring access authorizations (i.e., permissions, privileges), setting events to be audited, and setting intrusion detection parameters, system programming, system and security administration, other privileged functions.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,71,'AC-6(5)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,73,'AC-6(7) (a)-1 [at a minimum, annually]
 AC-6(7) (a)-2 [all users with privileges]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,75,'AC-6(9)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,76,'AC-6 (10)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,77,'AC-7','AC-7 Requirement: In alignment with NIST SP 800-63B','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,82,'AC-8 (a) [see additional Requirements and Guidance]
 AC-8 (c)(1) [see additional Requirements and Guidance]','AC-8 Requirement: The service provider shall determine elements of the cloud environment that require the System Use Notification control. The elements of the cloud environment that require System Use Notification are approved and accepted by the JAB/AO. 
 
 Requirement: The service provider shall determine how System Use Notification is going to be verified and provide appropriate periodicity of the check. The System Use Notification verification and periodicity are approved and accepted by the JAB/AO.
 
 Requirement: If not performed as part of a Configuration Baseline check, then there must be documented agreement on how to provide results of verification and the necessary periodicity of the verification by the service provider. The documented agreement on how to provide verification of the results are approved and accepted by the JAB/AO.
 
 Guidance: If performed as part of a Configuration Baseline check, then the % of items requiring setting that are checked and that pass (or fail) check can be provided.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,89,'AC-11 (a) [fifteen(15) minutes]; requiring the user to initiate a device lock before leaving the system unattended',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,90,'AC-11(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,91,'AC-12',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,96,'AC-14',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,110,'AC-17',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,111,'AC-17(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,112,'AC-17(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,113,'AC-17(3)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,114,'AC-17(4)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,121,'AC-18',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,122,'AC-18(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,124,'AC-18(3)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,127,'AC-19',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,132,'AC-19(5)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,133,'AC-20','AC-20 Guidance: The interrelated controls of AC-20, CA-3, and SA-9 should be differentiated as follows:
 AC-20 describes system access to and from external systems.
 CA-3 describes documentation of an agreement between the respective system owners when data is exchanged between the CSO and an external system.
 SA-9 describes the responsibilities of external system owners. These responsibilities would typically be captured in the agreement required by CA-3.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,134,'AC-20(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,135,'AC-20(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,139,'AC-21',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,142,'AC-22 (d) [at least quarterly]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,148,'AT-1 (c)(1) [at least every 3 years] 
 AT-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,149,'AT-2 (a)(1) [at least annually]
 AT-2 (c) [at least annually]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,151,'AT-2(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,152,'AT-2(3)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,156,'AT-3 (a)(1) [at least annually]
 AT-3 (b) [at least annually]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,162,'AT-4 (b) [at least one(1) year or 1 year after completion of a specific training program]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,165,'AU-1 (c)(1) [at least every 3 years] 
 AU-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,288,'CM-5(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,292,'CM-5(5) (b) [at least quarterly]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,463,'IR-3-1 [functional, at least annually]','IR-3-2 Requirement: The service provider defines tests and/or exercises in accordance with NIST Special Publication 800-61 (as amended). Functional testing must occur prior to testing for initial authorization. Annual functional testing may be concurrent with required penetration tests (see CA-8). The service provider provides test plans to the JAB/AO annually. Test plans are approved and accepted by the JAB/AO prior to test commencing.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,673,'PS-1 (c)(1) [at least every 3 years] 
 PS-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,674,'PS-2 (c) [at least every three years]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,883,'SC-1 (c)(1) [at least every 3 years] 
 SC-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,884,'SC-2',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,166,'AU-2 (a) [successful and unsuccessful account logon events, account management events, object access, policy change, privilege functions, process tracking, and system events. For Web applications: all administrator activity, authentication checks, authorization checks, data deletions, data access, data changes, and permission changes]
 AU-2 (c) [organization-defined subset of the auditable events defined in AU-2a to be audited continually for each identified event].
 AU-2 (e) [annually and whenever there is a change in the threat environment]','AU-2 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO.
 AU-2 (e) Guidance: Annually or whenever changes in the threat environment are communicated to the service provider by the JAB/AO.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,171,'AU-3',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,172,'AU-3(1) [session, connection, transaction, or activity duration; for client-server transactions, the number of bytes received and bytes sent; additional informational messages to diagnose or identify the event; characteristics that describe or identify the object or resource being acted upon; individual identities of group account users; full-text of privileged commands]','AU-3(1) Guidance: For client-server transactions, the number of bytes sent and received gives bidirectional transfer information that can be helpful during an investigation or inquiry.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,175,'AU-4',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,177,'AU-5 (b) [overwrite oldest record]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,183,'AU-6 (a)-1 [at least weekly]','AU-6 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO. In multi-tenant environments, capability and means for providing review, analysis, and reporting to consumer for data pertaining to consumer shall be documented.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,184,'AU-6(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,186,'AU-6(3)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,194,'AU-7',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,195,'AU-7(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,197,'AU-8 (b) [one second granularity of time measurement]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,200,'AU-9',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,204,'AU-9(4)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,214,'AU-11 [a time period in compliance with M-21-31]','AU-11 Requirement: The service provider retains audit records on-line for at least ninety days and further preserves audit records off-line for a period that is in accordance with NARA requirements. 
 AU-11 Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf)
 AU-11 Guidance: The service provider is encouraged to align with M-21-31 where possible','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,216,'AU-12 (a) [all information system and network components where audit capability is deployed/available]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,234,'CA-1 (c)(1) [at least every 3 years] 
 CA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,235,'CA-2 (d) [at least annually] 
 CA-2 (f) [individuals or roles to include FedRAMP PMO]','CA-2 Guidance: Reference FedRAMP Annual Assessment Guidance.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,236,'CA-2(1)','CA-2(1) Requirement: For JAB Authorization, must use an accredited 3PAO.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,238,'CA-2(3)-1 [any FedRAMP Accredited 3PAO]
 CA-2(3)-3 [the conditions of the JAB/AO in the FedRAMP Repository]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,239,'CA-3 (c) [at least annually and on input from JAB/AO]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,248,'CA-5 (b) [at least monthly]','CA-5 Requirement: POA&Ms must be provided at least monthly.
 CA-5 Guidance: Reference FedRAMP-POAM-Template','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,250,'CA-6 (e) [in accordance with OMB A-130 requirements or when a significant change occurs]','CA-6 (e) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F and according to FedRAMP Significant Change Policies and Procedures. The service provider describes the types of changes to the information system or the environment of operations that would impact the risk posture. The types of changes are approved and accepted by the JAB/AO.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,253,'CA-7 (g)-1 [to include JAB/AO]','CA-7 Requirement: Operating System, Database, Web Application, Container, and Service Configuration Scans: at least monthly. All scans performed by Independent Assessor: at least annually.
 CA-7 Requirement: CSOs with more than one agency ATO must implement a collaborative Continuous Monitoring (ConMon) approach described in the FedRAMP Guide for Multi-Agency Continuous Monitoring. This requirement applies to CSOs authorized via the Agency path as each agency customer is responsible for performing ConMon oversight. It does not apply to CSOs authorized via the JAB path because the JAB performs ConMon oversight.
 CA-7 Guidance: FedRAMP does not provide a template for the Continuous Monitoring Plan. CSPs should reference the FedRAMP Continuous Monitoring Strategy Guide when developing the Continuous Monitoring Plan.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,254,'CA-7(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,257,'CA-7(4)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,260,'CA-8-1 [at least annually]','CA-8 Guidance: Reference the FedRAMP Penetration Test Guidance.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,261,'CA-8(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,262,'CA-8(2)','CA-8(2) Guidance: See the FedRAMP Documents page> Penetration Test Guidance 
 https://www.FedRAMP.gov/documents/','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,264,'CA-9 (d) [at least annually]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,266,'CM-1 (c)(1) [at least every 3 years] 
 CM-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,267,'CM-2 (b)(1) [at least annually and when a significant change occurs]
 CM-2 (b)(2) [to include when directed by the JAB]','CM-2 (b)(1) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,269,'CM-2(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,270,'CM-2(3)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,274,'CM-2(7)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,275,'CM-3','CM-3 Requirement: The service provider establishes a central means of communicating major changes to or developments in the information system or environment of operations that may affect its services to the federal government and associated service consumers (e.g., electronic bulletin board, web status page). The means of communication are approved and accepted by the JAB/AO.
 CM-3 (e) Guidance: In accordance with record retention policies and procedures.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,277,'CM-3(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,279,'CM-3(4)-2 [Configuration control board (CCB) or similar (as defined in CM-3)]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,284,'CM-4',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,286,'CM-4(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,287,'CM-5',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,295,'CM-6','CM-6 (a) Requirement 1: The service provider shall use the DoD STIGs to establish configuration settings; Center for Internet Security up to Level 2 (CIS Level 2) guidelines shall be used if STIGs are not available; Custom baselines shall be used if CIS is not available.
 CM-6 (a) Requirement 2: The service provider shall ensure that checklists for configuration settings are Security Content Automation Protocol (SCAP) validated or SCAP compatible (if validated checklists are not available).
 
 CM-6 Guidance: Compliance checks are used to evaluate configuration settings and provide general insight into the overall effectiveness of configuration management activities. CSPs and 3PAOs typically combine compliance check findings into a single CM-6 finding, which is acceptable. However, for initial assessments, annual assessments, and significant change requests, FedRAMP requires a clear understanding, on a per-control basis, where risks exist. Therefore, 3PAOs must also analyze compliance check findings as part of the controls assessment. Where a direct mapping exists, the 3PAO must document additional findings per control in the corresponding SAR Risk Exposure Table (RET), which are then documented in the CSP’s Plan of Action and Milestones (POA&M). This will likely result in the details of individual control findings overlapping with those in the combined CM-6 finding, which is acceptable.
 During monthly continuous monitoring, new findings from CSP compliance checks may be combined into a single CM-6 POA&M item. CSPs are not required to map the findings to specific controls because controls are only assessed during initial assessments, annual assessments, and significant change requests.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,296,'CM-6(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,300,'CM-7','CM-7 (b) Requirement: The service provider shall use Security guidelines (See CM-6) to establish list of prohibited or restricted functions, ports, protocols, and/or services or establishes its own list of prohibited or restricted functions, ports, protocols, and/or services if STIGs or CIS is not available.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,301,'CM-7(1) (a) [at least annually]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,302,'CM-7(2)','CM-7(2) Guidance: This control refers to software deployment by CSP personnel into the production environment. The control requires a policy that states conditions for deploying software. This control shall be implemented in a technical manner on the information system to only allow programs to run that adhere to the policy (i.e. allow-listing). This control is not to be based off of strictly written policy on what is allowed or not allowed to run.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,305,'CM-7(5) (c) [at least quarterly or when there is a change]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,310,'CM-8 (b) [at least monthly]','CM-8 Requirement: must be provided at least monthly or when there is a change.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,311,'CM-8(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,313,'CM-8(3) (a)-1 [automated mechanisms with a maximum five-minute delay in detection.] 
 CM-8(3) (a)-2 [continuously]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,320,'CM-9','CM-9 Guidance: FedRAMP does not provide a template for the Configuration Management Plan. However, NIST SP 800-128, Guide for Security-Focused Configuration Management of Information Systems, provides guidelines for the implementation of CM controls as well as a sample CMP outline in Appendix D of the Guide','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,322,'CM-10',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,324,'CM-11 (c) [Continuously (via CM-7(5))]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,328,'CM-12','CM-12 Requirement: According to FedRAMP Authorization Boundary Guidance','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,329,'CM-12(1)-1: [Federal data and system data that must be protected at the High or Moderate impact levels]','CM-12(1) Requirement: According to FedRAMP Authorization Boundary Guidance.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,332,'CP-1 (c)(1) [at least every 3 years] 
 CP-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,333,'CP-2 (d) [at least annually]','CP-2 Requirement: For JAB authorizations the contingency lists include designated FedRAMP personnel.
 
 CP-2 Requirement: CSPs must use the FedRAMP Information System Contingency Plan (ISCP) Template (available on the fedramp.gov: https://www.fedramp.gov/assets/resources/templates/SSP-A06-FedRAMP-ISCP-Template.docx).','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,334,'CP-2(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,336,'CP-2(3)-1 [all]
 CP-2(3)-2 [time period defined in service provider and organization SLA]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,341,'CP-2(8)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,342,'CP-3 (a)(1) [*See Additional Requirements]
 CP-3 (a)(3) [at least annually]
 CP-3 (b) [at least annually]','CP-3 (a) Requirement: Privileged admins and engineers must take the basic contingency training within 10 days. Consideration must be given for those privileged admins and engineers with critical contingency-related roles, to gain enough system context and situational awareness to understand the full impact of contingency training as it applies to their respective level. Newly hired critical contingency personnel must take this more in-depth training within 60 days of hire date when the training will have more impact.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,345,'CP-4 (a)-1 [at least annually] 
 CP-4 (a)-2 [functional exercises]','CP-4 (a) Requirement: The service provider develops test plans in accordance with NIST Special Publication 800-34 (as amended); plans are approved by the JAB/AO prior to initiating testing.
 
 CP-4 (b) Requirement: The service provider must include the Contingency Plan test results with the security package within the Contingency Plan-designated appendix (Appendix G, Contingency Plan Test Report).','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,346,'CP-4(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,352,'CP-6',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,353,'CP-6(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,355,'CP-6(3)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,356,'CP-7','CP-7 (a) Requirement: The service provider defines a time period consistent with the recovery time objectives and business impact analysis.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,357,'CP-7(1)','CP-7(1) Guidance: The service provider may determine what is considered a sufficient degree of separation between the primary and alternate processing sites, based on the types of threats that are of concern. For one particular type of threat (i.e., hostile cyber attack), the degree of separation between sites will be less relevant.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,358,'CP-7(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,359,'CP-7(3)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,363,'CP-8','CP-8 Requirement: The service provider defines a time period consistent with the recovery time objectives and business impact analysis.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,364,'CP-8(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,365,'CP-8(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,465,'IR-3(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,630,'PL-8 (b) [at least annually and when a significant change occurs]','PL-8 (b) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,634,'PL-10','PL-10 Requirement: Select the appropriate FedRAMP Baseline','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,369,'CP-9 (a)-2 [daily incremental; weekly full]
 CP-9 (b) [daily incremental; weekly full]
 CP-9 (c) [daily incremental; weekly full]','CP-9 Requirement: The service provider shall determine what elements of the cloud environment require the Information System Backup control. The service provider shall determine how Information System Backup is going to be verified and appropriate periodicity of the check.
 CP-9 (a) Requirement: The service provider maintains at least three backup copies of user-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (b) Requirement: The service provider maintains at least three backup copies of system-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (c) Requirement: The service provider maintains at least three backup copies of information system documentation including security information (at least one of which is available online) or provides an equivalent alternative.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,370,'CP-9(1) [at least annually]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,377,'CP-9(8) [all backup files]','CP-9(8) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,378,'CP-10',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,380,'CP-10(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,388,'IA-1 (c)(1) [at least every 3 years] 
 IA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,389,'IA-2','IA-2 Requirement: For all control enhancements that specify multifactor authentication, the implementation must adhere to the Digital Identity Guidelines specified in NIST Special Publication 800-63B.
 
 IA-2 Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2 Requirement: All uses of encrypted virtual private networks must meet all applicable Federal requirements and architecture, dataflow, and security and privacy controls must be documented, assessed, and authorized to operate.
 
 IA-2 Guidance: “Phishing-resistant" authentication refers to authentication processes designed to detect and prevent disclosure of authentication secrets and outputs to a website or application masquerading as a legitimate system.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,390,'IA-2(1)','IA-2(1) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(1) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(1) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,391,'IA-2(2)','IA-2(2) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(2) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(2) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,394,'IA-2(5)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,395,'IA-2(6)-1 [local, network and remote]
 IA-2(6)-2 [privileged accounts; non-privileged accounts]
 IA-2(6) (b) [FIPS-validated or NSA-approved cryptography]','IA-2(6) Guidance: PIV=separate device. Please refer to NIST SP 800-157 Guidelines for Derived Personal Identity Verification (PIV) Credentials.
 
 IA-2(6) Guidance: See SC-13 Guidance for more information on FIPS-validated or NSA-approved cryptography.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,397,'IA-2(8) [privileged accounts; non-privileged accounts]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,401,'IA-2(12)','IA-2(12) Guidance: Include Common Access Card (CAC), i.e., the DoD technical implementation of PIV/FIPS 201/HSPD-12.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,403,'IA-3',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,408,'IA-4 (a) [at a minimum, the ISSO (or similar role within the organization)] 
 IA-4 (d) [at least two(2) years]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,412,'IA-4(4) [contractors; foreign nationals]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,418,'IA-5','IA-5 Requirement: Authenticators must be compliant with NIST SP 800-63-3 Digital Identity Guidelines IAL, AAL, FAL level 3. Link https://pages.nist.gov/800-63-3
 
 IA-5 Guidance: SP 800-63C Section 6.2.3 Encrypted Assertion requires that authentication assertions be encrypted when passed through third parties, such as a browser. For example, a SAML assertion can be encrypted using XML-Encryption, or an OpenID Connect ID Token can be encrypted using JSON Web Encryption (JWE).','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,419,'IA-5(1)','IA-5(1) Requirement: Password policies must be compliant with NIST SP 800-63B for all memorized, lookup, out-of-band, or One-Time-Passwords (OTP). Password policies shall not enforce special character or minimum password rotation requirements for memorized secrets of users.
 
 IA-5(1) (h) Requirement: For cases where technology doesn’t allow multi-factor authentication, these rules should be enforced: must have a minimum length of 14 characters and must support all printable ASCII characters.
  
 For emergency use accounts, these rules should be enforced: must have a minimum length of 14 characters, must support all printable ASCII characters, and passwords must be changed if used. 
 
 IA-5(1) Guidance: Note that (c) and (d) require the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,420,'IA-5(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,424,'IA-5(6)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,425,'IA-5(7)','IA-5(7) Guidance: In this context, prohibited static storage refers to any storage where unencrypted authenticators, such as passwords, persist beyond the time required to complete the access process.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,437,'IA-6',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,438,'IA-7',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,439,'IA-8',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,440,'IA-8(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,441,'IA-8(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,443,'IA-8(4)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,450,'IA-11','IA-11 Guidance:
 The fixed time period cannot exceed the limits set in SP 800-63. At this writing they are:
 - AAL3 (high baseline)
  -- 12 hours or
  -- 15 minutes of inactivity','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,451,'IA-12','IA-12 Additional FedRAMP Requirements and Guidance:
 Guidance: In accordance with NIST SP 800-63A Enrollment and Identity Proofing','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,453,'IA-12(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,454,'IA-12(3)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,456,'IA-12(5)','IA-12(5) Additional FedRAMP Requirements and Guidance:
 Guidance: In accordance with NIST SP 800-63A Enrollment and Identity Proofing','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,458,'IR-1 (c)(1) [at least every 3 years] 
 IR-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,459,'IR-2 (a)(1) [ten(10) days for privileged users, thirty(30) days for Incident Response roles]
 IR-2 (a)(3) [at least annually]
 IR-2 (b) [at least annually]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,635,'PL-11',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (2,599,'PE-13',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (3,467,'IR-4','IR-4 Requirement: The FISMA definition of "incident" shall be used: "An occurrence that actually or imminently jeopardizes, without lawful authority, the confidentiality, integrity, or availability of information or an information system; or constitutes a violation or imminent threat of violation of law, security policies, security procedures, or acceptable use policies."
 
 IR-4 Requirement: The service provider ensures that individuals conducting incident handling meet personnel security requirements commensurate with the criticality/sensitivity of the information being processed, stored, and transmitted by the information system.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,468,'IR-4(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,483,'IR-5',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,485,'IR-6 (a) [US-CERT incident reporting timelines as specified in NIST Special Publication 800-61 (as amended)]','IR-6 Requirement: Reports security incident information according to FedRAMP Incident Communications Procedure.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,486,'IR-6(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,488,'IR-6(3)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,489,'IR-7',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,490,'IR-7(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,492,'IR-8 (a)(9)-2 [at least annually]
 IR-8 (b) [see additional FedRAMP Requirements and Guidance]
 IR-8 (d) [see additional FedRAMP Requirements and Guidance]','IR-8 (b) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.
 IR-8 (d) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,494,'IR-9',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,496,'IR-9(2) [at least annually]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,497,'IR-9(3)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,498,'IR-9(4)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,500,'MA-1 (c)(1) [at least every 3 years]
 MA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,501,'MA-2',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,504,'MA-3 (b) [at least annually]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,505,'MA-3(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,506,'MA-3(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,507,'MA-3(3) (d) [the information owner]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,511,'MA-4',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,519,'MA-5',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,520,'MA-5(1)','MA-5(1) Requirement: Only MA-5(1) (a)(1) is required by FedRAMP Moderate Baseline','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,525,'MA-6-2 [a timeframe to support advertised uptime and availability]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,530,'MP-1 (c)(1) [at least every 3 years] 
 MP-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,531,'MP-2-1 [all types of digital and/or non-digital media containing sensitive information]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,534,'MP-3 (b)-1 [no removable media types]
 MP-3 (b)-2 [organization-defined security safeguards not applicable]','MP-3 (b) Guidance: Second parameter not-applicable','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,535,'MP-4 (a)-1 [all types of digital and non-digital media with sensitive information] 
 MP-4 (a)-2 [see additional FedRAMP requirements and guidance]','MP-4 (a) Requirement: The service provider defines controlled areas within facilities where the information and information system reside.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,538,'MP-5 (a) [all media with sensitive information] [prior to leaving secure/controlled environment: for digital media, encryption in compliance with Federal requirements and utilizes FIPS validated or NSA approved cryptography (see SC-13.); for non-digital media, secured in locked container]','MP-5 (a) Requirement: The service provider defines security measures to protect digital and non-digital media in transport. The security measures are approved and accepted by the JAB/AO.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,543,'MP-6 (a)-2 [techniques and procedures IAW NIST SP 800-88 Section 4: Reuse and Disposal of Storage Media and Hardware]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,552,'MP-7',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,560,'PE-1 (c)(1) [at least every 3 years] 
 PE-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,561,'PE-2 (c) [at least annually]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,565,'PE-3 (a)(2) [CSP defined physical access control systems/devices AND guards]
 PE-3 (d) [in all circumstances within restricted access area where the information system resides]
 PE-3 (f)-2 [at least annually]
 PE-3 (g) [at least annually or earlier as required by a security relevant event.]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,574,'PE-4',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,575,'PE-5',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,579,'PE-6 (b)-1 [at least monthly]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,580,'PE-6(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,585,'PE-8 (a) [for a minimum of one(1) year]
 PE-8 (b) [at least monthly]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,589,'PE-9',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,592,'PE-10 (b) [near more than one egress point of the IT area and ensures it is labeled and protected by a cover to prevent accidental shut-off]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,594,'PE-11',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,597,'PE-12',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,599,'PE-13',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,600,'PE-13(1) -1 [service provider building maintenance/physical security personnel]
 PE-13(1) -2 [service provider emergency responders with incident response responsibilities]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,601,'PE-13(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,604,'PE-14 (a) [consistent with American Society of Heating, Refrigerating and Air-conditioning Engineers (ASHRAE) document entitled Thermal Guidelines for Data Processing Environments]
 
 PE-14 (b) [continuously]','PE-14 (a) Requirement: The service provider measures temperature at server inlets and humidity levels by dew point.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,607,'PE-15',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,609,'PE-16 (a) [all information system components]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,610,'PE-17',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,619,'PL-1 (c)(1) [at least every 3 years] 
 PL-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,620,'PL-2 (a)(14) [to include chief privacy and ISSO and/or similar role or designees]
 PL-2 (b) [to include chief privacy and ISSO and/or similar role]
 PL-2 (c) [at least annually]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,625,'PL-4 (c) [at least every 3 years]
 PL-4 (d) [at least annually and when the rules are revised or changed]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,626,'PL-4(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (2,531,'MP-2',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (3,675,'PS-3 (b) [for national security clearances; a reinvestigation is required during the fifth(5th) year for top secret security clearance, the tenth(10th) year for secret security clearance, and fifteenth(15th) year for confidential security clearance.
 
 For moderate risk law enforcement and high impact public trust level, a reinvestigation is required during the fifth(5th) year. There is no reinvestigation for other moderate risk positions or any low risk positions]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,680,'PS-4 (a) [four(4) hours]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,683,'PS-5 (b)-2 [twenty-four(24) hours] 
 PS-5 (d)-1 [including access control personnel responsible for the system]
 PS-5 (d)-2 [twenty-four(24) hours]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,684,'PS-6 (b) [at least annually]
 PS-6 (c)(2) [at least annually and any time there is a change to the user''s level of access]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,688,'PS-7 (d)-1 [including access control personnel responsible for the system and/or facilities, as appropriate]
 PS-7 (d)-2 [within twenty-four(24) hours]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,689,'PS-8 (b)-1 [to include the ISSO and/or similar role within the organization]
 PS-8 (b)-2 [24 hours]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,690,'PS-9',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,712,'RA-1 (c)(1) [at least every 3 years] 
 RA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,713,'RA-2',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,715,'RA-3 (c) [security assessment report]
 
 RA-3 (d) [at least every three(3) years and when a significant change occurs]
 
 RA-3 (f) [at least every three(3) years]','RA-3 Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.
 RA-3 (e) Requirement: Include all Authorizing Officials; for JAB authorizations to include FedRAMP.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,716,'RA-3(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,721,'RA-5 (a) [monthly operating system/infrastructure; monthly web applications (including APIs) and databases]
 RA-5 (d) [high-risk vulnerabilities mitigated within thirty(30) days from date of discovery; moderate-risk vulnerabilities mitigated within ninety(90) days from date of discovery; low risk vulnerabilities mitigated within one hundred and eighty(180) days from date of discovery]','RA-5 Guidance: See the FedRAMP Documents page> Vulnerability Scanning Requirements 
 https://www.FedRAMP.gov/documents/
 RA-5 (a) Requirement: an accredited independent assessor scans operating systems/infrastructure, web applications, and databases once annually.
 RA-5 (d) Requirement: If a vulnerability is listed among the CISA Known Exploited Vulnerability (KEV) Catalog (https://www.cisa.gov/known-exploited-vulnerabilities-catalog) the KEV remediation date supersedes the FedRAMP parameter requirement.
 RA-5 (e) Requirement: to include all Authorizing Officials; for JAB authorizations to include FedRAMP
 
 RA-5 Guidance: Informational findings from a scanner are detailed as a returned result that holds no vulnerability risk or severity and for FedRAMP does not require an entry onto the POA&M or entry onto the RET during any assessment phase.
 Warning findings, on the other hand, are given a risk rating (low, moderate, high or critical) by the scanning solution and should be treated like any other finding with a risk or severity rating for tracking purposes onto either the POA&M or RET depending on when the findings originated (during assessments or during monthly continuous monitoring). If a warning is received during scanning, but further validation turns up no actual issue then this item should be categorized as a false positive. If this situation presents itself during an assessment phase (initial assessment, annual assessment or any SCR), follow guidance on how to report false positives in the Security Assessment Report (SAR). If this situation happens during monthly continuous monitoring, a deviation request will need to be submitted per the FedRAMP Vulnerability Deviation Request Form.
 Warnings are commonly associated with scanning solutions that also perform compliance scans, and if the scanner reports a “warning” as part of the compliance scanning of a CSO, follow guidance surrounding the tracking of compliance findings during either the assessment phases (initial assessment, annual assessment or any SCR) or monthly continuous monitoring as it applies. Guidance on compliance scan findings can be found by searching on “Tracking of Compliance Scans” in FAQs.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,723,'RA-5(2) [within 24 hours prior to
 running scans]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,724,'RA-5(3)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,726,'RA-5(5)-1 [all components that support authentication] 
 RA-5(5)-2 [all scans]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,732,'RA-5(11)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,734,'RA-7',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,736,'RA-9',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,738,'SA-1 (c)(1) [at least every 3 years] 
 SA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,739,'SA-2',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,740,'SA-3',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,744,'SA-4','SA-4 Requirement: The service provider must comply with Federal Acquisition Regulation (FAR) Subpart 7.103, and Section 889 of the John S. McCain National Defense Authorization Act (NDAA) for Fiscal Year 2019 (Pub. L. 115-232), and FAR Subpart 4.21, which implements Section 889 (as well as any added updates related to FISMA to address security concerns in the system acquisitions process).
 
 SA-4 Guidance: The use of Common Criteria (ISO/IEC 15408) evaluated products is strongly preferred.
 See https://www.niap-ccevs.org/Product/index.cfm or https://www.commoncriteriaportal.org/products/.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,745,'SA-4(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,746,'SA-4(2)-1 [at a minimum to include security-relevant external system interfaces; high-level design; low-level design; source code or network and data flow diagram; [organization-defined design/implementation information]]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,753,'SA-4(9)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,754,'SA-4 (10)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,757,'SA-5 (d) [at a minimum, the ISSO (or similar role within the organization)]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,765,'SA-8',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,799,'SA-9 (a) [Appropriate FedRAMP Security Controls Baseline (s) if Federal information is processed or stored within the external system]
 SA-9 (c) [Federal/FedRAMP Continuous Monitoring requirements must be met for external systems where Federal information is processed or stored]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,800,'SA-9(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,801,'SA-9(2) [all external systems where Federal information is processed or stored]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,804,'SA-9(5)-1 [information processing, information or data, AND system services]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,808,'SA-10 (a) [development, implementation, AND operation]','SA-10 (e) Requirement: track security flaws and flaw resolution within the system, component, or service and report findings to organization-defined personnel, to include FedRAMP.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,816,'SA-11',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,817,'SA-11(1)','SA-11(1) Requirement: The service provider must document its methodology for reviewing newly developed code for the Service in its Continuous Monitoring Plan.
 
 If Static code analysis cannot be performed (for example, when the source code is not available), then dynamic code analysis must be performed (see SA-11(8))','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,818,'SA-11(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (1,734,'RA-7',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,845,'SA-15 (b)-1 [frequency at least annually]
 SA-15 (b)-2 [FedRAMP Security Authorization requirements]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,848,'SA-15(3)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,880,'SA-22',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,893,'SC-4',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,896,'SC-5 (a)-1 [Protect against] 
 SC-5 (a)-2 [at a minimum: ICMP (ping) flood, SYN flood, slowloris, buffer overflow attack, and volume attack]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,901,'SC-7','SC-7 (b) Guidance: SC-7 (b) should be met by subnet isolation. A subnetwork (subnet) is a physically or logically segmented section of a larger network defined at TCP/IP Layer 3, to both minimize traffic and, important for a FedRAMP Authorization, add a crucial layer of network isolation. Subnets are distinct from VLANs (Layer 2), security groups, and VPCs and are specifically required to satisfy SC-7 part b and other controls. See the FedRAMP Subnets White Paper (https://www.fedramp.gov/assets/resources/documents/FedRAMP_subnets_white_paper.pdf) for additional information.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,904,'SC-7(3)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,905,'SC-7(4) (e) [at least every 180 days or whenever there is a change in the threat environment that warrants a review of the exceptions]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,906,'SC-7(5) [any systems]','SC-7(5) Guidance: For JAB Authorization, CSPs shall include details of this control in their Architecture Briefing','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,908,'SC-7(7)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,909,'SC-7(8)-2 [any network outside of organizational control and any network outside the authorization boundary]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,913,'SC-7(12)-1 [Host Intrusion Prevention System (HIPS), Host Intrusion Detection System (HIDS), or minimally a host-based firewall]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,919,'SC-7(18)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,931,'SC-8 [confidentiality AND integrity]','SC-8 Guidance:
 For each instance of data in transit, confidentiality AND integrity should be through cryptography as specified in SC-8(1), physical means as specified in SC-8(5), or in combination.
 
 For clarity, this control applies to all data in transit. Examples include the following data flows:
  - Crossing the system boundary
  - Between compute instances - including containers
  - From a compute instance to storage
  - Replication between availability zones
  - Transmission of backups to storage
  - From a load balancer to a compute instance
  - Flows from management tools required for their work – e.g. log collection, scanning, etc.
 
 The following applies only when choosing SC-8(5) in lieu of SC-8(1).
 FedRAMP-Defined Assignment / Selection Parameters 
 SC-8(5)-1 [a hardened or alarmed carrier Protective Distribution System (PDS) when outside of Controlled Access Area (CAA)]
 SC-8(5)-2 [prevent unauthorized disclosure of information AND detect changes to information] 
 
 SC-8 Guidance:
 SC-8(5) applies when physical protection has been selected as the method to protect confidentiality and integrity. For physical protection, data in transit must be in either a Controlled Access Area (CAA), or a Hardened or alarmed PDS.
 
 Hardened or alarmed PDS: Shall be as defined in SECTION X - CATEGORY 2 PDS INSTALLATION GUIDANCE of CNSSI No.7003, titled PROTECTED DISTRIBUTION SYSTEMS (PDS). Per the CNSSI No. 7003 Section VIII, PDS must originate and terminate in a Controlled Access Area (CAA). 
 
 Controlled Access Area (CAA): Data will be considered physically protected, and in a CAA if it meets Section 2.3 of the DHS’s Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies. CSPs can meet Section 2.3 of the DHS’ recommended practice by satisfactory implementation of the following controls PE-2(1), PE-2(2), PE-2(3), PE-3(2), PE-3(3), PE-6(2), and PE-6(3).
 
 Note: When selecting SC-8(5), the above SC-8(5), and the above referenced PE controls must be added to the SSP.
 
 CNSSI No.7003 can be accessed here:
 https://www.dcsa.mil/Portals/91/documents/ctp/nao/CNSSI_7003_PDS_September_2015.pdf 
 
 DHS Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies can be accessed here:
 https://us-cert.cisa.gov/sites/default/files/FactSheets/NCCIC%20ICS_FactSheet_Defense_in_Depth_Strategies_S508C.pdf','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,932,'SC-8(1) [prevent unauthorized disclosure of information AND detect changes to information]','SC-8(1) Requirement: Please ensure SSP Section 10.3 Cryptographic Modules Implemented for Data At Rest (DAR) and Data In Transit (DIT) is fully populated for reference in this control.
 
 SC-8(1) Guidance:
 See M-22-9, including "Agencies encrypt all DNS requests and HTTP traffic within their environment"
 
 SC-8(1) applies when encryption has been selected as the method to protect confidentiality and integrity. Otherwise refer to SC-8(5). SC-8(1) is strongly encouraged.
 
 SC-8(1) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)
 
 SC-8(1) Guidance: When leveraging encryption from the underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,938,'SC-10 [no longer than ten(10) minutes for privileged sessions and no longer than fifteen(15) minutes for user sessions]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,941,'SC-12 [In accordance with Federal requirements]','SC-12 Guidance: See references in NIST 800-53 documentation.
 
 SC-12 Guidance: Must meet applicable Federal Cryptographic Requirements. See References Section of control.
 
 SC-12 Guidance: Wildcard certificates may be used internally within the system, but are not permitted for external customer access to the system.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,948,'SC-13 (b) [FIPS-validated or NSA-approved cryptography]','SC-13 Guidance:
 This control applies to all use of cryptography. In addition to encryption, this includes functions such as hashing, random number generation, and key generation. Examples include the following:
  - Encryption of data
  - Decryption of data
  - Generation of one time passwords (OTPs) for MFA
  - Protocols such as TLS, SSH, and HTTPS
 
 The requirement for FIPS 140 validation, as well as timelines for acceptance of FIPS 140-2, and 140-3 can be found at the NIST Cryptographic Module Validation Program (CMVP).
 https://csrc.nist.gov/projects/cryptographic-module-validation-program 
 
 SC-13 Guidance: For NSA-approved cryptography, the National Information Assurance Partnership (NIAP) oversees a national program to evaluate Commercial IT Products for Use in National Security Systems. The NIAP Product Compliant List can be found at the following location:
 https://www.niap-ccevs.org/Product/index.cfm 
 
 SC-13 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-13 Guidance:
 Moving to non-FIPS CM or product is acceptable when:
 - FIPS validated version has a known vulnerability
 - Feature with vulnerability is in use
 - Non-FIPS version fixes the vulnerability
 - Non-FIPS version is submitted to NIST for FIPS validation
 - POA&M is added to track approval, and deployment when ready
 
 SC-13 Guidance: At a minimum, this control applies to cryptography in use for the following controls: AU-9(3), CP-9(8), IA-2(6), IA-5(1), MP-5, SC-8(1), and SC-28(1).','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,954,'SC-15 (a) [no exceptions for computing devices]','SC-15 Requirement: The information system provides disablement (instead of physical disconnect) of collaborative computing devices in a manner that supports ease of use.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,963,'SC-17',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,964,'SC-18',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (10,1301,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (3,1163,'SR-1 (a) [to include chief privacy and ISSO and/or similar role or designees]
 SR-1 (c)(1) [at least every 3 years] 
 SR-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1164,'SR-2 (b) [at least annually]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1165,'SR-2(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (2,248,'CA-5 (b) [at least monthly]','CA-5 Requirement: POA&Ms must be provided at least monthly.
 CA-5 Guidance: Reference FedRAMP-POAM-Template','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (3,971,'SC-20','SC-20 Requirement:
 Control Description should include how DNSSEC is implemented on authoritative DNS servers to supply valid responses to external DNSSEC requests.
 
 SC-20 Requirement: Authoritative DNS servers must be geolocated in accordance with SA-9(5).
 
 SC-20 Guidance: SC-20 applies to use of external authoritative DNS to access a CSO from outside the boundary.
 
 SC-20 Guidance:
 External authoritative DNS servers may be located outside an authorized environment. Positioning these servers inside an authorized boundary is encouraged.
 
 SC-20 Guidance: CSPs are recommended to self-check DNSSEC configuration through one of many available analyzers such as Sandia National Labs (https://dnsviz.net)','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,974,'SC-21','SC-21 Requirement:
 Control description should include how DNSSEC is implemented on recursive DNS servers to make DNSSEC requests when resolving DNS requests from internal components to domains external to the CSO boundary.
 - If the reply is signed, and fails DNSSEC, do not use the reply
 - If the reply is unsigned:
  -- CSP chooses the policy to apply
 
 SC-21 Requirement:
 Internal recursive DNS servers must be located inside an authorized environment. It is typically within the boundary, or leveraged from an underlying IaaS/PaaS.
 
 SC-21 Guidance: Accepting an unsigned reply is acceptable
 
 SC-21 Guidance:
 SC-21 applies to use of internal recursive DNS to access a domain outside the boundary by a component inside the boundary.
 - DNSSEC resolution to access a component inside the boundary is excluded.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,976,'SC-22',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,977,'SC-23',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,988,'SC-28 [confidentiality AND integrity]','SC-28 Guidance: The organization supports the capability to use cryptographic mechanisms to protect information at rest. 
 
 SC-28 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-28 Guidance: Note that this enhancement requires the use of cryptography in accordance with SC-13.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,989,'SC-28(1)-1 [all information system components storing Federal data or system data that must be protected at the High or Moderate impact levels]','SC-28(1) Guidance: 
 Organizations should select a mode of protection that is targeted towards the relevant threat scenarios. 
 Examples:
 A. Organizations may apply full disk encryption (FDE) to a mobile device where the primary threat is loss of the device while storage is locked. 
 B. For a database application housing data for a single customer, encryption at the file system level would often provide more protection than FDE against the more likely threat of an intruder on the operating system accessing the storage.
 C. For a database application housing data for multiple customers, encryption with unique keys for each customer at the database record level may be more appropriate.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1018,'SC-39',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1035,'SC-45',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1036,'SC-45(1) (a) [At least hourly] [http://tf.nist.gov/tf-cgi/servers.cgi] 
 SC-45(1) (b) [any difference]','SC-45(1) Requirement: The service provider selects primary and secondary time servers used by the NIST Internet time service. The secondary server is selected from a different geographic region than the primary server.
 SC-45(1) Requirement: The service provider synchronizes the system clocks of network computers that run operating systems other than Windows to the Windows Server Domain Controller emulator or to the same time source for that server.
 SC-45(1) Guidance: Synchronization of system clocks improves the accuracy of log analysis.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1045,'SI-1 (c)(1) [at least every 3 years] 
 SI-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1046,'SI-2 (c) [within thirty(30) days of release of updates]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1048,'SI-2(2)-2 [at least monthly]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1049,'SI-2(3)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1053,'SI-3 (a) [signature based and non-signature based]
 SI-3 (c)(1)-1 [at least weekly] 
 SI-3 (c)(1)-2 [to include endpoints and network entry and exit points]
 SI-3 (c)(2)-1 [to include blocking and quarantining malicious code]
 SI-3 (c)(2)-2 [administrator or defined security personnel near-realtime]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,1064,'SI-4','SI-4 Guidance: See US-CERT Incident Response Reporting Guidelines.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1065,'SI-4(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1066,'SI-4(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1068,'SI-4(4) (b)-1 [continuously]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1069,'SI-4(5)','SI-4(5) Guidance: In accordance with the incident response plan.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1080,'SI-4(16)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1082,NULL,NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1087,'SI-4 (23)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1090,'SI-5 (a) [to include US-CERT and Cybersecurity and Infrastructure Security Agency (CISA) Directives]
 SI-5 (c) [to include system security personnel and administrators with configuration/patch-management responsibilities]','SI-5 Requirement: Service Providers must address the CISA Emergency and Binding Operational Directives applicable to their cloud service offering per FedRAMP guidance. This includes listing the applicable directives and stating compliance status.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1092,'SI-6 (b) -1 [to include upon system startup and/or restart] -2 [at least monthly]
 SI-6 (c) [to include system administrators and security personnel]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,1096,'SI-7',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1097,'SI-7(1)-2 [selection to include security relevant events] 
 SI-7(1)-3 [at least monthly]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1103,'SI-7(7)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1114,'SI-8','SI-8 Guidance: 
 When CSO sends email on behalf of the government as part of the business offering, Control Description should include implementation of Domain-based Message Authentication, Reporting & Conformance (DMARC) on the sending domain for outgoing messages as described in DHS Binding Operational Directive (BOD) 18-1.
 https://cyber.dhs.gov/bod/18-1/ 
 
 SI-8 Guidance: CSPs should confirm DMARC configuration (where appropriate) to ensure that policy=reject and the rua parameter includes reports@dmarc.cyber.dhs.gov. DMARC compliance should be documented in the SI-8 control implementation solution description, and list the FROM: domain(s) that will be seen by email recipients.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1116,'SI-8(2)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1119,'SI-10','SI-10 Requirement: Validate all information inputs and document any exceptions','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1126,'SI-11 (b) [to include the ISSO and/or similar role within the organization]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1127,'SI-12',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1142,'SI-16',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (2,543,'MP-6 (a)-2 [techniques and procedures IAW NIST SP 800-88 Section 4: Reuse and Disposal of Storage Media and Hardware]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (3,1166,'SR-3','SR-3 Requirement: CSO must document and maintain the supply chain custody, including replacement devices, to ensure the integrity of the devices before being introduced to the boundary.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1175,'SR-5',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1178,'SR-6 [at least annually]','SR-6 Requirement: CSOs must ensure that their supply chain vendors build and test their systems in alignment with NIST SP 800-171 or a commensurate security and compliance framework. CSOs must ensure that vendors are compliant with physical facility access and logical access controls to supplied products.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1181,'SR-8-1 [notification of supply chain compromises and results of assessment or audits]','SR-8 Requirement: CSOs must ensure and document how they receive notifications from their supply chain vendor of newly discovered vulnerabilities including zero-day vulnerabilities.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1184,'SR-10',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1185,'SR-11','SR-11 Requirement: CSOs must ensure that their supply chain vendors provide authenticity of software and patches and the vendor must have a plan to protect the development pipeline.','2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1186,'SR-11(1)',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1187,'SR-11(2) [all]',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (3,1189,'SR-12',NULL,'2024-12-23 15:37:21.821548','2024-12-23 15:37:21.821548'),
	 (2,1,'AC-1 (c)(1) [at least every 3 years] 
 AC-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (2,2,'AC-2 (h)(1) [twenty-four(24) hours]
 AC-2 (h)(2) [eight(8) hours]
 AC-2 (h)(3) [eight(8) hours]
 AC-2 (j) [at least annually]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,16,'AC-3',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,77,'AC-7','AC-7 Requirement: In alignment with NIST SP 800-63B','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,82,'AC-8 (a) [see additional Requirements and Guidance]
 AC-8 (c)(1) [see additional Requirements and Guidance]','AC-8 Requirement: The service provider shall determine elements of the cloud environment that require the System Use Notification control. The elements of the cloud environment that require System Use Notification are approved and accepted by the JAB/AO. 
 
 Requirement: The service provider shall determine how System Use Notification is going to be verified and provide appropriate periodicity of the check. The System Use Notification verification and periodicity are approved and accepted by the JAB/AO.
 
 Requirement: If not performed as part of a Configuration Baseline check, then there must be documented agreement on how to provide results of verification and the necessary periodicity of the verification by the service provider. The documented agreement on how to provide verification of the results are approved and accepted by the JAB/AO.
 
 Guidance: If performed as part of a Configuration Baseline check, then the % of items requiring setting that are checked and that pass (or fail) check can be provided.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,96,'AC-14',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,110,'AC-17',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,121,'AC-18',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,127,'AC-19',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,133,'AC-20','AC-20 Guidance: The interrelated controls of AC-20, CA-3, and SA-9 should be differentiated as follows:
 AC-20 describes system access to and from external systems.
 CA-3 describes documentation of an agreement between the respective system owners when data is exchanged between the CSO and an external system.
 SA-9 describes the responsibilities of external system owners. These responsibilities would typically be captured in the agreement required by CA-3.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,142,'AC-22 (d) [at least quarterly]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (2,148,'AT-1 (c)(1) [at least every 3 years] 
 AT-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,149,'AT-2 (a)(1) [at least annually]
 AT-2 (c) [at least annually]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,151,'AT-2(2)',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,156,'AT-3 (a)(1) [at least annually]
 AT-3 (b) [at least annually]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,162,'AT-4 (b) [at least one(1) year or 1 year after completion of a specific training program]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,165,'AU-1 (c)(1) [at least every 3 years] 
 AU-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,166,'AU-2 (a) [successful and unsuccessful account logon events, account management events, object access, policy change, privilege functions, process tracking, and system events. For Web applications: all administrator activity, authentication checks, authorization checks, data deletions, data access, data changes, and permission changes]
 AU-2 (c) [organization-defined subset of the auditable events defined in AU-2a to be audited continually for each identified event].
 AU-2 (e) [annually and whenever there is a change in the threat environment]','AU-2 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO.
 AU-2 (e) Guidance: Annually or whenever changes in the threat environment are communicated to the service provider by the JAB/AO.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,171,'AU-3',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,175,'AU-4',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,177,'AU-5 (b) [overwrite oldest record]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (2,183,'AU-6 (a)-1 [at least weekly]','AU-6 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO. In multi-tenant environments, capability and means for providing review, analysis, and reporting to consumer for data pertaining to consumer shall be documented.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,197,'AU-8 (b) [one second granularity of time measurement]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,200,'AU-9',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,214,'AU-11 [a time period in compliance with M-21-31]','AU-11 Requirement: The service provider retains audit records on-line for at least ninety days and further preserves audit records off-line for a period that is in accordance with NARA requirements. 
 AU-11 Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf)
 AU-11 Guidance: The service provider is encouraged to align with M-21-31 where possible','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,216,'AU-12 (a) [all information system and network components where audit capability is deployed/available]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,234,'CA-1 (c)(1) [at least every 3 years] 
 CA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,552,'MP-7',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (10,1262,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (2,235,'CA-2 (d) [at least annually] 
 CA-2 (f) [individuals or roles to include FedRAMP PMO]','CA-2 Guidance: Reference FedRAMP Annual Assessment Guidance.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,236,'CA-2(1)','CA-2(1) Requirement: For JAB Authorization, must use an accredited 3PAO.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (2,250,'CA-6 (e) [in accordance with OMB A-130 requirements or when a significant change occurs]','CA-6 (e) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F and according to FedRAMP Significant Change Policies and Procedures. The service provider describes the types of changes to the information system or the environment of operations that would impact the risk posture. The types of changes are approved and accepted by the JAB/AO.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,253,'CA-7 (g)-1 [to include JAB/AO]','CA-7 Requirement: Operating System, Database, Web Application, Container, and Service Configuration Scans: at least monthly. All scans performed by Independent Assessor: at least annually.
 CA-7 Requirement: CSOs with more than one agency ATO must implement a collaborative Continuous Monitoring (ConMon) approach described in the FedRAMP Guide for Multi-Agency Continuous Monitoring. This requirement applies to CSOs authorized via the Agency path as each agency customer is responsible for performing ConMon oversight. It does not apply to CSOs authorized via the JAB path because the JAB performs ConMon oversight.
 CA-7 Guidance: FedRAMP does not provide a template for the Continuous Monitoring Plan. CSPs should reference the FedRAMP Continuous Monitoring Strategy Guide when developing the Continuous Monitoring Plan.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,257,'CA-7(4)',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,260,'CA-8-1 [at least annually]','CA-8 Guidance: Reference the FedRAMP Penetration Test Guidance.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,264,'CA-9',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,266,'CM-1 (c)(1) [at least every 3 years] 
 CM-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,267,'CM-2 (b)(1) [at least annually and when a significant change occurs]
 CM-2 (b)(2) [to include when directed by the JAB]','CM-2 (b)(1) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,284,'CM-4',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,287,'CM-5',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,295,'CM-6','CM-6 (a) Requirement 1: The service provider shall use the DoD STIGs to establish configuration settings; Center for Internet Security up to Level 2 (CIS Level 2) guidelines shall be used if STIGs are not available; Custom baselines shall be used if CIS is not available.
 CM-6 (a) Requirement 2: The service provider shall ensure that checklists for configuration settings are Security Content Automation Protocol (SCAP) validated or SCAP compatible (if validated checklists are not available).
 
 CM-6 Guidance: Compliance checks are used to evaluate configuration settings and provide general insight into the overall effectiveness of configuration management activities. CSPs and 3PAOs typically combine compliance check findings into a single CM-6 finding, which is acceptable. However, for initial assessments, annual assessments, and significant change requests, FedRAMP requires a clear understanding, on a per-control basis, where risks exist. Therefore, 3PAOs must also analyze compliance check findings as part of the controls assessment. Where a direct mapping exists, the 3PAO must document additional findings per control in the corresponding SAR Risk Exposure Table (RET), which are then documented in the CSP’s Plan of Action and Milestones (POA&M). This will likely result in the details of individual control findings overlapping with those in the combined CM-6 finding, which is acceptable.
 During monthly continuous monitoring, new findings from CSP compliance checks may be combined into a single CM-6 POA&M item. CSPs are not required to map the findings to specific controls because controls are only assessed during initial assessments, annual assessments, and significant change requests.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (2,300,'CM-7','CM-7 (b) Requirement: The service provider shall use Security guidelines (See CM-6) to establish list of prohibited or restricted functions, ports, protocols, and/or services or establishes its own list of prohibited or restricted functions, ports, protocols, and/or services if STIGs or CIS is not available.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,310,'CM-8 (b) [at least monthly]','CM-8 Requirement: must be provided at least monthly or when there is a change.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,322,'CM-10',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,324,'CM-11 (c) [Continuously (via CM-7(5))]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,332,'CP-1 (c)(1) [at least every 3 years] 
 CP-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,333,'CP-2 (d) [at least annually]','CP-2 Requirement: For JAB authorizations the contingency lists include designated FedRAMP personnel.
 
 CP-2 Requirement: CSPs must use the FedRAMP Information System Contingency Plan (ISCP) Template (available on the fedramp.gov: https://www.fedramp.gov/assets/resources/templates/SSP-A06-FedRAMP-ISCP-Template.docx).','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,342,'CP-3 (a)(1) [*See Additional Requirements]
 CP-3 (a)(3) [at least annually]
 CP-3 (b) [at least annually]','CP-3 (a) Requirement: Privileged admins and engineers must take the basic contingency training within 10 days. Consideration must be given for those privileged admins and engineers with critical contingency-related roles, to gain enough system context and situational awareness to understand the full impact of contingency training as it applies to their respective level. Newly hired critical contingency personnel must take this more in-depth training within 60 days of hire date when the training will have more impact.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,345,'CP-4 (a)-1 [at least every 3 years] 
 CP-4 (a)-2 [classroom exercise/table top written tests]','CP-4 (a) Requirement: The service provider develops test plans in accordance with NIST Special Publication 800-34 (as amended); plans are approved by the JAB/AO prior to initiating testing.
 
 CP-4 (b) Requirement: The service provider must include the Contingency Plan test results with the security package within the Contingency Plan-designated appendix (Appendix G, Contingency Plan Test Report).','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,560,'PE-1 (c)(1) [at least every 3 years] 
 PE-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,561,'PE-2 (c) [at least annually]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (2,565,'PE-3 (a)(2) [CSP defined physical access control systems/devices AND guards]
 PE-3 (d) [in all circumstances within restricted access area where the information system resides]
 PE-3 (f)-2 [at least annually]
 PE-3 (g) [at least annually]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,579,'PE-6 (b) [at least monthly]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,585,'PE-8 (a) [for a minimum of one(1) year]
 PE-8 (b) [at least monthly]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,597,'PE-12',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,604,'PE-14 (a) [consistent with American Society of Heating, Refrigerating and Air-conditioning Engineers (ASHRAE) document entitled Thermal Guidelines for Data Processing Environments]
 
 PE-14 (b) [continuously]','PE-14 (a) Requirement: The service provider measures temperature at server inlets and humidity levels by dew point.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,607,'PE-15',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,609,'PE-16 (a) [all information system components]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (10,1268,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1210,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (2,369,'CP-9 (a)-2 [daily incremental; weekly full]
 CP-9 (b) [daily incremental; weekly full]
 CP-9 (c) [daily incremental; weekly full]','CP-9 Requirement: The service provider shall determine what elements of the cloud environment require the Information System Backup control. The service provider shall determine how Information System Backup is going to be verified and appropriate periodicity of the check.
 CP-9 (a) Requirement: The service provider maintains at least three backup copies of user-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (b) Requirement: The service provider maintains at least three backup copies of system-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (c) Requirement: The service provider maintains at least three backup copies of information system documentation including security information (at least one of which is available online) or provides an equivalent alternative.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (2,378,'CP-10',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,388,'IA-1 (c)(1) [at least every 3 years] 
 IA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,389,'IA-2','IA-2 Requirement: For all control enhancements that specify multifactor authentication, the implementation must adhere to the Digital Identity Guidelines specified in NIST Special Publication 800-63B.
 
 IA-2 Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2 Requirement: All uses of encrypted virtual private networks must meet all applicable Federal requirements and architecture, dataflow, and security and privacy controls must be documented, assessed, and authorized to operate.
 
 IA-2 Guidance: “Phishing-resistant" authentication refers to authentication processes designed to detect and prevent disclosure of authentication secrets and outputs to a website or application masquerading as a legitimate system.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,390,'IA-2(1)','IA-2(1) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(1) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(1) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,391,'IA-2(2)','IA-2(2) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(2) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(2) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,397,'IA-2(8)',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,401,'IA-2(12)','IA-2(12) Guidance: Include Common Access Card (CAC), i.e., the DoD technical implementation of PIV/FIPS 201/HSPD-12.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,408,'IA-4 (a) [at a minimum, the ISSO (or similar role within the organization)] 
 IA-4 (d) [at least two(2) years]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,418,'IA-5','IA-5 Requirement: Authenticators must be compliant with NIST SP 800-63-3 Digital Identity Guidelines IAL, AAL, FAL level 3. Link https://pages.nist.gov/800-63-3
 
 IA-5 Guidance: SP 800-63C Section 6.2.3 Encrypted Assertion requires that authentication assertions be encrypted when passed through third parties, such as a browser. For example, a SAML assertion can be encrypted using XML-Encryption, or an OpenID Connect ID Token can be encrypted using JSON Web Encryption (JWE).','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,419,'IA-5(1)','IA-5(1) Requirement: Password policies must be compliant with NIST SP 800-63B for all memorized, lookup, out-of-band, or One-Time-Passwords (OTP). Password policies shall not enforce special character or minimum password rotation requirements for memorized secrets of users.
 
 IA-5(1) (h) Requirement: For cases where technology doesn’t allow multi-factor authentication, these rules should be enforced: must have a minimum length of 14 characters and must support all printable ASCII characters.
  
 For emergency use accounts, these rules should be enforced: must have a minimum length of 14 characters, must support all printable ASCII characters, and passwords must be changed if used. 
 
 IA-5(1) Guidance: Note that (c) and (d) require the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (2,437,'IA-6',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,438,'IA-7',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,439,'IA-8',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,440,'IA-8(1)',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,441,'IA-8(2)',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,443,'IA-8(4)',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,450,'IA-11','IA-11 Guidance:
 The fixed time period cannot exceed the limits set in SP 800-63. At this writing they are:
 - AAL3 (high baseline)
  -- 12 hours or
  -- 15 minutes of inactivity','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,458,'IR-1 (c)(1) [at least every 3 years] 
 IR-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,459,'IR-2 (a)(1) [ten(10) days for privileged users, thirty(30) days for Incident Response roles]
 IR-2 (a)(3) [at least annually]
 IR-2 (b) [at least annually]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,467,'IR-4','IR-4 Requirement: The FISMA definition of "incident" shall be used: "An occurrence that actually or imminently jeopardizes, without lawful authority, the confidentiality, integrity, or availability of information or an information system; or constitutes a violation or imminent threat of violation of law, security policies, security procedures, or acceptable use policies."
 
 IR-4 Requirement: The service provider ensures that individuals conducting incident handling meet personnel security requirements commensurate with the criticality/sensitivity of the information being processed, stored, and transmitted by the information system.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (2,483,'IR-5',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,485,'IR-6 (a) [US-CERT incident reporting timelines as specified in NIST Special Publication 800-61 (as amended)]','IR-6 Requirement: Reports security incident information according to FedRAMP Incident Communications Procedure.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,489,'IR-7',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,492,'IR-8 (a)(9)-2 [at least annually]
 IR-8 (b) [see additional FedRAMP Requirements and Guidance]
 IR-8 (d) [see additional FedRAMP Requirements and Guidance]','IR-8 (b) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.
 IR-8 (d) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,500,'MA-1 (c)(1) [at least every 3 years]
 MA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,501,'MA-2',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,511,'MA-4',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,519,'MA-5',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,530,'MP-1 (c)(1) [at least every 3 years] 
 MP-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,619,'PL-1 (c)(1) [at least every 3 years] 
 PL-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (2,620,'PL-2 (c) [at least annually]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,625,'PL-4 (c) [at least every 3 years]
 PL-4 (d) [at least annually and when the rules are revised or changed]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,626,'PL-4(1)',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,630,'PL-8 (b) [at least annually and when a significant change occurs]','PL-8 (b) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,634,'PL-10','PL-10 Requirement: Select the appropriate FedRAMP Baseline','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,635,'PL-11',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,673,'PS-1 (c)(1) [at least every 3 years] 
 PS-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,674,'PS-2 (c) [at least every three years]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,675,'PS-3 (b) [for national security clearances; a reinvestigation is required during the fifth(5th) year for top secret security clearance, the tenth(10th) year for secret security clearance, and fifteenth(15th) year for confidential security clearance.
 
 For moderate risk law enforcement and high impact public trust level, a reinvestigation is required during the fifth(5th) year. There is no reinvestigation for other moderate risk positions or any low risk positions]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,680,'PS-4 (a) [four(4) hours]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (2,683,'PS-5 (b)-2 [twenty-four(24) hours] 
 PS-5 (d)-2 [twenty-four(24) hours]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,684,'PS-6 (b) [at least annually]
 PS-6 (c)(2) [at least annually and any time there is a change to the user''s level of access]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,688,'PS-7 (d)-1 [including access control personnel responsible for the system and/or facilities, as appropriate]
 PS-7 (d)-2 [within twenty-four(24) hours]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,689,'PS-8 (b)-1 [at a minimum, the ISSO and/or similar role within the organization]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,690,'PS-9',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,712,'RA-1 (c)(1) [at least every 3 years] 
 RA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,713,'RA-2',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,715,'RA-3 (c) [security assessment report]
 
 RA-3 (d) [at least every three(3) years and when a significant change occurs]
 
 RA-3 (f) [at least every three(3) years]','RA-3 Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.
 RA-3 (e) Requirement: Include all Authorizing Officials; for JAB authorizations to include FedRAMP.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,716,'RA-3(1)',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,721,'RA-5 (a) [monthly operating system/infrastructure; monthly web applications (including APIs) and databases]
 RA-5 (d) [high-risk vulnerabilities mitigated within thirty(30) days from date of discovery; moderate-risk vulnerabilities mitigated within ninety(90) days from date of discovery; low risk vulnerabilities mitigated within one hundred and eighty(180) days from date of discovery]','RA-5 Guidance: See the FedRAMP Documents page> Vulnerability Scanning Requirements 
 https://www.FedRAMP.gov/documents/
 RA-5 (a) Requirement: an accredited independent assessor scans operating systems/infrastructure, web applications, and databases once annually.
 RA-5 (d) Requirement: If a vulnerability is listed among the CISA Known Exploited Vulnerability (KEV) Catalog (https://www.cisa.gov/known-exploited-vulnerabilities-catalog) the KEV remediation date supersedes the FedRAMP parameter requirement.
 RA-5 (e) Requirement: to include all Authorizing Officials; for JAB authorizations to include FedRAMP
 
 RA-5 Guidance: Informational findings from a scanner are detailed as a returned result that holds no vulnerability risk or severity and for FedRAMP does not require an entry onto the POA&M or entry onto the RET during any assessment phase.
 Warning findings, on the other hand, are given a risk rating (low, moderate, high or critical) by the scanning solution and should be treated like any other finding with a risk or severity rating for tracking purposes onto either the POA&M or RET depending on when the findings originated (during assessments or during monthly continuous monitoring). If a warning is received during scanning, but further validation turns up no actual issue then this item should be categorized as a false positive. If this situation presents itself during an assessment phase (initial assessment, annual assessment or any SCR), follow guidance on how to report false positives in the Security Assessment Report (SAR). If this situation happens during monthly continuous monitoring, a deviation request will need to be submitted per the FedRAMP Vulnerability Deviation Request Form.
 Warnings are commonly associated with scanning solutions that also perform compliance scans, and if the scanner reports a “warning” as part of the compliance scanning of a CSO, follow guidance surrounding the tracking of compliance findings during either the assessment phases (initial assessment, annual assessment or any SCR) or monthly continuous monitoring as it applies. Guidance on compliance scan findings can be found by searching on “Tracking of Compliance Scans” in FAQs.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (2,723,'RA-5(2) [prior to a new scan]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,732,'RA-5(11)',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,734,'RA-7',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,738,'SA-1 (c)(1) [at least every 3 years] 
 SA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,739,'SA-2',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,740,'SA-3',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,744,'SA-4','SA-4 Requirement: The service provider must comply with Federal Acquisition Regulation (FAR) Subpart 7.103, and Section 889 of the John S. McCain National Defense Authorization Act (NDAA) for Fiscal Year 2019 (Pub. L. 115-232), and FAR Subpart 4.21, which implements Section 889 (as well as any added updates related to FISMA to address security concerns in the system acquisitions process).
 
 SA-4 Guidance: The use of Common Criteria (ISO/IEC 15408) evaluated products is strongly preferred.
 See https://www.niap-ccevs.org/Product/index.cfm or https://www.commoncriteriaportal.org/products/.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,754,'SA-4 (10)',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,757,'SA-5 (d) [at a minimum, the ISSO (or similar role within the organization)]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,765,'SA-8',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (2,799,'SA-9 (a) [Appropriate FedRAMP Security Controls Baseline (s) if Federal information is processed or stored within the external system]
 SA-9 (c) [Federal/FedRAMP Continuous Monitoring requirements must be met for external systems where Federal information is processed or stored]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,880,'SA-22',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,883,'SC-1 (c)(1) [at least every 3 years] 
 SC-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,896,'SC-5 (a) -1 [Protect against] 
 SC-5 (a) -2 [at a minimum: ICMP (ping) flood, SYN flood, slowloris, buffer overflow attack, and volume attack]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (1,332,'CP-1 (c)(1) [at least every 3 years] 
 CP-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,738,'SA-1 (c)(1) [at least every 3 years] 
 SA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (2,988,'SC-28','SC-28 Guidance: The organization supports the capability to use cryptographic mechanisms to protect information at rest. 
 
 SC-28 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-28 Guidance: Note that this enhancement requires the use of cryptography in accordance with SC-13.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,901,'SC-7','SC-7 (b) Guidance: SC-7 (b) should be met by subnet isolation. A subnetwork (subnet) is a physically or logically segmented section of a larger network defined at TCP/IP Layer 3, to both minimize traffic and, important for a FedRAMP Authorization, add a crucial layer of network isolation. Subnets are distinct from VLANs (Layer 2), security groups, and VPCs and are specifically required to satisfy SC-7 part b and other controls. See the FedRAMP Subnets White Paper (https://www.fedramp.gov/assets/resources/documents/FedRAMP_subnets_white_paper.pdf) for additional information.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,931,'SC-8','SC-8 Guidance:
 For each instance of data in transit, confidentiality AND integrity should be through cryptography as specified in SC-8(1), physical means as specified in SC-8(5), or in combination.
 
 For clarity, this control applies to all data in transit. Examples include the following data flows:
  - Crossing the system boundary
  - Between compute instances - including containers
  - From a compute instance to storage
  - Replication between availability zones
  - Transmission of backups to storage
  - From a load balancer to a compute instance
  - Flows from management tools required for their work – e.g. log collection, scanning, etc.
 
 The following applies only when choosing SC-8(5) in lieu of SC-8(1).
 FedRAMP-Defined Assignment / Selection Parameters 
 SC-8(5)-1 [a hardened or alarmed carrier Protective Distribution System (PDS) when outside of Controlled Access Area (CAA)]
 SC-8(5)-2 [prevent unauthorized disclosure of information AND detect changes to information] 
 
 SC-8 Guidance:
 SC-8(5) applies when physical protection has been selected as the method to protect confidentiality and integrity. For physical protection, data in transit must be in either a Controlled Access Area (CAA), or a Hardened or alarmed PDS.
 
 Hardened or alarmed PDS: Shall be as defined in SECTION X - CATEGORY 2 PDS INSTALLATION GUIDANCE of CNSSI No.7003, titled PROTECTED DISTRIBUTION SYSTEMS (PDS). Per the CNSSI No. 7003 Section VIII, PDS must originate and terminate in a Controlled Access Area (CAA). 
 
 Controlled Access Area (CAA): Data will be considered physically protected, and in a CAA if it meets Section 2.3 of the DHS’s Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies. CSPs can meet Section 2.3 of the DHS’ recommended practice by satisfactory implementation of the following controls PE-2(1), PE-2(2), PE-2(3), PE-3(2), PE-3(3), PE-6(2), and PE-6(3).
 
 Note: When selecting SC-8(5), the above SC-8(5), and the above referenced PE controls must be added to the SSP.
 
 CNSSI No.7003 can be accessed here:
 https://www.dcsa.mil/Portals/91/documents/ctp/nao/CNSSI_7003_PDS_September_2015.pdf 
 
 DHS Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies can be accessed here:
 https://us-cert.cisa.gov/sites/default/files/FactSheets/NCCIC%20ICS_FactSheet_Defense_in_Depth_Strategies_S508C.pdf','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,932,'SC-8(1)','SC-8(1) Requirement: Please ensure SSP Section 10.3 Cryptographic Modules Implemented for Data At Rest (DAR) and Data In Transit (DIT) is fully populated for reference in this control.
 
 SC-8(1) Guidance:
 See M-22-9, including "Agencies encrypt all DNS requests and HTTP traffic within their environment"
 
 SC-8(1) applies when encryption has been selected as the method to protect confidentiality and integrity. Otherwise refer to SC-8(5). SC-8(1) is strongly encouraged.
 
 SC-8(1) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)
 
 SC-8(1) Guidance: When leveraging encryption from the underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (2,941,'SC-12 [In accordance with Federal requirements]','SC-12 Guidance: See references in NIST 800-53 documentation.
 
 SC-12 Guidance: Must meet applicable Federal Cryptographic Requirements. See References Section of control.
 
 SC-12 Guidance: Wildcard certificates may be used internally within the system, but are not permitted for external customer access to the system.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,948,'SC-13 (b) [FIPS-validated or NSA-approved cryptography]','SC-13 Guidance:
 This control applies to all use of cryptography. In addition to encryption, this includes functions such as hashing, random number generation, and key generation. Examples include the following:
  - Encryption of data
  - Decryption of data
  - Generation of one time passwords (OTPs) for MFA
  - Protocols such as TLS, SSH, and HTTPS
 
 The requirement for FIPS 140 validation, as well as timelines for acceptance of FIPS 140-2, and 140-3 can be found at the NIST Cryptographic Module Validation Program (CMVP).
 https://csrc.nist.gov/projects/cryptographic-module-validation-program 
 
 SC-13 Guidance: For NSA-approved cryptography, the National Information Assurance Partnership (NIAP) oversees a national program to evaluate Commercial IT Products for Use in National Security Systems. The NIAP Product Compliant List can be found at the following location:
 https://www.niap-ccevs.org/Product/index.cfm 
 
 SC-13 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-13 Guidance:
 Moving to non-FIPS CM or product is acceptable when:
 - FIPS validated version has a known vulnerability
 - Feature with vulnerability is in use
 - Non-FIPS version fixes the vulnerability
 - Non-FIPS version is submitted to NIST for FIPS validation
 - POA&M is added to track approval, and deployment when ready
 
 SC-13 Guidance: At a minimum, this control applies to cryptography in use for the following controls: AU-9(3), CP-9(8), IA-2(6), IA-5(1), MP-5, SC-8(1), and SC-28(1).','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,954,'SC-15 (a) [no exceptions for computing devices]','SC-15 Requirement: The information system provides disablement (instead of physical disconnect) of collaborative computing devices in a manner that supports ease of use.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,971,'SC-20','SC-20 Requirement:
 Control Description should include how DNSSEC is implemented on authoritative DNS servers to supply valid responses to external DNSSEC requests.
 
 SC-20 Requirement: Authoritative DNS servers must be geolocated in accordance with SA-9(5).
 
 SC-20 Guidance: SC-20 applies to use of external authoritative DNS to access a CSO from outside the boundary.
 
 SC-20 Guidance:
 External authoritative DNS servers may be located outside an authorized environment. Positioning these servers inside an authorized boundary is encouraged.
 
 SC-20 Guidance: CSPs are recommended to self-check DNSSEC configuration through one of many available analyzers such as Sandia National Labs (https://dnsviz.net)','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,974,'SC-21','SC-21 Requirement:
 Control description should include how DNSSEC is implemented on recursive DNS servers to make DNSSEC requests when resolving DNS requests from internal components to domains external to the CSO boundary.
 - If the reply is signed, and fails DNSSEC, do not use the reply
 - If the reply is unsigned:
  -- CSP chooses the policy to apply
 
 SC-21 Requirement:
 Internal recursive DNS servers must be located inside an authorized environment. It is typically within the boundary, or leveraged from an underlying IaaS/PaaS.
 
 SC-21 Guidance: Accepting an unsigned reply is acceptable
 
 SC-21 Guidance:
 SC-21 applies to use of internal recursive DNS to access a domain outside the boundary by a component inside the boundary.
 - DNSSEC resolution to access a component inside the boundary is excluded.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,976,'SC-22',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (1,333,'CP-2 (d) [at least annually]','CP-2 Requirement: For JAB authorizations the contingency lists include designated FedRAMP personnel.
 
 CP-2 Requirement: CSPs must use the FedRAMP Information System Contingency Plan (ISCP) Template (available on the fedramp.gov: https://www.fedramp.gov/assets/resources/templates/SSP-A06-FedRAMP-ISCP-Template.docx).','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,739,'SA-2',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (2,989,'SC-28(1)-1 [all information system components storing Federal data or system data that must be protected at the High or Moderate impact levels]','SC-28(1) Guidance: 
 Organizations should select a mode of protection that is targeted towards the relevant threat scenarios. 
 Examples:
 A. Organizations may apply full disk encryption (FDE) to a mobile device where the primary threat is loss of the device while storage is locked. 
 B. For a database application housing data for a single customer, encryption at the file system level would often provide more protection than FDE against the more likely threat of an intruder on the operating system accessing the storage.
 C. For a database application housing data for multiple customers, encryption with unique keys for each customer at the database record level may be more appropriate.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,1018,'SC-39',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (2,1045,'SI-1 (c)(1) [at least every 3 years] 
 SI-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,1046,'SI-2 (c) [within thirty(30) days of release of updates]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,1053,'SI-3 (a) [signature based and non-signature based]
 SI-3 (c)(1)-1 [at least weekly] 
 SI-3 (c)(1)-2 [to include endpoints and network entry and exit points]
 SI-3 (c)(2)-1 [to include blocking and quarantining malicious code]
 SI-3 (c)(2)-2 [administrator or defined security personnel near-realtime]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,1064,'SI-4','SI-4 Guidance: See US-CERT Incident Response Reporting Guidelines.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,1090,'SI-5 (a) [to include US-CERT and Cybersecurity and Infrastructure Security Agency (CISA) Directives]
 SI-5 (c) [to include system security personnel and administrators with configuration/patch-management responsibilities]','SI-5 Requirement: Service Providers must address the CISA Emergency and Binding Operational Directives applicable to their cloud service offering per FedRAMP guidance. This includes listing the applicable directives and stating compliance status.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,1127,'SI-12',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,1163,'SR-1 (a) [to include chief privacy and ISSO and/or similar role or designees]
 SR-1 (c)(1) [at least every 3 years] 
 SR-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,1164,'SR-2 (b) [at least annually]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,1165,'SR-2(1)',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,1166,'SR-3','SR-3 Requirement: CSO must document and maintain the supply chain custody, including replacement devices, to ensure the integrity of the devices before being introduced to the boundary.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (2,1175,'SR-5',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,1181,'SR-8-1 [notification of supply chain compromises and results of assessment or audits]','SR-8 Requirement: CSOs must ensure and document how they receive notifications from their supply chain vendor of newly discovered vulnerabilities including zero-day vulnerabilities.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,1184,'SR-10',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,1185,'SR-11','SR-11 Requirement: CSOs must ensure that their supply chain vendors provide authenticity of software and patches and the vendor must have a plan to protect the development pipeline.','2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,1186,'SR-11(1)',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,1187,'SR-11(2) [all]',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (2,1189,'SR-12',NULL,'2024-12-23 15:38:07.797271','2024-12-23 15:38:07.797271'),
	 (1,1,'AC-1 (c)(1) [at least every 3 years] 
 AC-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,2,'AC-2 (h)(1) [twenty-four(24) hours]
 AC-2 (h)(2) [eight(8) hours]
 AC-2 (h)(3) [eight(8) hours]
 AC-2 (j) [at least annually]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,16,'AC-3',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (1,77,'AC-7','AC-7 Requirement: In alignment with NIST SP 800-63B','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,82,'AC-8 (a) [see additional Requirements and Guidance]
 AC-8 (c)(1) [see additional Requirements and Guidance]','AC-8 Requirement: The service provider shall determine elements of the cloud environment that require the System Use Notification control. The elements of the cloud environment that require System Use Notification are approved and accepted by the JAB/AO. 
 
 Requirement: The service provider shall determine how System Use Notification is going to be verified and provide appropriate periodicity of the check. The System Use Notification verification and periodicity are approved and accepted by the JAB/AO.
 
 Requirement: If not performed as part of a Configuration Baseline check, then there must be documented agreement on how to provide results of verification and the necessary periodicity of the verification by the service provider. The documented agreement on how to provide verification of the results are approved and accepted by the JAB/AO.
 
 Guidance: If performed as part of a Configuration Baseline check, then the % of items requiring setting that are checked and that pass (or fail) check can be provided.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,96,'AC-14',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,110,'AC-17',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,121,'AC-18',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,127,'AC-19',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,133,'AC-20','AC-20 Guidance: The interrelated controls of AC-20, CA-3, and SA-9 should be differentiated as follows:
 AC-20 describes system access to and from external systems.
 CA-3 describes documentation of an agreement between the respective system owners when data is exchanged between the CSO and an external system.
 SA-9 describes the responsibilities of external system owners. These responsibilities would typically be captured in the agreement required by CA-3.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,142,'AC-22 (d) [at least quarterly]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,148,'AT-1 (c)(1) [at least every 3 years] 
 AT-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,149,'AT-2 (a)(1) [at least annually]
 AT-2 (c) [at least annually]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (1,151,'AT-2(2)',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,156,'AT-3 (a)(1) [at least annually]
 AT-3 (b) [at least annually]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,162,'AT-4 (b) [at least one(1) year or 1 year after completion of a specific training program]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,165,'AU-1 (c)(1) [at least every 3 years] 
 AU-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,489,'IR-7',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,740,'SA-3',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (10,1279,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1252,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1253,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1308,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (10,1257,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1236,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1212,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1256,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1202,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1225,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1237,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (1,166,'AU-2 (a) [successful and unsuccessful account logon events, account management events, object access, policy change, privilege functions, process tracking, and system events. For Web applications: all administrator activity, authentication checks, authorization checks, data deletions, data access, data changes, and permission changes]
 AU-2 (c) [organization-defined subset of the auditable events defined in AU-2a to be audited continually for each identified event].
 AU-2 (e) [annually and whenever there is a change in the threat environment]','AU-2 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO.
 AU-2 (e) Guidance: Annually or whenever changes in the threat environment are communicated to the service provider by the JAB/AO.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,171,'AU-3',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,175,'AU-4',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (1,177,'AU-5 (b) [overwrite oldest record]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,183,'AU-6 (a)-1 [at least weekly]','AU-6 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO. In multi-tenant environments, capability and means for providing review, analysis, and reporting to consumer for data pertaining to consumer shall be documented.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,197,'AU-8 (b) [one second granularity of time measurement]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,200,'AU-9',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,214,'AU-11 [a time period in compliance with M-21-31]','AU-11 Requirement: The service provider retains audit records on-line for at least ninety days and further preserves audit records off-line for a period that is in accordance with NARA requirements. 
 AU-11 Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf)
 AU-11 Guidance: The service provider is encouraged to align with M-21-31 where possible','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,216,'AU-12 (a) [all information system and network components where audit capability is deployed/available]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,234,'CA-1 (c)(1) [at least every 3 years] 
 CA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,235,'CA-2 (d) [at least annually] 
 CA-2 (f) [individuals or roles to include FedRAMP PMO]','CA-2 Guidance: Reference FedRAMP Annual Assessment Guidance.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,236,'CA-2(1)','CA-2(1) Requirement: For JAB Authorization, must use an accredited 3PAO.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,239,'CA-3 (c) [at least annually and on input from JAB/AO]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (1,248,'CA-5 (b) [at least monthly]','CA-5 Requirement: POA&Ms must be provided at least monthly.
 CA-5 Guidance: Reference FedRAMP-POAM-Template','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,250,'CA-6 (e) [in accordance with OMB A-130 requirements or when a significant change occurs]','CA-6 (e) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F and according to FedRAMP Significant Change Policies and Procedures. The service provider describes the types of changes to the information system or the environment of operations that would impact the risk posture. The types of changes are approved and accepted by the JAB/AO.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,253,'CA-7 (g)-1 [to include JAB/AO]','CA-7 Requirement: Operating System, Database, Web Application, Container, and Service Configuration Scans: at least monthly. All scans performed by Independent Assessor: at least annually.
 CA-7 Requirement: CSOs with more than one agency ATO must implement a collaborative Continuous Monitoring (ConMon) approach described in the FedRAMP Guide for Multi-Agency Continuous Monitoring. This requirement applies to CSOs authorized via the Agency path as each agency customer is responsible for performing ConMon oversight. It does not apply to CSOs authorized via the JAB path because the JAB performs ConMon oversight.
 CA-7 Guidance: FedRAMP does not provide a template for the Continuous Monitoring Plan. CSPs should reference the FedRAMP Continuous Monitoring Strategy Guide when developing the Continuous Monitoring Plan.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,257,'CA-7(4)',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,260,'CA-8-1 [at least annually]','CA-8 Guidance: Reference the FedRAMP Penetration Test Guidance.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,264,'CA-9',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,266,'CM-1 (c)(1) [at least every 3 years] 
 CM-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,267,'CM-2 (b)(1) [at least annually and when a significant change occurs]
 CM-2 (b)(2) [to include when directed by the JAB]','CM-2 (b)(1) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,284,'CM-4',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,287,'CM-5',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (1,295,'CM-6','CM-6 (a) Requirement 1: The service provider shall use the DoD STIGs to establish configuration settings; Center for Internet Security up to Level 2 (CIS Level 2) guidelines shall be used if STIGs are not available; Custom baselines shall be used if CIS is not available.
 CM-6 (a) Requirement 2: The service provider shall ensure that checklists for configuration settings are Security Content Automation Protocol (SCAP) validated or SCAP compatible (if validated checklists are not available).
 
 CM-6 Guidance: Compliance checks are used to evaluate configuration settings and provide general insight into the overall effectiveness of configuration management activities. CSPs and 3PAOs typically combine compliance check findings into a single CM-6 finding, which is acceptable. However, for initial assessments, annual assessments, and significant change requests, FedRAMP requires a clear understanding, on a per-control basis, where risks exist. Therefore, 3PAOs must also analyze compliance check findings as part of the controls assessment. Where a direct mapping exists, the 3PAO must document additional findings per control in the corresponding SAR Risk Exposure Table (RET), which are then documented in the CSP’s Plan of Action and Milestones (POA&M). This will likely result in the details of individual control findings overlapping with those in the combined CM-6 finding, which is acceptable.
 During monthly continuous monitoring, new findings from CSP compliance checks may be combined into a single CM-6 POA&M item. CSPs are not required to map the findings to specific controls because controls are only assessed during initial assessments, annual assessments, and significant change requests.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,300,'CM-7','CM-7 (b) Requirement: The service provider shall use Security guidelines (See CM-6) to establish list of prohibited or restricted functions, ports, protocols, and/or services or establishes its own list of prohibited or restricted functions, ports, protocols, and/or services if STIGs or CIS is not available.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,310,'CM-8 (b) [at least monthly]','CM-8 Requirement: must be provided at least monthly or when there is a change.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,322,'CM-10',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,324,'CM-11 (c) [Continuously (via CM-7(5))]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,342,'CP-3 (a)(1) [*See Additional Requirements]
 CP-3 (a)(3) [at least annually]
 CP-3 (b) [at least annually]','CP-3 (a) Requirement: Privileged admins and engineers must take the basic contingency training within 10 days. Consideration must be given for those privileged admins and engineers with critical contingency-related roles, to gain enough system context and situational awareness to understand the full impact of contingency training as it applies to their respective level. Newly hired critical contingency personnel must take this more in-depth training within 60 days of hire date when the training will have more impact.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,345,'CP-4 (a)-1 [at least every 3 years] 
 CP-4 (a)-2 [classroom exercise/table top written tests]','CP-4 (a) Requirement: The service provider develops test plans in accordance with NIST Special Publication 800-34 (as amended); plans are approved by the JAB/AO prior to initiating testing.
 
 CP-4 (b) Requirement: The service provider must include the Contingency Plan test results with the security package within the Contingency Plan-designated appendix (Appendix G, Contingency Plan Test Report).','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,369,'CP-9 (a)-2 [daily incremental; weekly full]
 CP-9 (b) [daily incremental; weekly full]
 CP-9 (c) [daily incremental; weekly full]','CP-9 Requirement: The service provider shall determine what elements of the cloud environment require the Information System Backup control. The service provider shall determine how Information System Backup is going to be verified and appropriate periodicity of the check.
 CP-9 (a) Requirement: The service provider maintains at least three backup copies of user-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (b) Requirement: The service provider maintains at least three backup copies of system-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (c) Requirement: The service provider maintains at least three backup copies of information system documentation including security information (at least one of which is available online) or provides an equivalent alternative.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,378,'CP-10',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,388,'IA-1 (c)(1) [at least every 3 years] 
 IA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (1,389,'IA-2','IA-2 Requirement: For all control enhancements that specify multifactor authentication, the implementation must adhere to the Digital Identity Guidelines specified in NIST Special Publication 800-63B.
 
 IA-2 Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2 Requirement: All uses of encrypted virtual private networks must meet all applicable Federal requirements and architecture, dataflow, and security and privacy controls must be documented, assessed, and authorized to operate.
 
 IA-2 Guidance: “Phishing-resistant" authentication refers to authentication processes designed to detect and prevent disclosure of authentication secrets and outputs to a website or application masquerading as a legitimate system.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,390,'IA-2(1)','IA-2(1) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(1) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(1) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,391,'IA-2(2)','IA-2(2) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(2) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(2) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,397,'IA-2(8)',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,401,'IA-2(12)','IA-2(12) Guidance: Include Common Access Card (CAC), i.e., the DoD technical implementation of PIV/FIPS 201/HSPD-12.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,408,'IA-4 (a) [at a minimum, the ISSO (or similar role within the organization)] 
 IA-4 (d) [at least two(2) years]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,418,'IA-5','IA-5 Requirement: Authenticators must be compliant with NIST SP 800-63-3 Digital Identity Guidelines IAL, AAL, FAL level 3. Link https://pages.nist.gov/800-63-3
 
 IA-5 Guidance: SP 800-63C Section 6.2.3 Encrypted Assertion requires that authentication assertions be encrypted when passed through third parties, such as a browser. For example, a SAML assertion can be encrypted using XML-Encryption, or an OpenID Connect ID Token can be encrypted using JSON Web Encryption (JWE).','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,419,'IA-5(1)','IA-5(1) Requirement: Password policies must be compliant with NIST SP 800-63B for all memorized, lookup, out-of-band, or One-Time-Passwords (OTP). Password policies shall not enforce special character or minimum password rotation requirements for memorized secrets of users.
 
 IA-5(1) (h) Requirement: For cases where technology doesn’t allow multi-factor authentication, these rules should be enforced: must have a minimum length of 14 characters and must support all printable ASCII characters.
  
 For emergency use accounts, these rules should be enforced: must have a minimum length of 14 characters, must support all printable ASCII characters, and passwords must be changed if used. 
 
 IA-5(1) Guidance: Note that (c) and (d) require the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,437,'IA-6',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,438,'IA-7',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (1,439,'IA-8',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,440,'IA-8(1)',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,441,'IA-8(2)',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,443,'IA-8(4)',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,450,'IA-11','IA-11 Guidance:
 The fixed time period cannot exceed the limits set in SP 800-63. At this writing they are:
 - AAL3 (high baseline)
  -- 12 hours or
  -- 15 minutes of inactivity','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,458,'IR-1 (c)(1) [at least every 3 years] 
 IR-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,459,'IR-2 (a)(1) [ten(10) days for privileged users, thirty(30) days for Incident Response roles]
 IR-2 (a)(3) [at least annually]
 IR-2 (b) [at least annually]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,467,'IR-4','IR-4 Requirement: The FISMA definition of "incident" shall be used: "An occurrence that actually or imminently jeopardizes, without lawful authority, the confidentiality, integrity, or availability of information or an information system; or constitutes a violation or imminent threat of violation of law, security policies, security procedures, or acceptable use policies."
 
 IR-4 Requirement: The service provider ensures that individuals conducting incident handling meet personnel security requirements commensurate with the criticality/sensitivity of the information being processed, stored, and transmitted by the information system.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,483,'IR-5',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,485,'IR-6 (a) [US-CERT incident reporting timelines as specified in NIST Special Publication 800-61 (as amended)]','IR-6 Requirement: Reports security incident information according to FedRAMP Incident Communications Procedure.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (1,492,'IR-8 (a)(9)-2 [at least annually]
 IR-8 (b) [see additional FedRAMP Requirements and Guidance]
 IR-8 (d) [see additional FedRAMP Requirements and Guidance]','IR-8 (b) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.
 IR-8 (d) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,500,'MA-1 (c)(1) [at least every 3 years]
 MA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,501,'MA-2',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,511,'MA-4',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,519,'MA-5',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,530,'MP-1 (c)(1) [at least every 3 years] 
 MP-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,531,'MP-2',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,543,'MP-6 (a)-2 [techniques and procedures IAW NIST SP 800-88 Section 4: Reuse and Disposal of Storage Media and Hardware]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,552,'MP-7',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,560,'PE-1 (c)(1) [at least every 3 years] 
 PE-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (1,561,'PE-2 (c) [at least annually]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,565,'PE-3 (a)(2) [CSP defined physical access control systems/devices AND guards]
 PE-3 (d) [in all circumstances within restricted access area where the information system resides]
 PE-3 (f)-2 [at least annually]
 PE-3 (g) [at least annually]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,579,'PE-6 (b) [at least monthly]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,585,'PE-8 (a) [for a minimum of one(1) year]
 PE-8 (b) [at least monthly]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,597,'PE-12',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,599,'PE-13',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,604,'PE-14 (a) [consistent with American Society of Heating, Refrigerating and Air-conditioning Engineers (ASHRAE) document entitled Thermal Guidelines for Data Processing Environments]
 
 PE-14 (b) [continuously]','PE-14 (a) Requirement: The service provider measures temperature at server inlets and humidity levels by dew point.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,607,'PE-15',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,609,'PE-16 (a) [all information system components]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,619,'PL-1 (c)(1) [at least every 3 years] 
 PL-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (1,620,'PL-2 (c) [at least annually]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,625,'PL-4 (c) [at least every 3 years]
 PL-4 (d) [at least annually and when the rules are revised or changed]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,626,'PL-4(1)',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,630,'PL-8 (b) [at least annually and when a significant change occurs]','PL-8 (b) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,634,'PL-10','PL-10 Requirement: Select the appropriate FedRAMP Baseline','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,635,'PL-11',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,673,'PS-1 (c)(1) [at least every 3 years] 
 PS-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,674,'PS-2 (c) [at least every three years]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,675,'PS-3 (b) [for national security clearances; a reinvestigation is required during the fifth(5th) year for top secret security clearance, the tenth(10th) year for secret security clearance, and fifteenth(15th) year for confidential security clearance.
 
 For moderate risk law enforcement and high impact public trust level, a reinvestigation is required during the fifth(5th) year. There is no reinvestigation for other moderate risk positions or any low risk positions]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,680,'PS-4 (a) [four(4) hours]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (1,683,'PS-5 (b)-2 [twenty-four(24) hours] 
 PS-5 (d)-2 [twenty-four(24) hours]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,684,'PS-6 (b) [at least annually]
 PS-6 (c)(2) [at least annually and any time there is a change to the user''s level of access]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,688,'PS-7 (d)-1 [including access control personnel responsible for the system and/or facilities, as appropriate]
 PS-7 (d)-2 [within twenty-four(24) hours]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,689,'PS-8 (b)-1 [at a minimum, the ISSO and/or similar role within the organization]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,690,'PS-9',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,712,'RA-1 (c)(1) [at least every 3 years] 
 RA-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,713,'RA-2',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,715,'RA-3 (c) [security assessment report]
 
 RA-3 (d) [at least every three(3) years and when a significant change occurs]
 
 RA-3 (f) [at least every three(3) years]','RA-3 Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.
 RA-3 (e) Requirement: Include all Authorizing Officials; for JAB authorizations to include FedRAMP.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,716,'RA-3(1)',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,721,'RA-5 (a) [monthly operating system/infrastructure; monthly web applications (including APIs) and databases]
 RA-5 (d) [high-risk vulnerabilities mitigated within thirty(30) days from date of discovery; moderate-risk vulnerabilities mitigated within ninety(90) days from date of discovery; low risk vulnerabilities mitigated within one hundred and eighty(180) days from date of discovery]','RA-5 Guidance: See the FedRAMP Documents page> Vulnerability Scanning Requirements 
 https://www.FedRAMP.gov/documents/
 RA-5 (a) Requirement: an accredited independent assessor scans operating systems/infrastructure, web applications, and databases once annually.
 RA-5 (d) Requirement: If a vulnerability is listed among the CISA Known Exploited Vulnerability (KEV) Catalog (https://www.cisa.gov/known-exploited-vulnerabilities-catalog) the KEV remediation date supersedes the FedRAMP parameter requirement.
 RA-5 (e) Requirement: to include all Authorizing Officials; for JAB authorizations to include FedRAMP
 
 RA-5 Guidance: Informational findings from a scanner are detailed as a returned result that holds no vulnerability risk or severity and for FedRAMP does not require an entry onto the POA&M or entry onto the RET during any assessment phase.
 Warning findings, on the other hand, are given a risk rating (low, moderate, high or critical) by the scanning solution and should be treated like any other finding with a risk or severity rating for tracking purposes onto either the POA&M or RET depending on when the findings originated (during assessments or during monthly continuous monitoring). If a warning is received during scanning, but further validation turns up no actual issue then this item should be categorized as a false positive. If this situation presents itself during an assessment phase (initial assessment, annual assessment or any SCR), follow guidance on how to report false positives in the Security Assessment Report (SAR). If this situation happens during monthly continuous monitoring, a deviation request will need to be submitted per the FedRAMP Vulnerability Deviation Request Form.
 Warnings are commonly associated with scanning solutions that also perform compliance scans, and if the scanner reports a “warning” as part of the compliance scanning of a CSO, follow guidance surrounding the tracking of compliance findings during either the assessment phases (initial assessment, annual assessment or any SCR) or monthly continuous monitoring as it applies. Guidance on compliance scan findings can be found by searching on “Tracking of Compliance Scans” in FAQs.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (1,723,'RA-5(2) [prior to a new scan]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,732,'RA-5(11)',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,744,'SA-4','SA-4 Requirement: The service provider must comply with Federal Acquisition Regulation (FAR) Subpart 7.103, and Section 889 of the John S. McCain National Defense Authorization Act (NDAA) for Fiscal Year 2019 (Pub. L. 115-232), and FAR Subpart 4.21, which implements Section 889 (as well as any added updates related to FISMA to address security concerns in the system acquisitions process).
 
 SA-4 Guidance: The use of Common Criteria (ISO/IEC 15408) evaluated products is strongly preferred.
 See https://www.niap-ccevs.org/Product/index.cfm or https://www.commoncriteriaportal.org/products/.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,754,'SA-4 (10)',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,757,'SA-5 (d) [at a minimum, the ISSO (or similar role within the organization)]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,765,'SA-8',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,799,'SA-9 (a) [Appropriate FedRAMP Security Controls Baseline (s) if Federal information is processed or stored within the external system]
 SA-9 (c) [Federal/FedRAMP Continuous Monitoring requirements must be met for external systems where Federal information is processed or stored]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,880,'SA-22',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,883,'SC-1 (c)(1) [at least every 3 years] 
 SC-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,896,'SC-5 (a) -1 [Protect against] 
 SC-5 (a) -2 [at a minimum: ICMP (ping) flood, SYN flood, slowloris, buffer overflow attack, and volume attack]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (1,901,'SC-7','SC-7 (b) Guidance: SC-7 (b) should be met by subnet isolation. A subnetwork (subnet) is a physically or logically segmented section of a larger network defined at TCP/IP Layer 3, to both minimize traffic and, important for a FedRAMP Authorization, add a crucial layer of network isolation. Subnets are distinct from VLANs (Layer 2), security groups, and VPCs and are specifically required to satisfy SC-7 part b and other controls. See the FedRAMP Subnets White Paper (https://www.fedramp.gov/assets/resources/documents/FedRAMP_subnets_white_paper.pdf) for additional information.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,931,'SC-8','SC-8 Guidance:
 For each instance of data in transit, confidentiality AND integrity should be through cryptography as specified in SC-8(1), physical means as specified in SC-8(5), or in combination.
 
 For clarity, this control applies to all data in transit. Examples include the following data flows:
  - Crossing the system boundary
  - Between compute instances - including containers
  - From a compute instance to storage
  - Replication between availability zones
  - Transmission of backups to storage
  - From a load balancer to a compute instance
  - Flows from management tools required for their work – e.g. log collection, scanning, etc.
 
 The following applies only when choosing SC-8(5) in lieu of SC-8(1).
 FedRAMP-Defined Assignment / Selection Parameters 
 SC-8(5)-1 [a hardened or alarmed carrier Protective Distribution System (PDS) when outside of Controlled Access Area (CAA)]
 SC-8(5)-2 [prevent unauthorized disclosure of information AND detect changes to information] 
 
 SC-8 Guidance:
 SC-8(5) applies when physical protection has been selected as the method to protect confidentiality and integrity. For physical protection, data in transit must be in either a Controlled Access Area (CAA), or a Hardened or alarmed PDS.
 
 Hardened or alarmed PDS: Shall be as defined in SECTION X - CATEGORY 2 PDS INSTALLATION GUIDANCE of CNSSI No.7003, titled PROTECTED DISTRIBUTION SYSTEMS (PDS). Per the CNSSI No. 7003 Section VIII, PDS must originate and terminate in a Controlled Access Area (CAA). 
 
 Controlled Access Area (CAA): Data will be considered physically protected, and in a CAA if it meets Section 2.3 of the DHS’s Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies. CSPs can meet Section 2.3 of the DHS’ recommended practice by satisfactory implementation of the following controls PE-2(1), PE-2(2), PE-2(3), PE-3(2), PE-3(3), PE-6(2), and PE-6(3).
 
 Note: When selecting SC-8(5), the above SC-8(5), and the above referenced PE controls must be added to the SSP.
 
 CNSSI No.7003 can be accessed here:
 https://www.dcsa.mil/Portals/91/documents/ctp/nao/CNSSI_7003_PDS_September_2015.pdf 
 
 DHS Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies can be accessed here:
 https://us-cert.cisa.gov/sites/default/files/FactSheets/NCCIC%20ICS_FactSheet_Defense_in_Depth_Strategies_S508C.pdf','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,932,'SC-8(1)','SC-8(1) Requirement: Please ensure SSP Section 10.3 Cryptographic Modules Implemented for Data At Rest (DAR) and Data In Transit (DIT) is fully populated for reference in this control.
 
 SC-8(1) Guidance:
 See M-22-9, including "Agencies encrypt all DNS requests and HTTP traffic within their environment"
 
 SC-8(1) applies when encryption has been selected as the method to protect confidentiality and integrity. Otherwise refer to SC-8(5). SC-8(1) is strongly encouraged.
 
 SC-8(1) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)
 
 SC-8(1) Guidance: When leveraging encryption from the underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,941,'SC-12 [In accordance with Federal requirements]','SC-12 Guidance: See references in NIST 800-53 documentation.
 
 SC-12 Guidance: Must meet applicable Federal Cryptographic Requirements. See References Section of control.
 
 SC-12 Guidance: Wildcard certificates may be used internally within the system, but are not permitted for external customer access to the system.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,948,'SC-13 (b) [FIPS-validated or NSA-approved cryptography]','SC-13 Guidance:
 This control applies to all use of cryptography. In addition to encryption, this includes functions such as hashing, random number generation, and key generation. Examples include the following:
  - Encryption of data
  - Decryption of data
  - Generation of one time passwords (OTPs) for MFA
  - Protocols such as TLS, SSH, and HTTPS
 
 The requirement for FIPS 140 validation, as well as timelines for acceptance of FIPS 140-2, and 140-3 can be found at the NIST Cryptographic Module Validation Program (CMVP).
 https://csrc.nist.gov/projects/cryptographic-module-validation-program 
 
 SC-13 Guidance: For NSA-approved cryptography, the National Information Assurance Partnership (NIAP) oversees a national program to evaluate Commercial IT Products for Use in National Security Systems. The NIAP Product Compliant List can be found at the following location:
 https://www.niap-ccevs.org/Product/index.cfm 
 
 SC-13 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-13 Guidance:
 Moving to non-FIPS CM or product is acceptable when:
 - FIPS validated version has a known vulnerability
 - Feature with vulnerability is in use
 - Non-FIPS version fixes the vulnerability
 - Non-FIPS version is submitted to NIST for FIPS validation
 - POA&M is added to track approval, and deployment when ready
 
 SC-13 Guidance: At a minimum, this control applies to cryptography in use for the following controls: AU-9(3), CP-9(8), IA-2(6), IA-5(1), MP-5, SC-8(1), and SC-28(1).','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,954,'SC-15 (a) [no exceptions for computing devices]','SC-15 Requirement: The information system provides disablement (instead of physical disconnect) of collaborative computing devices in a manner that supports ease of use.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (10,1293,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1242,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1232,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1231,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (10,1305,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1204,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1219,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1223,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1255,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (1,971,'SC-20','SC-20 Requirement:
 Control Description should include how DNSSEC is implemented on authoritative DNS servers to supply valid responses to external DNSSEC requests.
 
 SC-20 Requirement: Authoritative DNS servers must be geolocated in accordance with SA-9(5).
 
 SC-20 Guidance: SC-20 applies to use of external authoritative DNS to access a CSO from outside the boundary.
 
 SC-20 Guidance:
 External authoritative DNS servers may be located outside an authorized environment. Positioning these servers inside an authorized boundary is encouraged.
 
 SC-20 Guidance: CSPs are recommended to self-check DNSSEC configuration through one of many available analyzers such as Sandia National Labs (https://dnsviz.net)','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,974,'SC-21','SC-21 Requirement:
 Control description should include how DNSSEC is implemented on recursive DNS servers to make DNSSEC requests when resolving DNS requests from internal components to domains external to the CSO boundary.
 - If the reply is signed, and fails DNSSEC, do not use the reply
 - If the reply is unsigned:
  -- CSP chooses the policy to apply
 
 SC-21 Requirement:
 Internal recursive DNS servers must be located inside an authorized environment. It is typically within the boundary, or leveraged from an underlying IaaS/PaaS.
 
 SC-21 Guidance: Accepting an unsigned reply is acceptable
 
 SC-21 Guidance:
 SC-21 applies to use of internal recursive DNS to access a domain outside the boundary by a component inside the boundary.
 - DNSSEC resolution to access a component inside the boundary is excluded.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,976,'SC-22',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,988,'SC-28','SC-28 Guidance: The organization supports the capability to use cryptographic mechanisms to protect information at rest. 
 
 SC-28 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-28 Guidance: Note that this enhancement requires the use of cryptography in accordance with SC-13.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,989,'SC-28(1)-1 [all information system components storing Federal data or system data that must be protected at the High or Moderate impact levels]','SC-28(1) Guidance: 
 Organizations should select a mode of protection that is targeted towards the relevant threat scenarios. 
 Examples:
 A. Organizations may apply full disk encryption (FDE) to a mobile device where the primary threat is loss of the device while storage is locked. 
 B. For a database application housing data for a single customer, encryption at the file system level would often provide more protection than FDE against the more likely threat of an intruder on the operating system accessing the storage.
 C. For a database application housing data for multiple customers, encryption with unique keys for each customer at the database record level may be more appropriate.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (1,1018,'SC-39',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,1045,'SI-1 (c)(1) [at least every 3 years] 
 SI-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,1046,'SI-2 (c) [within thirty(30) days of release of updates]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,1053,'SI-3 (a) [signature based and non-signature based]
 SI-3 (c)(1)-1 [at least weekly] 
 SI-3 (c)(1)-2 [to include endpoints and network entry and exit points]
 SI-3 (c)(2)-1 [to include blocking and quarantining malicious code]
 SI-3 (c)(2)-2 [administrator or defined security personnel near-realtime]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,1064,'SI-4','SI-4 Guidance: See US-CERT Incident Response Reporting Guidelines.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,1090,'SI-5 (a) [to include US-CERT and Cybersecurity and Infrastructure Security Agency (CISA) Directives]
 SI-5 (c) [to include system security personnel and administrators with configuration/patch-management responsibilities]','SI-5 Requirement: Service Providers must address the CISA Emergency and Binding Operational Directives applicable to their cloud service offering per FedRAMP guidance. This includes listing the applicable directives and stating compliance status.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,1127,'SI-12',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,1163,'SR-1 (a) [to include chief privacy and ISSO and/or similar role or designees]
 SR-1 (c)(1) [at least every 3 years] 
 SR-1 (c)(2) [at least annually] [significant changes]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,1164,'SR-2 (b) [at least annually]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,1165,'SR-2(1)',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (1,1166,'SR-3','SR-3 Requirement: CSO must document and maintain the supply chain custody, including replacement devices, to ensure the integrity of the devices before being introduced to the boundary.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,1175,'SR-5',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,1181,'SR-8-1 [notification of supply chain compromises and results of assessment or audits]','SR-8 Requirement: CSOs must ensure and document how they receive notifications from their supply chain vendor of newly discovered vulnerabilities including zero-day vulnerabilities.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,1184,'SR-10',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,1185,'SR-11','SR-11 Requirement: CSOs must ensure that their supply chain vendors provide authenticity of software and patches and the vendor must have a plan to protect the development pipeline.','2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,1186,'SR-11(1)',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,1187,'SR-11(2) [all]',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (1,1189,'SR-12',NULL,'2024-12-23 15:38:57.577736','2024-12-23 15:38:57.577736'),
	 (6,1036,'SC-45(1) (a) [At least hourly] [http://tf.nist.gov/tf-cgi/servers.cgi] 
 SC-45(1) (b) [any difference]','SC-45(1) Requirement: The service provider selects primary and secondary time servers used by the NIST Internet time service. The secondary server is selected from a different geographic region than the primary server.
 SC-45(1) Requirement: The service provider synchronizes the system clocks of network computers that run operating systems other than Windows to the Windows Server Domain Controller emulator or to the same time source for that server.
 SC-45(1) Guidance: Synchronization of system clocks improves the accuracy of log analysis.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1038,'DSPAV must be used.',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (6,1045,'SI-1 (c)(1) [at least annually]
 SI-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1046,'SI-2 (c) [within thirty(30) days of release of updates]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1048,'SI-2(2)-2 [at least monthly]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1049,'SI-2(3)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1053,'SI-3 (a) [signature based and non-signature based]
 SI-3 (c)(1)-1 [at least weekly] 
 SI-3 (c)(1)-2 [to include endpoints and network entry and exit points]
 SI-3 (c)(2)-1 [to include blocking and quarantining malicious code]
 SI-3 (c)(2)-2 [administrator or defined security personnel near-realtime]',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1064,'SI-4','SI-4 Guidance: See US-CERT Incident Response Reporting Guidelines.','2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1065,'SI-4(1)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (6,1066,'SI-4(2)',NULL,'2025-01-13 15:18:12.186151','2025-01-13 15:18:12.186151'),
	 (10,1271,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1214,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (10,1306,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1298,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1286,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1263,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1229,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1224,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1251,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1245,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1206,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1244,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (10,1294,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1270,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1275,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1285,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1264,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1201,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1248,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1297,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1207,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1221,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (10,1208,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1226,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1209,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1217,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1211,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1249,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1288,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1281,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1289,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1292,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (10,1295,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1296,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1205,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1309,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1303,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1284,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1261,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1234,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1276,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1200,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (10,1258,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1267,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1287,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1247,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (10,1238,NULL,NULL,'2025-01-30 13:06:46.988414','2025-01-30 13:06:46.988414'),
	 (11,1243,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1241,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1230,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1277,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1228,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (11,1272,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1216,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1301,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1262,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1279,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1293,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1242,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1232,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1231,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1305,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (11,1204,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1219,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1223,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1255,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1299,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1227,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1307,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1250,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1280,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1246,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (11,1273,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1235,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1254,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1233,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1278,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1265,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1260,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1300,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1269,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1213,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (11,1259,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1215,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1282,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1291,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1266,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1218,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1252,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1253,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1308,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1257,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (11,1236,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1212,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1256,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1202,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1225,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1237,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1283,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1304,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1222,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1302,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (11,1239,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1240,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1220,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1203,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1274,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1290,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1268,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1210,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1271,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1214,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (11,1306,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1298,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1286,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1263,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1229,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1224,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1251,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1245,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1206,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1244,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (11,1294,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1270,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1275,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1285,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1264,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1201,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1248,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1297,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1207,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1221,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (11,1208,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1226,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1209,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1217,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1211,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1249,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1288,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1281,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1289,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1292,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (11,1295,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1296,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1205,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1309,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1303,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1284,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1261,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1234,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1276,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1200,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (11,1258,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1267,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1287,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1247,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (11,1238,NULL,NULL,'2025-01-30 13:07:15.650911','2025-01-30 13:07:15.650911'),
	 (9,1279,NULL,NULL,'2025-02-03 05:55:26.505466','2025-02-03 05:55:26.505466'),
	 (9,1219,NULL,NULL,'2025-02-03 05:55:26.505466','2025-02-03 05:55:26.505466'),
	 (9,1307,NULL,NULL,'2025-02-03 05:55:26.505466','2025-02-03 05:55:26.505466'),
	 (9,1280,NULL,NULL,'2025-02-03 05:55:26.505466','2025-02-03 05:55:26.505466'),
	 (9,1278,NULL,NULL,'2025-02-03 05:55:26.505466','2025-02-03 05:55:26.505466');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (9,1269,NULL,NULL,'2025-02-03 05:55:26.505466','2025-02-03 05:55:26.505466'),
	 (9,1291,NULL,NULL,'2025-02-03 05:55:26.505466','2025-02-03 05:55:26.505466'),
	 (9,1304,NULL,NULL,'2025-02-03 05:55:26.505466','2025-02-03 05:55:26.505466'),
	 (9,1306,NULL,NULL,'2025-02-03 05:55:26.505466','2025-02-03 05:55:26.505466'),
	 (9,1201,NULL,NULL,'2025-02-03 05:55:26.505466','2025-02-03 05:55:26.505466'),
	 (9,1248,NULL,NULL,'2025-02-03 05:55:26.505466','2025-02-03 05:55:26.505466'),
	 (9,1221,NULL,NULL,'2025-02-03 05:55:26.505466','2025-02-03 05:55:26.505466'),
	 (9,1303,NULL,NULL,'2025-02-03 05:55:26.505466','2025-02-03 05:55:26.505466'),
	 (9,1287,NULL,NULL,'2025-02-03 05:55:26.505466','2025-02-03 05:55:26.505466'),
	 (9,1247,NULL,NULL,'2025-02-03 05:55:26.505466','2025-02-03 05:55:26.505466');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (9,1200,NULL,NULL,'2025-02-03 05:55:26.505466','2025-02-03 05:55:26.505466'),
	 (9,1276,NULL,NULL,'2025-02-03 05:55:26.505466','2025-02-03 05:55:26.505466'),
	 (12,235,'CA-2 (d) [at least annually] 
 CA-2 (f) [individuals or roles to include FedRAMP PMO]','CA-2 Guidance: Reference FedRAMP Annual Assessment Guidance.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,166,'AU-2 (a) [successful and unsuccessful account logon events, account management events, object access, policy change, privilege functions, process tracking, and system events. For Web applications: all administrator activity, authentication checks, authorization checks, data deletions, data access, data changes, and permission changes]
 AU-2 (c) [organization-defined subset of the auditable events defined in AU-2a to be audited continually for each identified event].
 AU-2 (e) [annually and whenever there is a change in the threat environment]','AU-2 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO.
 AU-2 (e) Guidance: Annually or whenever changes in the threat environment are communicated to the service provider by the JAB/AO.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,601,'PE-13(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,4,'AC-2(2) [Selection: disables] 
 [Assignment: no more than 24 hours from last use]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,744,'SA-4','SA-4 Requirement: The service provider must comply with Federal Acquisition Regulation (FAR) Subpart 7.103, and Section 889 of the John S. McCain National Defense Authorization Act (NDAA) for Fiscal Year 2019 (Pub. L. 115-232), and FAR Subpart 4.21, which implements Section 889 (as well as any added updates related to FISMA to address security concerns in the system acquisitions process).
 
 SA-4 Guidance: The use of Common Criteria (ISO/IEC 15408) evaluated products is strongly preferred.
 See https://www.niap-ccevs.org/Product/index.cfm or https://www.commoncriteriaportal.org/products/.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,171,'AU-3',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,172,'AU-3(1) [session, connection, transaction, or activity duration; for client-server transactions, the number of bytes received and bytes sent; additional informational messages to diagnose or identify the event; characteristics that describe or identify the object or resource being acted upon; individual identities of group account users; full-text of privileged commands]','AU-3(1) Guidance: For client-server transactions, the number of bytes sent and received gives bidirectional transfer information that can be helpful during an investigation or inquiry.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,175,'AU-4',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,200,'AU-9',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,202,'AU-9(2) [at least weekly]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,264,'CA-9 (d) [at least annually]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,276,'CM-3(1) (c) [organization agreed upon time period] 
 CM-3(1) (f) [organization defined configuration management approval authorities]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,204,'AU-9(4)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,11,'AC-2(9) [organization-defined need with justification statement that explains why such accounts are necessary]','AC-2(9) Requirement: Required if shared/group accounts are deployed','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,208,'AU-10 [minimum actions including the addition, modification, deletion, approval, sending, or receiving of data]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,190,'AU-6(7) [information system process; role; user]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,261,'CA-8(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,216,'AU-12 (a) [all information system and network components where audit capability is deployed/available]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,270,'CM-2(3) [organization-defined number of previous versions of baseline configurations of the previously approved baseline configuration of IS components]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,219,'AU-12(3)-1 [service provider-defined individuals or roles with audit configuration responsibilities] 
 AU-12(3)-2 [all network, data storage, and computing devices]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,217,'AU-12(1)-1 [all network, data storage, and computing devices]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,239,'CA-3 (c) [at least annually and on input from JAB/AO]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,277,'CM-3(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,288,'CM-5(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,292,'CM-5(5) (b) [at least quarterly]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,297,'CM-6(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,296,'CM-6(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,300,'CM-7','CM-7 (b) Requirement: The service provider shall use Security guidelines (See CM-6) to establish list of prohibited or restricted functions, ports, protocols, and/or services or establishes its own list of prohibited or restricted functions, ports, protocols, and/or services if STIGs or CIS is not available.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,301,'CM-7(1) (a) [at least annually]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,506,'MA-3(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,749,'SA-4(5) (a) The service provider shall use the DoD STIGs to establish configuration settings; Center for Internet Security up to Level 2 (CIS Level 2) guidelines shall be used if STIGs are not available; Custom baselines shall be used if CIS is not available.',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,302,'CM-7(2)','CM-7(2) Guidance: This control refers to software deployment by CSP personnel into the production environment. The control requires a policy that states conditions for deploying software. This control shall be implemented in a technical manner on the information system to only allow programs to run that adhere to the policy (i.e. allow-listing). This control is not to be based off of strictly written policy on what is allowed or not allowed to run.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,310,'CM-8 (b) [at least monthly]','CM-8 Requirement: must be provided at least monthly or when there is a change.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,311,'CM-8(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,312,'CM-8(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,505,'MA-3(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,580,'PE-6(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,314,'CM-8(4) [position and role]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,322,'CM-10',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,324,'CM-11 (c) [Continuously (via CM-7(5))]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,328,'CM-12','CM-12 Requirement: According to FedRAMP Authorization Boundary Guidance','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,586,'PE-8(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,133,'AC-20','AC-20 Guidance: The interrelated controls of AC-20, CA-3, and SA-9 should be differentiated as follows:
 AC-20 describes system access to and from external systems.
 CA-3 describes documentation of an agreement between the respective system owners when data is exchanged between the CSO and an external system.
 SA-9 describes the responsibilities of external system owners. These responsibilities would typically be captured in the agreement required by CA-3.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,583,'PE-6(4)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,585,'PE-8 (a) [for a minimum of one(1) year]
 PE-8 (b) [at least monthly]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,589,'PE-9',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,2,'AC-2 (h)(1) [twenty-four(24) hours]
 AC-2 (h)(2) [eight(8) hours]
 AC-2 (h)(3) [eight(8) hours]
 AC-2 (j) [monthly for privileged accessed, every six(6) months for non-privileged access]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,592,'PE-10 (b) [near more than one egress point of the IT area and ensures it is labeled and protected by a cover to prevent accidental shut-off]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,594,'PE-11',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,595,'PE-11(1) [automatically]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,152,'AT-2(3)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,579,'PE-6 (b)-1 [at least monthly]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,600,'PE-13(1) -1 [service provider building maintenance/physical security personnel]
 PE-13(1) -2 [service provider emergency responders with incident response responsibilities]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,604,'PE-14 (a) [consistent with American Society of Heating, Refrigerating and Air-conditioning Engineers (ASHRAE) document entitled Thermal Guidelines for Data Processing Environments]
 
 PE-14 (b) [continuously]','PE-14 (a) Requirement: The service provider measures temperature at server inlets and humidity levels by dew point.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,607,'PE-15',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,610,'PE-17',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,611,'PE-18 [physical and environmental hazards identified during threat assessment]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,625,'PL-4 (c) [at least annually]
 PL-4 (d) [at least annually and when the rules are revised or changed]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,683,'PS-5 (b)-2 [twenty-four(24) hours] 
 PS-5 (d)-1 [including access control personnel responsible for the system]
 PS-5 (d)-2 [twenty-four(24) hours]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,630,'PL-8 (b) [at least annually and when a significant change occurs]','PL-8 (b) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,635,'PL-11',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1045,'SI-1 (c)(1) [at least annually]
 SI-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1046,'SI-2 (c) [within thirty(30) days of release of updates]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1049,'SI-2(3)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,197,'AU-8 (b) [one second granularity of time measurement]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,675,'PS-3 (b) [for national security clearances; a reinvestigation is required during the fifth(5th) year for top secret security clearance, the tenth(10th) year for secret security clearance, and fifteenth(15th) year for confidential security clearance.
 
 For moderate risk law enforcement and high impact public trust level, a reinvestigation is required during the fifth(5th) year. There is no reinvestigation for other moderate risk positions or any low risk positions]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,680,'PS-4 (a) [one(1) hour]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,682,'PS-4(2)-2 Notify [access control personnel responsible for disabling access to the system]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,684,'PS-6 (b) [at least annually]
 PS-6 (c)(2) [at least annually and any time there is a change to the user''s level of access]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,688,'PS-7 (d)-1 [including access control personnel responsible for the system and/or facilities, as appropriate]
 PS-7 (d)-2 [terminations: immediately; transfers: within twenty-four(24) hours]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,626,'PL-4(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,689,'PS-8 (b)-1 [to include the ISSO and/or similar role within the organization]
 PS-8 (b)-2 [24 hours]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,266,'CM-1 (c)(1) [at least annually]
 CM-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,690,'PS-9',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,608,'PE-15(1)-1 [service provider building maintenance/physical security personnel]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,287,'CM-5',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,713,'RA-2',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,745,'SA-4(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,715,'RA-3 (c) [security assessment report]
  
 RA-3 (d) [at least annually and whenever a significant change occurs]
  
 RA-3 (f) [annually]','RA-3 Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.
 RA-3 (e) Requirement: Include all Authorizing Officials; for JAB authorizations to include FedRAMP.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,723,'RA-5(2) [within 24 hours prior to
 running scans]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,725,'RA-5(4) [notify appropriate service provider personnel and follow procedures for organization and service provider-defined corrective actions]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,305,'CM-7(5) (c) [at least quarterly or when there is a change]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,734,'RA-7',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,739,'SA-2',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,754,'SA-4 (10)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,757,'SA-5 (d) [at a minimum, the ISSO (or similar role within the organization)]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,765,'SA-8',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1065,'SI-4(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,674,'PS-2 (c) [at least annually]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,333,'CP-2 (d) [at least annually]','CP-2 Requirement: For JAB authorizations the contingency lists include designated FedRAMP personnel.
 
 CP-2 Requirement: CSPs must use the FedRAMP Information System Contingency Plan (ISCP) Template (available on the fedramp.gov: https://www.fedramp.gov/assets/resources/templates/SSP-A06-FedRAMP-ISCP-Template.docx).','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1066,'SI-4(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,878,'SA-21',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,801,'SA-9(2) [all external systems where Federal information is processed or stored]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,804,'SA-9(5)-1 [information processing, information or data, AND system services]
 SA-9(5)-2 [U.S./U.S. Territories or geographic locations where there is U.S. jurisdiction]
 SA-9(5)-3 [all High impact data, systems, or services]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,808,'SA-10 (a) [development, implementation, AND operation]','SA-10 (e) Requirement: track security flaws and flaw resolution within the system, component, or service and report findings to organization-defined personnel, to include FedRAMP.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,370,'CP-9(1) [at least monthly]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,858,'SA-16',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,859,'SA-17',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,275,'CM-3','CM-3 Requirement: The service provider establishes a central means of communicating major changes to or developments in the information system or environment of operations that may affect its services to the federal government and associated service consumers (e.g., electronic bulletin board, web status page). The means of communication are approved and accepted by the JAB/AO.
 CM-3 (e) Guidance: In accordance with record retention policies and procedures.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,896,'SC-5 (a)-1 [Protect against] 
 SC-5 (a)-2 [at a minimum: ICMP (ping) flood, SYN flood, slowloris, buffer overflow attack, and volume attack]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,408,'IA-4 (a) [at a minimum, the ISSO (or similar role within the organization)] 
 IA-4 (d) [at least two(2) years]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,412,'IA-4(4) [contractors; foreign nationals]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,887,'SC-3',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,269,'CM-2(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,904,'SC-7(3)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,905,'SC-7(4) (e) [at least every ninety(90) days or whenever there is a change in the threat environment that warrants a review of the exceptions]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,906,'SC-7(5) [any systems]','SC-7(5) Guidance: For JAB Authorization, CSPs shall include details of this control in their Architecture Briefing','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,420,'IA-5(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,908,'SC-7(7)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,378,'CP-10',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1068,'SI-4(4) (b)-1 [continuously]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,919,'SC-7(18)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,921,'SC-7 (20)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,922,'SC-7 (21)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,443,'IA-8(4)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,455,'IA-12(4)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1069,'SI-4(5)','SI-4(5) Guidance: In accordance with the incident response plan.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,932,'SC-8(1) [prevent unauthorized disclosure of information AND detect changes to information]','SC-8(1) Requirement: Please ensure SSP Section 10.3 Cryptographic Modules Implemented for Data At Rest (DAR) and Data In Transit (DIT) is fully populated for reference in this control.
 
 SC-8(1) Guidance:
 See M-22-9, including "Agencies encrypt all DNS requests and HTTP traffic within their environment"
 
 SC-8(1) applies when encryption has been selected as the method to protect confidentiality and integrity. Otherwise refer to SC-8(5). SC-8(1) is strongly encouraged.
 
 SC-8(1) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)
 
 SC-8(1) Guidance: When leveraging encryption from the underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,331,'CM-14','CM-14 Guidance: If digital signatures/certificates are unavailable, alternative cryptographic integrity checks (hashes, self-signed certs, etc.) can be utilized.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,942,'SC-12(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,274,'CM-2(7)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,279,'CM-3(4)-2 [Configuration control board (CCB) or similar (as defined in CM-3)]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,954,'SC-15 (a) [no exceptions for computing devices]','SC-15 Requirement: The information system provides disablement (instead of physical disconnect) of collaborative computing devices in a manner that supports ease of use.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,484,'IR-5(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,285,'CM-4(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,963,'SC-17',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,267,'CM-2 (b)(1) [at least annually and when a significant change occurs]
 CM-2 (b)(2) [to include when directed by the JAB]','CM-2 (b)(1) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,974,'SC-21','SC-21 Requirement:
 Control description should include how DNSSEC is implemented on recursive DNS servers to make DNSSEC requests when resolving DNS requests from internal components to domains external to the CSO boundary.
 - If the reply is signed, and fails DNSSEC, do not use the reply
 - If the reply is unsigned:
  -- CSP chooses the policy to apply
 
 SC-21 Requirement:
 Internal recursive DNS servers must be located inside an authorized environment. It is typically within the boundary, or leveraged from an underlying IaaS/PaaS.
 
 SC-21 Guidance: Accepting an unsigned reply is acceptable
 
 SC-21 Guidance:
 SC-21 applies to use of internal recursive DNS to access a domain outside the boundary by a component inside the boundary.
 - DNSSEC resolution to access a component inside the boundary is excluded.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,281,'CM-3(6) All security safeguards that rely on cryptography',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,976,'SC-22',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,486,'IR-6(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,507,'MA-3(3) (d) [the information owner]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,983,'SC-24',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,352,'CP-6',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,845,'SA-15 (b)-1 [frequency as before first use and annually thereafter]
 SA-15 (b)-2 [FedRAMP Security Authorization requirements]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,353,'CP-6(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,988,'SC-28 [confidentiality AND integrity]','SC-28 Guidance: The organization supports the capability to use cryptographic mechanisms to protect information at rest. 
 
 SC-28 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS services provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-28 Guidance: Note that this enhancement requires the use of cryptography in accordance with SC-13.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1074,'SI-4 (10)','SI-4(10) Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf) and M-22-9 (https://www.whitehouse.gov/wp-content/uploads/2022/01/M-22-9.pdf).','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,338,'CP-2(5) [essential]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1075,'SI-4(11)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1076,'SI-4(12)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1078,'SI-4(14)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1080,'SI-4(16)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,332,'CP-1 (c)(1) [at least annually]
 CP-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,520,'MA-5(1)','MA-5(1) Requirement: Only MA-5(1) (a)(1) is required by FedRAMP Moderate Baseline','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1082,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1087,'SI-4 (23)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1083,'SI-4 (19)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1084,'SI-4 (20)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1086,'SI-4 (22)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,543,'MP-6 (a)-2 [techniques and procedures IAW NIST SP 800-88 Section 4: Reuse and Disposal of Storage Media and Hardware]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,544,'MP-6(1)','MP-6(1) Requirement: Must comply with NIST SP 800-88','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1091,'SI-5(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1096,'SI-7',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,68,'AC-6(2) [all security functions]','AC-6(2) Guidance: Examples of security functions include but are not limited to: establishing system accounts, configuring access authorizations (i.e., permissions, privileges), setting events to be audited, and setting intrusion detection parameters, system programming, system and security administration, other privileged functions.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1097,'SI-7(1)-2 [selection to include security relevant events] 
 SI-7(1)-3 [at least monthly]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1101,'SI-7(5)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1103,'SI-7(7)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1111,'SI-7(15) [to include all software and firmware inside the boundary]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1116,'SI-8(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,334,'CP-2(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,469,'IR-4(2)-1 [all network, data storage, and computing devices]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,483,'IR-5',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,597,'PE-12',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,620,'PL-2 (a)(14) [to include chief privacy and ISSO and/or similar role or designees]
 PL-2 (b) [to include chief privacy and ISSO and/or similar role]
 PL-2 (c) [at least annually]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,634,'PL-10','PL-10 Requirement: Select the appropriate FedRAMP Baseline','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,726,'RA-5(5)-1 [all components that support authentication] 
 RA-5(5)-2 [all scans]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,599,'PE-13',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,729,'RA-5(8)','RA-5(8) Requirement: This enhancement is required for all high (or critical) vulnerability scan findings.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,799,'SA-9 (a) [Appropriate FedRAMP Security Controls Baseline (s) if Federal information is processed or stored within the external system]
 SA-9 (c) [Federal/FedRAMP Continuous Monitoring requirements must be met for external systems where Federal information is processed or stored]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,606,'PE-14(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,800,'SA-9(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,818,'SA-11(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,880,'SA-22',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,883,'SC-1 (c)(1) [at least annually]
 SC-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,901,'SC-7','SC-7 (b) Guidance: SC-7 (b) should be met by subnet isolation. A subnetwork (subnet) is a physically or logically segmented section of a larger network defined at TCP/IP Layer 3, to both minimize traffic and, important for a FedRAMP Authorization, add a crucial layer of network isolation. Subnets are distinct from VLANs (Layer 2), security groups, and VPCs and are specifically required to satisfy SC-7 part b and other controls. See the FedRAMP Subnets White Paper (https://www.fedramp.gov/assets/resources/documents/FedRAMP_subnets_white_paper.pdf) for additional information.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,619,'PL-1 (c)(1) [at least annually]
 PL-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,909,'SC-7(8)-2 [any network outside of organizational control and any network outside the authorization boundary]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,335,'CP-2(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,162,'AT-4 (b) [five(5) years or 5 years after completion of a specific training program]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,938,'SC-10 [no longer than ten(10) minutes for privileged sessions and no longer than fifteen(15) minutes for user sessions]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1119,'SI-10','SI-10 Requirement: Validate all information inputs and document any exceptions','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,177,'AU-5 (b) [overwrite oldest record]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,336,'CP-2(3)-1 [all]
 CP-2(3)-2 [time period defined in service provider and organization SLA]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,989,'SC-28(1)-1 [all information system components storing Federal data or system data that must be protected at the High or Moderate impact levels]','SC-28(1) Guidance: 
 Organizations should select a mode of protection that is targeted towards the relevant threat scenarios. 
 Examples:
 A. Organizations may apply full disk encryption (FDE) to a mobile device where the primary threat is loss of the device while storage is locked. 
 B. For a database application housing data for a single customer, encryption at the file system level would often provide more protection than FDE against the more likely threat of an intruder on the operating system accessing the storage.
 C. For a database application housing data for multiple customers, encryption with unique keys for each customer at the database record level may be more appropriate.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,609,'PE-16 (a) [all information system components]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,753,'SA-4(9)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,893,'SC-4',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1036,'SC-45(1) (a) [At least hourly] [http://tf.nist.gov/tf-cgi/servers.cgi] 
 SC-45(1) (b) [any difference]','SC-45(1) Requirement: The service provider selects primary and secondary time servers used by the NIST Internet time service. The secondary server is selected from a different geographic region than the primary server.
 SC-45(1) Requirement: The service provider synchronizes the system clocks of network computers that run operating systems other than Windows to the Windows Server Domain Controller emulator or to the same time source for that server.
 SC-45(1) Guidance: Synchronization of system clocks improves the accuracy of log analysis.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,165,'AU-1 (c)(1) [at least annually]
 AU-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1090,'SI-5 (a) [to include US-CERT and Cybersecurity and Infrastructure Security Agency (CISA) Directives]
 SI-5 (c) [to include system security personnel and administrators with configuration/patch-management responsibilities]','SI-5 Requirement: Service Providers must address the CISA Emergency and Binding Operational Directives applicable to their cloud service offering per FedRAMP guidance. This includes listing the applicable directives and stating compliance status.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1142,'SI-16',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,178,'AU-5(1)-3 [75%, or one month before expected negative impact]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,179,'AU-5(2)-1 [real-time] 
 AU-5(2)-2 [service provider personnel with authority to address failed audit events] 
 AU-5(2)-3 [audit failure events requiring real-time alerts, as defined by organization audit policy].',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,911,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,346,'CP-4(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,342,'CP-3 (a)(1) [*See Additional Requirements]
 CP-3 (a)(3) [at least annually]
 CP-3 (b) [at least annually]','CP-3 (a) Requirement: Privileged admins and engineers must take the basic contingency training within 10 days. Consideration must be given for those privileged admins and engineers with critical contingency-related roles, to gain enough system context and situational awareness to understand the full impact of contingency training as it applies to their respective level. Newly hired critical contingency personnel must take this more in-depth training within 60 days of hire date when the training will have more impact.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,345,'CP-4 (a)-1 [at least annually] 
 CP-4 (a)-2 [functional exercises]','CP-4 (a) Requirement: The service provider develops test plans in accordance with NIST Special Publication 800-34 (as amended); plans are approved by the JAB/AO prior to initiating testing.
 
 CP-4 (b) Requirement: The service provider must include the Contingency Plan test results with the security package within the Contingency Plan-designated appendix (Appendix G, Contingency Plan Test Report).','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,941,'SC-12 [In accordance with Federal requirements]','SC-12 Guidance: See references in NIST 800-53 documentation.
 
 SC-12 Guidance: Must meet applicable Federal Cryptographic Requirements. See References Section of control.
 
 SC-12 Guidance: Wildcard certificates may be used internally within the system, but are not permitted for external customer access to the system.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,746,'SA-4(2)-1 [at a minimum to include security-relevant external system interfaces; high-level design; low-level design; source code or network and data flow diagram; [organization-defined design/implementation information]]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,357,'CP-7(1)','CP-7(1) Guidance: The service provider may determine what is considered a sufficient degree of separation between the primary and alternate processing sites, based on the types of threats that are of concern. For one particular type of threat (i.e., hostile cyber attack), the degree of separation between sites will be less relevant.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,964,'SC-18',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,358,'CP-7(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,359,'CP-7(3)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,184,'AU-6(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,360,'CP-7(4)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,313,'CM-8(3) (a)-1 [automated mechanisms with a maximum five-minute delay in detection.] 
 CM-8(3) (a)-2 [continuously]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,364,'CP-8(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,187,'AU-6(4)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,365,'CP-8(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,366,'CP-8(3)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,188,'AU-6(5) [Selection (one or more): vulnerability scanning information; performance data; information system monitoring information; penetration test data; [Organization -defined data/information collected from other sources]]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,142,'AC-22 (d) [at least quarterly]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,369,'CP-9 (a)-2 [daily incremental; weekly full]
 CP-9 (b) [daily incremental; weekly full]
 CP-9 (c) [daily incremental; weekly full]','CP-9 Requirement: The service provider shall determine what elements of the cloud environment require the Information System Backup control. The service provider shall determine how Information System Backup is going to be verified and appropriate periodicity of the check.
 CP-9 (a) Requirement: The service provider maintains at least three backup copies of user-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (b) Requirement: The service provider maintains at least three backup copies of system-level information (at least one of which is available online) or provides an equivalent alternative.
 CP-9 (c) Requirement: The service provider maintains at least three backup copies of information system documentation including security information (at least one of which is available online) or provides an equivalent alternative.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,371,'CP-9(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,511,'MA-4',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,377,'CP-9(8) [all backup files]','CP-9(8) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,374,'CP-9(5) [time period and transfer rate consistent with the recovery time and recovery point objectives defined in the service provider and organization SLA].',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,382,'CP-10(4) [time period consistent with the restoration time-periods defined in the service provider and organization SLA]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,189,'AU-6(6)','AU-6(6) Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,354,'CP-6(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,355,'CP-6(3)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,913,'SC-7(12)-1 [Host Intrusion Prevention System (HIPS), Host Intrusion Detection System (HIDS), or minimally a host-based firewall]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,194,'AU-7',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,195,'AU-7(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,347,'CP-4(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,390,'IA-2(1)','IA-2(1) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(1) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(1) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1,'AC-1 (c)(1) [at least annually]
 AC-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,391,'IA-2(2)','IA-2(2) Requirement: According to SP 800-63-3, SP 800-63A (IAL), SP 800-63B (AAL), and SP 800-63C (FAL).
 
 IA-2(2) Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2(2) Guidance: Multi-factor authentication to subsequent components in the same user domain is not required.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1064,'SI-4','SI-4 Guidance: See US-CERT Incident Response Reporting Guidelines.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,395,'IA-2(6)-1 [local, network and remote]
 IA-2(6)-2 [privileged accounts; non-privileged accounts]
 IA-2(6) (b) [FIPS-validated or NSA-approved cryptography]','IA-2(6) Guidance: PIV=separate device. Please refer to NIST SP 800-157 Guidelines for Derived Personal Identity Verification (PIV) Credentials.
 
 IA-2(6) Guidance: See SC-13 Guidance for more information on FIPS-validated or NSA-approved cryptography.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1181,'SR-8-1 [notification of supply chain compromises and results of assessment or audits]','SR-8 Requirement: CSOs must ensure and document how they receive notifications from their supply chain vendor of newly discovered vulnerabilities including zero-day vulnerabilities.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,139,'AC-21',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,397,'IA-2(8) [privileged accounts; non-privileged accounts]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1182,'SR-9','SR-9 Requirement: CSOs must ensure vendors provide authenticity of software and patches supplied to the service provider including documenting the safeguards in place.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1183,'SR-9(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,214,'AU-11 [a time period in compliance with M-21-31]','AU-11 Requirement: The service provider retains audit records on-line for at least ninety days and further preserves audit records off-line for a period that is in accordance with NARA requirements. 
 AU-11 Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf)
 AU-11 Guidance: The service provider is encouraged to align with M-21-31 where possible','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,401,'IA-2(12)','IA-2(12) Guidance: Include Common Access Card (CAC), i.e., the DoD technical implementation of PIV/FIPS 201/HSPD-12.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,257,'CA-7(4)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,238,'CA-2(3)-1 [any FedRAMP Accredited 3PAO]
 CA-2(3)-3 [the conditions of the JAB/AO in the FedRAMP Repository]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,149,'AT-2 (a)(1) [at least annually]
 AT-2 (c) [at least annually]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,418,'IA-5','IA-5 Requirement: Authenticators must be compliant with NIST SP 800-63-3 Digital Identity Guidelines IAL, AAL, FAL level 3. Link https://pages.nist.gov/800-63-3
 
 IA-5 Guidance: SP 800-63C Section 6.2.3 Encrypted Assertion requires that authentication assertions be encrypted when passed through third parties, such as a browser. For example, a SAML assertion can be encrypted using XML-Encryption, or an OpenID Connect ID Token can be encrypted using JSON Web Encryption (JWE).','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,151,'AT-2(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1098,'SI-7(2) [to include the ISSO and/or similar role within the organization]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,260,'CA-8-1 [at least annually]','CA-8 Guidance: Reference the FedRAMP Penetration Test Guidance.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,156,'AT-3 (a)(1) [at least annually]
 AT-3 (b) [at least annually]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1114,'SI-8','SI-8 Guidance: 
 When CSO sends email on behalf of the government as part of the business offering, Control Description should include implementation of Domain-based Message Authentication, Reporting & Conformance (DMARC) on the sending domain for outgoing messages as described in DHS Binding Operational Directive (BOD) 18-1.
 https://cyber.dhs.gov/bod/18-1/ 
 
 SI-8 Guidance: CSPs should confirm DMARC configuration (where appropriate) to ensure that policy=reject and the rua parameter includes reports@dmarc.cyber.dhs.gov. DMARC compliance should be documented in the SI-8 control implementation solution description, and list the FROM: domain(s) that will be seen by email recipients.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1092,'SI-6 (b) -1 [to include upon system startup and/or restart] -2 [at least monthly]
 SI-6 (c) [to include system administrators and security personnel]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,248,'CA-5 (b) [at least monthly]','CA-5 Requirement: POA&Ms must be provided at least monthly.
 CA-5 Guidance: Reference FedRAMP-POAM-Template','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,419,'IA-5(1)','IA-5(1) Requirement: Password policies must be compliant with NIST SP 800-63B for all memorized, lookup, out-of-band, or One-Time-Passwords (OTP). Password policies shall not enforce special character or minimum password rotation requirements for memorized secrets of users.
 
 IA-5(1) (h) Requirement: For cases where technology doesn’t allow multi-factor authentication, these rules should be enforced: must have a minimum length of 14 characters and must support all printable ASCII characters.
  
 For emergency use accounts, these rules should be enforced: must have a minimum length of 14 characters, must support all printable ASCII characters, and passwords must be changed if used. 
 
 IA-5(1) Guidance: Note that (c) and (d) require the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1126,'SI-11 (b) [to include the ISSO and/or similar role within the organization]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,425,'IA-5(7)','IA-5(7) Guidance: In this context, prohibited static storage refers to any storage where unencrypted authenticators, such as passwords, persist beyond the time required to complete the access process.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1127,'SI-12',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,426,'IA-5(8) [different authenticators in different user authentication domains]','IA-5(8) Guidance: If a single user authentication domain is used to access multiple systems, such as in single-sign-on, then only a single authenticator is required.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,514,'MA-4(3)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,431,'IA-5(13)','IA-5(13) Guidance: For components subject to configuration baseline(s) (such as STIG or CIS,) the time period should conform to the baseline standard.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,437,'IA-6',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,372,'CP-9(3)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,459,'IR-2 (a)(1) [ten(10) days for privileged users, thirty(30) days for Incident Response roles]
 IR-2 (a)(3) [at least annually]
 IR-2 (b) [at least annually]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,148,'AT-1 (c)(1) [at least annually]
 AT-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1035,'SC-45',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,438,'IA-7',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,439,'IA-8',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,440,'IA-8(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,441,'IA-8(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,460,'IR-2(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,454,'IA-12(3)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,456,'IA-12(5)','IA-12(5) Additional FedRAMP Requirements and Guidance:
 Guidance: In accordance with NIST SP 800-63A Enrollment and Identity Proofing','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,403,'IA-3',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,461,'IR-2(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,465,'IR-3(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,467,'IR-4','IR-4 Requirement: The FISMA definition of "incident" shall be used: "An occurrence that actually or imminently jeopardizes, without lawful authority, the confidentiality, integrity, or availability of information or an information system; or constitutes a violation or imminent threat of violation of law, security policies, security procedures, or acceptable use policies."
 
 IR-4 Requirement: The service provider ensures that individuals conducting incident handling meet personnel security requirements commensurate with the criticality/sensitivity of the information being processed, stored, and transmitted by the information system.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,471,'IR-4(4)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,478,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,485,'IR-6 (a) [US-CERT incident reporting timelines as specified in NIST Special Publication 800-61 (as amended)]','IR-6 Requirement: Reports security incident information according to FedRAMP Incident Communications Procedure.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,488,'IR-6(3)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,489,'IR-7',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,490,'IR-7(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,494,'IR-9',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,496,'IR-9(2) [at least annually]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,497,'IR-9(3)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,498,'IR-9(4)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,519,'MA-5',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,525,'MA-6-2 [a timeframe to support advertised uptime and availability]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,531,'MP-2-1 [all types of digital and/or non-digital media containing sensitive information]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,534,'MP-3 (b)-1 [no removable media types]
 MP-3 (b)-2 [organization-defined security safeguards not applicable]','MP-3 (b) Guidance: Second parameter not-applicable','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,535,'MP-4 (a)-1 [all types of digital and non-digital media with sensitive information] 
 MP-4 (a)-2 [see additional FedRAMP requirements and guidance]','MP-4 (a) Requirement: The service provider defines controlled areas within facilities where the information and information system reside.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,538,'MP-5 (a) [all media with sensitive information] [prior to leaving secure/controlled environment: for digital media, encryption in compliance with Federal requirements and utilizes FIPS validated or NSA approved cryptography (see SC-13.); for non-digital media, secured in locked container]','MP-5 (a) Requirement: The service provider defines security measures to protect digital and non-digital media in transport. The security measures are approved and accepted by the JAB/AO.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,545,'MP-6(2) [at least every six(6) months]','MP-6(2) Guidance: Equipment and procedures may be tested or validated for effectiveness','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,546,'MP-6(3)','MP-6(3) Requirement: Must comply with NIST SP 800-88','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,552,'MP-7',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,721,'RA-5 (a) [monthly operating system/infrastructure; monthly web applications (including APIs) and databases]
 RA-5 (d) [high-risk vulnerabilities mitigated within thirty(30) days from date of discovery; moderate-risk vulnerabilities mitigated within ninety(90) days from date of discovery; low risk vulnerabilities mitigated within one hundred and eighty(180) days from date of discovery]','RA-5 Guidance: See the FedRAMP Documents page> Vulnerability Scanning Requirements 
 https://www.FedRAMP.gov/documents/
 RA-5 (a) Requirement: an accredited independent assessor scans operating systems/infrastructure, web applications, and databases once annually.
 RA-5 (d) Requirement: If a vulnerability is listed among the CISA Known Exploited Vulnerability (KEV) Catalog (https://www.cisa.gov/known-exploited-vulnerabilities-catalog) the KEV remediation date supersedes the FedRAMP parameter requirement.
 RA-5 (e) Requirement: to include all Authorizing Officials; for JAB authorizations to include FedRAMP
 
 RA-5 Guidance: Informational findings from a scanner are detailed as a returned result that holds no vulnerability risk or severity and for FedRAMP does not require an entry onto the POA&M or entry onto the RET during any assessment phase.
 Warning findings, on the other hand, are given a risk rating (low, moderate, high or critical) by the scanning solution and should be treated like any other finding with a risk or severity rating for tracking purposes onto either the POA&M or RET depending on when the findings originated (during assessments or during monthly continuous monitoring). If a warning is received during scanning, but further validation turns up no actual issue then this item should be categorized as a false positive. If this situation presents itself during an assessment phase (initial assessment, annual assessment or any SCR), follow guidance on how to report false positives in the Security Assessment Report (SAR). If this situation happens during monthly continuous monitoring, a deviation request will need to be submitted per the FedRAMP Vulnerability Deviation Request Form.
 Warnings are commonly associated with scanning solutions that also perform compliance scans, and if the scanner reports a “warning” as part of the compliance scanning of a CSO, follow guidance surrounding the tracking of compliance findings during either the assessment phases (initial assessment, annual assessment or any SCR) or monthly continuous monitoring as it applies. Guidance on compliance scan findings can be found by searching on “Tracking of Compliance Scans” in FAQs.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,186,'AU-6(3)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,560,'PE-1 (c)(1) [at least annually]
 PE-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,561,'PE-2 (c) [at least every ninety(90) days]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,565,'PE-3 (a)(2) [CSP defined physical access control systems/devices AND guards]
 PE-3 (d) [in all circumstances within restricted access area where the information system resides]
 PE-3 (f)-2 [at least annually]
 PE-3 (g) [at least annually or earlier as required by a security relevant event.]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,566,'PE-3(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,574,'PE-4',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,575,'PE-5',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,3,'AC-2(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,13,'AC-2(11)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,15,'AC-2(13)-1 [one(1) hour]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,237,'CA-2(2) [at least annually]','CA-2(2) Requirement: To include ''announced'', ''vulnerability scanning''','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,16,'AC-3',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,14,'AC-2(12) (b)[at a minimum, the ISSO and/or similar role within the organization]','AC-2(12) (a) Requirement: Required for privileged accounts.
 AC-2(12) (b) Requirement: Required for privileged accounts.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,32,'AC-4',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1003,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,663,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,929,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,36,'AC-4(4)-1 [intrusion detection mechanisms]','AC-4(4) Requirement: The service provider must support Agency requirements to comply with M-21-31 (https://www.whitehouse.gov/wp-content/uploads/2021/08/M-21-31-Improving-the-Federal-Governments-Investigative-and-Remediation-Capabilities-Related-to-Cybersecurity-Incidents.pdf) and M-22-9 (https://www.whitehouse.gov/wp-content/uploads/2022/01/M-22-9.pdf).','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,53,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,5,'AC-2(3) [24 hours for user accounts]
 AC-2(3) (d) [thirty-five(35) days] (See additional requirements and guidance.)','AC-2(3) Requirement: The service provider defines the time period for non-user accounts (e.g., accounts associated with devices). The time periods are approved and accepted by the JAB/AO. Where user management is a function of the service, reports of activity of consumer users shall be made available.
 AC-2(3) (d) Requirement: The service provider defines the time period of inactivity for device identifiers.
 Guidance: For DoD clouds, see DoD cloud website for specific DoD requirements that go above and beyond FedRAMP https://public.cyber.mil/dccs/.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,6,'AC-2(4)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,7,'AC-2(5) [inactivity is anticipated to exceed Fifteen(15) minutes]','AC-2(5) Guidance: Should use a shorter timeframe than AC-12.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,65,'AC-5','AC-5 Guidance: CSPs have the option to provide a separation of duties matrix as an attachment to the SSP.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,250,'CA-6 (e) [in accordance with OMB A-130 requirements or when a significant change occurs]','CA-6 (e) Guidance: Significant change is defined in NIST Special Publication 800-37 Revision 2, Appendix F and according to FedRAMP Significant Change Policies and Procedures. The service provider describes the types of changes to the information system or the environment of operations that would impact the risk posture. The types of changes are approved and accepted by the JAB/AO.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1053,'SI-3 (a) [signature based and non-signature based]
 SI-3 (c)(1)-1 [at least weekly] 
 SI-3 (c)(1)-2 [to include endpoints and network entry and exit points]
 SI-3 (c)(2)-1 [to include blocking and quarantining malicious code]
 SI-3 (c)(2)-2 [administrator or defined security personnel near-realtime]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,66,'AC-6',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,67,'AC-6(1) (a) [all functions not publicly accessible]
 AC-6(1) (b) [all security-relevant information not publicly available]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,69,'AC-6(3)-1 [all privileged commands]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,71,'AC-6(5)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,73,'AC-6(7) (a)-1 [at a minimum, annually]
 AC-6(7) (a)-2 [all users with privileges]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,74,'AC-6(8) [any software except software explicitly documented]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,253,'CA-7 (g)-1 [to include JAB/AO]','CA-7 Requirement: Operating System, Database, Web Application, Container, and Service Configuration Scans: at least monthly. All scans performed by Independent Assessor: at least annually.
 CA-7 Requirement: CSOs with more than one agency ATO must implement a collaborative Continuous Monitoring (ConMon) approach described in the FedRAMP Guide for Multi-Agency Continuous Monitoring. This requirement applies to CSOs authorized via the Agency path as each agency customer is responsible for performing ConMon oversight. It does not apply to CSOs authorized via the JAB path because the JAB performs ConMon oversight.
 CA-7 Guidance: FedRAMP does not provide a template for the Continuous Monitoring Plan. CSPs should reference the FedRAMP Continuous Monitoring Strategy Guide when developing the Continuous Monitoring Plan.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,9,'AC-2(7)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,75,'AC-6(9)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,76,'AC-6 (10)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,77,'AC-7','AC-7 Requirement: In alignment with NIST SP 800-63B','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,82,'AC-8 (a) [see additional Requirements and Guidance]
 AC-8 (c)(1) [see additional Requirements and Guidance]','AC-8 Requirement: The service provider shall determine elements of the cloud environment that require the System Use Notification control. The elements of the cloud environment that require System Use Notification are approved and accepted by the JAB/AO. 
 
 Requirement: The service provider shall determine how System Use Notification is going to be verified and provide appropriate periodicity of the check. The System Use Notification verification and periodicity are approved and accepted by the JAB/AO.
 
 Requirement: If not performed as part of a Configuration Baseline check, then there must be documented agreement on how to provide results of verification and the necessary periodicity of the verification by the service provider. The documented agreement on how to provide verification of the results are approved and accepted by the JAB/AO.
 
 Guidance: If performed as part of a Configuration Baseline check, then the % of items requiring setting that are checked and that pass (or fail) check can be provided.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,254,'CA-7(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,88,'AC-10-2 [three(3) sessions for privileged access and two(2) sessions for non-privileged access]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,89,'AC-11 (a) [fifteen(15) minutes]; requiring the user to initiate a device lock before leaving the system unattended',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,90,'AC-11(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,91,'AC-12',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,96,'AC-14',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,110,'AC-17',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,111,'AC-17(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,112,'AC-17(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,113,'AC-17(3)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,114,'AC-17(4)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,121,'AC-18',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,122,'AC-18(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,124,'AC-18(3)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,125,'AC-18(4)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,126,'AC-18(5)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,127,'AC-19',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,132,'AC-19(5)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,134,'AC-20(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,135,'AC-20(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,234,'CA-1 (c)(1) [at least annually]
 CA-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,262,'CA-8(2)','CA-8(2) Guidance: See the FedRAMP Documents page> Penetration Test Guidance 
 https://www.FedRAMP.gov/documents/','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,453,'IA-12(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,450,'IA-11','IA-11 Guidance:
 The fixed time period cannot exceed the limits set in SP 800-63. At this writing they are:
 - AAL3 (high baseline)
  -- 12 hours or
  -- 15 minutes of inactivity','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,770,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,22,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,271,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,417,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,320,'CM-9','CM-9 Guidance: FedRAMP does not provide a template for the Configuration Management Plan. However, NIST SP 800-128, Guide for Security-Focused Configuration Management of Information Systems, provides guidelines for the implementation of CM controls as well as a sample CMP outline in Appendix D of the Guide','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,329,'CM-12(1)-1: [Federal data and system data that must be protected at the High or Moderate impact levels]','CM-12(1) Requirement: According to FedRAMP Authorization Boundary Guidance.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,341,'CP-2(8)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,473,'IR-4(6)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,343,'CP-3(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,363,'CP-8','CP-8 Requirement: The service provider defines a time period consistent with the recovery time objectives and business impact analysis.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,367,'CP-8(4) (c) [annually]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,380,'CP-10(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,388,'IA-1 (c)(1) [at least annually]
 IA-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,389,'IA-2','IA-2 Requirement: For all control enhancements that specify multifactor authentication, the implementation must adhere to the Digital Identity Guidelines specified in NIST Special Publication 800-63B.
 
 IA-2 Requirement: Multi-factor authentication must be phishing-resistant.
 
 IA-2 Requirement: All uses of encrypted virtual private networks must meet all applicable Federal requirements and architecture, dataflow, and security and privacy controls must be documented, assessed, and authorized to operate.
 
 IA-2 Guidance: “Phishing-resistant" authentication refers to authentication processes designed to detect and prevent disclosure of authentication secrets and outputs to a website or application masquerading as a legitimate system.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,424,'IA-5(6)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,458,'IR-1 (c)(1) [at least annually]
 IR-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,463,'IR-3-1 [at least every six(6) months, including functional at least annually]','IR-3-2 Requirement: The service provider defines tests and/or exercises in accordance with NIST Special Publication 800-61 (as amended). Functional testing must occur prior to testing for initial authorization. Annual functional testing may be concurrent with required penetration tests (see CA-8). The service provider provides test plans to the JAB/AO annually. Test plans are approved and accepted by the JAB/AO prior to test commencing.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,468,'IR-4(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,492,'IR-8 (a)(9)-2 [at least annually]
 IR-8 (b) [see additional FedRAMP Requirements and Guidance]
 IR-8 (d) [see additional FedRAMP Requirements and Guidance]','IR-8 (b) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.
 IR-8 (d) Requirement: The service provider defines a list of incident response personnel (identified by name and/or by role) and organizational elements. The incident response list includes designated FedRAMP personnel.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,500,'MA-1 (c)(1) [at least annually]
 MA-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,501,'MA-2',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,504,'MA-3 (b) [at least annually]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,530,'MP-1 (c)(1) [at least annually]
 MP-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1185,'SR-11','SR-11 Requirement: CSOs must ensure that their supply chain vendors provide authenticity of software and patches and the vendor must have a plan to protect the development pipeline.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1186,'SR-11(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1189,'SR-12',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1187,'SR-11(2) [all]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,673,'PS-1 (c)(1) [at least annually]
 PS-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,884,'SC-2',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,712,'RA-1 (c)(1) [at least annually]
 RA-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,716,'RA-3(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,724,'RA-5(3)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,356,'CP-7','CP-7 (a) Requirement: The service provider defines a time period consistent with the recovery time objectives and business impact analysis.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,732,'RA-5(11)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,736,'RA-9',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,738,'SA-1 (c)(1) [at least annually]
 SA-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,740,'SA-3',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1163,'SR-1 (a) [to include chief privacy and ISSO and/or similar role or designees]
 SR-1 (c)(1) [at least annually]
 SR-1 (c)(2) [at least annually] [significant changes]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1165,'SR-2(1)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,295,'CM-6','CM-6 (a) Requirement 1: The service provider shall use the DoD STIGs to establish configuration settings; Center for Internet Security up to Level 2 (CIS Level 2) guidelines shall be used if STIGs are not available; Custom baselines shall be used if CIS is not available.
 CM-6 (a) Requirement 2: The service provider shall ensure that checklists for configuration settings are Security Content Automation Protocol (SCAP) validated or SCAP compatible (if validated checklists are not available).
 
 CM-6 Guidance: Compliance checks are used to evaluate configuration settings and provide general insight into the overall effectiveness of configuration management activities. CSPs and 3PAOs typically combine compliance check findings into a single CM-6 finding, which is acceptable. However, for initial assessments, annual assessments, and significant change requests, FedRAMP requires a clear understanding, on a per-control basis, where risks exist. Therefore, 3PAOs must also analyze compliance check findings as part of the controls assessment. Where a direct mapping exists, the 3PAO must document additional findings per control in the corresponding SAR Risk Exposure Table (RET), which are then documented in the CSP’s Plan of Action and Milestones (POA&M). This will likely result in the details of individual control findings overlapping with those in the combined CM-6 finding, which is acceptable.
 During monthly continuous monitoring, new findings from CSP compliance checks may be combined into a single CM-6 POA&M item. CSPs are not required to map the findings to specific controls because controls are only assessed during initial assessments, annual assessments, and significant change requests.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,816,'SA-11',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,556,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,764,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,529,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,638,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,791,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,775,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,817,'SA-11(1)','SA-11(1) Requirement: The service provider must document its methodology for reviewing newly developed code for the Service in its Continuous Monitoring Plan.
 
 If Static code analysis cannot be performed (for example, when the source code is not available), then dynamic code analysis must be performed (see SA-11(8))','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,848,'SA-15(3)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,394,'IA-2(5)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1166,'SR-3','SR-3 Requirement: CSO must document and maintain the supply chain custody, including replacement devices, to ensure the integrity of the devices before being introduced to the boundary.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,284,'CM-4',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,286,'CM-4(2)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,203,'AU-9(3)','AU-9(3) Guidance: Note that this enhancement requires the use of cryptography which must be compliant with Federal requirements and utilize FIPS validated or NSA approved cryptography (see SC-13.)','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,183,'AU-6 (a)-1 [at least weekly]','AU-6 Requirement: Coordination between service provider and consumer shall be documented and accepted by the JAB/AO. In multi-tenant environments, capability and means for providing review, analysis, and reporting to consumer for data pertaining to consumer shall be documented.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,236,NULL,'CA-2(1) Requirement: For JAB Authorization, must use an accredited 3PAO.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,245,'CA-3(6)',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1178,'SR-6 [at least annually]','SR-6 Requirement: CSOs must ensure that their supply chain vendors build and test their systems in alignment with NIST SP 800-171 or a commensurate security and compliance framework. CSOs must ensure that vendors are compliant with physical facility access and logical access controls to supplied products.','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,931,'SC-8 [confidentiality AND integrity]','SC-8 Guidance:
 For each instance of data in transit, confidentiality AND integrity should be through cryptography as specified in SC-8(1), physical means as specified in SC-8(5), or in combination.
 
 For clarity, this control applies to all data in transit. Examples include the following data flows:
  - Crossing the system boundary
  - Between compute instances - including containers
  - From a compute instance to storage
  - Replication between availability zones
  - Transmission of backups to storage
  - From a load balancer to a compute instance
  - Flows from management tools required for their work – e.g. log collection, scanning, etc.
 
 The following applies only when choosing SC-8(5) in lieu of SC-8(1).
 FedRAMP-Defined Assignment / Selection Parameters 
 SC-8(5)-1 [a hardened or alarmed carrier Protective Distribution System (PDS) when outside of Controlled Access Area (CAA)]
 SC-8(5)-2 [prevent unauthorized disclosure of information AND detect changes to information] 
 
 SC-8 Guidance:
 SC-8(5) applies when physical protection has been selected as the method to protect confidentiality and integrity. For physical protection, data in transit must be in either a Controlled Access Area (CAA), or a Hardened or alarmed PDS.
 
 Hardened or alarmed PDS: Shall be as defined in SECTION X - CATEGORY 2 PDS INSTALLATION GUIDANCE of CNSSI No.7003, titled PROTECTED DISTRIBUTION SYSTEMS (PDS). Per the CNSSI No. 7003 Section VIII, PDS must originate and terminate in a Controlled Access Area (CAA). 
 
 Controlled Access Area (CAA): Data will be considered physically protected, and in a CAA if it meets Section 2.3 of the DHS’s Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies. CSPs can meet Section 2.3 of the DHS’ recommended practice by satisfactory implementation of the following controls PE-2(1), PE-2(2), PE-2(3), PE-3(2), PE-3(3), PE-6(2), and PE-6(3).
 
 Note: When selecting SC-8(5), the above SC-8(5), and the above referenced PE controls must be added to the SSP.
 
 CNSSI No.7003 can be accessed here:
 https://www.dcsa.mil/Portals/91/documents/ctp/nao/CNSSI_7003_PDS_September_2015.pdf 
 
 DHS Recommended Practice: Improving Industrial Control System Cybersecurity with Defense-in-Depth Strategies can be accessed here:
 https://us-cert.cisa.gov/sites/default/files/FactSheets/NCCIC%20ICS_FactSheet_Defense_in_Depth_Strategies_S508C.pdf','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,948,'SC-13 (b) [FIPS-validated or NSA-approved cryptography]','SC-13 Guidance:
 This control applies to all use of cryptography. In addition to encryption, this includes functions such as hashing, random number generation, and key generation. Examples include the following:
  - Encryption of data
  - Decryption of data
  - Generation of one time passwords (OTPs) for MFA
  - Protocols such as TLS, SSH, and HTTPS
 
 The requirement for FIPS 140 validation, as well as timelines for acceptance of FIPS 140-2, and 140-3 can be found at the NIST Cryptographic Module Validation Program (CMVP).
 https://csrc.nist.gov/projects/cryptographic-module-validation-program 
 
 SC-13 Guidance: For NSA-approved cryptography, the National Information Assurance Partnership (NIAP) oversees a national program to evaluate Commercial IT Products for Use in National Security Systems. The NIAP Product Compliant List can be found at the following location:
 https://www.niap-ccevs.org/Product/index.cfm 
 
 SC-13 Guidance: When leveraging encryption from underlying IaaS/PaaS: While some IaaS/PaaS provide encryption by default, many require encryption to be configured, and enabled by the customer. The CSP has the responsibility to verify encryption is properly configured. 
 
 SC-13 Guidance:
 Moving to non-FIPS CM or product is acceptable when:
 - FIPS validated version has a known vulnerability
 - Feature with vulnerability is in use
 - Non-FIPS version fixes the vulnerability
 - Non-FIPS version is submitted to NIST for FIPS validation
 - POA&M is added to track approval, and deployment when ready
 
 SC-13 Guidance: At a minimum, this control applies to cryptography in use for the following controls: AU-9(3), CP-9(8), IA-2(6), IA-5(1), MP-5, SC-8(1), and SC-28(1).','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1164,'SR-2 (b) [at least annually]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1175,'SR-5',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,971,'SC-20','SC-20 Requirement:
 Control Description should include how DNSSEC is implemented on authoritative DNS servers to supply valid responses to external DNSSEC requests.
 
 SC-20 Requirement: Authoritative DNS servers must be geolocated in accordance with SA-9(5).
 
 SC-20 Guidance: SC-20 applies to use of external authoritative DNS to access a CSO from outside the boundary.
 
 SC-20 Guidance:
 External authoritative DNS servers may be located outside an authorized environment. Positioning these servers inside an authorized boundary is encouraged.
 
 SC-20 Guidance: CSPs are recommended to self-check DNSSEC configuration through one of many available analyzers such as Sandia National Labs (https://dnsviz.net)','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,977,'SC-23',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1018,'SC-39',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1048,'SI-2(2)-2 [at least monthly]',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1184,'SR-10',NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,451,'IA-12','IA-12 Additional FedRAMP Requirements and Guidance:
 Guidance: In accordance with NIST SP 800-63A Enrollment and Identity Proofing','2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,652,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,273,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,51,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,951,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,839,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,70,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,350,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,539,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,758,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1108,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1128,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,874,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,278,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1136,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,946,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,176,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,576,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,940,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,173,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,42,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,876,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,161,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,632,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,658,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,120,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,802,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,578,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,695,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,815,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1004,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,794,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,57,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,19,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,160,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,644,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,824,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,508,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1194,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1143,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,769,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,315,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1162,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,307,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,841,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1030,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,803,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,54,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,181,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,743,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,10,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,35,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,220,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,823,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,822,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,400,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1118,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,241,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1025,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1007,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,596,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,50,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1104,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,487,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,699,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,246,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1190,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,128,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,714,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,344,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,428,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,637,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,747,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,222,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1006,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1008,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,164,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,777,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,787,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,750,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,182,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,18,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,528,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,27,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,143,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,563,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,811,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,58,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,228,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,667,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,668,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,814,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,294,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,850,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,481,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,645,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,926,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1009,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,258,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,853,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1050,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,84,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,646,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1044,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,379,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,115,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1062,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,97,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,108,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,59,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1167,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,555,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,567,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,44,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1144,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,153,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,676,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1022,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,778,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,944,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,847,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,664,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,551,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1170,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,532,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,945,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,95,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,259,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,965,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,409,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,30,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,840,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,521,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1038,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,936,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,981,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,249,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,255,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,984,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,639,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,209,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,937,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,868,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,138,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,34,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,947,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,978,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,972,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,761,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,407,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,387,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,39,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,526,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,393,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,524,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1151,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,862,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,118,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,793,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,317,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,702,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,476,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,99,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,629,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1146,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,224,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,719,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,756,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,318,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,933,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,647,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,442,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,12,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,593,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,479,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,293,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1120,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,495,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,154,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,657,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,474,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,899,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,935,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,748,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,696,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,969,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1179,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,898,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,435,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,384,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1145,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,351,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,116,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,970,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,837,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,826,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,491,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,462,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,855,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,436,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,180,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,870,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,967,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,263,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,836,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,784,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,470,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,711,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,780,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,768,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,838,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,577,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,280,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,240,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1057,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,717,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,650,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,703,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,226,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,210,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1161,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,710,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,48,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,843,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1016,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,447,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,298,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,81,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1015,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1021,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1077,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,796,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,283,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,807,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,624,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,686,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,681,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,361,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1173,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,303,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,829,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,785,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,643,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,472,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,444,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,537,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,233,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1149,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1115,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,93,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,373,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,252,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,31,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1199,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,155,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,722,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,953,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,416,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1153,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1137,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,199,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,243,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,902,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1047,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,892,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,856,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,230,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,503,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1154,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,78,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,573,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,994,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,987,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1099,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,852,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,621,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,865,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,106,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,962,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1010,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,795,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,809,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,8,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,934,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,708,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1135,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1156,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,448,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,396,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,930,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,701,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,854,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,916,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1056,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,863,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,60,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1106,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1052,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,518,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,289,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,693,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,98,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,527,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1132,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,763,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,119,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,627,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,306,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,376,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,147,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,480,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,860,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,26,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,564,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,950,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,72,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1159,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1168,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,642,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,232,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,131,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,37,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,832,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,907,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1001,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,584,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,806,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,939,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,834,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,831,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,813,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,225,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,174,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,45,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,891,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,918,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,975,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,430,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,102,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,158,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,533,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,915,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,207,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,123,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,979,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1180,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,871,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,881,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,385,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,704,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,157,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,308,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,618,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1072,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,140,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,137,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,614,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,24,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,392,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,191,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,966,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,760,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,94,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1055,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,218,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1188,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,49,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,671,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1131,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,742,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,912,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,846,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1158,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1037,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,87,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,477,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,550,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,272,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,781,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,867,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,554,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,406,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,670,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,309,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,849,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,509,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1067,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,475,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,641,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,961,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,888,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,282,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,733,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,502,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,117,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,40,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1122,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,700,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,43,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,587,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,349,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,914,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,766,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,728,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1150,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,242,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1024,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,677,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1028,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,29,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,698,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,466,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,201,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,844,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,980,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1039,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,631,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,107,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1196,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,446,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,86,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1148,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,920,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1058,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,231,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,661,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,512,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,340,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,873,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,523,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,414,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,640,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,368,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,735,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,924,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,410,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,872,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1140,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1054,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,792,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,651,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,381,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,38,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1005,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,193,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1012,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,730,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,548,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,709,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,47,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1105,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,886,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,727,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,985,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,810,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,779,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1117,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,145,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,557,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,718,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,623,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1081,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,229,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1112,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,559,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1102,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,788,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,304,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,52,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1198,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,633,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,900,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,405,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,170,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1195,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,996,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,762,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,192,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1174,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,513,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,101,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1197,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1063,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1059,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,679,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,375,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,415,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,782,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1160,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,522,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,982,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1079,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1152,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,821,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1141,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,659,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1094,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1110,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,903,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,741,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,897,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1130,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,457,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,85,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,687,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1041,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,553,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,21,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,622,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,927,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1027,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,774,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,398,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,56,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,820,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,992,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,894,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,205,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,325,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1020,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,895,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1060,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1017,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,783,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,558,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,144,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1071,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,540,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,168,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,598,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1051,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,464,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1109,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,167,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,290,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,662,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1133,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1073,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,588,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1019,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,41,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,206,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,46,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,572,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,247,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,423,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,136,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,411,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,869,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1033,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,864,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,672,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,825,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,316,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1040,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,731,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,256,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,654,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,628,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,33,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,885,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,422,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,549,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,185,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,215,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,653,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1107,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,130,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,23,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1157,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,612,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1155,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,617,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,959,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,819,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,386,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,433,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,877,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,169,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,299,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1113,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1123,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,92,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,605,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,541,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,660,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,910,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,957,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,949,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,998,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,999,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,493,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,707,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,665,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,759,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1193,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,482,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,879,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,227,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1169,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,103,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1171,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,875,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1138,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1085,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,755,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1031,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,196,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,291,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,842,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1129,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,767,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,61,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1043,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,244,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,602,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1192,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1088,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,691,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1124,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,697,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,251,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1100,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,705,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,104,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1032,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,960,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,427,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,786,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,562,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,636,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,321,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,105,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,402,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,445,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,866,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,889,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,991,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,776,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,327,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,581,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,692,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1177,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1121,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,109,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1134,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,339,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,772,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,603,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,591,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,383,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1011,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,771,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,827,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,952,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,159,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,432,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,857,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,986,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,890,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,20,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1061,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,319,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,517,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,129,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,789,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1002,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,773,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1023,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,146,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,80,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1172,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,861,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,797,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,582,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1095,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1034,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,943,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,330,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,751,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,323,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,337,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,348,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,399,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,547,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,268,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1042,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,613,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,737,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,569,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,452,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,615,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,798,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,830,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,590,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,990,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,685,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,973,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,79,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,678,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,812,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,510,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1176,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,198,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,17,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,212,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,28,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1089,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,404,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1070,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1147,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,720,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,997,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,917,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1029,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,515,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1000,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,616,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,706,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,83,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,63,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,571,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,516,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,666,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,956,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,542,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,958,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,882,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,694,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,213,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,955,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,163,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,223,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,669,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,833,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,362,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,221,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,752,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,1013,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,499,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,265,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,851,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1093,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,968,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,62,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,326,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,993,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,568,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,805,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,655,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1139,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,413,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,649,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,100,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,925,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,150,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,656,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,421,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,429,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,835,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,25,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,141,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,648,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,570,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,923,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1026,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,995,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,434,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,211,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1191,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1014,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,1125,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,928,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,536,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,449,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,64,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,55,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523'),
	 (12,790,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
INSERT INTO public.standard_control_mapping (standard_id,control_id,additional_selection_parameters,additional_guidance,created_at,updated_at) VALUES
	 (12,828,NULL,NULL,'2025-03-20 12:20:34.711523','2025-03-20 12:20:34.711523');
         `)
         
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Delete all existing data from standard_control_mapping table
        await queryRunner.query(`DELETE FROM public.standard_control_mapping `);
        
        // Reset the sequence back to 1
        await queryRunner.query(`ALTER SEQUENCE public.standard_control_mapping_id_seq RESTART WITH 1`);
    }

}
