export interface NewsletterAdapter {
  subscribe(email: string, metadata?: Record<string, string>): Promise<void>;
  unsubscribe(email: string): Promise<void>;
}
