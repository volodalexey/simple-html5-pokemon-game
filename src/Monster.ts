import { AnimatedSprite, type Container, type Texture } from 'pixi.js'
import gsap from 'gsap'
import { type CharacterBox } from './CharacterBox'
import { ATTACKS, AttackType } from './attacks'
import { AUDIO } from './audio'

export interface IMonsterOptions {
  x: number
  y: number
  name: string
  animationTexture: Texture[]
  fireballTexture: Texture[]
  attackTypes: AttackType[]
  isEnemy: boolean
}

export class Monster extends AnimatedSprite {
  public animSpeed = 0.03
  public health = 100
  public name!: string
  public attackTypes!: IMonsterOptions['attackTypes']
  public isEnemy!: boolean
  public fireballTexture!: IMonsterOptions['fireballTexture']
  private readonly posX!: number
  private readonly posY!: number
  constructor (options: IMonsterOptions) {
    super(options.animationTexture)
    this.animationSpeed = this.animSpeed
    this.posX = options.x
    this.posY = options.y
    this.name = options.name
    this.attackTypes = options.attackTypes
    this.isEnemy = options.isEnemy
    this.fireballTexture = options.fireballTexture
  }

  initialize (): void {
    this.health = 100
    this.alpha = 1

    this.x = this.posX
    this.y = this.posY
  }

  faint (): void {
    this.stop()
    gsap.to(this, {
      alpha: 0,
      y: this.posY + 20
    })
    AUDIO.battle.stop()
    AUDIO.victory.play()
  }

  attack ({
    attackType,
    recipient,
    recipientBox,
    container
  }: {
    attackType: AttackType
    recipient: Monster
    recipientBox: CharacterBox
    container: Container
  }): void {
    recipient.health -= ATTACKS[attackType].damage
    switch (attackType) {
      case AttackType.Fireball: {
        AUDIO.initFireball.play()
        const fireball = new AnimatedSprite(this.fireballTexture)
        fireball.x = this.x
        fireball.y = this.y

        let rotation = 1
        if (this.isEnemy) rotation = -2.2
        fireball.anchor.set(0.5, 0.5)
        fireball.rotation = rotation
        container.addChild(fireball)

        gsap.to(fireball.position, {
          x: recipient.position.x + recipient.width / 2,
          y: recipient.position.y + recipient.height / 2,
          onComplete: () => {
            AUDIO.fireballHit.play()
            recipientBox.updateHealth(recipient.health)

            gsap.to(recipient, {
              x: recipient.posX + 10,
              alpha: 0,
              yoyo: true,
              repeat: 5,
              duration: 0.08
            })

            container.removeChild(fireball)
          }
        })
      }
        break
      case AttackType.Tackle: {
        const tl = gsap.timeline()

        let movementDistance = 20
        if (this.isEnemy) movementDistance = -20

        tl.to(this, {
          x: this.posX - movementDistance
        })
          .to(this, {
            x: this.position.x + movementDistance * 2,
            duration: 0.1,
            onComplete: () => {
              AUDIO.tackleHit.play()
              recipientBox.updateHealth(recipient.health)

              gsap.to(recipient, {
                x: recipient.x + 10,
                alpha: 0,
                yoyo: true,
                repeat: 5,
                duration: 0.08
              })
            }
          })
          .to(this.position, {
            x: this.position.x
          })
      }
        break
    }
  }
}
