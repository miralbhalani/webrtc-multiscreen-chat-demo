import express, { Application } from "express";
import { ServerIO } from 'webrtc-chat-helper';
import { createServer, Server as HTTPServer } from "http";
import path from "path";

export class Server {
  private httpServer: HTTPServer;
  private app: Application;
  private readonly DEFAULT_PORT = 5000;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.app = express();
    this.httpServer = createServer(this.app);

    (new ServerIO(this.httpServer));
    this.configureApp();
    this.configureRoutes();
  }

  private configureApp(): void {
    this.app.use(express.static(path.join(__dirname, "../public")));
  }

  private configureRoutes(): void {
    this.app.get("/", (req, res) => {
      res.sendFile("index.html");
    });
  }


  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.DEFAULT_PORT, () => {
      callback(this.DEFAULT_PORT);
    });
  }
}
