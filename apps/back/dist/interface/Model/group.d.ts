import { UserInfo } from './user';
export type groupManager = Exclude<Exclude<UserInfo, 'description'>, 'password'>;
export type groupMembers = Exclude<UserInfo, 'password'>;
export interface GroupInfo {
    gid: string;
    group_avatar: string;
    members: groupMembers;
    managers: groupManager;
}
