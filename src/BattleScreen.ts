import { AnimatedSprite, Container, type Texture, Sprite } from 'pixi.js'
import { type IScreen } from './classes'

interface IBattleScreenOptions {
  sprites: {
    background: Texture
    draggle: Texture[]
    emby: Texture[]
  }
}

export class BattleScreen extends Container implements IScreen {
  public isActive = false
  public animationSpeed = 0.05
  public draggle!: AnimatedSprite
  public emby!: AnimatedSprite
  public background!: Sprite

  constructor (options: IBattleScreenOptions) {
    super()
    this.setup(options)
  }

  setup (options: IBattleScreenOptions): void {
    this.setupBackground(options)
    this.setupVersus(options)
  }

  setupBackground ({ sprites: { background } }: IBattleScreenOptions): void {
    const bgSpr = new Sprite(background)
    this.addChild(bgSpr)
    this.background = bgSpr
  }

  setupVersus ({ sprites: { draggle, emby } }: IBattleScreenOptions): void {
    const drlSpr = new AnimatedSprite(draggle)
    drlSpr.animationSpeed = this.animationSpeed
    drlSpr.play()
    this.addChild(drlSpr)
    this.draggle = drlSpr

    const embSpr = new AnimatedSprite(emby)
    embSpr.animationSpeed = this.animationSpeed
    embSpr.play()
    this.addChild(embSpr)
    this.emby = embSpr
  }

  activate (): void {
    this.isActive = true
  }

  deactivate (): void {
    this.isActive = false
  }

  handleScreenTick (): void {
    if (!this.isActive) {

    }
  }

  handleScreenResize (options: Parameters<IScreen['handleScreenResize']>[0]): void {

  }
}
