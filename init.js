require('./api/db.js').setup().then((connection) => {
    connection.close();
});