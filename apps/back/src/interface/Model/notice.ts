export type NoticeType =
  | 'system'
  | 'friend-request'
  | 'friend-refuse'
  | 'friend-accept'
  | 'group-request'
  | 'group-kick'
  | 'group-refuse'
  | 'group-accept'
  | 'group-die';

export interface Notice {
  type: NoticeType;
  /**
   * If type has `friend` prefix tid is required.
   * describe who send this request
   */
  tid?: number;
  /**
   * If type type has `group` prefix gid is required.
   * describe what group send this request id.
   */
  gid?: number;
  /**
   * when type is system
   */
  isAll?: boolean;
  /**
   * when type is `friend-request`, `group-request`, `system`
   */
  message?: string;
  /**
   * when type is `friend-refuse`, `group-kick`, `group-refuse`
   */
  reason?: string;
}
