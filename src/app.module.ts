import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { MachinesModule } from './machines/machines.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { ReportsModule } from './reports/reports.module';
import { IssuesModule } from './issues/issues.module';
import { ChatModule } from './chat/chat.module';
import { AttachmentsModule } from './attachments/attachments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CommonModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    MachinesModule,
    AssignmentsModule,
    ReportsModule,
    IssuesModule,
    ChatModule,
    AttachmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
