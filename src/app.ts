import { Application } from 'pixi.js'

import './styles.css'
import { World } from './World'
import { GameLoader } from './GameLoader'

async function run (): Promise<void> {
  const gameLoader = new GameLoader()
  await gameLoader.loadAll()
  const app = new Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0xe6e7ea,
    resizeTo: window
  })
  void new World({ app, gameLoader })
}

run().catch(console.error)
