import { app } from './app.js';

const PORT = process.env.PORT || 9999;

app.listen(PORT, () => {
  console.log(`Lí Express listening on port ${PORT}`);
});
