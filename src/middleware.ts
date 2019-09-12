import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Router, static as staticPath } from "express";
import path from "path";
import { getSessionInstance } from "./middleware-instances";

const handleCookieParser = (router: Router) => {
  router.use(cookieParser());
};

const handleBodyParser = (router: Router) => {
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());
};

const handleCors = (router: Router) => {
  router.use(cors({ credentials: true, origin: true }));
};

const handleCompression = (router: Router) => {
  router.use(compression());
};

const handleSessionParser = (router: Router) => {
  router.use(getSessionInstance());
};

const handleTemplateEngine = (router: Router) => {
  
};

const handleStaticPath = (router: Router) => {
  router.use(staticPath(path.resolve(__dirname, "../public")));
};

export default [
  handleCookieParser,
  handleBodyParser,
  handleCors,
  handleCompression,
  handleSessionParser,
  handleTemplateEngine,
  handleStaticPath,
];
