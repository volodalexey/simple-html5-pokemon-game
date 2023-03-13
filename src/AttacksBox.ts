import { Container, Graphics, Text } from 'pixi.js'
import { ATTACKS, type AttackType } from './attacks'

interface IAttacksBarOptions {
  boxWidth: number
  attackTypes: AttackType[]
  onAttackClick: (attackType: AttackType) => void
}

interface IAttackButtonOptions {
  attackType: AttackType
  btnWidth: number
  btnHeight: number
  onHover: (attackType: AttackType) => void
  onClick: (attackBtn: AttackButton) => void
}

class AttackButton extends Container {
  public background!: Graphics
  public text!: Text
  public buttonIdleColor = 0xffffff
  public buttonHoverColor = 0xdddddd
  public textColor = 0x000000
  public textSize = 16
  public attackType!: AttackType
  public btnWidth!: number
  public btnHeight!: number
  public onHover!: IAttackButtonOptions['onHover']
  public onClick!: IAttackButtonOptions['onClick']
  constructor (options: IAttackButtonOptions) {
    super()
    this.interactive = true
    this.attackType = options.attackType
    this.cursor = 'pointer'
    this.btnWidth = options.btnWidth
    this.btnHeight = options.btnHeight
    this.onHover = options.onHover
    this.onClick = options.onClick
    this.setup(options)
    this.draw(this.buttonIdleColor)
  }

  setup ({ attackType, btnWidth, btnHeight }: IAttackButtonOptions): void {
    const background = new Graphics()
    this.addChild(background)
    this.background = background

    const text = new Text(ATTACKS[this.attackType].name, {
      fontFamily: 'Press Start 2P',
      fontSize: this.textSize,
      fill: this.textColor,
      align: 'center'
    })
    text.anchor.set(0.5, 0.5)
    text.position.set(btnWidth / 2, btnHeight / 2)
    this.addChild(text)
    this.text = text

    this.on('pointerdown', (e) => {
      if (e.pointerType === 'touch') {
        this.draw(this.buttonHoverColor)
        this.onHover(attackType)
      }
      this.onClick(this)
    })
    this.on('pointerenter', (e) => {
      if (e.pointerType === 'mouse') {
        this.draw(this.buttonHoverColor)
        this.onHover(attackType)
      }
    })
    this.on('pointerleave', (e) => {
      if (e.pointerType === 'mouse') {
        this.draw(this.buttonIdleColor)
      }
    })
    this.on('pointerup', (e) => {
      if (e.pointerType === 'touch') {
        this.draw(this.buttonIdleColor)
      }
    })
  }

  draw (fillColor: number): void {
    this.background.beginFill(fillColor)
    this.background.drawRect(0, 0, this.btnWidth, this.btnHeight)
    this.background.endFill()
  }
}

export class AttacksBox extends Container {
  public box!: Graphics
  public boxBorderThick = 4
  public boxBorderColor = 0x000000
  public boxHeight = 140
  public boxColor = 0xffffff
  public attackTextSize = 16
  public attacksWidth!: number
  public attackText!: Text
  public onAttackClick!: IAttacksBarOptions['onAttackClick']

  constructor (options: IAttacksBarOptions) {
    super()
    this.attacksWidth = Math.round(options.boxWidth * 0.66)
    this.onAttackClick = options.onAttackClick
    this.setup(options)
    this.draw(options)
  }

  setup (options: IAttacksBarOptions): void {
    this.box = new Graphics()
    this.addChild(this.box)

    const attackWidth = this.attacksWidth / options.attackTypes.length
    options.attackTypes.forEach((attackType, idx) => {
      const attackButton = new AttackButton({
        attackType,
        btnWidth: attackWidth,
        btnHeight: this.boxHeight - this.boxBorderThick,
        onHover: (attackType) => {
          this.attackText.text = ATTACKS[attackType].description
          this.attackText.style.fill = ATTACKS[attackType].color
        },
        onClick: this.handleAttackBtnClick
      })
      this.addChild(attackButton)
      attackButton.x = idx * attackWidth
      attackButton.y = this.boxBorderThick
    })

    const attackText = new Text('', {
      fontFamily: 'Press Start 2P',
      fontSize: this.attackTextSize,
      fill: 0xffffff,
      align: 'center'
    })
    attackText.anchor.set(0.5, 0.5)
    attackText.position.set(this.attacksWidth + (options.boxWidth - this.attacksWidth) / 2, this.boxBorderThick + (this.boxHeight - this.boxBorderThick) / 2)

    this.addChild(attackText)
    this.attackText = attackText
  }

  draw ({ boxWidth }: IAttacksBarOptions): void {
    const {
      box, boxBorderColor, boxHeight, boxColor, boxBorderThick, attacksWidth
    } = this
    box.beginFill(boxBorderColor)
    box.drawRect(0, 0, boxWidth, boxHeight)
    box.endFill()
    box.beginFill(boxColor)
    box.drawRect(0, boxBorderThick, attacksWidth, boxHeight - boxBorderThick)
    box.drawRect(attacksWidth + boxBorderThick, boxBorderThick, boxWidth - attacksWidth - boxBorderThick, boxHeight - boxBorderThick)
    box.endFill()
  }

  handleAttackBtnClick = (attackBtn: AttackButton): void => {
    this.onAttackClick(attackBtn.attackType)
  }
}
