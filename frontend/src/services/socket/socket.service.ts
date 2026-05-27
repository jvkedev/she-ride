import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let registeredUserId: string | null = null;
let connectListenerInitialized = false;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket"], // ← skip polling, go straight to websocket
    });
  }
  return socket;
}

export function connectSocket(userId: string): Socket {
  const s = getSocket();

  registeredUserId = userId;

  if (!connectListenerInitialized) {
    s.on("connect", () => {
      if (registeredUserId) {
        s.emit("register", { userId: registeredUserId });
      }
    });
    connectListenerInitialized = true;
  }

  if (!s.connected) {
    s.connect();
  }

  if (s.connected && registeredUserId) {
    s.emit("register", { userId: registeredUserId });
  }

  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    if (socket.connected) {
      socket.disconnect();
    }
    socket = null; // reset so next connect is fresh
  }
  registeredUserId = null;
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
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.routes?.[0]) return [];
    return data.routes[0].geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
    );
  } catch {
    return [];
  }
}

export function sendCaptainLocation(
  rideId: string,
  userId: string,
  lat: number,
  lng: number,
) {
  const socket = getSocket();
  if (!socket.connected) {
    console.warn("Socket not connected yet, queuing captain:location event");
  }
  socket.emit("captain:location", { rideId, userId, lat, lng });
}
