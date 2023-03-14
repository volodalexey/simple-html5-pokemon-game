import { Container, type Texture, Sprite } from 'pixi.js'
import { ATTACKS, AttackType } from './attacks'
import { AttacksBox } from './AttacksBox'
import { AUDIO } from './audio'
import { CharacterBox } from './CharacterBox'
import { type IScreen } from './classes'
import { DialogueBox } from './DialogueBox'
import { logBattleLayout, logBattleQueue } from './logger'
import { Monster } from './Monster'

interface IBattleScreenOptions {
  viewWidth: number
  viewHeight: number
  sprites: {
    background: Texture
    draggle: Texture[]
    emby: Texture[]
    fireball: Texture[]
  }
  onBattleEnd: () => void
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
  public onBattleEnd!: IBattleScreenOptions['onBattleEnd']
  public queue: Array<() => void> = []

  constructor (options: IBattleScreenOptions) {
    super()
    this.onBattleEnd = options.onBattleEnd
    this.setup(options)
  }

  setup (options: IBattleScreenOptions): void {
    this.setupBackground(options)
    this.setupMonsters(options)
    this.setupCharacterBoxes(options)
    this.setupAttacksBar()
    this.setupDialogueBox()

    this.hideDialogue()
  }

  setupBackground ({ sprites: { background } }: IBattleScreenOptions): void {
    const bgSpr = new Sprite(background)
    this.addChild(bgSpr)
    this.background = bgSpr
  }

  setupMonsters ({ sprites: { draggle, emby, fireball } }: IBattleScreenOptions): void {
    const draggleMonster = new Monster({
      x: 800,
      y: 95,
      name: 'Draggle',
      animationTexture: draggle,
      attackTypes: [AttackType.Tackle, AttackType.Fireball],
      isEnemy: true,
      fireballTexture: fireball
    })
    this.addChild(draggleMonster)
    this.draggle = draggleMonster

    const embyMonster = new Monster({
      x: 300,
      y: 330,
      name: 'Emby',
      animationTexture: emby,
      attackTypes: [AttackType.Tackle, AttackType.Fireball],
      isEnemy: false,
      fireballTexture: fireball
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
    AUDIO.battle.play()
  }

  deactivate (): void {
    this.isActive = false
    this.draggle.stop()
    this.emby.stop()
    AUDIO.battle.stop()
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
      attackTypes: this.emby.attackTypes,
      boxWidth: this.background.width,
      onAttackClick: this.handleAttackClick
    })
    this.addChild(this.attacksBox)
    this.attacksBox.y = this.background.height - this.attacksBox.height
  }

  handleAttackClick = (attackType: AttackType): void => {
    const { queue, draggle, emby, draggleBox, embyBox } = this
    logBattleQueue(`queue.push (${queue.length}) attack`)
    if (queue.length === 0) {
      emby.attack({
        attackType,
        recipient: draggle,
        recipientBox: draggleBox,
        container: this
      })
      this.showDialogue(`${emby.name} used ${ATTACKS[attackType].name}`)

      if (draggle.health <= 0) {
        logBattleQueue(`queue.push (${queue.length}) draggle fainted`)
        queue.push(() => {
          this.showDialogue(`${draggle.name} fainted!`)
          draggle.faint()
        })
        logBattleQueue(`queue.push (${queue.length}) onBattleEnd`)
        queue.push(() => {
          this.onBattleEnd()
        })
      } else {
        const maxAttackIdx = draggle.attackTypes.length
        const randomAttackType = draggle.attackTypes[Math.floor(Math.random() * maxAttackIdx)]

        logBattleQueue(`queue.push (${queue.length}) draggle attack`)
        queue.push(() => {
          draggle.attack({
            attackType: randomAttackType,
            recipient: emby,
            recipientBox: embyBox,
            container: this
          })

          if (emby.health <= 0) {
            logBattleQueue(`queue.push (${queue.length}) emby fainted`)
            queue.push(() => {
              this.showDialogue(`${emby.name} fainted!`)
              emby.faint()
            })
            logBattleQueue(`queue.push (${queue.length}) onBattleEnd`)
            queue.push(() => {
              this.onBattleEnd()
            })
          }
        })
      }
    }
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
    this.dialogueBox.text.text = text
    this.attacksBox.visible = false
  }

  hideDialogue = (): void => {
    this.dialogueBox.visible = false
    this.attacksBox.visible = true
    if (this.queue.length > 0) {
      logBattleQueue('queue shift', this.queue.length)
      const task = this.queue.shift()
      if (typeof task === 'function') {
        logBattleQueue('task()')
        task()
      }
    }
    logBattleQueue('after', this.queue.length)
  }
}
