// import { Test } from '@nestjs/testing';
// import { EntityManager } from 'typeorm';

// describe('AppStandardControlService', () => {
//     let entityManager: EntityManager;

//     describe('recalculateControlCompletion', () => {
//         it('should not update anything if enhancement percentage is null', async () => {
//             const mockQueryBuilder = {
//                 select: jest.fn().mockReturnThis(),
//                 from: jest.fn().mockReturnThis(),
//                 where: jest.fn().mockReturnThis(),
//                 andWhere: jest.fn().mockReturnThis(),
//                 getRawOne: jest.fn().mockResolvedValue({ average: null }),
//             };

//             expect(entityManager.update).not.toHaveBeenCalled();
//         });

//         it('should update completion percentages for control, category and compliance', async () => {
//             const mockControl = {
//                 id: 1,
//                 compliance_category_id: 2,
//                 compliance_id: 3,
//             };

//             const mockQueryBuilder = {
//                 select: jest.fn().mockReturnThis(),
//                 from: jest.fn().mockReturnThis(),
//                 where: jest.fn().mockReturnThis(),
//                 andWhere: jest.fn().mockReturnThis(),
//                 getRawOne: jest.fn()
//                     .mockResolvedValueOnce({ average: '75.5' })  // enhancement percentage
//                     .mockResolvedValueOnce({ average: '80.0' })  // control percentage
//                     .mockResolvedValueOnce({ average: '85.0' }), // category percentage
//             };

//             jest.spyOn(entityManager, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

//             expect(entityManager.update).toHaveBeenCalledTimes(3);
//             expect(entityManager.update).toHaveBeenCalledWith(
//                 { id: 1 },
//                 expect.objectContaining({ percentage_completion: 75.5 })
//             );
//             expect(entityManager.update).toHaveBeenCalledWith(
//                 { id: 2 },
//                 expect.objectContaining({ percentage_completion: 80.0 })
//             );
//             expect(entityManager.update).toHaveBeenCalledWith(
//                 { id: 3 },
//                 expect.objectContaining({ percentage_completion: 85.0 })
//             );
//         });
//     });

//     describe('recalculateAsset', () => {
//         it('should execute all three update queries with correct parameters', async () => {
//             const appId = 1;
//             const currentDate = new Date();
//             jest.spyOn(global, 'Date').mockImplementation(() => currentDate);


//             expect(entityManager.query).toHaveBeenCalledTimes(3);

//             expect(entityManager.query).toHaveBeenNthCalledWith(
//                 1,
//                 expect.stringContaining('UPDATE compliance_control_enhancements'),
//                 [appId, currentDate]
//             );

//             expect(entityManager.query).toHaveBeenNthCalledWith(
//                 2,
//                 expect.stringContaining('UPDATE compliance_controls'),
//                 [appId, currentDate]
//             );

//             expect(entityManager.query).toHaveBeenNthCalledWith(
//                 3,
//                 expect.stringContaining('UPDATE compliances'),
//                 [appId, currentDate]
//             );
//         });

//         it('should handle database errors gracefully', async () => {
//             jest.spyOn(entityManager, 'query').mockRejectedValueOnce(new Error('Database error'));
//         });
//     });
// });
