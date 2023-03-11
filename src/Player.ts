import { AnimatedSprite, Container, type Resource, type Texture } from 'pixi.js'
import { type IPosition } from './classes'

export interface IPlayerOptions {
  position: IPosition
  sprites: {
    up: Array<Texture<Resource>>
    left: Array<Texture<Resource>>
    right: Array<Texture<Resource>>
    down: Array<Texture<Resource>>
  }
}

enum PlayerDirection {
  up,
  down,
  left,
  right
}

export class Player extends Container {
  public DIRECTIONS = PlayerDirection
  private _direction!: PlayerDirection
  public animationSpeed = 0.05
  public up!: AnimatedSprite
  public left!: AnimatedSprite
  public right!: AnimatedSprite
  public down!: AnimatedSprite
  constructor (options: IPlayerOptions) {
    super()
    this.setup(options)
    this.setDirection(PlayerDirection.down)
    this.x = options.position.x
    this.y = options.position.y
  }

  hideAllDirections (): void {
    [this.up, this.left, this.right, this.down].forEach(spr => {
      spr.visible = false
    })
  }

  setDirection (dir: PlayerDirection): void {
    this.hideAllDirections()
    switch (dir) {
      case PlayerDirection.down:
        this.down.visible = true
        break
      case PlayerDirection.left:
        this.left.visible = true
        break
      case PlayerDirection.right:
        this.right.visible = true
        break
      case PlayerDirection.up:
        this.up.visible = true
        break
    }
    this._direction = dir
  }

  stopAllAnimations (): void {
    [this.up, this.left, this.right, this.down].forEach(spr => {
      spr.stop()
    })
  }

  playAnimation (): void {
    this.hideAllDirections()
    switch (this._direction) {
      case PlayerDirection.down:
        this.down.play()
        break
      case PlayerDirection.left:
        this.left.play()
        break
      case PlayerDirection.right:
        this.right.play()
        break
      case PlayerDirection.up:
        this.up.play()
        break
    }
  }

  setup ({ sprites: { up, left, right, down } }: IPlayerOptions): void {
    const upSpr = new AnimatedSprite(up)
    upSpr.animationSpeed = this.animationSpeed
    this.addChild(upSpr)
    this.up = upSpr

    const leftSpr = new AnimatedSprite(left)
    leftSpr.animationSpeed = this.animationSpeed
    this.addChild(leftSpr)
    this.left = leftSpr

    const righSpr = new AnimatedSprite(right)
    righSpr.animationSpeed = this.animationSpeed
    this.addChild(righSpr)
    this.right = righSpr

    const downSpr = new AnimatedSprite(down)
    downSpr.animationSpeed = this.animationSpeed
    this.addChild(downSpr)
    this.down = downSpr
  }
}
