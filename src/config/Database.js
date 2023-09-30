import { Sequelize } from "sequelize";

const db = new Sequelize('study', 'postgres', 'admin123', {
    host: "localhost",
    dialect: "postgres",
    port: 5432,
    schema: "master"
});

if(db) {
    console.log('connect Postgree')
}

export default db;