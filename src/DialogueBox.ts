import { Container, Graphics, Text } from 'pixi.js'

interface IDialogueBox {
  boxWidth: number
  onClick: () => void
}

export class DialogueBox extends Container {
  public box!: Graphics
  public text!: Text
  public boxBorderThick = 4
  public boxBorderColor = 0x000000
  public boxHeight = 140
  public boxColor = 0xffffff
  public textColor = 0x000000
  public textSize = 16
  public padding = 12
  public onClick!: IDialogueBox['onClick']
  constructor (options: IDialogueBox) {
    super()
    this.onClick = options.onClick
    this.setup()
    this.draw(options)

    this.interactive = true
    this.cursor = 'pointer'
    this.on('pointerdown', () => {
      this.onClick()
    })
  }

  setup (): void {
    const box = new Graphics()
    this.addChild(box)
    this.box = box

    const text = new Text('Emby used Fireball', {
      fontFamily: 'Press Start 2P',
      fontSize: this.textSize,
      fill: this.textColor
    })
    text.x = this.padding
    text.y = this.padding + this.boxBorderThick
    this.addChild(text)
    this.text = text
  }

  draw ({ boxWidth }: IDialogueBox): void {
    const {
      box, boxBorderColor, boxHeight, boxColor, boxBorderThick
    } = this
    box.beginFill(boxBorderColor)
    box.drawRect(0, 0, boxWidth, boxHeight)
    box.endFill()
    box.beginFill(boxColor)
    box.drawRect(0, boxBorderThick, boxWidth, boxHeight - boxBorderThick)
    box.endFill()
  }
}
