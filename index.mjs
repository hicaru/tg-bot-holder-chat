import { config } from 'dotenv';
import telegramAPI from 'node-telegram-bot-api';


config();

const API_KEY = process.env.TOKEN;


console.log(API_KEY);
