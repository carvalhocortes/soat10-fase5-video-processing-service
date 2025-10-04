import express, { Request, Response } from 'express';

export class HttpServer {
  private app: express.Application;
  private port: number;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
      });
    });
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`🚀 HTTP Server running on port ${this.port}`);
        resolve();
      });
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}
