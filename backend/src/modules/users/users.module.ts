import { Module, forwardRef, Global } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UserPreferencesService } from './user-preferences.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../../database/database.module';
import { CommonModule } from '../../common/common.module';
import { RolesModule } from '../roles/roles.module';
import { CaslModule } from '../../core/casl/casl.module';

@Global() // Make UsersModule global so UsersService available everywhere
@Module({
  imports: [DatabaseModule, CommonModule, forwardRef(() => RolesModule), CaslModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UserPreferencesService],
  exports: [UsersService, UsersRepository, UserPreferencesService],
})
export class UsersModule {}
