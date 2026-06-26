export declare class LoginDto {
    email: string;
    password: string;
    tenantSlug?: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class LogoutDto {
    refreshToken: string;
}
export declare class RegisterDto {
    schoolName: string;
    principalName: string;
    email: string;
    phone: string;
    country?: string;
    studentCount?: string;
    domain?: string;
    plan?: string;
}
