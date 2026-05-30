import { io, Socket } from "socket.io-client";

import { getAccessToken } from "@/lib/auth/session";

import {

  getRouteWithMeta,

  type RouteResult,

} from "@/services/routing/routing.service";



let socket: Socket | null = null;

let registeredUserId: string | null = null;

let registeredMeta: { role?: string; vehicleType?: string } = {};

let connectListenerInitialized = false;



function socketAuth() {

  const token = getAccessToken();

  return token ? { token } : {};

}



export function getSocket(): Socket {

  if (!socket) {

    socket = io(process.env.NEXT_PUBLIC_API_URL!, {

      autoConnect: false,

      reconnection: true,

      reconnectionAttempts: 10,

      reconnectionDelay: 1000,

      transports: ["websocket"],

      auth: socketAuth,

    });

  }

  return socket;

}



function emitRegister(s: Socket) {

  if (!registeredUserId) return;

  s.emit("register", {

    userId: registeredUserId,

    role: registeredMeta.role,

    vehicleType: registeredMeta.vehicleType,

  });

}



export function connectSocket(

  userId: string,

  options?: { role?: string; vehicleType?: string },

): Socket {

  const s = getSocket();



  registeredUserId = userId;

  registeredMeta = options ?? {};



  if (!connectListenerInitialized) {

    s.on("connect", () => {

      emitRegister(s);

    });

    s.io.on("reconnect", () => {

      emitRegister(s);

    });

    connectListenerInitialized = true;

  }



  s.auth = socketAuth;



  if (!s.connected) {

    s.connect();

  } else {

    emitRegister(s);

  }



  return s;

}



export function disconnectSocket() {

  if (socket) {

    socket.removeAllListeners();

    if (socket.connected) {

      socket.disconnect();

    }

    socket = null;

  }

  registeredUserId = null;

  registeredMeta = {};

  connectListenerInitialized = false;

}



export function joinRideRoom(rideId: string) {

  const s = getSocket();

  if (!s.connected) {

    s.connect();

  }

  s.emit("join:ride", { rideId });

}



export async function getRoute(

  fromLat: number,

  fromLng: number,

  toLat: number,

  toLng: number,

): Promise<[number, number][]> {

  const result = await getRouteWithMeta(fromLat, fromLng, toLat, toLng);

  return result.coordinates;

}



export function sendCaptainLocation(

  rideId: string,

  userId: string,

  lat: number,

  lng: number,

) {

  const s = getSocket();

  if (!s.connected) {

    s.connect();

  }

  s.emit("captain:location", { rideId, userId, lat, lng });

}

export type CaptainVerificationSocketPayload = {
  event?: "approved" | "rejected" | "updated" | "submitted";
  message?: string;
  isVerified?: boolean;
};

export function subscribeCaptainVerification(
  handler: (payload: CaptainVerificationSocketPayload) => void,
) {
  const s = getSocket();
  const listener = (payload: CaptainVerificationSocketPayload) => handler(payload);
  s.on("captain:verification", listener);
  return () => {
    s.off("captain:verification", listener);
  };
}


