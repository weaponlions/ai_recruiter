import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IdentityPublisher } from '../events/identity.publisher';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        privateKey: config
          .get<string>('JWT_PRIVATE_KEY', '')
          .replace(/\\n/g, '\n'),
        publicKey: config
          .get<string>('JWT_PUBLIC_KEY', '')
          .replace(/\\n/g, '\n'),
        signOptions: {
          algorithm: 'RS256',
          expiresIn: config.get<string>('JWT_EXPIRY', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, IdentityPublisher],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
