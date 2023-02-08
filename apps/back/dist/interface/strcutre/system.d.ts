export type command_type = 'accept-friend-request' | 'refuse-friend-request' | 'accept-join-group-request' | 'refuse-join-group-request' | 'accept-invite-group-request' | 'refuse-invite-group-request';
export type noticeType = 'message' | 'notification' | 'alert';
export interface systemCommandStructure {
    sender: string;
    timestamp: string;
    command_type: command_type;
}
export interface systemNotice {
    target: string;
    timestampe: string;
    type: noticeType;
    notification?: {
        title: string;
        content: string;
    };
    alert?: {
        content: string;
    };
    message?: {
        content: string;
    };
}
export interface sendSystemCommandStructure<T> extends systemCommandStructure {
    payload: Record<string, any> | T;
}
