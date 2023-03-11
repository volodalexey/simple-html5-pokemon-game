import { AnimatedSprite, type Application } from 'pixi.js'
import { logPokeLayout } from './logger'

import { type TTileLayer, type GameLoader } from './GameLoader'
import { MapScreen } from './MapScreen'
import { BattleScreen } from './BattleScreen'

enum WorldScreen {
  map,
  battle
}

export class World {
  public static SCREENS = WorldScreen

  public app: Application<HTMLCanvasElement>
  public gameLoader: GameLoader
  public resizeTimeoutId!: NodeJS.Timeout
  public resizeTimeout = 300
  public totalWidth = 1024
  public totalHeight = 576

  public screen!: WorldScreen
  public mapScreen!: MapScreen
  public battleScreen!: BattleScreen

  constructor ({ app, gameLoader }: { app: Application, gameLoader: GameLoader }) {
    this.app = app as Application<HTMLCanvasElement>
    this.gameLoader = gameLoader
    this.setup()

    this.setScreen(WorldScreen.map)
  }

  setup (): void {
    this.setupCanvas()
    this.setupScreens()
    this.setupEventLesteners()

    // this.resizeHandler()

    const sprite = new AnimatedSprite(this.gameLoader.spritesheet.animations['Draggle-Idle'])
    sprite.animationSpeed = 0.035
    sprite.play()
    sprite.position.x = 0
    sprite.position.y = 0
    this.app.stage.addChild(sprite)

    const sprite2 = new AnimatedSprite(this.gameLoader.spritesheet.animations['Emby-Idle'])
    sprite2.animationSpeed = 0.035
    sprite2.play()
    sprite2.position.x = 100
    sprite2.position.y = 0
    this.app.stage.addChild(sprite2)
  }

  setupEventLesteners (): void {
    this.app.ticker.add(this.handleAppTick)
  }

  findTileLayer (name: string): TTileLayer {
    const layer = this.gameLoader.settings.layers.find((l): l is TTileLayer => l.type === 'tilelayer' && l.name === name)
    if (layer == null) {
      throw new Error(`Unable to detect "${name}" layer`)
    }
    return layer
  }

  setupCanvas (): void {
    document.body.appendChild(this.app.view)
    window.addEventListener('resize', this.resizeDeBounce)
  }

  setupScreens (): void {
    const {
      app: { view }, gameLoader: {
        worldBackgroundTexture,
        worldForegroundTexture,
        spritesheet: { animations }
      }
    } = this
    this.mapScreen = new MapScreen({
      plWidth: view.width,
      plHeight: view.height,
      collisionsLayer: this.findTileLayer('Collisions'),
      battleZonesLayer: this.findTileLayer('Battle Zones'),
      playerSprites: {
        up: animations['Player-Up'],
        left: animations['Player-Left'],
        right: animations['Player-Right'],
        down: animations['Player-Down']
      },
      mapSprites: {
        background: worldBackgroundTexture,
        foreground: worldForegroundTexture
      }
    })
    this.battleScreen = new BattleScreen()

    this.app.stage.addChild(this.mapScreen)
    this.app.stage.addChild(this.battleScreen)
  }

  resizeDeBounce = (): void => {
    this.cancelScheduledResizeHandler()
    this.scheduleResizeHandler()
  }

  cancelScheduledResizeHandler (): void {
    clearTimeout(this.resizeTimeoutId)
  }

  scheduleResizeHandler (): void {
    this.resizeTimeoutId = setTimeout(() => {
      this.cancelScheduledResizeHandler()
      this.resizeHandler()
    }, this.resizeTimeout)
  }

  resizeHandler = (): void => {
    const { app, totalWidth, totalHeight } = this
    const availableWidth = app.view.width
    const availableHeight = app.view.height
    let scale = 1
    if (totalHeight >= totalWidth) {
      scale = availableHeight / totalHeight
      if (scale * totalWidth > availableWidth) {
        scale = availableWidth / totalWidth
      }
      logPokeLayout(`By height (sc=${scale})`)
    } else {
      scale = availableWidth / totalWidth
      logPokeLayout(`By width (sc=${scale})`)
      if (scale * totalHeight > availableHeight) {
        scale = availableHeight / totalHeight
      }
    }
    const occupiedWidth = Math.floor(totalWidth * scale)
    const occupiedHeight = Math.floor(totalHeight * scale)
    const x = availableWidth > occupiedWidth ? (availableWidth - occupiedWidth) / 2 : 0
    const y = availableHeight > occupiedHeight ? (availableHeight - occupiedHeight) / 2 : 0
    logPokeLayout(`aw=${availableWidth} (ow=${occupiedWidth}) x=${x} ah=${availableHeight} (oh=${occupiedHeight}) y=${y}`)
    this.app.stage.x = x
    this.app.stage.width = occupiedWidth
    this.app.stage.y = y
    this.app.stage.height = occupiedHeight
    logPokeLayout(`x=${x} y=${y} stgw=${this.app.stage.width} stgh=${this.app.stage.height}`)
  }

  setScreen (screen: WorldScreen): void {
    switch (screen) {
      case WorldScreen.map:
        this.mapScreen.visible = true
        this.battleScreen.visible = false
        break
      case WorldScreen.battle:
        this.mapScreen.visible = false
        this.battleScreen.visible = true
        break
    }
    this.screen = screen
  }

  handleAppTick = (): void => {
    //
  }
}
