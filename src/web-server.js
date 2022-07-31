const express = require('express')

function WebServer(port) {
  clients = []

  express()
    .use(express.static('public'))
    .get('/events', (request, response, next) => {
      const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      };
      response.writeHead(200, headers);
    
      const clientId = Date.now();
      const newClient = {
        id: clientId,
        response
      };
    
      console.log(`${clientId}: Connection opened`);
      clients.push(newClient);
    
      request.on('close', () => {
        console.log(`${clientId}: Connection closed`);
        clients = clients.filter(client => client.id !== clientId);
      });
    })
    .listen(port, () => console.log(`WebServer listening on port ${port}`))

  this.sendEvent = (data) => {
    clients.forEach(client => client.response.write(`data: ${JSON.stringify(data)}\n\n`))
  }
}

module.exports = WebServer