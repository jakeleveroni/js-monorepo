export type UserRecord = {
  id: string;
  username: string;
  password: string;
  salt: string;
  role: string;
};

export type MinimalUserRecord = Pick<UserRecord, 'username' | 'role' | 'id'>;
