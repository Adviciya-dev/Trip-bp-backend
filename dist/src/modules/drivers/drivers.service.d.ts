import { PrismaService } from '../../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { QueryDriversDto } from './dto/query-drivers.dto';
export declare class DriversService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryDriversDto, orgId: string): Promise<{
        items: ({
            vehicle: {
                id: string;
                plateNumber: string;
                vehicleType: string;
            } | null;
        } & {
            id: string;
            name: string;
            email: string | null;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            orgId: string;
            licenseNumber: string | null;
            licenseExpiry: Date | null;
            deletedAt: Date | null;
            userId: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, orgId: string): Promise<{
        user: {
            id: string;
            email: string | null;
            phone: string | null;
            role: import(".prisma/client").$Enums.UserRole;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            orgId: string;
            plateNumber: string;
            vehicleType: string;
            seats: number;
            driverId: string | null;
        } | null;
    } & {
        id: string;
        name: string;
        email: string | null;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        licenseNumber: string | null;
        licenseExpiry: Date | null;
        deletedAt: Date | null;
        userId: string;
    }>;
    create(dto: CreateDriverDto, orgId: string): Promise<({
        vehicle: {
            id: string;
            plateNumber: string;
            vehicleType: string;
        } | null;
    } & {
        id: string;
        name: string;
        email: string | null;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        licenseNumber: string | null;
        licenseExpiry: Date | null;
        deletedAt: Date | null;
        userId: string;
    }) | null>;
    update(id: string, dto: UpdateDriverDto, orgId: string): Promise<({
        vehicle: {
            id: string;
            plateNumber: string;
            vehicleType: string;
        } | null;
    } & {
        id: string;
        name: string;
        email: string | null;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        licenseNumber: string | null;
        licenseExpiry: Date | null;
        deletedAt: Date | null;
        userId: string;
    }) | null>;
    softDelete(id: string, orgId: string): Promise<{
        message: string;
    }>;
}
