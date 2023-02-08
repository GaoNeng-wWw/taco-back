import { BasicUserField } from '../interface/Model/user';
import User from './User';
export default class UserFactory {
    create({ nick, password, birthday, phone }: BasicUserField): User;
}
