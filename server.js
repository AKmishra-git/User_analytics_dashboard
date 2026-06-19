import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import connectToDB from './src/config/database.js';

connectToDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

