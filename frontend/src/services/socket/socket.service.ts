import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

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
  if (!s.connected) {
    s.connect();
  }
  s.on("connect", () => {
    s.emit("register", { userId });
  });
  s.emit("register", { userId });
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
    socket = null; // ← reset so next connect is fresh
  }
}

export function joinRideRoom(rideId: string) {
  getSocket().emit("join:ride", { rideId });
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
  getSocket().emit("captain:location", { rideId, userId, lat, lng });
}
