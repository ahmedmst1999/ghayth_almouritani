
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  isAudio?: boolean;
}

export interface UserProfile {
  email: string;
  isSubscribed: boolean;
  subscriptionExpiry?: string;
  isAdmin?: boolean;
  paymentNoteCode?: string;
}

export enum AppMode {
  VOICE = 'voice',
  CHAT = 'chat',
  SUBSCRIPTION = 'subscription',
  LOGIN = 'login'
}
