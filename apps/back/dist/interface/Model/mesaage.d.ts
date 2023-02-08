export interface signChatMessage {
    from: string;
    message: string[];
    messageHash: string;
    messageSign: string;
}
export interface groupChatMessage {
    gid: string;
    from: {
        nick: string;
        avatar: string;
        isOwner: boolean;
        isManager: boolean;
    };
    message: string[];
}
export interface groupMemberAction {
    action: string;
    tid: string;
}
export interface managerAction {
    action: string;
    tid: string;
    reason?: string;
}
