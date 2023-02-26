export type groupCommands =
  | 'taboo'
  | 'tick'
  | 'tick-forever'
  | 'update-group-info'
  | 'update-member-info';

export type groupRole = 'member' | 'manager' | 'master';

export interface groupMessageStructure {
  sender: string;
  gid: string;
  timestampe: string;
  messages: string[];
}

export interface groupInfo {
  name: string;
  description: string;
  tags: string[];
  max: number;
  currentNumber: number;
  avatar: string;
  groupNotice: {
    [hash: string]: {
      author: string;
      date: string;
      content: string;
    };
  };
  managerList: {
    tid: string;
    avatar: string;
    alias: string;
    role: Exclude<groupRole, 'member'>;
  }[];
  memberList: {
    tid: string;
    avatar: string;
    alias: string;
    role: groupRole;
  }[];
}

export type groupSearchResult = groupInfo;
export type groupSearchResults = groupInfo[];

export interface groupCommandStructure {
  sender: string;
  timestampe: string;
  commands: {
    sender: string;
    command: groupCommands;
    timestamp: string;
    groupInfo: groupInfo;
  }[];
}
