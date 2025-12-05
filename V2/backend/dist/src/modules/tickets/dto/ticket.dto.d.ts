import { TicketStatus } from '@prisma/client';
export declare class CreateTicketDto {
    subject: string;
    description: string;
    requester_email?: string;
    requester_name?: string;
    requester_phone: string;
    location?: string;
    priority_id: string;
    category_ids?: string[];
}
export declare class UpdateTicketDto {
    subject?: string;
    description?: string;
    status?: TicketStatus;
    assignee_id?: string;
    priority_id?: string;
    category_ids?: string[];
}
export declare class AddCommentDto {
    content: string;
    is_internal?: boolean;
}
export declare class BulkAssignDto {
    ticket_ids: string[];
    assignee_id: string;
}
export declare class BulkStatusDto {
    ticket_ids: string[];
    status: TicketStatus;
}
export declare class AddAttachmentDto {
    original_filename: string;
    stored_filename: string;
    mime_type: string;
    size: number;
}
