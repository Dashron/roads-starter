require('./db.js').setup().then((connection) => {
    connection.close();
});