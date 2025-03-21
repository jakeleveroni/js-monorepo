export type UserRecord = {
  id: string;
  username: string;
  password: string;
  salt: string;
  role_id: number;
};

export type MinimalUserRecord = Pick<UserRecord, "username" | "role_id" | "id">;

export type Role = "admin" | "manager" | "user";

export type Permission = "create" | "edit" | "delete";
