import { RawBodyRequest } from '@nestjs/common';
import { BillingService } from './billing.service';
import { Request } from 'express';
export declare class BillingController {
    private readonly svc;
    constructor(svc: BillingService);
    checkout(dto: {
        plan: string;
    }, tid: string): Promise<any>;
    portal(tid: string): Promise<any>;
    subscription(tid: string): Promise<any>;
    webhook(req: RawBodyRequest<Request>, sig: string): Promise<void>;
}
