import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private requestId: string;
  private ipAddress: string;

  setRequestId(requestId: string) {
    this.requestId = requestId;
  }

  getRequestId(): string {
    return this.requestId;
  }

  setIpAddress(ipAddress: string) {
    this.ipAddress = ipAddress;
  }

  getIpAddress(): string {
    return this.ipAddress;
  }
}