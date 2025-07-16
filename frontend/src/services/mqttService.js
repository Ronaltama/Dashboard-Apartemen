import mqtt from "mqtt";

let client = null;
const handlers = {};

export function connectMqtt() {
  if (client) return;
  client = mqtt.connect("203.175.11.155:1885", {
    username: "wiwan",
    password: "35k4nu54",
    clientId: "webclient_" + Math.random().toString(16).substr(2, 8),
  });
  client.on("connect", () => {
    console.log("MQTT connected (frontend)");
  });
  client.on("error", (err) => {
    console.error("MQTT error (frontend):", err);
  });
  client.on("message", (topic, message) => {
    console.log("MQTT message received:", topic, message.toString());
    if (handlers[topic]) {
      const payload = Number(message.toString());
      handlers[topic].forEach((cb) => cb(payload));
    }
  });
}

export function subscribeMqtt(topic, cb) {
  if (!client) connectMqtt();
  if (!handlers[topic]) handlers[topic] = [];
  handlers[topic].push(cb);
  client.subscribe(topic);
}

export function unsubscribeMqtt(topic, cb) {
  if (!handlers[topic]) return;
  handlers[topic] = handlers[topic].filter((fn) => fn !== cb);
  if (handlers[topic].length === 0) {
    client.unsubscribe(topic);
  }
}
