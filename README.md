# RasperryPi Sonos MQTT Speaker Switch

Little node app to toggle an active speaker's power via MQTT switch based on the Sonos status.

- **case 1**: Sonos playing and speaker off:
  1. Mute Sonos
  2. Set Sonos volume to default value of 20
  3. Turn speaker switch on
  4. Unmute Sonos
- **case 2**: Sonos not playing and speaker on:
  1. Wait 5 seconds
  2. Turn speaker switch off

## Components

- Sonos CONNECT
- SONOFF Tasmota ESP8266 MQTT switch
- RaspberryPi Zero to run the script

## RaspberryPi Setup

`Raspberry Pi OS Lite` in headless mode (ssh + wifi enabled):

- hostname: `pizero`
- ssh user: `pi`
- ssh pass: `***`

```bash
# ssh login
ssh pi@pizero

# setup mqtt broker:
sudo apt install mosquitto
sudo systemctl enable mosquitto
echo 'listener 1883' | sudo tee -a /etc/mosquitto/mosquitto.conf
echo 'allow_anonymous true' | sudo tee -a /etc/mosquitto/mosquitto.conf
sudo systemctl restart mosquitto

# setup node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
exit # ...and reconnect via ssh
NVM_NODEJS_ORG_MIRROR=https://unofficial-builds.nodejs.org/download/release nvm install 16
node -v
npm -v

# get code
sudo apt install git
git clone https://github.com/christiansiegel/raspberry-pi-sonos-mqtt-speaker-switch.git
cd raspberry-pi-sonos-mqtt-speaker-switch.git

# verify it's working
npm install
npm run start
npm run logs

# configure PM2 auto startup
npm run startup
# -> execute printed command
npm run save
```