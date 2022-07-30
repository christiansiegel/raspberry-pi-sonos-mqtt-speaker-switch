const AsyncDeviceDiscovery = require('sonos').AsyncDeviceDiscovery

class Sonos {
  #sonosInstance
  #config

  constructor(config) {
    this.#sonosInstance = undefined
    this.#config = config
  }

  async isPlaying() {
    const currentState = await (await this.#getSonos()).getCurrentState()
    return currentState === 'playing'
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
