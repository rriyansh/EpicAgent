export interface User {
  id: string;
  email: string;
}

export interface Device {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}
