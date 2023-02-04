const { addVisit } = require("../mysql/add-visit");

class NatsVisitListener {
  #client;
  #queueGroupName;

  constructor(client, queueGroupName) {
    this.#client = client;
    this.#queueGroupName = queueGroupName;
  }

  getSubscriptionOption() {
    return this.#client
      .subscriptionOptions()
      .setManualAckMode(true)
      .setDeliverAllAvailable()
      .setDurableName(this.#queueGroupName);
  }

  listen(subject) {
    return new Promise((resolve, reject) => {
      const subscription = this.#client.subscribe(
        subject,
        this.#queueGroupName,
        this.getSubscriptionOption()
      );

      subscription.on("message", async (msg) => {
        const data = msg.getData();

        console.log(
          `Process ID[${
            process.env.NATS_CLIENT_ID
          }] Received event #${msg.getSequence()}, with data ${data}`
        );

        try {
          await addVisit(data);
          msg.ack();
          resolve();
        } catch (e) {}
      });

      subscription.on("error", (err) => {
        reject(err);
      });
    });
  }
}

module.exports = { NatsVisitListener };
