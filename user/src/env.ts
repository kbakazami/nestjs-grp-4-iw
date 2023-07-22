import * as Joi from 'joi';
export const envSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  JWT_CONSTANT: Joi.string().required(),
  AUTH_API_URL: Joi.string().required(),
  PRODUCT_API_URL: Joi.string().required(),
  PORT: Joi.number().default(3000),
  HEALTH_PORT: Joi.number().default(4000),
});
