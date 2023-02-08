import { UserInfo, BasicUserField } from '../interface/Model/user';
export default class User implements BasicUserField {
    tid: string;
    nick: string;
    password: string;
    description: string;
    friends: Omit<UserInfo, 'password'>[];
    birthday: string;
    join_date: string;
    level: number;
    is_Vip: boolean;
    phone: string;
    constructor({ nick, password, birthday, phone }: BasicUserField);
}
