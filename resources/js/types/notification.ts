export interface AppNotification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: {
        title: string;
        message: string;
        action_url?: string;
        icon?: string;
        type?: string;
        meta?: Record<string, unknown>;
    };
    read_at: string | null;
    created_at: string;
}
