import { CommunicationService } from './communication.service';
export declare class CommunicationController {
    private readonly svc;
    constructor(svc: CommunicationService);
    send(dto: any, u: any, tid: string): Promise<any>;
    threads(u: any, tid: string): Promise<any>;
    thread(id: string, u: any, tid: string): Promise<any>;
    announcements(sid: string, tid: string): Promise<any>;
    createAnnouncement(dto: any, u: any, tid: string): Promise<any>;
}
