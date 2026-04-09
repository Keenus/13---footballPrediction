import { Match } from './match.model';
export interface Round {
  id: string;
  number: number;
  matches: Match[];
  isCompleted: boolean;
}
