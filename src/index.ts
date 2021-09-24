import dotenv from 'dotenv-safe';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { registerRoutes } from './routes';

import './connection';
import './redis';

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

registerRoutes(app);

export const server = app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});
