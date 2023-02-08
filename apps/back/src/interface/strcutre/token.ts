export interface tokenPayload {
  // Taco id
  tid: number;
  // 密码
  password: string;
  // 颁发时间
  iat: number;
  // 颁发机构
  iss: string;
}
