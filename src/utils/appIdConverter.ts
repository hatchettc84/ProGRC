import { BadRequestException } from "@nestjs/common";

export function convertToValidAppId(appId: string): number {
    const appIdNum = appId ? Number(appId) : undefined;
    if (appId && isNaN(appIdNum)) {
        throw new BadRequestException("Invalid appId. Must be a valid number.");
    }
    return +appId;
}
