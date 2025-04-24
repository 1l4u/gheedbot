    // keep_alive.js
    const express = require('express');
    const app = express();
    const port = 3000;  // Có thể đổi thành port khác (8080, 5000, ...)

    app.get('/', (req, res) => {
      res.send('Bot is alive!');
    });

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });