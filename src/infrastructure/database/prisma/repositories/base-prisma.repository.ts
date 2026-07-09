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

export abstract class BasePrismaRepository<TPersistence> {
  constructor(
    protected readonly prisma: PrismaService,
    private readonly modelName: string,
    private readonly options: BasePrismaRepositoryOptions = {},
  ) {}

  protected get model(): any {
    return this.prisma[this.modelName];
  }

  protected async createRow(data: Record<string, unknown>): Promise<TPersistence> {
    return this.model.create({ data });
  }

  protected async findByIdRow(id: string): Promise<TPersistence | null> {
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

  protected async findFirstRow(
    where: Record<string, unknown>,
    args?: {
      select?: Record<string, unknown>;
      include?: Record<string, unknown>;
    },
  ): Promise<TPersistence | null> {
    return this.model.findFirst({
      where: this.withSoftDeleteFilter(where),
      ...args,
    });
  }

  protected async findManyRows(args?: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, unknown> | Record<string, unknown>[];
    skip?: number;
    take?: number;
    select?: Record<string, unknown>;
    include?: Record<string, unknown>;
  }): Promise<TPersistence[]> {
    return this.model.findMany({
      ...args,
      where: this.withSoftDeleteFilter(args?.where ?? {}),
    });
  }

  protected async updateRow(
    id: string,
    data: Record<string, unknown>,
  ): Promise<TPersistence | null> {
    try {
      return await this.model.update({
        where: { id },
        data,
      });
    } catch (error) {
      return null;
    }
  }

  protected async deleteRow(id: string): Promise<boolean> {
    try {
      await this.model.delete({
        where: { id },
      });

      return true;
    } catch {
      return false;
    }
  }

  protected async softDeleteRow(id: string): Promise<boolean> {
    try {
      await this.model.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      return true;
    } catch {
      return false;
    }
  }

  protected async countRows(where: Record<string, unknown> = {}): Promise<number> {
    return this.model.count({
      where: this.withSoftDeleteFilter(where),
    });
  }

  protected async existsRow(where: Record<string, unknown>): Promise<boolean> {
    const row = await this.model.findFirst({
      where: this.withSoftDeleteFilter(where),
      select: {
        id: true,
      },
    });

    return !!row;
  }

  protected async findWithPagination(args: {
    page?: number;
    limit?: number;
    where?: Record<string, unknown>;
    orderBy?: Record<string, unknown> | Record<string, unknown>[];
    include?: Record<string, unknown>;
    select?: Record<string, unknown>;
  }): Promise<PaginationResult<TPersistence>> {
    const page = args.page && args.page > 0 ? args.page : 1;
    const limit = args.limit && args.limit > 0 ? args.limit : 10;
    const skip = (page - 1) * limit;

    const where = this.withSoftDeleteFilter(args.where ?? {});

    const [data, total] = await this.prisma.$transaction([
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
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

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
