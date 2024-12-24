import { Injectable } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class PostgresService {
  private client: Client;
  private readonly superuserClient: Client;

  constructor() {
    this.superuserClient = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'Tankionlain007',
    });
  }

  async connectSuperUser() {
    await this.superuserClient.connect();
  }

  async disconnectSuperUser() {
    await this.superuserClient.end();
  }

  async createDatabaseIfNotExist(databaseName: string) {
    const result = await this.superuserClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [databaseName],
    );

    if (result.rowCount === 0) {
      console.log(`Database '${databaseName}' does not exist. Creating...`);
      await this.superuserClient.query(`CREATE DATABASE ${databaseName}`);
    } else {
      console.log(`Database '${databaseName}' exists.`);
    }
  }

  async disconnectClient() {
    await this.client.end()
  }
  async connectToDatabase(databaseName: string) {

    this.client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'dedicateduser',
      password: 'superpassword',
      database: databaseName,
    });
    await this.client.connect();
  }

  async connectDedicatedUser(username) {
    this.client = new Client({
      host: 'localhost',
      port: 5432,
      user: username,
      password: 'qwerty123',
      database: 'projectud',
    });
    await this.client.connect();
  }


  async query(query: string, values: any[] = []) {
    return this.client.query(query, values);
  }


}
