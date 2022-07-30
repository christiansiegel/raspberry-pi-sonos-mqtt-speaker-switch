const {sleep, now, secondsSince} = require('./util')
const Speaker = require('./speaker')
const Sonos = require('./sonos')
const config = require('./config.json')


const app = async () => {
  console.log('app started')

  const sonos = new Sonos(config)
  const speaker = new Speaker(config)

  let sonosWasLastPlayingAt = undefined;

  while(true) {
    const [isSonosPlaying, isSpeakerOn] = await Promise.all([sonos.isPlaying(), speaker.isOn()])
    console.log(`sonos: ${isSonosPlaying ? '' : 'not '}playing; speaker: ${isSpeakerOn ? 'on' : 'off'}`)

    if (isSonosPlaying) {
      sonosWasLastPlayingAt = now()
    }

    if (isSonosPlaying && !isSpeakerOn) {
      console.log('turning on speaker...')
      await sonos.mute()
      await Promise.all([sonos.setVolume(20), speaker.turnOn()])
      await sonos.unmute()
      console.log('done')
    }
    else if (!isSonosPlaying && isSpeakerOn) {
      const secondsUntilTurnOff = config.SPEAKER_TURN_OFF_TIMEOUT_SECONDS - secondsSince(sonosWasLastPlayingAt)
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

app()
