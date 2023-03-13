import { AnimatedSprite, type Texture } from 'pixi.js'

export enum MonsterAttack {
  Tackle = 'Tackle', Fireball = 'Fireball'
}

export interface IMonster {
  x: number
  y: number
  name: string
  animationTexture: Texture[]
  attacks: MonsterAttack[]
  isEnemy: boolean
}

export class Monster extends AnimatedSprite {
  static ATTACKS = MonsterAttack
  public animSpeed = 0.03
  public health = 100
  public name!: string
  public attacks!: MonsterAttack[]
  public isEnemy!: boolean
  constructor (options: IMonster) {
    super(options.animationTexture)
    this.animationSpeed = this.animSpeed
    this.x = options.x
    this.y = options.y
    this.name = options.name
    this.attacks = options.attacks
    this.isEnemy = options.isEnemy
  }

  initialize (): void {
    this.health = 100
  }
}
