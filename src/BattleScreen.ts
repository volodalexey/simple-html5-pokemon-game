import { Container, type Texture, Sprite } from 'pixi.js'
import { AttacksBox } from './AttacksBox'
import { CharacterBox } from './CharacterBox'
import { type IScreen } from './classes'
import { DialogueBox } from './DialogueBox'
import { logBattleLayout } from './logger'
import { Monster } from './Monster'

interface IBattleScreenOptions {
  viewWidth: number
  viewHeight: number
  sprites: {
    background: Texture
    draggle: Texture[]
    emby: Texture[]
  }
}

export class BattleScreen extends Container implements IScreen {
  public isActive = false
  public draggle!: Monster
  public emby!: Monster
  public draggleBox!: CharacterBox
  public embyBox!: CharacterBox
  public background!: Sprite
  public attacksBox!: AttacksBox
  public dialogueBox!: DialogueBox

  constructor (options: IBattleScreenOptions) {
    super()
    this.setup(options)
  }

  setup (options: IBattleScreenOptions): void {
    this.setupBackground(options)
    this.setupMonsters(options)
    this.setupCharacterBoxes(options)
    this.setupAttacksBar()
    this.setupDialogueBox()

    this.hideDialogue()

    setTimeout(() => {
      this.showDialogue('FFF')
    }, 2000)
  }

  setupBackground ({ sprites: { background } }: IBattleScreenOptions): void {
    const bgSpr = new Sprite(background)
    this.addChild(bgSpr)
    this.background = bgSpr
  }

  setupMonsters ({ sprites: { draggle, emby } }: IBattleScreenOptions): void {
    const draggleMonster = new Monster({
      x: 800,
      y: 95,
      name: 'Draggle',
      animationTexture: draggle,
      attacks: [Monster.ATTACKS.Tackle, Monster.ATTACKS.Fireball],
      isEnemy: true
    })
    this.addChild(draggleMonster)
    this.draggle = draggleMonster

    const embyMonster = new Monster({
      x: 300,
      y: 330,
      name: 'Emby',
      animationTexture: emby,
      attacks: [Monster.ATTACKS.Tackle, Monster.ATTACKS.Fireball],
      isEnemy: false
    })
    this.addChild(embyMonster)
    this.emby = embyMonster
  }

  activate (): void {
    this.isActive = true
    this.draggle.play()
    this.emby.play()
    this.draggle.initialize()
    this.draggleBox.updateHealth(this.draggle.health)
    this.emby.initialize()
    this.embyBox.updateHealth(this.emby.health)
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

  setupCharacterBoxes (options: IBattleScreenOptions): void {
    const draggleBox = new CharacterBox({
      text: this.draggle.name
    })
    draggleBox.x = 50
    draggleBox.y = 50
    this.addChild(draggleBox)
    this.draggleBox = draggleBox

    const embyBox = new CharacterBox({
      text: this.emby.name
    })
    embyBox.x = this.background.width - (embyBox.width + 50)
    embyBox.y = 330
    this.addChild(embyBox)
    this.embyBox = embyBox
  }

  setupAttacksBar (): void {
    this.attacksBox = new AttacksBox({
      attacks: this.emby.attacks,
      boxWidth: this.background.width,
      onAttackClick: this.handleAttackClick
    })
    this.addChild(this.attacksBox)
    this.attacksBox.y = this.background.height - this.attacksBox.height
  }

  handleAttackClick = (attack: string): void => {
    console.log(attack)
  }

  setupDialogueBox (): void {
    this.dialogueBox = new DialogueBox({
      boxWidth: this.background.width,
      onClick: this.hideDialogue
    })
    this.dialogueBox.y = this.background.height - this.dialogueBox.height
    this.addChild(this.dialogueBox)
  }

  showDialogue (text: string): void {
    this.dialogueBox.visible = true
    this.attacksBox.visible = false
  }

  hideDialogue = (): void => {
    this.dialogueBox.visible = false
    this.attacksBox.visible = true
  }
}
