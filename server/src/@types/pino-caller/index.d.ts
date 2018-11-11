declare module 'pino-caller' {
  import { Logger } from "pino";

  export default function(logger: Logger): Logger;
}
