const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const now = () => new Date()

const secondsSince = (date) => {
    const milliSecondsSince = now().getTime() - (date?.getTime() || 0)
    return Math.round(milliSecondsSince / 1000)
}

module.exports = {
    sleep,
    now,
    secondsSince,
}
