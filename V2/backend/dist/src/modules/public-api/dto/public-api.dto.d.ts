export declare class ApiRegisterUserDto {
    email?: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
}
export declare class ApiCreateTicketDto {
    subject: string;
    description: string;
    user_id: string;
    location?: string;
    priority_id: string;
    category_ids?: string[];
}
