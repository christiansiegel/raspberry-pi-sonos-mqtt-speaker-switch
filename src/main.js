const {sleep, now, secondsSince} = require('./util')
const WebServer = require('./web-server')
const Switch = require('./switch')
const Sonos = require('./sonos')
const config = require('./config.json')

const app = async () => {
  console.log('App loop started')

  const webServer = new WebServer(config.WEB_PORT)
  const sonos = new Sonos({
    name: config.SONOS_NAME,
  })
  const speaker = new Switch({
    mqttHost: config.MQTT_HOST,
    powerCommandTopic: config.MQTT_SPEAKER_POWER_COMMAND_TOPIC,
    stateCommandTopic: config.MQTT_SPEAKER_STATE_COMMAND_TOPIC,
    stateResultTopic: config.MQTT_SPEAKER_STATE_RESULT_TOPIC,
  })

  const log = text => {
    console.log(text)
    webServer.sendEvent({ts: now(), text})
  }

  while(true) {
    const timeoutId = setTimeout(() => { log('loop timeout'); throw 'loop timeout' }, config.LOOP_TIMEOUT_SECONDS * 1000);

    const [isSonosPlaying, isSpeakerOn] = await Promise.all([sonos.isPlaying(), speaker.isOn()])
    log(`sonos: ${isSonosPlaying ? '' : 'not '}playing; speaker: ${isSpeakerOn ? 'on' : 'off'}`)

    if (isSonosPlaying && !isSpeakerOn) {
      log('turning on speaker...')
      await sonos.mute()
      await Promise.all([sonos.setVolume(20), speaker.turnOn()])
      await sonos.unmute()
      log('done')
    }
    else if (!isSonosPlaying && isSpeakerOn) {
      const secondsUntilTurnOff = config.SPEAKER_TURN_OFF_TIMEOUT_SECONDS - secondsSince(sonos.getLastPlayingDate())
      if (secondsUntilTurnOff > 0) {
        log(`turning off speaker in ${secondsUntilTurnOff}s...`)
      } else {
        log('turning off speaker now...')
        await speaker.turnOff()
        log('done')
      }
    }
    
    await sleep(1000)
    clearTimeout(timeoutId)
  }
}
app()
