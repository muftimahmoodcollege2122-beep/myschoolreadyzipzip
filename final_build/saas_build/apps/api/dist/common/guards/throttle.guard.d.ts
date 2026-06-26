import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../cache/cache.service';
export declare const THROTTLE_KEY = "throttle";
export declare const Throttle: (limit: number, windowSec: number) => {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare const SkipThrottle: () => {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare class ThrottleGuard implements CanActivate {
    private readonly cache;
    private readonly reflector;
    constructor(cache: CacheService, reflector: Reflector);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
