import { Container, Graphics, Text } from 'pixi.js'
import gsap from 'gsap'

export interface ICharacterBoxOptions {
  text: string
}

export class CharacterBox extends Container {
  public box!: Graphics
  public lifeBarEmpty!: Graphics
  public lifeBarFull!: Graphics
  public lifeEmptyColor = 0xcccccc
  public lifeColor = 0x008000
  public lifeBarHeight = 5
  public text!: Text
  public textColor = 0x000000
  public textSize = 16
  public boxWidth = 250
  public boxHeight = 60
  public boxColor = 0xffffff
  public boxBorderThick = 4
  public boxBorderColor = 0x000000
  public padding = 16
  public lifeBarWidth = this.boxWidth - this.padding * 2
  constructor (options: ICharacterBoxOptions) {
    super()
    this.setup(options)
    this.draw()
  }

  setup (options: ICharacterBoxOptions): void {
    this.box = new Graphics()
    this.addChild(this.box)

    const text = new Text(options.text, {
      fontFamily: 'Press Start 2P',
      fontSize: this.textSize,
      fill: this.textColor
    })
    text.x = this.padding
    text.y = this.padding
    this.addChild(text)
    this.text = text

    const barsContainer = new Container()
    this.lifeBarEmpty = new Graphics()
    barsContainer.addChild(this.lifeBarEmpty)
    this.lifeBarFull = new Graphics()
    barsContainer.addChild(this.lifeBarFull)
    barsContainer.x = this.padding
    barsContainer.y = this.boxHeight - this.padding - this.lifeBarHeight

    this.addChild(barsContainer)
  }

  draw (): void {
    const {
      box, boxBorderColor, boxWidth, boxHeight, boxColor, boxBorderThick,
      lifeBarEmpty, lifeEmptyColor, lifeBarHeight, lifeBarFull, lifeColor,
      lifeBarWidth
    } = this
    box.clear()
    box.beginFill(boxBorderColor)
    box.drawRect(0, 0, boxWidth, boxHeight)
    box.endFill()
    box.beginFill(boxColor)
    box.drawRect(0 + boxBorderThick, 0 + boxBorderThick, boxWidth - boxBorderThick * 2, boxHeight - boxBorderThick * 2)
    box.endFill()

    lifeBarEmpty.beginFill(lifeEmptyColor)
    lifeBarEmpty.drawRect(0, 0, lifeBarWidth, lifeBarHeight)

    lifeBarFull.beginFill(lifeColor)
    lifeBarFull.drawRect(0, 0, lifeBarWidth, lifeBarHeight)
  }

  updateHealth (health: number): void {
    if (health <= 0) {
      health = 0
    } else if (health >= 100) {
      health = 100
    }
    gsap.to(this.lifeBarFull, {
      width: this.lifeBarWidth * health / 100
    })
  }
}
