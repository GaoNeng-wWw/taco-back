export type NoticeType = 'system' | 'friend-request' | 'friend-refuse' | 'friend-accept' | 'group-request' | 'group-kick' | 'group-refuse' | 'group-accept' | 'group-die';
export interface Notice {
    type: NoticeType;
    tid?: number;
    gid?: number;
    isAll?: boolean;
    message?: string;
    reason?: string;
}
