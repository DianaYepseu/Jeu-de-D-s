const http = require("http");
const WebSocket = require("ws");

const server = http.createServer();
const wss = new WebSocket.Server({ server, path: "/multinode" });

const clients = new Map();

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const ws of wss.clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  }
}

wss.on("connection", (ws) => {

  ws.on("message", (data) => {
    let msg;

    try {
      msg = JSON.parse(data);
    } catch {
      return;
    }

    if (msg.etiquette === "DEMANDE_AUTHENTIFICATION") {

      const pseudo = msg.pseudonyme;
      clients.set(ws, pseudo);

      const autres = [...clients.values()].filter(p => p !== pseudo);

      ws.send(JSON.stringify({
        etiquette: "CONFIRMATION_AUTHENTIFICATION",
        listePseudo: autres
      }));

      for (const client of wss.clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            etiquette: "NOTIFICATION_AUTHENTIFICATION",
            pseudonyme: pseudo
          }));
        }
      }
    }

    if (msg.etiquette === "TRANSFERT_VARIABLE") {
      broadcast({
        etiquette: "NOTIFICATION_VARIABLE",
        variable: msg.variable
      });
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
  });

});

server.listen(8080, () => {
  console.log("Serveur WebSocket MultiNode lancé sur ws://127.0.0.1:8080/multinode");
});
