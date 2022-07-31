const express = require('express')
const {sleep, secondsSince} = require('./util')
const Switch = require('./switch')
const Sonos = require('./sonos')
const config = require('./config.json')

const app = express()
app.use(express.static('public'));
app.listen(config.WEB_PORT, () => {
  console.log(`App listening on port ${config.WEB_PORT}`)
})

const controlLoop = async () => {
  console.log('Control loop started')

  const sonos = new Sonos({
    name: config.SONOS_NAME,
  })
  const speaker = new Switch({
    mqttHost: config.MQTT_HOST,
    powerCommandTopic: config.MQTT_SPEAKER_POWER_COMMAND_TOPIC,
    stateCommandTopic: config.MQTT_SPEAKER_STATE_COMMAND_TOPIC,
    stateResultTopic: config.MQTT_SPEAKER_STATE_RESULT_TOPIC,
  })

  let sonosWasLastPlayingAt = undefined;

  while(true) {
    const [isSonosPlaying, isSpeakerOn] = await Promise.all([sonos.isPlaying(), speaker.isOn()])
    console.log(`sonos: ${isSonosPlaying ? '' : 'not '}playing; speaker: ${isSpeakerOn ? 'on' : 'off'}`)

    if (isSonosPlaying && !isSpeakerOn) {
      console.log('turning on speaker...')
      await sonos.mute()
      await Promise.all([sonos.setVolume(20), speaker.turnOn()])
      await sonos.unmute()
      console.log('done')
    }
    else if (!isSonosPlaying && isSpeakerOn) {
      const secondsUntilTurnOff = config.SPEAKER_TURN_OFF_TIMEOUT_SECONDS - secondsSince(sonos.getLastPlayingDate())
      if (secondsUntilTurnOff > 0) {
        console.log(`turning off speaker in ${secondsUntilTurnOff}s...`)
      } else {
        console.log('turning off speaker now...')
        await speaker.turnOff()
        console.log('done')
      }
    }
    
    await sleep(1000)
  }
}
controlLoop()
