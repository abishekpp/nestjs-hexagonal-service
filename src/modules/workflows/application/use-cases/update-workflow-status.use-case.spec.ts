import { ApplicationException } from '@common/exceptions/application.exception';
import { Workflow } from '@modules/workflows/domain/entities/workflow.entity';
import { WorkflowRepositoryPort } from '@modules/workflows/ports/out/workflow.repository.port';
import { WorkflowTransmittalPort } from '@modules/workflows/ports/out/workflow-transmittal.port';
import { UpdateWorkflowStatusUseCase } from './update-workflow-status.use-case';

describe('UpdateWorkflowStatusUseCase', () => {
  let workflowRepository: jest.Mocked<WorkflowRepositoryPort>;
  let workflowTransmittal: jest.Mocked<WorkflowTransmittalPort>;
  let useCase: UpdateWorkflowStatusUseCase;

  beforeEach(() => {
    workflowRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };
    workflowTransmittal = {
      createTransmittal: jest.fn(),
    };
    useCase = new UpdateWorkflowStatusUseCase(workflowRepository, workflowTransmittal);
  });

  it('creates a transmittal and stores the reference when completing a workflow', async () => {
    const workflow = new Workflow(
      'workflow-id',
      'project-id',
      'Issued for review',
      ['document-1'],
      ['recipient-1'],
      'IN_PROGRESS',
      '2026-07-15',
      'Please review',
      'creator-id',
      new Date('2026-07-01T00:00:00.000Z'),
      new Date('2026-07-01T00:00:00.000Z'),
      null,
      null,
      null,
    );

    workflowRepository.findById.mockResolvedValue(workflow);
    workflowRepository.update.mockImplementation(async (updatedWorkflow) => updatedWorkflow);
    workflowTransmittal.createTransmittal.mockResolvedValue({
      id: 'transmittal-id',
      transmittalNumber: 'TRN-2026-0001',
      status: 'DRAFT',
      createdAt: '2026-07-01T00:00:00.000Z',
    });

    const output = await useCase.execute({
      id: 'workflow-id',
      status: 'COMPLETED',
    });

    expect(workflowTransmittal.createTransmittal).toHaveBeenCalledWith({
      projectId: 'project-id',
      subject: 'Issued for review',
      documentIds: ['document-1'],
      recipientIds: ['recipient-1'],
      dueDate: '2026-07-15',
      remarks: 'Please review',
      createdBy: 'creator-id',
    });
    expect(workflowRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'COMPLETED',
        transmittalId: 'transmittal-id',
        transmittalNumber: 'TRN-2026-0001',
      }),
    );
    expect(output).toEqual(
      expect.objectContaining({
        id: 'workflow-id',
        status: 'COMPLETED',
        transmittalId: 'transmittal-id',
        transmittalNumber: 'TRN-2026-0001',
      }),
    );
  });

  it('does not create a transmittal when the workflow is missing', async () => {
    workflowRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        id: 'missing-workflow-id',
        status: 'COMPLETED',
      }),
    ).rejects.toBeInstanceOf(ApplicationException);

    expect(workflowTransmittal.createTransmittal).not.toHaveBeenCalled();
    expect(workflowRepository.update).not.toHaveBeenCalled();
  });
});
