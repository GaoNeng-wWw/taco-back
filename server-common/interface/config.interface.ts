export interface ConfigStructre {
  db: {
    redis: {
      host: string;
      port: number;
      db: number;
      password: string;
    }[];
  };
}
