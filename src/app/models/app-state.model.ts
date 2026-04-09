import { Team } from './team.model';
import { TyperLeague } from './typer-league.model';

export interface AppState {
  teams: Team[];
  leagues: TyperLeague[];
  activeLeagueId: string | null;
}
