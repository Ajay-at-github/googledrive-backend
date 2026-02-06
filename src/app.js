// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const errorHandler = require('./middleware/error.middleware');

// const authRoutes = require('./routes/auth.routes');
// const fileRoutes = require('./routes/file.routes');
// const folderRoutes = require('./routes/folder.routes');

// const app = express();

// // Middleware
// app.use(helmet());
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(morgan('dev'));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/files', fileRoutes);
// app.use('/api/folders', folderRoutes);

// // Health check
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'OK', message: 'Server is running' });
// });

// // Error handling middleware
// app.use(errorHandler);

// module.exports = app;



const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const folderRoutes = require("./routes/folder.routes");
const fileRoutes = require("./routes/file.routes");

const app = express();

app.use(
    cors({
        origin: [
        "http://localhost:5173",
        "https://ajay-at-github.github.io",
        ],
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/folders", folderRoutes);
app.use("/api/v1/files", fileRoutes);

module.exports = app;
