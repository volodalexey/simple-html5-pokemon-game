import { type Application } from 'pixi.js'
// import { logPokeLayout } from './logger'

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

    this.resizeHandler()
  }

  setupEventLesteners (): void {
    window.addEventListener('resize', this.resizeDeBounce)
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
  }

  setupScreens (): void {
    const {
      app: { view: { width, height } },
      gameLoader: {
        worldBackgroundTexture,
        worldForegroundTexture,
        battleBackgroundTexture,
        spritesheet: { animations }
      }
    } = this
    this.mapScreen = new MapScreen({
      viewWidth: width,
      viewHeight: height,
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
    this.battleScreen = new BattleScreen({
      sprites: {
        draggle: animations['Draggle-Idle'],
        emby: animations['Emby-Idle'],
        background: battleBackgroundTexture
      }
    })

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
    const params = { viewWidth: this.app.view.width, viewHeight: this.app.view.height }
    this.mapScreen.handleScreenResize(params)
    this.battleScreen.handleScreenResize(params)
  }

  setScreen (screen: WorldScreen): void {
    switch (screen) {
      case WorldScreen.map:
        this.mapScreen.visible = true
        this.mapScreen.activate()
        this.battleScreen.visible = false
        this.battleScreen.deactivate()
        break
      case WorldScreen.battle:
        this.mapScreen.visible = false
        this.mapScreen.deactivate()
        this.battleScreen.visible = true
        this.battleScreen.activate()
        break
    }
    this.screen = screen
  }

  handleAppTick = (): void => {
    switch (this.screen) {
      case WorldScreen.map:
        this.mapScreen.handleScreenTick()
        break
      case WorldScreen.battle:
        this.battleScreen.handleScreenTick()
        break
    }
  }
}
