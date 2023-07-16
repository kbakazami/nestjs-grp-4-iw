import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { MySQLInstrumentation } from '@opentelemetry/instrumentation-mysql';

registerInstrumentations({
  instrumentations: [
    new GrpcInstrumentation(),
    new WinstonInstrumentation(),
    new MySQLInstrumentation(),
  ],
});
