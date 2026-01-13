export interface JwtPayload {
  sub: string;
  email: string;
  role_id: number;
  organization_id?: string;
}

export interface JwtResponse {
  access_token: string;
  refresh_token?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role_id: number;
  mobile?: string;
  profile_image_key?: string | null;
  tos_accepted_at?: Date | null;
}

export interface OrganizationResponse {
  id: string;
  logo_image_key: string | null;
  organization_name: string;
  license_type: string | null;
  is_onboarding_complete: boolean;
  created_at: Date;
  created_by?: {
    name: string;
    email: string;
  } | null;
  license_type_id: number;
  license_type_data?: {
    id: number;
    name: string;
    created_at: Date;
    updated_at: Date;
    licenseRule: {
      id: number;
      name: string;
      license_type_id: number;
      number_of_applications: number;
      number_of_assessments: number;
      standards_per_application: number;
      available_standards: number[];
      available_templates: number[];
      created_at: Date;
      updated_at: Date;
    };
  };
  license_start_date: Date;
  license_end_date: Date;
  csms?: Array<{
    id: string;
    created_at: Date;
    name: string;
    email: string;
  }>;
} 