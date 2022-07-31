const mqtt = require('async-mqtt')

class Switch {
  #config
  #mqttClient

  constructor({mqttHost, powerCommandTopic, stateCommandTopic, stateResultTopic}) {
    this.#config = {
      mqttHost, powerCommandTopic, stateCommandTopic, stateResultTopic
    }
    this.#mqttClient = undefined
  }

  async turnOn() {
    await this.#turnSpeaker('ON')
  }

  async turnOff() {
    await this.#turnSpeaker('OFF')
  }
    
  async isOn() {
    const mqttClient = await this.#getMqttClient()
    try {
      const [message,] = await Promise.all([
        getFirstMessageFromTopic(mqttClient, this.#config.stateResultTopic, 1000),
        mqttClient.subscribe(this.#config.stateResultTopic),
        mqttClient.publish(this.#config.stateCommandTopic, 0),
      ])
      return JSON.parse(message).POWER === 'ON'
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async #turnSpeaker(state)  {
    await (await this.#getMqttClient()).publish(this.#config.powerCommandTopic, state)
  }

  async #getMqttClient() {
    return this.#mqttClient || (this.#mqttClient = await mqtt.connectAsync('mqtt://' + this.#config.mqttHost))
  }
}

const getFirstMessageFromTopic = (mqttClient, topic, timeoutMs) => {
  return new Promise((resolve, reject) => {
    const removeListener = () => mqttClient.removeListener('message', listener)
    const timeoutId = setTimeout(() => {
      removeListener()
      reject(`timeout after waiting ${timeoutMs} ms for message on topic '${topic}'`)
    }, timeoutMs)
    const listener = (receivedTopic, message) => {
      if (receivedTopic === topic) {
        clearTimeout(timeoutId)
        removeListener()
        resolve(message.toString())
      }
    }
    mqttClient.on('message', listener)
  })
}

module.exports = Switch
