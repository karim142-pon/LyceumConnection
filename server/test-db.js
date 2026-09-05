import pool from "./models/db.js";

try {
    const result = await pool.query("SELECT NOW();");

    console.log("Подключение успешно.");

    console.log(result.rows[0]);

} catch (error) {

    console.error(error);

} finally {

    await pool.end();

}