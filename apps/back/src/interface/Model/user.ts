import { Notice } from './notice';

export interface BasicUserField {
  nick: string;
  password: string;
  birthday: string;
  phone: string;
}

export interface UserInfo {
  tid: number;
  nick: string;
  password: string;
  description: string;
  friends: Omit<UserInfo, 'password'>[];
  notices: Notice;
  birthday: string;
  join_date: string;
  level: number;
  is_Vip: boolean;
  is_sponsor: boolean;
}

export type excludePassword = Omit<UserInfo, 'password'>;
export type excludeFriends = Omit<UserInfo, 'friends'>;
export type excludeBirthday = Omit<UserInfo, 'birthday'>;

export type afterDesensitizationUserInfo = Omit<
  Omit<Omit<Omit<UserInfo, 'password'>, 'friends'>, 'birthday'>,
  'notices'
>;
