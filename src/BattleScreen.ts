import { AnimatedSprite, Container, type Texture, Sprite } from 'pixi.js'
import { type IScreen } from './classes'
import { logBattleLayout } from './logger'

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
    this.addChild(drlSpr)
    this.draggle = drlSpr
    this.draggle.x = 800
    this.draggle.y = 95

    const embSpr = new AnimatedSprite(emby)
    embSpr.animationSpeed = this.animationSpeed
    this.addChild(embSpr)
    this.emby = embSpr
    this.emby.x = 300
    this.emby.y = 330
  }

  activate (): void {
    this.isActive = true
    this.draggle.play()
    this.emby.play()
  }

  deactivate (): void {
    this.isActive = false
    this.draggle.stop()
    this.emby.stop()
  }

  handleScreenTick (): void {}

  handleScreenResize ({ viewWidth, viewHeight }: Parameters<IScreen['handleScreenResize']>[0]): void {
    const availableWidth = viewWidth
    const availableHeight = viewHeight
    const totalWidth = this.background.width
    const totalHeight = this.background.height
    let scale = 1
    if (totalHeight >= totalWidth) {
      scale = availableHeight / totalHeight
      if (scale * totalWidth > availableWidth) {
        scale = availableWidth / totalWidth
      }
      logBattleLayout(`By height (sc=${scale})`)
    } else {
      scale = availableWidth / totalWidth
      logBattleLayout(`By width (sc=${scale})`)
      if (scale * totalHeight > availableHeight) {
        scale = availableHeight / totalHeight
      }
    }
    const occupiedWidth = Math.floor(totalWidth * scale)
    const occupiedHeight = Math.floor(totalHeight * scale)
    const x = availableWidth > occupiedWidth ? (availableWidth - occupiedWidth) / 2 : 0
    const y = availableHeight > occupiedHeight ? (availableHeight - occupiedHeight) / 2 : 0
    logBattleLayout(`aw=${availableWidth} (ow=${occupiedWidth}) x=${x} ah=${availableHeight} (oh=${occupiedHeight}) y=${y}`)
    this.x = x
    this.width = occupiedWidth
    this.y = y
    this.height = occupiedHeight
    logBattleLayout(`x=${x} y=${y} w=${this.width} h=${this.height}`)
  }
}
