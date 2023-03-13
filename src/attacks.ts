export enum AttackType {
  Tackle = 'Tackle',
  Fireball = 'Fireball'
}

export interface Attack {
  name: string
  damage: number
  type: AttackType
  description: string
  color: number
}

export const ATTACKS: Record<AttackType, Attack> = {
  [AttackType.Tackle]: {
    name: 'Tackle',
    damage: 10,
    type: AttackType.Tackle,
    description: 'Normal',
    color: 0x000000
  },
  [AttackType.Fireball]: {
    name: 'Fireball',
    damage: 25,
    type: AttackType.Fireball,
    description: 'Fire',
    color: 0xff0000
  }
}
