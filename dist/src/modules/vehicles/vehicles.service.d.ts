import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
export declare class VehiclesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(orgId: string): Promise<({
        driver: {
            id: string;
            name: string;
            phone: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        plateNumber: string;
        vehicleType: string;
        seats: number;
        driverId: string | null;
    })[]>;
    findOne(id: string, orgId: string): Promise<{
        driver: {
            id: string;
            name: string;
            phone: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        plateNumber: string;
        vehicleType: string;
        seats: number;
        driverId: string | null;
    }>;
    create(dto: CreateVehicleDto, orgId: string): Promise<{
        driver: {
            id: string;
            name: string;
            phone: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        plateNumber: string;
        vehicleType: string;
        seats: number;
        driverId: string | null;
    }>;
    update(id: string, dto: UpdateVehicleDto, orgId: string): Promise<{
        driver: {
            id: string;
            name: string;
            phone: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        orgId: string;
        plateNumber: string;
        vehicleType: string;
        seats: number;
        driverId: string | null;
    }>;
    private validateDriverAssignment;
}
