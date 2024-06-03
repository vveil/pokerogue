import { default as Pokemon } from "../field/pokemon";
import { addTextObject, TextStyle } from "./text";
import * as Utils from "../utils";
import BattleScene from "#app/battle-scene.js";
import { BattleSceneEventType } from "#app/battle-scene-events.js";
import i18next from "i18next";
import { Type, getTypeDamageMultiplier, TypeDamageMultiplier } from "../data/type";
import { WeatherType } from "../data/weather";

/** A Flyout Menu attached to each {@linkcode BattleInfo} object on the field UI */
export default class TypeEffectivenessFlyout extends Phaser.GameObjects.Container {
  /** An alias for the scene typecast to a {@linkcode BattleScene} */
  private battleScene: BattleScene;

  /** Is this object linked to a player's Pokemon? */
  private player: boolean;

  /** The Pokemon this object is linked to */
  private pokemon: Pokemon;

  /** The restricted width of the flyout which should be drawn to */
  private flyoutWidth = 118;
  /** The restricted height of the flyout which should be drawn to */
  private flyoutHeight = 23;

  /** The amount of translation animation on the x-axis */
  private translationX: number;
  /** The x-axis point where the flyout should sit when activated */
  private anchorX: number;
  /** The y-axis point where the flyout should sit when activated */
  private anchorY: number;

  /** The initial container which defines where the flyout should be attached */
  private flyoutParent: Phaser.GameObjects.Container;
  /** The background {@linkcode Phaser.GameObjects.Sprite;} for the flyout */
  private flyoutBackground: Phaser.GameObjects.Sprite;

  /** The container which defines the drawable dimensions of the flyout */
  private flyoutContainer: Phaser.GameObjects.Container;

  /** A map of multipliers to types
   * It shows which damagetype is effective against the types of the {@linkcode Pokemon} linked to the flyout
   */
  private multipliers: Map<string, string[]> = new Map<string, string[]>([["0", []], ["0.125", []], ["0.25", []], ["0.5", []], ["1", []], ["2", []], ["4", []], ["8", []]]);
  /** Has the typeEffectiveness flyout been filled with the types? */
  private typeEffectivenessFilled: boolean = false;



  private readonly onTurnInit = (event) => this.updateTypeEffectiveness(event);

  constructor(scene: Phaser.Scene, player: boolean) {
    super(scene, 0, 0);
    this.battleScene = scene as BattleScene;

    // Note that all player based flyouts are disabled. This is included in case of future development
    this.player = player;

    this.translationX = this.player ? -this.flyoutWidth : this.flyoutWidth;
    this.anchorX = (this.player ? -130 : -40);
    this.anchorY = -2.5 + (this.player ? -18.5 : -13);

    this.flyoutParent = this.scene.add.container(this.anchorX - this.translationX, this.anchorY);
    this.flyoutParent.setAlpha(0);
    this.add(this.flyoutParent);

    // Load the background image
    this.flyoutBackground = this.scene.add.sprite(0, 0, "pbinfo_enemy_boss_stats");
    this.flyoutBackground.setOrigin(0, 0);

    this.flyoutParent.add(this.flyoutBackground);

    this.flyoutContainer = this.scene.add.container(44 + (this.player ? -this.flyoutWidth : 0), 2);
    this.flyoutParent.add(this.flyoutContainer);
  }

  /**
   * Links the given {@linkcode Pokemon} and subscribes to the {@linkcode BattleSceneEventType.MOVE_USED} event
   * @param pokemon {@linkcode Pokemon} to link to this flyout
   */
  initInfo(pokemon: Pokemon) {
    this.pokemon = pokemon;

    this.name = `Flyout ${this.pokemon.name}`;
    this.flyoutParent.name = `Flyout Parent ${this.pokemon.name}`;

    this.battleScene.eventTarget.addEventListener(BattleSceneEventType.TURN_INIT, this.onTurnInit);
  }

  /** Sets and formats the text property for all {@linkcode Phaser.GameObjects.Text} in the flyoutText array */
  setText() {
    let y: number = 1;
    this.multipliers.forEach((currTypes: any, index) => {
      const currType = currTypes as string[];

      let x: number = this.anchorX + 42;
      const flyoutText: Phaser.GameObjects.Text = addTextObject(
        this.scene,
        x,
        y, index.toString() + "x:", TextStyle.BATTLE_INFO);
      flyoutText.setFontSize(45);
      flyoutText.setLineSpacing(-10);
      flyoutText.setOrigin(0, 0);
      flyoutText.setAlign("right");
      this.flyoutContainer.add(flyoutText);

      x += 14;
      let typeIcon: Phaser.GameObjects.Sprite;
      for (let j = 0; j < currType.length; j++) {
        typeIcon = this.scene.add.sprite(x, y, `types${Utils.verifyLang(i18next.language) ? `_${i18next.language}` : ""}`); typeIcon.setScale(0.5);
        typeIcon.setOrigin(0, 0);
        typeIcon.setFrame(currType[j].toLowerCase());
        this.flyoutContainer.add(typeIcon);
        x += 18;
      }
      y += 7;
    }
    );
    this.typeEffectivenessFilled = true;
  }

  /** Updates all of the {@linkcode MoveInfo} objects in the moveInfo array */
  updateTypeEffectiveness(event: Event) {
    if (this.typeEffectivenessFilled) {
      return;
    }
    // TODO Stellar
    const types = Object.values(Type).slice(0, 18);
    types.map(atkType => {
      const mult = this.getAttackTypeEffectiveness(atkType.toString(), this.pokemon);
      return [mult, atkType.toString()];
    }).reduce((acc, [mult, atkType]) => {
      acc.get(mult.toString())?.push(atkType.toString());
      return acc;
    }, this.multipliers);

    // Delete all multipliers that have no types and delete the multiplier for 1x
    this.clearTypeEffectivenessMap();
    this.setText();
  }

  clearTypeEffectivenessMap(): void {
    this.multipliers.forEach((value, key) => {
      if (value.length === 0 || key === "1") {
        this.multipliers.delete(key);
      }
    });
  }

  getAttackTypeEffectiveness(atkType: string, source?: Pokemon): TypeDamageMultiplier {
    const types = source.getTypes(true, true);

    let multiplier = types.map(defType => {
      return getTypeDamageMultiplier(Type[atkType], defType);
    }).reduce((acc, cur) => acc * cur, 1) as TypeDamageMultiplier;

    // Handle strong winds lowering effectiveness of types super effective against pure flying
    if (this.battleScene.arena.weather?.weatherType === WeatherType.STRONG_WINDS && !this.battleScene.arena.weather.isEffectSuppressed(this.battleScene) && multiplier >= 2 && types.includes(Type.FLYING) && getTypeDamageMultiplier(Type[atkType], Type.FLYING) === 2) {
      multiplier /= 2;
    }

    return multiplier;
  }

  /** Animates the flyout to either show or hide it by applying a fade and translation */
  toggleTypeEffectivenessFlyout(visible: boolean): void {
    this.scene.tweens.add({
      targets: this.flyoutParent,
      x: visible ? this.anchorX : this.anchorX - this.translationX,
      duration: Utils.fixedInt(125),
      ease: "Sine.easeInOut",
      alpha: visible ? 1 : 0,
    });
  }

  destroy(fromScene?: boolean): void {
    this.battleScene.eventTarget.removeEventListener(BattleSceneEventType.TURN_INIT, this.onTurnInit);

    super.destroy();
  }
}
