import { WebSocketServer, WebSocket } from "ws";
import { BaseService } from "./base.service.js";
import { ElizaService } from "./eliza.service.js";
import { NgrokService } from "./ngrok.service.js";
import { v4 as uuidv4 } from "uuid";

export class ChatService extends BaseService {
  private static instance: ChatService;
  private wss: WebSocketServer;
  private elizaService: ElizaService;
  private ngrokService: NgrokService;
  private clients: Map<string, WebSocket> = new Map();
  private constructor() {
    super();
    this.elizaService = ElizaService.getInstance();
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public async start(): Promise<void> {
    this.ngrokService = await NgrokService.getInstance();
    const ngrokUrl = this.ngrokService.getUrl();

    const port = 3005;
    this.wss = new WebSocketServer({ port });

    this.wss.on("connection", (ws) => {
      const clientId = uuidv4();
      this.clients.set(clientId, ws);

      console.log(`Client connected: ${clientId}`);

      ws.on("message", async (message) => {
        try {
          const parsedMessage = JSON.parse(message.toString());
          const userMessage = parsedMessage.message || parsedMessage.text;

          if (!userMessage?.trim()) {
            throw new Error("Received empty message content");
          }

          console.log(`Received message from ${clientId}: ${userMessage}`);

          const chunks =
            await this.elizaService.handleClientMessage(userMessage);

          chunks.forEach((chunk) => {
            ws.send(
              JSON.stringify({
                type: "response",
                content: chunk,
                isFinal: chunk === chunks[chunks.length - 1],
              })
            );
          });
        } catch (error) {
          console.error("Error processing message:", error);
          ws.send(
            JSON.stringify({
              type: "error",
              message: error.message || "Error processing your message.",
            })
          );
        }
      });

      ws.on("close", () => {
        console.log(`Client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      ws.on("error", (error) => {
        console.error(`WebSocket error for ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });

    console.log(`WebSocket server started on port ${port}`);
    console.log(`WebSocket server accessible via ${ngrokUrl}`);
  }

  public async stop(): Promise<void> {
    this.wss.close();
    console.log("Chat service stopped.");
  }
}
