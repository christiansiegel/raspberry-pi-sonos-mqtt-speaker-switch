const consoleElement = document.getElementById('console')
const es = new EventSource('/events')
es.onmessage = (event) => {
  if (consoleElement.childNodes.length > 10) {
    consoleElement.removeChild(consoleElement.childNodes[0])
  }
  const data = JSON.parse(event.data)
  const time = data.ts.substring(11, 19)
  const text = data.text
  consoleElement.appendChild(document.createTextNode(`[${time}] ${text}\n`))
}
