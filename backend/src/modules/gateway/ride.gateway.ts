import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class RideGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Track which socket belongs to which user
  private userSockets = new Map<string, string>(); // userId → socketId
  private socketUsers = new Map<string, string>(); // socketId → userId

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

  // Client registers their userId after connecting
  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.userSockets.set(data.userId, client.id);
    this.socketUsers.set(client.id, data.userId);
    client.join(`user:${data.userId}`);
    console.log(`User ${data.userId} registered with socket ${client.id}`);
  }

  // Captain sends location update
  @SubscribeMessage('captain:location')
  handleCaptainLocation(
    @MessageBody()
    data: { rideId: string; lat: number; lng: number; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast to the ride room
    this.server.to(`ride:${data.rideId}`).emit('captain:location', {
      lat: data.lat,
      lng: data.lng,
    });
  }

  // Join a ride room
  @SubscribeMessage('join:ride')
  handleJoinRide(
    @MessageBody() data: { rideId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`ride:${data.rideId}`);
    console.log(`Socket ${client.id} joined ride:${data.rideId}`);
  }

  // Notify rider when captain accepts
  notifyRiderCaptainAccepted(riderUserId: string, payload: object) {
    this.server.to(`user:${riderUserId}`).emit('ride:accepted', payload);
  }

  // Notify rider of status changes
  notifyRideStatusChange(rideId: string, payload: object) {
    this.server.to(`ride:${rideId}`).emit('ride:status', payload);
  }
}
