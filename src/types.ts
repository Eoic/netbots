import { NextFunction, Request, RequestHandler, Response, Router } from "express";
import { SessionOptions } from "express-session";
import { ValidationChain } from "express-validator";

type Wrapper = (
  (router: Router) => void
);

type Handler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void> | void;

// tslint:disable-next-line: interface-name
interface Route {
  path: string;
  method: string;
  validator?: ValidationChain[];
  handler: Handler | Handler[];
}

type SessionType = (
  expressSession: SessionOptions | undefined,
) => RequestHandler;

export {
  Wrapper,
  Handler,
  Route,
  SessionType,
};
