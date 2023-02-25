export interface Clarification{
    request: string;
    response?: string;
    timestamp?: number;
}

export interface MenuItem {
    id: number;
    path: string;
    title: string;
    icon?: string;
    class?: string;
}

export interface Feedback {
    is_satisfied : any;
    reason: any;
}