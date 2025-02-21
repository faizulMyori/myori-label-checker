import { fetchAll } from "sqlite-electron";

export function getUsers() {
  return fetchAll(`SELECT 
        id,
        username,
        password,
        created_at
      FROM users`);
}
