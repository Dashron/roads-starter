module.exports = {
    "web": {
        "port": 80,
        "layoutPath": "/code/example/templates/layout.hbs",
        "pageNotFoundPath": "/code/example/templates/404.hbs",
        "api": {
            "hostname": "api",
            "secure": false,
            "port": 80,
            "external": {
                "hostname": "",
                "secure": true,
                "port": 443,
            }
        }
    },
    "api": {
        "port": 80,
        "PGSSL": "/code/example/config/postgres-cert.txt"
    }
};