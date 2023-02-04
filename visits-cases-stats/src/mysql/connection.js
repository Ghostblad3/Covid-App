const mysql = require("mysql2/promise");

class Connection {
  #connection;

  constructor() {}

  getConnection() {
    if (this.#connection) {
      return this.#connection;
    }

    throw new Error("Connection is not established. ");
  }

  async connnectToMySqlDb() {
    this.#connection = await mysql.createConnection({
      host: "mysql-visits-cases-stats-db-srv",
      user: "root",
      database: "visits_cases_stats_db",
      password: "123",
    });
  }
}

const connection = new Connection();

module.exports = { connection };
