import { SetMetadata } from "@nestjs/common";

export const Roles = (...allowedRoles: number[]) => SetMetadata('allowedRoles', allowedRoles);