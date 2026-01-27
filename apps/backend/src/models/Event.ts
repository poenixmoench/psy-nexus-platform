// Interface für ein Event-Objekt
export interface Event {
  id: number;
  title: string;
  description: string;
  start_time: Date;
  end_time: Date;
  location: string;
  creator_id: number;
  created_at: Date;
  updated_at: Date;
}
