import { Body, Controller, Post, Request } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthService } from "src/auth/services/jwt-auth.service";
import { StandardResponse } from "src/common/dto/standardResponse.dto";
import * as metadata from '../common/metadata';
import { AuthService } from "src/auth/auth.service";
const userRoles = metadata['userRoles'];


@Controller('auth')
export class AuthController {
    constructor(
        private readonly jwtAuthService: JwtAuthService,
        private readonly authService: AuthService,
    ) { }

      //for super admin
  //create kovr Admin User
  @Post('/register_super_admin_user')
  @ApiOperation({ summary: 'Create New Admin' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'new user email' },
        password: { type: 'string', description: 'password' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'It will create a new Super Admin account.' })
  async registerRootUser(@Request() req: any) {
    const data = await this.jwtAuthService.registerSuperAdminUser(req.body);
    return StandardResponse.success(data.message);
  }

  @Post('/org_admin')
  @ApiOperation({ summary: 'Create Organization Admin (No Auth Required)' })
  @ApiBody({
      schema: {
          type: 'object',
          properties: {
              org_id: { type: 'string', description: 'Organization ID' },
              org_name: { type: 'string', description: 'Organization Name' },
              email: { type: 'string', description: 'Admin email' },
              role: { type: 'string', description: 'Role name' },
              role_id: { type: 'number', description: 'Role ID' },
              name: { type: 'string', description: 'Admin name' },
              create_new_org: { type: 'boolean', description: 'Whether to create new organization' },
              license_type_id: { type: 'number', description: 'License type ID' },
              license_start_date: { type: 'string', description: 'License start date' },
              license_end_date: { type: 'string', description: 'License end date' },
          },
      },
  })
  @ApiResponse({ status: 200, description: 'Organization admin created successfully' })
  async createOrgAdmin(@Body() body: any) {
      const { role_id } = body;
      if (!role_id) {
          body['role_id'] = userRoles['org_admin'];
          body['role'] = 'org_admin';
      }
      const result = await this.authService.createOrgUser(body, body.created_by || 'system');
      return StandardResponse.success('Organization admin created successfully', result);
  }
}