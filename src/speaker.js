const mqtt = require('async-mqtt')

class Speaker {
  #mqttClient
  #config

  constructor(config) {
    this.#mqttClient = undefined
    this.#config = config
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
        getFirstMessageFromTopic(mqttClient, this.#config.MQTT_SPEAKER_STATE_RESULT_TOPIC, 1000),
        mqttClient.subscribe(this.#config.MQTT_SPEAKER_STATE_RESULT_TOPIC),
        mqttClient.publish(this.#config.MQTT_SPEAKER_STATE_COMMAND_TOPIC, 0),
      ])
      return JSON.parse(message).POWER === 'ON'
    } catch (error) {
      console.error(error)
      return false
    }
  }

  async #turnSpeaker(state)  {
    await (await this.#getMqttClient()).publish(this.#config.MQTT_SPEAKER_POWER_COMMAND_TOPIC, state)
  }

  async #getMqttClient() {
    return this.#mqttClient || (this.#mqttClient = await mqtt.connectAsync('mqtt://' + this.#config.MQTT_HOST))
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

module.exports = Speaker
