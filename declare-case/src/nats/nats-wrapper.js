const nats = require("node-nats-streaming");

class NatsWrapper {
  #client;

  getClient() {
    if (!this.#client) {
      throw new Error("Client undefined.");
    }

    return this.#client;
  }

  connect(clusterId, clientId, url) {
    this.#client = nats.connect(clusterId, clientId, {
      url,
    });

    return new Promise((resolve, reject) => {
      this.#client.on("connect", () => {
        console.log("Connected to nats.");
        resolve();
      });

      this.#client.on("error", (err) => {
        reject(err);
      });
    });
  }
}

const natsWrapper = new NatsWrapper();
module.exports = { natsWrapper };
