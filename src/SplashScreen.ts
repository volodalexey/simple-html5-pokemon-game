import { Container, Graphics } from 'pixi.js'
import { type IScreen } from './classes'

export interface ISplashScreenOptions {
  viewWidth: number
  viewHeight: number
}

export class SplashScreen extends Container implements IScreen {
  public isActive = false
  public graphics!: Graphics
  public fillColor = 0x000000

  constructor (options: ISplashScreenOptions) {
    super()
    this.setup()
    this.draw(options)

    this.alpha = 0
  }

  setup (): void {
    this.graphics = new Graphics()
    this.addChild(this.graphics)
  }

  draw ({ viewWidth, viewHeight }: ISplashScreenOptions): void {
    this.graphics.beginFill(this.fillColor)
    this.graphics.drawRect(0, 0, viewWidth, viewHeight)
    this.graphics.endFill()
  }

  activate (): void {
    this.isActive = true
  }

  deactivate (): void {
    this.isActive = false
  }

  handleScreenTick (): void {}

  resizeGraphics ({ viewWidth, viewHeight }: Parameters<IScreen['handleScreenResize']>[0]): void {
    this.width = viewWidth
    this.height = viewHeight
  }

  handleScreenResize (options: Parameters<IScreen['handleScreenResize']>[0]): void {
    this.resizeGraphics(options)
  }
}
