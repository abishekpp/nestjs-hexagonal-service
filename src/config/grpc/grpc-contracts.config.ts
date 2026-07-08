import { join } from 'node:path';

type GrpcContractConfig = {
  packageName: string;
  protoRelativePath: string;
};

const CORE_GRPC_CONTRACTS: GrpcContractConfig[] = [
  {
    packageName: 'transmittal',
    protoRelativePath: 'modules/transmittals/adapters/in/grpc/proto/transmittal.proto',
  },
  {
    packageName: 'workflow',
    protoRelativePath: 'modules/workflows/adapters/in/grpc/proto/workflow.proto',
  },
];

export function getGrpcPackages(): string[] {
  return CORE_GRPC_CONTRACTS.map((contract) => contract.packageName);
}

export function getGrpcProtoPaths(rootDir: string): string[] {
  return CORE_GRPC_CONTRACTS.map((contract) => join(rootDir, contract.protoRelativePath));
}
