import {

  WebSocketGateway,

  WebSocketServer,

  SubscribeMessage,

  MessageBody,

  ConnectedSocket,

  OnGatewayConnection,

  OnGatewayDisconnect,

  OnGatewayInit,

} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { VehicleType } from '@prisma/client';

import { redis } from '../../config/redis';
import { PrismaService } from '../../prisma/prisma.service';
import { RideRedisService } from '../redis/ride-redis.service';



@WebSocketGateway({

  cors: {

    origin: [

      'http://localhost:3000',

      'http://localhost:3001',

      process.env.FRONTEND_URL ?? 'http://localhost:3000',

    ],

    credentials: true,

  },

})

export class RideGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {

  @WebSocketServer()

  server!: Server;



  constructor(

    private readonly prisma: PrismaService,

    private readonly rideRedis: RideRedisService,

  ) {}

  afterInit() {
    const subscriber = redis.duplicate();
    const channel = this.rideRedis.getVerificationChannel();
    void subscriber.subscribe(channel);
    subscriber.on('message', (topic, message) => {
      if (topic !== channel) return;
      try {
        const payload = JSON.parse(message) as {
          userId: string;
          event?: string;
          message?: string;
          isVerified?: boolean;
        };
        if (!payload.userId) return;
        this.server.to(`user:${payload.userId}`).emit('captain:verification', payload);
      } catch {
        /* ignore malformed payloads */
      }
    });
  }

  private userSockets = new Map<string, string>();

  private socketUsers = new Map<string, string>();



  handleConnection(client: Socket) {

    console.log(`Client connected: ${client.id}`);

  }



  handleDisconnect(client: Socket) {

    const userId = this.socketUsers.get(client.id);

    if (userId) {

      this.userSockets.delete(userId);

      this.socketUsers.delete(client.id);

    }

    console.log(`Client disconnected: ${client.id}`);

  }



  @SubscribeMessage('register')

  handleRegister(

    @MessageBody() data: { userId: string; role?: string; vehicleType?: string },

    @ConnectedSocket() client: Socket,

  ) {

    this.userSockets.set(data.userId, client.id);

    this.socketUsers.set(client.id, data.userId);

    client.join(`user:${data.userId}`);



    if (data.role === 'CAPTAIN' && data.vehicleType) {

      client.join(`captains:${data.vehicleType}`);

    }



    console.log(`User ${data.userId} registered with socket ${client.id}`);

  }



  @SubscribeMessage('captain:location')

  async handleCaptainLocation(

    @MessageBody()

    data: { rideId: string; lat: number; lng: number; userId: string },

  ) {

    if (

      Number.isFinite(data.lat) &&

      Number.isFinite(data.lng) &&

      data.userId

    ) {

      const captain = await this.prisma.captain.findUnique({

        where: { userId: data.userId },

        include: { vehicle: true },

      });



      if (captain) {

        await this.prisma.captain.update({

          where: { id: captain.id },

          data: {

            currentLatitude: data.lat,

            currentLongitude: data.lng,

          },

        });



        if (captain.isOnline && captain.vehicle) {

          await this.rideRedis.setCaptainLocation({

            captainId: captain.id,

            userId: data.userId,

            lat: data.lat,

            lng: data.lng,

            vehicleType: captain.vehicle.vehicleType,

            updatedAt: new Date().toISOString(),

          });

        }

      }

    }



    this.server.to(`ride:${data.rideId}`).emit('captain:location', {

      lat: data.lat,

      lng: data.lng,

      ts: Date.now(),

    });

  }



  @SubscribeMessage('join:ride')

  handleJoinRide(

    @MessageBody() data: { rideId: string },

    @ConnectedSocket() client: Socket,

  ) {

    client.join(`ride:${data.rideId}`);

    console.log(`Socket ${client.id} joined ride:${data.rideId}`);

  }



  notifySearchingProgress(rideId: string, payload: object) {

    this.server.to(`ride:${rideId}`).emit('ride:searching', {

      rideId,

      ...payload,

    });

  }



  broadcastNewSearchingRide(vehicleType: VehicleType, payload: object) {

    this.server.to(`captains:${vehicleType}`).emit('ride:new', payload);

  }



  notifyRiderCaptainAccepted(riderUserId: string, payload: object) {

    this.server.to(`user:${riderUserId}`).emit('ride:accepted', payload);

  }



  notifyRideStatusChange(rideId: string, payload: object) {

    this.server.to(`ride:${rideId}`).emit('ride:status', payload);

  }

  notifyCaptainVerification(userId: string, payload: object) {
    this.server.to(`user:${userId}`).emit('captain:verification', payload);
  }
}


