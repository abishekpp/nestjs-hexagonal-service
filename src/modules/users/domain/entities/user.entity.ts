export class User {
  private constructor(
    private readonly _id: string,
    private _name: string,
    private _email: string,
    private _isActive: boolean,
    private _isEmailVerified: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  private static validateName(name: string): string {
    const trimmedName = name.trim();

    if (trimmedName.length < 3) {
      throw new Error('User name must be at least 3 characters');
    }

    return trimmedName;
  }

  private static validateEmail(email: string): string {
    const normalizedEmail = email.trim().toLocaleLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(normalizedEmail)) {
      throw new Error('Invalid email address');
    }

    return normalizedEmail;
  }

  private touch(): void {
    this._updatedAt = new Date();
  }

  static create(params: { id: string; name: string; email: string }): User {
    const name = User.validateName(params.name);
    const email = User.validateEmail(params.email);

    const now = new Date();

    return new User(params.id, name, email, true, false, now, now);
  }

  static restore(params: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      params.id,
      params.name,
      params.email,
      params.isActive,
      params.isEmailVerified,
      params.createdAt,
      params.updatedAt,
    );
  }

  changeName(name: string): void {
    this._name = User.validateName(name);
    this.touch();
  }

  changeEmail(email: string): void {
    this._email = User.validateEmail(email);
    this.touch();
  }

  updateIsActive(isActive: boolean): void {
    this._isActive = isActive;
  }

  updateIsVerified(isEmailVerified: boolean): void {
    this._isEmailVerified = isEmailVerified;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get isACtive(): boolean {
    return this._isActive;
  }

  get isVerified(): boolean {
    return this._isEmailVerified;
  }
}
