import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
