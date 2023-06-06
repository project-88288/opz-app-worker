import pgPromise from 'pg-promise';

const pgp = pgPromise();

// Replace 'your_connection_string' with your actual connection string
const connectionString = 'postgres://dev:dev@localhost:5432/workermainnet';

const db = pgp(connectionString);

async function runQuery() {
    try {
      const result = await db.query('SELECT * FROM block');
      console.log(result);
      // Handle the query result
    } catch (error) {
      console.error('Error executing query:', error);
    } finally {
      pgp.end(); // Close the database connection
    }
  }
  
//  runQuery();

  async function runQuery2() {
    try {
      const result = await db.query('INSERT INTO "block"("height", "latestheight") VALUES (0, 0) RETURNING "id"');
      console.log(result);
      // Handle the query result
    } catch (error) {
      console.error('Error executing query:', error);
    } finally {
      pgp.end(); // Close the database connection
    }
  }
  
  runQuery();

  /*
ts-node index.ts
  async function runParameterizedQuery() {
    try {
      const userId = 1;
      const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      console.log(result);
      // Handle the query result
    } catch (error) {
      console.error('Error executing query:', error);
    } finally {
      pgp.end(); // Close the database connection
    }
  }
  
  //runParameterizedQuery();

  */