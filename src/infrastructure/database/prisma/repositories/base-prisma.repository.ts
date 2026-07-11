import { BaseRepositoryPort } from '@common/ports/base-repository.port';
import { PrismaService } from '../prisma.service';

export type PaginationResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type BasePrismaRepositoryOptions = {
  hasSoftDelete?: boolean;
};

export abstract class BasePrismaRepository<TDomain extends { id: string }, TPersistence>
  implements BaseRepositoryPort<TDomain>
{
  constructor(
    protected readonly prisma: PrismaService,
    private readonly modelName: string,
    private readonly options: BasePrismaRepositoryOptions = {},
  ) {}

  protected get model(): any {
    return this.prisma[this.modelName];
  }

  async findAll(): Promise<TDomain[]> {
    const rows = await this.model.findMany({
      where: this.withSoftDeleteFilter({}),
    });

    return rows.map((row: TPersistence) => this.toDomain(row));
  }

  async findById(id: string): Promise<TDomain | null> {
    if (this.options.hasSoftDelete) {
      return this.model.findFirst({
        where: {
          id,
          isDeleted: false,
        },
      });
    }

    return this.model.findUnique({
      where: { id },
    });
  }

  async create(data: TDomain): Promise<TDomain> {
    const row = await this.model.create({
      data: this.toPersistence(data),
    });

    return this.toDomain(row);
  }

  async save(data: TDomain): Promise<TDomain> {
    const row = await this.model.update({
      where: { id: data.id },
      data: this.toPersistence(data),
    });

    return this.toDomain(row);
  }

  async update(id: string, data: Partial<TDomain>): Promise<TDomain | null> {
    try {
      const row = await this.model.update({
        where: { id },
        data: this.toPersistence(data),
      });

      return this.toDomain(row);
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.model.delete({
        where: { id },
      });

      return true;
    } catch {
      return false;
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      await this.model.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      return true;
    } catch {
      return false;
    }
  }

  async exists(id: string): Promise<boolean> {
    const row = await this.model.findFirst({
      where: this.withSoftDeleteFilter({ id }),
      select: {
        id: true,
      },
    });

    return !!row;
  }

  // These methods should be implement on the specific module which is used by

  protected async existsByWhere(where: Record<string, unknown>): Promise<boolean> {
    const row = await this.model.findFirst({
      where: this.withSoftDeleteFilter(where),
      select: {
        id: true,
      },
    });

    return !!row;
  }

  protected async findFirstByWhere(
    where: Record<string, unknown>,
    args?: {
      select?: Record<string, unknown>;
      include?: Record<string, unknown>;
    },
  ): Promise<TDomain | null> {
    const row = await this.model.findFirst({
      where: this.withSoftDeleteFilter(where),
      ...args,
    });

    return row ? this.toDomain(row) : null;
  }

  protected async findManyByWhere(args?: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, unknown> | Record<string, unknown>[];
    skip?: number;
    take?: number;
    select?: Record<string, unknown>;
    include?: Record<string, unknown>;
  }): Promise<TDomain[]> {
    const rows = await this.model.findMany({
      ...args,
      where: this.withSoftDeleteFilter(args?.where ?? {}),
    });

    return rows.map((row: TPersistence) => this.toDomain(row));
  }

  protected async findWithPagination(args: {
    page?: number;
    limit?: number;
    where?: Record<string, unknown>;
    orderBy?: Record<string, unknown> | Record<string, unknown>[];
    include?: Record<string, unknown>;
    select?: Record<string, unknown>;
  }): Promise<PaginationResult<TDomain>> {
    const page = args.page && args.page > 0 ? args.page : 1;
    const limit = args.limit && args.limit > 0 ? args.limit : 10;
    const skip = (page - 1) * limit;

    const where = this.withSoftDeleteFilter(args.where ?? {});

    const [rows, total] = await this.prisma.$transaction([
      this.model.findMany({
        where,
        orderBy: args.orderBy,
        skip,
        take: limit,
        include: args.include,
        select: args.select,
      }),
      this.model.count({
        where,
      }),
    ]);

    return {
      data: rows.map((row: TPersistence) => this.toDomain(row)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  protected async countRows(where: Record<string, unknown> = {}): Promise<number> {
    return this.model.count({
      where: this.withSoftDeleteFilter(where),
    });
  }

  protected abstract toDomain(row: TPersistence): TDomain;

  protected abstract toPersistence(entity: Partial<TDomain>): Record<string, unknown>;

  private withSoftDeleteFilter(where: Record<string, unknown>): Record<string, unknown> {
    if (!this.options.hasSoftDelete) {
      return where;
    }

    return {
      ...where,
      isDeleted: false,
    };
  }
}
