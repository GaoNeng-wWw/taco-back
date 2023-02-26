import { BasicUserField } from '@common/interface/Model/user';
import User from './User';

export default class UserFactory {
  create({ nick, password, birthday, phone }: BasicUserField) {
    return new User({
      nick,
      password,
      birthday,
      phone,
    });
  }
}
