import { ExceptionType } from 'src/shared/enums/exception-type.enum';

export class ApplicationException extends Error {
  constructor(
    message: string,
    public readonly errorCode: string,
    public readonly type: ExceptionType = ExceptionType.VALIDATION,
  ) {
    super(message);
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
