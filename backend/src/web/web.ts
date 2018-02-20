import express = require("express");
import cors = require("cors");
import cookieParser = require("cookie-parser");
import bodyParser = require("body-parser");

/**
 * Creates a new Express instance for serving the web panel. This application
 * will not attach the API routes, since they are stateful. All other routes
 * are added.
 */
export default function createApplication() {
    const app = express();

    app.use(cors());
    app.use(cookieParser());
    app.use(bodyParser.json());

    // First try static data.
    app.use(express.static("../../frontend/dist"));

    // Then try any API routes...
    app.use(app.router);

    // Then, default to index for anything we do not recognize, that way
    // our vue-router can catch the problem and render the appropriate page.
    app.use((req, res) => {
        res.sendFile("../../frontend/dist/index.html");
    });

    return app;
}