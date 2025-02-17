import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'evilgeo2_Dealers',
  password: '06yhye4@9',
  database: 'evilgeo2_DealerBase',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
