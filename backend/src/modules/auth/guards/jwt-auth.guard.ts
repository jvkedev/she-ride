import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Run standard JWT validation first
    const isValid = await super.canActivate(context);
    if (!isValid) return false;

    // 2. Check account status from DB
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) throw new UnauthorizedException('Invalid token');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { accountStatus: true },
    });

    if (!user) throw new UnauthorizedException('User not found');

    if (user.accountStatus === 'BLOCKED') {
      throw new ForbiddenException(
        'Your account has been blocked. Please contact support.',
      );
    }

    if (user.accountStatus === 'PENDING') {
      throw new ForbiddenException('Your account is pending verification.');
    }

    return true;
  }
}
