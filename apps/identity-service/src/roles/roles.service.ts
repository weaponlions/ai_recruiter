import { Injectable, NotFoundException } from '@nestjs/common';

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: string[];
}

const ROLES: RoleDefinition[] = [
  {
    name: 'ADMIN',
    description: 'Full platform access including tenant management',
    permissions: [
      'tenant:read', 'tenant:update',
      'user:create', 'user:read', 'user:update', 'user:delete',
      'job:create', 'job:read', 'job:update', 'job:delete', 'job:publish',
      'candidate:read', 'candidate:update',
      'pipeline:manage',
      'document:read', 'document:upload',
      'audit:read',
    ],
  },
  {
    name: 'HR_MANAGER',
    description: 'Manages hiring processes, job postings, and team access',
    permissions: [
      'user:read', 'user:update',
      'job:create', 'job:read', 'job:update', 'job:publish',
      'candidate:read', 'candidate:update',
      'pipeline:manage',
      'document:read', 'document:upload',
    ],
  },
  {
    name: 'RECRUITER',
    description: 'Creates jobs, reviews candidates, manages pipeline stages',
    permissions: [
      'job:create', 'job:read', 'job:update',
      'candidate:read', 'candidate:update',
      'pipeline:manage',
      'document:read',
    ],
  },
  {
    name: 'INTERVIEWER',
    description: 'Views assigned candidates and submits interview feedback',
    permissions: [
      'job:read',
      'candidate:read',
      'pipeline:read',
    ],
  },
  {
    name: 'VIEWER',
    description: 'Read-only access across the platform',
    permissions: [
      'job:read',
      'candidate:read',
    ],
  },
];

@Injectable()
export class RolesService {
  findAll(): RoleDefinition[] {
    return ROLES;
  }

  findOne(name: string): RoleDefinition {
    const role = ROLES.find(
      (r) => r.name.toUpperCase() === name.toUpperCase(),
    );
    if (!role) throw new NotFoundException(`Role '${name}' not found`);
    return role;
  }
}
