import { Module, forwardRef, Global } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { DatabaseModule } from '../../database/database.module';
import { CommonModule } from '../../common/common.module';
import { RolesModule } from '../roles/roles.module';

@Global() // Make UsersModule global so UsersService available everywhere
@Module({
  imports: [DatabaseModule, CommonModule, forwardRef(() => RolesModule)],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
