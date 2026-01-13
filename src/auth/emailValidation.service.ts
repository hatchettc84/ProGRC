import { Injectable, BadRequestException } from '@nestjs/common';
import * as validator from 'validator';

@Injectable()
export class EmailValidationService {
  private readonly allowedDomains: string[] = ['progrc.com', 'supertal.io']; // Add your allowed domains here

  validateEmail(email: string): boolean {
    if (!validator.isEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // const domain = this.extractDomain(email);

    // if (!this.allowedDomains.includes(domain)) {
    //   throw new BadRequestException('Email domain is not allowed');
    // }

    return true;
  }

  private extractDomain(email: string): string {
    const domain = email.split('@')[1];
    if (!domain) {
      throw new BadRequestException('Unable to extract domain from email');
    }
    return domain.toLowerCase();
  }
}
