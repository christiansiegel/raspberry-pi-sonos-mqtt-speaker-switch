const AsyncDeviceDiscovery = require('sonos').AsyncDeviceDiscovery
const {now} = require('./util')

class Sonos {
  #sonosInstance
  #config
  #lastPlayingDate

  constructor(config) {
    this.#sonosInstance = undefined
    this.#config = config
    this.#lastPlayingDate = undefined
  }

  async isPlaying() {
    const currentState = await this.getCurrentState()
    if (currentState === 'playing') {
      this.#lastPlayingDate = now()
      return true;
    }
    return false;
  }

  async lastPlayingAt() {
    return this.#lastPlayingDate
  }

  async getCurrentState() {
    return await (await this.#getSonos()).getCurrentState()
  }

  async setVolume(volume) {
    await (await this.#getSonos()).setVolume(volume)
  }

  async mute(muted) {
    await (await this.#getSonos()).setMuted(true)
  }

  async unmute(muted) {
    await (await this.#getSonos()).setMuted(false)
  }

  async #getSonos() {
    return this.#sonosInstance || (this.#sonosInstance = await this.#discover())
  }

  async #discover() {
    const device = await new AsyncDeviceDiscovery().discover()
    const groups = await device.getAllGroups()
    const group = groups.find(g => g.Name === this.#config.SONOS_NAME)
    return group.CoordinatorDevice()
  }
}

module.exports = Sonos
