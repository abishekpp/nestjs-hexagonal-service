export interface BaseRepositoryPort<TDomain> {
  findAll(): Promise<TDomain[]>;
  findById(id: string): Promise<TDomain | null>;
  create(entity: TDomain): Promise<TDomain>;
  save(entity: TDomain): Promise<TDomain>;
  update(id: string, entity: Partial<TDomain>): Promise<TDomain | null>;
  delete(id: string): Promise<boolean>;
  softDelete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}
