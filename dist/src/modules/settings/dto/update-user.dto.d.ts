import { UserRole } from '@prisma/client';
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    phone?: string;
    role?: UserRole;
    isActive?: boolean;
    password?: string;
}
