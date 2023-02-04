class NatsPublisher {
  #client;

  constructor(client) {
    this.#client = client;
  }

  publish(subject, data) {
    this.#client.publish(subject, JSON.stringify(data), () => {
      console.log("Data sent.");
    });
  }
}

module.exports = { NatsPublisher };
