import { Round } from './round.model';
import { Prediction } from './prediction.model';
import { Tipster } from './tipster.model';

export interface TyperLeague {
  id: string;
  name: string;
  ownerId: string;
  rounds: Round[];
  predictions: Record<string, Prediction>;
  currentRoundIndex: number;
  tipsters: Tipster[];
  isFinished: boolean;
}
