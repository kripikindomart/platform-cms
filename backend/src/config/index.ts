import appConfig from './app.config';
import databaseConfig from './database.config';
import redisConfig from './redis.config';
import uploadConfig from './upload.config';

export const configs = [appConfig, databaseConfig, redisConfig, uploadConfig];

export { appConfig, databaseConfig, redisConfig, uploadConfig };
