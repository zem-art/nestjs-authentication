import { ConfigService } from "@nestjs/config";
import * as mongoose from 'mongoose'

export const connectToDatabase = async (configService: ConfigService) => {
    const dbUrl = configService.get<string>('database.url');
    const dbPort = configService.get<string>('database.port');
    const dbUser = configService.get<string>('database.user');
    const dbPassword = configService.get<string>('database.password');
    const dbDirect = configService.get<string>('database.direct');
    const dbAuth = configService.get<string>('database.auth');
    const dbName = configService.get<string>('database.name');

    // Add query parameter for authentication
    const authParams = new URLSearchParams({
      directConnection: dbDirect, // Force direct connection to MongoDB server without trying to find replica set
      authSource : dbAuth,
    }).toString();

    // Format URL with credentials if any
    const urlName = dbUser && dbPassword
      ? `mongodb://${dbUser}:${dbPassword}@${dbUrl}:${dbPort}?${authParams}`
      : `mongodb://${dbUrl}:${dbPort}`;

    const config = {
      dbName : dbName,
      autoIndex: true,
      autoCreate : true,
      serverSelectionTimeoutMS : 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }; // Add optional configurations such as SSL or authentication

    try {
      await mongoose.connect(urlName, config);
      console.log('MongoDB connected with Mongoose');

      mongoose.connection.on('connected', () => {
        console.log('Mongoose connected to db');
      });
    
      mongoose.connection.on('error', (err) => {
        console.log('Mongoose connection error:', err.message);
      });
    
      mongoose.connection.on('disconnected', () => {
        console.log('Mongoose is disconnected.');
      });
    } catch (err) {
      console.log('Error connecting to MongoDB:', err.message);
    }
}