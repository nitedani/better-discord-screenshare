import io from "socket.io-client";
import { getSettings } from "src/settings";
import { StreamEvents } from "./events/events";

export interface ViewerConnectionEvent {
  type: "viewer_connected" | "viewer_disconnected";
  viewerId: string;
  viewerCount: number;
}

let socket: SocketIOClient.Socket | null = null;

export const connectSocket = async () => {
  if (socket?.connected) {
    socket.close();
  }
  const { server_url, stream_id } = getSettings();

  socket = io(server_url.replace("/api", ""), {
    path: "/api/socket",
    transports: ["polling"],
    autoConnect: true,
    query: {
      streamId: stream_id,
    },
  });

  socket.on("conn_ev", (data: ViewerConnectionEvent) => {
    StreamEvents.emit(data.type, data);
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.close();
    socket = null;
  }
};
