export declare class CreateTenantDto {
    schoolName: string;
    adminEmail: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
    adminPhone?: string;
    timezone?: string;
    locale?: string;
    currency?: string;
    academicYear?: string;
    dataRegion?: string;
    phone?: string;
    address?: Record<string, string>;
}
