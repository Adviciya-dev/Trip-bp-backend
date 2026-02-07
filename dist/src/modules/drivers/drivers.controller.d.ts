import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { QueryDriversDto } from './dto/query-drivers.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
export declare class DriversController {
    private driversService;
    constructor(driversService: DriversService);
    findAll(query: QueryDriversDto, user: JwtPayload): Promise<{
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
    findOne(id: string, user: JwtPayload): Promise<{
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
    create(dto: CreateDriverDto, user: JwtPayload): Promise<({
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
    update(id: string, dto: UpdateDriverDto, user: JwtPayload): Promise<({
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
    remove(id: string, user: JwtPayload): Promise<{
        message: string;
    }>;
}
