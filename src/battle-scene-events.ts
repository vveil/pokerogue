import Move from "./data/move";
import { BerryModifier } from "./modifier/modifier";

/** Alias for all {@linkcode BattleScene} events */
export enum BattleSceneEventType {
  /**
   * Triggers when the corresponding setting is changed
   * @see {@linkcode CandyUpgradeNotificationChangedEvent}
   */
  CANDY_UPGRADE_NOTIFICATION_CHANGED = "onCandyUpgradeDisplayChanged",

  /**
   * Triggers when a move is successfully used
   * @see {@linkcode MoveUsedEvent}
   */
  MOVE_USED = "onMoveUsed",
  /**
   * Triggers when a berry gets successfully used
   * @see {@linkcode BerryUsedEvent}
   */
  BERRY_USED = "onBerryUsed",

  /**
   * Triggers at the start of each new encounter
   * @see {@linkcode EncounterPhaseEvent}
   */
  ENCOUNTER_PHASE = "onEncounterPhase",
  /**
   * Triggers on the first turn of a new battle
   * @see {@linkcode TurnInitEvent}
   */
  TURN_INIT = "onTurnInit",
  /**
   * Triggers after a turn ends in battle
   * @see {@linkcode TurnEndEvent}
   */
  TURN_END  = "onTurnEnd",

  /**
   * Triggers when a new {@linkcode Arena} is created during initialization
   * @see {@linkcode NewArenaEvent}
   */
  NEW_ARENA = "onNewArena",
  /**
   * Triggers when the Summon & PostSummon Phase begins
   * Triggering in both Phases is a Workaround, to ensure the Type Effectiveness Flyout is updated,
   * because the Summon & PostSummon Phases are not always started,
   * but always one of them
   * @see {@linkcode PokemonSummonedEvent}
   */
  POKEMON_SUMMONED = "onPokemonSummoned",
}

/**
 * Container class for {@linkcode BattleSceneEventType.CANDY_UPGRADE_NOTIFICATION_CHANGED} events
 * @extends Event
*/
export class CandyUpgradeNotificationChangedEvent extends Event {
  /** The new value the setting was changed to */
  public newValue: number;
  constructor(newValue: number) {
    super(BattleSceneEventType.CANDY_UPGRADE_NOTIFICATION_CHANGED);

    this.newValue = newValue;
  }
}

/**
 * Container class for {@linkcode BattleSceneEventType.MOVE_USED} events
 * @extends Event
*/
export class MoveUsedEvent extends Event {
  /** The ID of the {@linkcode Pokemon} that used the {@linkcode Move} */
  public pokemonId: number;
  /** The {@linkcode Move} used */
  public move: Move;
  /** The amount of PP used on the {@linkcode Move} this turn */
  public ppUsed: number;
  constructor(userId: number, move: Move, ppUsed: number) {
    super(BattleSceneEventType.MOVE_USED);

    this.pokemonId = userId;
    this.move = move;
    this.ppUsed = ppUsed;
  }
}
/**
 * Container class for {@linkcode BattleSceneEventType.BERRY_USED} events
 * @extends Event
*/
export class BerryUsedEvent extends Event {
  /** The {@linkcode BerryModifier} being used */
  public berryModifier: BerryModifier;
  constructor(berry: BerryModifier) {
    super(BattleSceneEventType.BERRY_USED);

    this.berryModifier = berry;
  }
}

/**
 * Container class for {@linkcode BattleSceneEventType.ENCOUNTER_PHASE} events
 * @extends Event
*/
export class EncounterPhaseEvent extends Event {
  constructor() {
    super(BattleSceneEventType.ENCOUNTER_PHASE);
  }
}
/**
 * Container class for {@linkcode BattleSceneEventType.TURN_INIT} events
 * @extends Event
*/
export class TurnInitEvent extends Event {
  constructor() {
    super(BattleSceneEventType.TURN_INIT);
  }
}
/**
 * Container class for {@linkcode BattleSceneEventType.TURN_END} events
 * @extends Event
*/
export class TurnEndEvent extends Event {
  /** The amount of turns in the current battle */
  public turnCount: number;
  constructor(turnCount: number) {
    super(BattleSceneEventType.TURN_END);

    this.turnCount = turnCount;
  }
}
/**
 * Container class for {@linkcode BattleSceneEventType.NEW_ARENA} events
 * @extends Event
*/
export class NewArenaEvent extends Event {
  constructor() {
    super(BattleSceneEventType.NEW_ARENA);
  }
}
/**
 * Container class for {@linkcode BattleSceneEventType.POKEMON_SUMMONED} events
 * @extends Event
*/
export class PokemonSummonedEvent extends Event {
  constructor() {
    super(BattleSceneEventType.POKEMON_SUMMONED);
  }
}
