import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
export declare class VehiclesController {
    private vehiclesService;
    constructor(vehiclesService: VehiclesService);
    findAll(user: JwtPayload): Promise<({
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
    findOne(id: string, user: JwtPayload): Promise<{
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
    create(dto: CreateVehicleDto, user: JwtPayload): Promise<{
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
    update(id: string, dto: UpdateVehicleDto, user: JwtPayload): Promise<{
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
}
