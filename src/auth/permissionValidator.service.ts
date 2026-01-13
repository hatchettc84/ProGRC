import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LoggerService } from "src/logger/logger.service";
import { Customer } from "src/entities/customer.entity";
import { DomainCacheService } from "src/cache/domain-cache.service";
import { Permission } from "src/entities/permission.entity";


@Injectable()
export class PermissionValidatorService {
    constructor(
        @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
        private readonly cacheService: DomainCacheService,
        private readonly logger: LoggerService
    ) { }

    async accessAllowed(req: any) {
        try {
            const enablePermissionRestrictions = process.env.ENABLE_PERMISSION_RESTRICTIONS === 'true';
            // Get route path from request - NestJS route path doesn't include global prefix
            // Fallback to req.url if req.route.path is undefined
            let api_path = req.route?.path || req.path || req.url.split('?')[0];
            const roles = Number(req.user_data.role_id);
            const customerId = req.user_data.customerId;

            // Log the original path for debugging
            if (!api_path || api_path === '') {
                this.logger.warn(`PermissionValidator: api_path is empty. req.route.path: ${req.route?.path}, req.path: ${req.path}, req.url: ${req.url}`);
                api_path = req.url.split('?')[0]; // Fallback to full URL without query params
            }

            // Log the path before transformation for debugging
            this.logger.debug(`PermissionValidator: Original api_path: ${api_path}, Method: ${req.method}, URL: ${req.url}`);
            
            api_path = this.transformApiPath(api_path);
            
            // Log the path after transformation for debugging
            this.logger.debug(`PermissionValidator: Transformed api_path: ${api_path}`);

            // Use the injected singleton instance
            const permissions: Permission[] = await this.cacheService.getPermissions();

            if (!permissions) {
                // Default deny: If permissions cache is empty, deny access for security
                // Only allow if explicitly configured via ALLOW_EMPTY_PERMISSIONS=true
                const allowEmptyPermissions = process.env.ALLOW_EMPTY_PERMISSIONS === 'true';
                if (allowEmptyPermissions) {
                    this.logger.warn(`Permissions cache is empty, allowing request (ALLOW_EMPTY_PERMISSIONS=true)`);
                    return true;
                }
                this.logger.error(`Permissions cache is empty, denying access for security (default deny)`);
                return false;  // Security fix: Default deny instead of allow
            }

            const checkApiPath = (path: string): Permission | null => {
                const permission = permissions.find(permission => permission.api_path.toLowerCase() === path.toLowerCase() && permission.method === req.method);
                if (permission) {
                    return permission;
                }
                const lastSlashIndex = path.lastIndexOf('/');
                if (lastSlashIndex === -1) {
                    return null;
                }
                const newPath = path.substring(0, lastSlashIndex);
                return checkApiPath(newPath);
            };

            const permission = checkApiPath(api_path);

            if (!permission) {
                // Default deny: If no permission rule found, deny access for security
                // Only allow if explicitly configured via ENABLE_PERMISSION_RESTRICTIONS=false
                const allowUnknownPaths = process.env.ALLOW_UNKNOWN_API_PATHS === 'true';
                if (allowUnknownPaths) {
                    this.logger.warn(`Access allowed for API path: ${api_path}, permission rule not found (ALLOW_UNKNOWN_API_PATHS=true)`);
                    return true;
                }
                this.logger.warn(`Access denied for API path: ${api_path}, permission rule not found (default deny)`);
                return false;  // Security fix: Default deny instead of allow
            }

            if (permission.allow_all) {
                return true;
            }

            let hasAllowedRole = false;
            if (permission.allowed_roles.length > 0) {
                hasAllowedRole = permission.allowed_roles.includes(roles);
            } else {
                hasAllowedRole = true;
            }
            let hasAllowedLicense = true;
            if (permission.allowed_licenses.length > 0 && customerId) {
                const customer = await this.getCustomerById(customerId);
                hasAllowedLicense = permission.allowed_licenses.includes(customer.license_type_id);
            }

            if (hasAllowedRole && hasAllowedLicense) {
                return true;
            } else {
                this.logger.error(`Access denied for API path: ${api_path}, permission denied. hasAllowedRole: ${hasAllowedRole}, hasAllowedLicense: ${hasAllowedLicense}`);
                if (enablePermissionRestrictions) {
                    return false;
                }
                return true;
            }
        } catch (error) {
            this.logger.error("Error in accessAllowed method:", error);
            return error;
        }
    }

    private transformApiPath(api_path: string): string {
        const apiPrefix = '/api/v1';
        
        // If path already starts with /api/v1, process it
        if (api_path.startsWith(apiPrefix)) {
            const pathAfterPrefix = api_path.slice(apiPrefix.length);
            const segments = pathAfterPrefix.split('/').map(segment => {
                return /^:[a-zA-Z0-9\-]+$/.test(segment) ? '{id}' : segment;
            });
            return apiPrefix + segments.join('/');
        }
        
        // If path doesn't start with /api/v1, add it (NestJS routes don't include the global prefix)
        // Remove leading slash if present to avoid double slashes
        const cleanPath = api_path.startsWith('/') ? api_path.slice(1) : api_path;
        const segments = cleanPath.split('/').map(segment => {
            return /^:[a-zA-Z0-9\-]+$/.test(segment) ? '{id}' : segment;
        });
        return apiPrefix + '/' + segments.join('/');
    }

    private async getCustomerById(customerId: string): Promise<Customer> {
        const customer: Customer = await this.customerRepo.findOne({ where: { id: customerId }, relations: ['licenseType'] });
        if (!customer) {
            this.logger.info('Invalid organization', customerId);
            throw new ForbiddenException('Invalid organization');
        }
        return customer
    }

}
