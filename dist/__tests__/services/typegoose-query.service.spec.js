"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typegoose_1 = require("@typegoose/typegoose");
/* eslint-disable no-underscore-dangle,@typescript-eslint/no-unsafe-return */
const testing_1 = require("@nestjs/testing");
const mongodb_1 = require("mongodb");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const core_1 = require("@nestjs-query/core");
const __fixtures__1 = require("../__fixtures__");
const src_1 = require("../../src");
const services_1 = require("../../src/services");
describe('TypegooseQueryService', () => {
    let moduleRef;
    let TestEntityModel;
    let TestReferenceModel;
    let TestEntityService = class TestEntityService extends services_1.TypegooseQueryService {
        constructor(model) {
            super(model);
            this.model = model;
            TestEntityModel = model;
        }
    };
    TestEntityService = tslib_1.__decorate([
        tslib_1.__param(0, nestjs_typegoose_1.InjectModel(__fixtures__1.TestEntity)),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], TestEntityService);
    let TestReferenceService = class TestReferenceService extends services_1.TypegooseQueryService {
        constructor(model) {
            super(model);
            this.model = model;
            TestReferenceModel = model;
        }
    };
    TestReferenceService = tslib_1.__decorate([
        tslib_1.__param(0, nestjs_typegoose_1.InjectModel(__fixtures__1.TestReference)),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], TestReferenceService);
    beforeAll(async () => {
        moduleRef = await testing_1.Test.createTestingModule({
            imports: [
                nestjs_typegoose_1.TypegooseModule.forRoot(await __fixtures__1.getConnectionUri(), {
                    useFindAndModify: false,
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                }),
                src_1.NestjsQueryTypegooseModule.forFeature([__fixtures__1.TestEntity, __fixtures__1.TestReference]),
            ],
            providers: [TestReferenceService, TestEntityService],
        }).compile();
    });
    function convertDocument(doc) {
        return doc.toObject({ virtuals: true });
    }
    function convertDocuments(docs) {
        return docs.map((doc) => convertDocument(doc));
    }
    function testEntityToObject(te) {
        return {
            _id: te._id,
            stringType: te.stringType,
            boolType: te.boolType,
            numberType: te.numberType,
            dateType: te.dateType,
        };
    }
    function testEntityToCreate(te) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { _id, ...insert } = testEntityToObject(te);
        return insert;
    }
    function expectEqualCreate(result, expected) {
        const cleansedResults = result.map(testEntityToCreate);
        const cleansedExpected = expected.map(testEntityToCreate);
        expect(cleansedResults).toEqual(cleansedExpected);
    }
    afterAll(async () => __fixtures__1.closeDbConnection());
    beforeEach(() => __fixtures__1.prepareDb());
    afterEach(() => __fixtures__1.dropDatabase());
    describe('#query', () => {
        it('call find and return the result', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.query({});
            expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(__fixtures__1.TEST_ENTITIES));
        });
        it('should support eq operator', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.query({ filter: { stringType: { eq: 'foo1' } } });
            expect(convertDocuments(queryResult)).toEqual([__fixtures__1.TEST_ENTITIES[0]]);
        });
        it('should support neq operator', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.query({ filter: { stringType: { neq: 'foo1' } } });
            expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(__fixtures__1.TEST_ENTITIES.slice(1)));
        });
        it('should support gt operator', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.query({ filter: { numberType: { gt: 5 } } });
            expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(__fixtures__1.TEST_ENTITIES.slice(5)));
        });
        it('should support gte operator', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.query({ filter: { numberType: { gte: 5 } } });
            expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(__fixtures__1.TEST_ENTITIES.slice(4)));
        });
        it('should support lt operator', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.query({ filter: { numberType: { lt: 5 } } });
            expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(__fixtures__1.TEST_ENTITIES.slice(0, 4)));
        });
        it('should support lte operator', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.query({ filter: { numberType: { lte: 5 } } });
            expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(__fixtures__1.TEST_ENTITIES.slice(0, 5)));
        });
        it('should support in operator', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.query({ filter: { numberType: { in: [1, 2, 3] } } });
            expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(__fixtures__1.TEST_ENTITIES.slice(0, 3)));
        });
        it('should support notIn operator', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.query({ filter: { numberType: { notIn: [1, 2, 3] } } });
            expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(__fixtures__1.TEST_ENTITIES.slice(4)));
        });
        it('should support is operator', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.query({ filter: { boolType: { is: true } } });
            expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(__fixtures__1.TEST_ENTITIES.filter((e) => e.boolType)));
        });
        it('should support isNot operator', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.query({ filter: { boolType: { isNot: true } } });
            expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(__fixtures__1.TEST_ENTITIES.filter((e) => !e.boolType)));
        });
        it('should support like operator', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.query({ filter: { stringType: { like: 'foo%' } } });
            expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(__fixtures__1.TEST_ENTITIES));
        });
        it('should support notLike operator', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.query({ filter: { stringType: { notLike: 'foo%' } } });
            expect(convertDocuments(queryResult)).toEqual([]);
        });
        it('should support iLike operator', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.query({ filter: { stringType: { iLike: 'FOO%' } } });
            expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(__fixtures__1.TEST_ENTITIES));
        });
        it('should support notILike operator', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.query({ filter: { stringType: { notILike: 'FOO%' } } });
            expect(convertDocuments(queryResult)).toEqual([]);
        });
    });
    describe('#aggregate', () => {
        it('call select with the aggregate columns and return the result', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.aggregate({}, {
                count: ['id'],
                avg: ['numberType'],
                sum: ['numberType'],
                max: ['id', 'dateType', 'numberType', 'stringType'],
                min: ['id', 'dateType', 'numberType', 'stringType'],
            });
            return expect(queryResult).toEqual({
                avg: {
                    numberType: 5.5,
                },
                count: {
                    id: 10,
                },
                max: {
                    dateType: __fixtures__1.TEST_ENTITIES[9].dateType,
                    numberType: 10,
                    stringType: 'foo9',
                    id: expect.any(mongodb_1.ObjectId),
                },
                min: {
                    dateType: __fixtures__1.TEST_ENTITIES[0].dateType,
                    numberType: 1,
                    stringType: 'foo1',
                    id: expect.any(mongodb_1.ObjectId),
                },
                sum: {
                    numberType: 55,
                },
            });
        });
        it('call select with the aggregate columns and return the result with a filter', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.aggregate({ stringType: { in: ['foo1', 'foo2', 'foo3'] } }, {
                count: ['id'],
                avg: ['numberType'],
                sum: ['numberType'],
                max: ['id', 'dateType', 'numberType', 'stringType'],
                min: ['id', 'dateType', 'numberType', 'stringType'],
            });
            return expect(queryResult).toEqual({
                avg: {
                    numberType: 2,
                },
                count: {
                    id: 3,
                },
                max: {
                    dateType: __fixtures__1.TEST_ENTITIES[2].dateType,
                    numberType: 3,
                    stringType: 'foo3',
                    id: expect.any(mongodb_1.ObjectId),
                },
                min: {
                    dateType: __fixtures__1.TEST_ENTITIES[0].dateType,
                    numberType: 1,
                    stringType: 'foo1',
                    id: expect.any(mongodb_1.ObjectId),
                },
                sum: {
                    numberType: 6,
                },
            });
        });
    });
    describe('#count', () => {
        it('should return number of elements matching a query', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const expectedEntities = __fixtures__1.TEST_ENTITIES.slice(0, 2);
            const count = await queryService.count({ stringType: { in: expectedEntities.map((e) => e.stringType) } });
            expect(count).toEqual(2);
        });
    });
    describe('#findById', () => {
        it('return the entity if found', async () => {
            const entity = __fixtures__1.TEST_ENTITIES[0];
            const queryService = moduleRef.get(TestEntityService);
            const found = await queryService.findById(entity._id.toHexString());
            expect(convertDocument(found)).toEqual(entity);
        });
        it('return undefined if not found', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const found = await queryService.findById(new mongodb_1.ObjectId().toHexString());
            expect(found).toBeUndefined();
        });
        describe('with filter', () => {
            it('should return an entity if all filters match', async () => {
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                const found = await queryService.findById(entity._id.toHexString(), {
                    filter: { stringType: { eq: entity.stringType } },
                });
                expect(convertDocument(found)).toEqual(entity);
            });
            it('should return an undefined if an entity with the pk and filter is not found', async () => {
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                const found = await queryService.findById(entity._id.toHexString(), {
                    filter: { stringType: { eq: __fixtures__1.TEST_ENTITIES[1].stringType } },
                });
                expect(found).toBeUndefined();
            });
        });
    });
    describe('#getById', () => {
        it('return the entity if found', async () => {
            const entity = __fixtures__1.TEST_ENTITIES[0];
            const queryService = moduleRef.get(TestEntityService);
            const found = await queryService.getById(entity._id.toHexString());
            expect(convertDocument(found)).toEqual(entity);
        });
        it('return undefined if not found', () => {
            const badId = new mongodb_1.ObjectId().toHexString();
            const queryService = moduleRef.get(TestEntityService);
            return expect(queryService.getById(badId)).rejects.toThrow(`Unable to find TestEntity with id: ${badId}`);
        });
        describe('with filter', () => {
            it('should return an entity if all filters match', async () => {
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                const found = await queryService.getById(entity._id.toHexString(), {
                    filter: { stringType: { eq: entity.stringType } },
                });
                expect(convertDocument(found)).toEqual(entity);
            });
            it('should return an undefined if an entity with the pk and filter is not found', async () => {
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.getById(entity._id.toHexString(), {
                    filter: { stringType: { eq: __fixtures__1.TEST_ENTITIES[1].stringType } },
                })).rejects.toThrow(`Unable to find TestEntity with id: ${String(entity._id)}`);
            });
        });
    });
    describe('#createMany', () => {
        it('call save on the repo with instances of entities when passed plain objects', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const created = await queryService.createMany(__fixtures__1.TEST_ENTITIES.map(testEntityToCreate));
            expectEqualCreate(created, __fixtures__1.TEST_ENTITIES);
        });
        it('call save on the repo with instances of entities when passed instances', async () => {
            const instances = __fixtures__1.TEST_ENTITIES.map((e) => testEntityToCreate(e));
            const queryService = moduleRef.get(TestEntityService);
            const created = await queryService.createMany(instances);
            expectEqualCreate(created, __fixtures__1.TEST_ENTITIES);
        });
        it('should reject if the entities already exist', async () => {
            const queryService = moduleRef.get(TestEntityService);
            return expect(queryService.createMany(__fixtures__1.TEST_ENTITIES)).rejects.toThrow('Id cannot be specified when updating or creating');
        });
    });
    describe('#createOne', () => {
        it('call save on the repo with an instance of the entity when passed a plain object', async () => {
            const entity = testEntityToCreate(__fixtures__1.TEST_ENTITIES[0]);
            const queryService = moduleRef.get(TestEntityService);
            const created = await queryService.createOne(entity);
            expect(convertDocument(created)).toEqual(expect.objectContaining(entity));
        });
        it('call save on the repo with an instance of the entity when passed an instance', async () => {
            const Model = typegoose_1.getModelForClass(__fixtures__1.TestEntity);
            const entity = new Model(testEntityToCreate(__fixtures__1.TEST_ENTITIES[0]));
            const outcome = testEntityToObject(entity);
            const queryService = moduleRef.get(TestEntityService);
            const created = await queryService.createOne(entity);
            expect(convertDocument(created)).toEqual(expect.objectContaining(outcome));
        });
        it('should reject if the entity contains an id', async () => {
            const entity = __fixtures__1.TEST_ENTITIES[0];
            const queryService = moduleRef.get(TestEntityService);
            return expect(queryService.createOne({ ...entity })).rejects.toThrow('Id cannot be specified when updating or creating');
        });
    });
    describe('#deleteMany', () => {
        it('delete all records that match the query', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const entities = __fixtures__1.TEST_ENTITIES.slice(0, 5);
            const { deletedCount } = await queryService.deleteMany({
                stringType: { in: entities.map((e) => e.stringType) },
            });
            expect(deletedCount).toEqual(5);
            const allCount = await queryService.count({});
            expect(allCount).toBe(5);
        });
    });
    describe('#deleteOne', () => {
        it('remove the entity', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const deleted = await queryService.deleteOne(__fixtures__1.TEST_ENTITIES[0]._id.toHexString());
            expect(convertDocument(deleted)).toEqual(__fixtures__1.TEST_ENTITIES[0]);
        });
        it('call fail if the entity is not found', async () => {
            const badId = new mongodb_1.ObjectId().toHexString();
            const queryService = moduleRef.get(TestEntityService);
            return expect(queryService.deleteOne(badId)).rejects.toThrow(`Unable to find TestEntity with id: ${badId}`);
        });
        describe('with filter', () => {
            it('should delete the entity if all filters match', async () => {
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                const deleted = await queryService.deleteOne(entity._id.toHexString(), {
                    filter: { stringType: { eq: entity.stringType } },
                });
                expect(convertDocument(deleted)).toEqual(__fixtures__1.TEST_ENTITIES[0]);
            });
            it('should return throw an error if unable to find', async () => {
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.deleteOne(entity._id.toHexString(), {
                    filter: { stringType: { eq: __fixtures__1.TEST_ENTITIES[1].stringType } },
                })).rejects.toThrow(`Unable to find TestEntity with id: ${String(entity._id)}`);
            });
        });
    });
    describe('#updateMany', () => {
        it('update all entities in the filter', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const filter = {
                stringType: { in: __fixtures__1.TEST_ENTITIES.slice(0, 5).map((e) => e.stringType) },
            };
            await queryService.updateMany({ stringType: 'updated' }, filter);
            const entities = await queryService.query({ filter: { stringType: { eq: 'updated' } } });
            expect(entities).toHaveLength(5);
        });
        it('should reject if the update contains the ID', () => {
            const queryService = moduleRef.get(TestEntityService);
            return expect(queryService.updateMany({ id: new mongodb_1.ObjectId().toHexString() }, {})).rejects.toThrow('Id cannot be specified when updating');
        });
    });
    describe('#updateOne', () => {
        it('update the entity', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const entity = __fixtures__1.TEST_ENTITIES[0];
            const update = { stringType: 'updated' };
            const updated = await queryService.updateOne(entity._id.toHexString(), update);
            expect(updated).toEqual(expect.objectContaining({
                _id: entity._id,
                ...update,
            }));
        });
        it('update the entity with an instance of the entity', async () => {
            const queryService = moduleRef.get(TestEntityService);
            const entity = __fixtures__1.TEST_ENTITIES[0];
            const Model = typegoose_1.getModelForClass(__fixtures__1.TestEntity);
            const update = new Model({ stringType: 'updated' });
            const updated = await queryService.updateOne(entity._id.toHexString(), update);
            expect(updated).toEqual(expect.objectContaining({
                _id: entity._id,
                stringType: 'updated',
            }));
        });
        it('should reject if the update contains the ID', async () => {
            const queryService = moduleRef.get(TestEntityService);
            return expect(queryService.updateOne(__fixtures__1.TEST_ENTITIES[0]._id.toHexString(), { id: new mongodb_1.ObjectId().toHexString() })).rejects.toThrow('Id cannot be specified when updating');
        });
        it('call fail if the entity is not found', async () => {
            const badId = new mongodb_1.ObjectId().toHexString();
            const queryService = moduleRef.get(TestEntityService);
            return expect(queryService.updateOne(badId, { stringType: 'updated' })).rejects.toThrow(`Unable to find TestEntity with id: ${badId}`);
        });
        describe('with filter', () => {
            it('should update the entity if all filters match', async () => {
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                const update = { stringType: 'updated' };
                const updated = await queryService.updateOne(entity._id.toHexString(), update, {
                    filter: { stringType: { eq: entity.stringType } },
                });
                expect(updated).toEqual(expect.objectContaining({ _id: entity._id, ...update }));
            });
            it('should throw an error if unable to find the entity', async () => {
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.updateOne(entity._id.toHexString(), { stringType: 'updated' }, { filter: { stringType: { eq: __fixtures__1.TEST_ENTITIES[1].stringType } } })).rejects.toThrow(`Unable to find TestEntity with id: ${String(entity._id)}`);
            });
        });
    });
    describe('#findRelation', () => {
        describe('with one entity', () => {
            it('call select and return the result', async () => {
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.findRelation(__fixtures__1.TestReference, 'testReference', entity);
                expect(convertDocument(queryResult)).toEqual(__fixtures__1.TEST_REFERENCES[0]);
            });
            it('apply the filter option', async () => {
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                const queryResult1 = await queryService.findRelation(__fixtures__1.TestReference, 'testReference', entity, {
                    filter: { referenceName: { eq: __fixtures__1.TEST_REFERENCES[0].referenceName } },
                });
                expect(convertDocument(queryResult1)).toEqual(__fixtures__1.TEST_REFERENCES[0]);
                const queryResult2 = await queryService.findRelation(__fixtures__1.TestReference, 'testReference', entity, {
                    filter: { referenceName: { eq: __fixtures__1.TEST_REFERENCES[1].referenceName } },
                });
                expect(queryResult2).toBeUndefined();
            });
            it('should return undefined select if no results are found.', async () => {
                const entity = __fixtures__1.TEST_ENTITIES[0];
                await TestEntityModel.updateOne({ _id: entity._id }, { $set: { testReference: undefined } });
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.findRelation(__fixtures__1.TestReference, 'testReference', entity);
                expect(queryResult).toBeUndefined();
            });
            it('throw an error if a relation with that name is not found.', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const entity = __fixtures__1.TEST_ENTITIES[0];
                return expect(queryService.findRelation(__fixtures__1.TestReference, 'badReference', entity)).rejects.toThrow('Unable to find reference badReference on TestEntity');
            });
            describe('virtual reference', () => {
                it('call select and return the result', async () => {
                    const entity = __fixtures__1.TEST_REFERENCES[0];
                    const queryService = moduleRef.get(TestReferenceService);
                    const queryResult = await queryService.findRelation(__fixtures__1.TestEntity, 'virtualTestEntity', entity);
                    expect(convertDocument(queryResult)).toEqual(__fixtures__1.TEST_ENTITIES[0]);
                });
                it('apply the filter option', async () => {
                    const entity = __fixtures__1.TEST_REFERENCES[0];
                    const queryService = moduleRef.get(TestReferenceService);
                    const queryResult1 = await queryService.findRelation(__fixtures__1.TestEntity, 'virtualTestEntity', entity, {
                        filter: { stringType: { eq: __fixtures__1.TEST_ENTITIES[0].stringType } },
                    });
                    expect(convertDocument(queryResult1)).toEqual(__fixtures__1.TEST_ENTITIES[0]);
                    const queryResult2 = await queryService.findRelation(__fixtures__1.TestEntity, 'virtualTestEntity', entity, {
                        filter: { stringType: { eq: __fixtures__1.TEST_ENTITIES[1].stringType } },
                    });
                    expect(queryResult2).toBeUndefined();
                });
                it('should return undefined select if no results are found.', async () => {
                    const entity = __fixtures__1.TEST_REFERENCES[0];
                    await TestReferenceModel.updateOne({ _id: entity._id }, { $set: { testEntity: undefined } });
                    const queryService = moduleRef.get(TestReferenceService);
                    const queryResult = await queryService.findRelation(__fixtures__1.TestEntity, 'virtualTestEntity', entity);
                    expect(queryResult).toBeUndefined();
                });
                it('throw an error if a relation with that name is not found.', async () => {
                    const entity = __fixtures__1.TEST_REFERENCES[0];
                    const queryService = moduleRef.get(TestReferenceService);
                    return expect(queryService.findRelation(__fixtures__1.TestEntity, 'badReference', entity)).rejects.toThrow('Unable to find reference badReference on TestReference');
                });
            });
        });
        describe('with multiple entities', () => {
            it('call select and return the result', async () => {
                const entities = __fixtures__1.TEST_ENTITIES.slice(0, 3);
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.findRelation(__fixtures__1.TestReference, 'testReference', entities, {});
                expect(queryResult).toEqual(new Map([
                    [entities[0], expect.objectContaining(__fixtures__1.TEST_REFERENCES[0])],
                    [entities[1], expect.objectContaining(__fixtures__1.TEST_REFERENCES[3])],
                    [entities[2], expect.objectContaining(__fixtures__1.TEST_REFERENCES[6])],
                ]));
            });
            it('should apply the filter option', async () => {
                const entities = __fixtures__1.TEST_ENTITIES.slice(0, 3);
                const queryService = moduleRef.get(TestEntityService);
                const options = {
                    filter: {
                        id: { in: [__fixtures__1.TEST_REFERENCES[0]._id.toHexString(), __fixtures__1.TEST_REFERENCES[6]._id.toHexString()] },
                    },
                };
                const queryResult = await queryService.findRelation(__fixtures__1.TestReference, 'testReference', entities, options);
                expect(queryResult).toEqual(new Map([
                    [entities[0], expect.objectContaining(__fixtures__1.TEST_REFERENCES[0])],
                    [entities[1], undefined],
                    [entities[2], expect.objectContaining(__fixtures__1.TEST_REFERENCES[6])],
                ]));
            });
            it('should return undefined select if no results are found.', async () => {
                const entities = [
                    __fixtures__1.TEST_ENTITIES[0],
                    { _id: new mongodb_1.ObjectId() },
                ];
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.findRelation(__fixtures__1.TestReference, 'testReference', entities);
                expect(queryResult).toEqual(new Map([
                    [entities[0], expect.objectContaining(__fixtures__1.TEST_REFERENCES[0])],
                    [entities[1], undefined],
                ]));
            });
        });
    });
    describe('#queryRelations', () => {
        describe('with one entity', () => {
            it('call select and return the result', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.queryRelations(__fixtures__1.TestReference, 'testReferences', __fixtures__1.TEST_ENTITIES[0], {
                    filter: { referenceName: { isNot: null } },
                });
                return expect(convertDocuments(queryResult)).toEqual(__fixtures__1.TEST_REFERENCES.slice(0, 3));
            });
            it('should apply a filter', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.queryRelations(__fixtures__1.TestReference, 'testReferences', __fixtures__1.TEST_ENTITIES[0], {
                    filter: { referenceName: { eq: __fixtures__1.TEST_REFERENCES[1].referenceName } },
                });
                expect(convertDocuments(queryResult)).toEqual([__fixtures__1.TEST_REFERENCES[1]]);
            });
            it('should apply paging', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.queryRelations(__fixtures__1.TestReference, 'testReferences', __fixtures__1.TEST_ENTITIES[0], {
                    paging: { limit: 2, offset: 1 },
                });
                expect(convertDocuments(queryResult)).toEqual(__fixtures__1.TEST_REFERENCES.slice(1, 3));
            });
        });
        describe('with virtual entity', () => {
            it('call select and return the result', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.queryRelations(__fixtures__1.TestReference, 'virtualTestReferences', __fixtures__1.TEST_ENTITIES[0], {
                    filter: { referenceName: { isNot: null } },
                });
                return expect(convertDocuments(queryResult)).toEqual(expect.arrayContaining(__fixtures__1.TEST_REFERENCES.slice(0, 3)));
            });
            it('should apply a filter', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.queryRelations(__fixtures__1.TestReference, 'virtualTestReferences', __fixtures__1.TEST_ENTITIES[0], {
                    filter: { referenceName: { eq: __fixtures__1.TEST_REFERENCES[1].referenceName } },
                });
                expect(convertDocuments(queryResult)).toEqual([__fixtures__1.TEST_REFERENCES[1]]);
            });
            it('should apply paging', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.queryRelations(__fixtures__1.TestReference, 'virtualTestReferences', __fixtures__1.TEST_ENTITIES[0], {
                    paging: { limit: 2, offset: 1 },
                    sorting: [{ field: 'referenceName', direction: core_1.SortDirection.ASC }],
                });
                expect(convertDocuments(queryResult)).toEqual(__fixtures__1.TEST_REFERENCES.slice(1, 3));
            });
        });
        describe('with multiple entities', () => {
            it('call return a map of results for each entity', async () => {
                const entities = __fixtures__1.TEST_ENTITIES.slice(0, 3);
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.queryRelations(__fixtures__1.TestReference, 'testReferences', entities, {
                    filter: { referenceName: { isNot: null } },
                });
                expect(queryResult.size).toBe(3);
                expect(convertDocuments(queryResult.get(entities[0]))).toEqual(__fixtures__1.TEST_REFERENCES.slice(0, 3));
                expect(convertDocuments(queryResult.get(entities[1]))).toEqual(__fixtures__1.TEST_REFERENCES.slice(3, 6));
                expect(convertDocuments(queryResult.get(entities[2]))).toEqual(__fixtures__1.TEST_REFERENCES.slice(6, 9));
            });
            it('should apply a filter per entity', async () => {
                const entities = __fixtures__1.TEST_ENTITIES.slice(0, 3);
                const references = [__fixtures__1.TEST_REFERENCES[1], __fixtures__1.TEST_REFERENCES[4], __fixtures__1.TEST_REFERENCES[7]];
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.queryRelations(__fixtures__1.TestReference, 'testReferences', entities, {
                    filter: { referenceName: { in: references.map((r) => r.referenceName) } },
                });
                expect(queryResult.size).toBe(3);
                expect(convertDocuments(queryResult.get(entities[0]))).toEqual([references[0]]);
                expect(convertDocuments(queryResult.get(entities[1]))).toEqual([references[1]]);
                expect(convertDocuments(queryResult.get(entities[2]))).toEqual([references[2]]);
            });
            it('should apply paging per entity', async () => {
                const entities = __fixtures__1.TEST_ENTITIES.slice(0, 3);
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.queryRelations(__fixtures__1.TestReference, 'testReferences', entities, {
                    paging: { limit: 2, offset: 1 },
                });
                expect(queryResult.size).toBe(3);
                expect(convertDocuments(queryResult.get(entities[0]))).toEqual(__fixtures__1.TEST_REFERENCES.slice(1, 3));
                expect(convertDocuments(queryResult.get(entities[1]))).toEqual(__fixtures__1.TEST_REFERENCES.slice(4, 6));
                expect(convertDocuments(queryResult.get(entities[2]))).toEqual(__fixtures__1.TEST_REFERENCES.slice(7, 9));
            });
            it('should return an empty array if no results are found.', async () => {
                const entities = [
                    __fixtures__1.TEST_ENTITIES[0],
                    { _id: new mongodb_1.ObjectId() },
                ];
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.queryRelations(__fixtures__1.TestReference, 'testReferences', entities, {
                    filter: { referenceName: { isNot: null } },
                });
                expect(queryResult.size).toBe(2);
                expect(convertDocuments(queryResult.get(entities[0]))).toEqual(__fixtures__1.TEST_REFERENCES.slice(0, 3));
                expect(convertDocuments(queryResult.get(entities[1]))).toEqual([]);
            });
        });
    });
    describe('#aggregateRelations', () => {
        describe('with one entity', () => {
            it('call select and return the result', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const aggResult = await queryService.aggregateRelations(__fixtures__1.TestReference, 'testReferences', __fixtures__1.TEST_ENTITIES[0], { referenceName: { isNot: null } }, { count: ['id'] });
                return expect(aggResult).toEqual({
                    count: {
                        id: 3,
                    },
                });
            });
        });
        describe('with virtual relation', () => {
            it('call select and return the result', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const aggResult = await queryService.aggregateRelations(__fixtures__1.TestReference, 'virtualTestReferences', __fixtures__1.TEST_ENTITIES[0], { referenceName: { isNot: null } }, { count: ['id'] });
                return expect(aggResult).toEqual({
                    count: {
                        id: 3,
                    },
                });
            });
        });
        describe('with multiple entities', () => {
            it('call select and return the result', async () => {
                const entities = __fixtures__1.TEST_ENTITIES.slice(0, 3);
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.aggregateRelations(__fixtures__1.TestReference, 'testReferences', entities, { referenceName: { isNot: null } }, {
                    count: ['id', 'referenceName', 'testEntity'],
                    min: ['id', 'referenceName', 'testEntity'],
                    max: ['id', 'referenceName', 'testEntity'],
                });
                expect(queryResult.size).toBe(3);
                expect(queryResult).toEqual(new Map([
                    [
                        entities[0],
                        {
                            count: {
                                referenceName: 3,
                                testEntity: 3,
                                id: 3,
                            },
                            max: {
                                referenceName: __fixtures__1.TEST_REFERENCES[2].referenceName,
                                testEntity: entities[0]._id,
                                id: expect.any(mongodb_1.ObjectId),
                            },
                            min: {
                                referenceName: __fixtures__1.TEST_REFERENCES[0].referenceName,
                                testEntity: entities[0]._id,
                                id: expect.any(mongodb_1.ObjectId),
                            },
                        },
                    ],
                    [
                        entities[1],
                        {
                            count: {
                                referenceName: 3,
                                testEntity: 3,
                                id: 3,
                            },
                            max: {
                                referenceName: __fixtures__1.TEST_REFERENCES[5].referenceName,
                                testEntity: entities[1]._id,
                                id: expect.any(mongodb_1.ObjectId),
                            },
                            min: {
                                referenceName: __fixtures__1.TEST_REFERENCES[3].referenceName,
                                testEntity: entities[1]._id,
                                id: expect.any(mongodb_1.ObjectId),
                            },
                        },
                    ],
                    [
                        entities[2],
                        {
                            count: {
                                referenceName: 3,
                                testEntity: 3,
                                id: 3,
                            },
                            max: {
                                referenceName: __fixtures__1.TEST_REFERENCES[8].referenceName,
                                testEntity: entities[2]._id,
                                id: expect.any(mongodb_1.ObjectId),
                            },
                            min: {
                                referenceName: __fixtures__1.TEST_REFERENCES[6].referenceName,
                                testEntity: entities[2]._id,
                                id: expect.any(mongodb_1.ObjectId),
                            },
                        },
                    ],
                ]));
            });
            it('should return an empty array if no results are found.', async () => {
                const entities = [
                    __fixtures__1.TEST_ENTITIES[0],
                    { _id: new mongodb_1.ObjectId() },
                ];
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.aggregateRelations(__fixtures__1.TestReference, 'testReferences', entities, { referenceName: { isNot: null } }, {
                    count: ['id', 'referenceName', 'testEntity'],
                    min: ['id', 'referenceName', 'testEntity'],
                    max: ['id', 'referenceName', 'testEntity'],
                });
                expect(queryResult).toEqual(new Map([
                    [
                        entities[0],
                        {
                            count: {
                                referenceName: 3,
                                testEntity: 3,
                                id: 3,
                            },
                            max: {
                                referenceName: __fixtures__1.TEST_REFERENCES[2].referenceName,
                                testEntity: entities[0]._id,
                                id: expect.any(mongodb_1.ObjectId),
                            },
                            min: {
                                referenceName: __fixtures__1.TEST_REFERENCES[0].referenceName,
                                testEntity: entities[0]._id,
                                id: expect.any(mongodb_1.ObjectId),
                            },
                        },
                    ],
                    [entities[1], {}],
                ]));
            });
        });
    });
    describe('#countRelations', () => {
        describe('with one entity', () => {
            it('count the references', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const countResult = await queryService.countRelations(__fixtures__1.TestReference, 'testReferences', entity, {
                    referenceName: { in: [__fixtures__1.TEST_REFERENCES[1].referenceName, __fixtures__1.TEST_REFERENCES[2].referenceName] },
                });
                return expect(countResult).toEqual(2);
            });
            it('should return a rejected promise if the relation is not found', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const entity = __fixtures__1.TEST_ENTITIES[0];
                return expect(queryService.countRelations(__fixtures__1.TestReference, 'badReferences', entity, {
                    referenceName: { in: [__fixtures__1.TEST_REFERENCES[1].referenceName, __fixtures__1.TEST_REFERENCES[2].referenceName] },
                })).rejects.toThrow('Unable to find reference badReferences on TestEntity');
            });
        });
        describe('with virtual entity', () => {
            it('count references', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const countResult = await queryService.countRelations(__fixtures__1.TestReference, 'virtualTestReferences', entity, {});
                return expect(countResult).toEqual(3);
            });
            it('count and return the result', async () => {
                const queryService = moduleRef.get(TestEntityService);
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const countResult = await queryService.countRelations(__fixtures__1.TestReference, 'virtualTestReferences', entity, {
                    referenceName: { in: [__fixtures__1.TEST_REFERENCES[1].referenceName, __fixtures__1.TEST_REFERENCES[2].referenceName] },
                });
                return expect(countResult).toEqual(2);
            });
        });
        describe('with multiple entities', () => {
            it('call count and return the result', async () => {
                const entities = __fixtures__1.TEST_ENTITIES.slice(0, 3);
                const queryService = moduleRef.get(TestEntityService);
                const queryResult = await queryService.countRelations(__fixtures__1.TestReference, 'testReferences', entities, {
                    referenceName: {
                        in: [
                            __fixtures__1.TEST_REFERENCES[1].referenceName,
                            __fixtures__1.TEST_REFERENCES[2].referenceName,
                            __fixtures__1.TEST_REFERENCES[4].referenceName,
                            __fixtures__1.TEST_REFERENCES[5].referenceName,
                            __fixtures__1.TEST_REFERENCES[7].referenceName,
                            __fixtures__1.TEST_REFERENCES[8].referenceName,
                        ],
                    },
                });
                expect(queryResult).toEqual(new Map([
                    [entities[0], 2],
                    [entities[1], 2],
                    [entities[2], 2],
                ]));
            });
        });
    });
    describe('#addRelations', () => {
        it('call select and return the result', async () => {
            const entity = __fixtures__1.TEST_ENTITIES[0];
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.addRelations('testReferences', entity._id.toHexString(), __fixtures__1.TEST_REFERENCES.slice(3, 6).map((r) => r._id.toHexString()));
            expect(queryResult).toEqual(expect.objectContaining({
                _id: entity._id,
                testReferences: expect.arrayContaining(__fixtures__1.TEST_REFERENCES.slice(0, 6).map((r) => r._id)),
            }));
            const relations = await queryService.queryRelations(__fixtures__1.TestReference, 'testReferences', entity, {});
            expect(relations).toHaveLength(6);
        });
        describe('with virtual reference', () => {
            it('should return a rejected promise', async () => {
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.addRelations('virtualTestReferences', entity._id.toHexString(), __fixtures__1.TEST_REFERENCES.slice(3, 6).map((r) => r._id.toHexString()))).rejects.toThrow('AddRelations not supported for virtual relation virtualTestReferences');
            });
        });
        describe('with modify options', () => {
            it('should throw an error if the entity is not found with the id and provided filter', async () => {
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.addRelations('testReferences', entity._id.toHexString(), __fixtures__1.TEST_REFERENCES.slice(3, 6).map((r) => r._id.toHexString()), {
                    filter: { stringType: { eq: __fixtures__1.TEST_ENTITIES[1].stringType } },
                })).rejects.toThrow(`Unable to find TestEntity with id: ${String(entity._id)}`);
            });
            it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.addRelations('testReferences', entity._id.toHexString(), __fixtures__1.TEST_REFERENCES.slice(3, 6).map((r) => r._id.toHexString()), {
                    relationFilter: { referenceName: { like: '%-one' } },
                })).rejects.toThrow('Unable to find all testReferences to add to TestEntity');
            });
        });
    });
    describe('#setRelation', () => {
        it('call select and return the result', async () => {
            const entity = __fixtures__1.TEST_REFERENCES[0];
            const queryService = moduleRef.get(TestReferenceService);
            const queryResult = await queryService.setRelation('testEntity', entity._id.toHexString(), __fixtures__1.TEST_ENTITIES[1]._id.toHexString());
            expect(queryResult).toEqual(expect.objectContaining({ ...entity, testEntity: __fixtures__1.TEST_ENTITIES[1]._id }));
            const relation = await queryService.findRelation(__fixtures__1.TestEntity, 'testEntity', entity);
            expect(convertDocument(relation)).toEqual(__fixtures__1.TEST_ENTITIES[1]);
        });
        it('should reject with a virtual reference', async () => {
            const entity = __fixtures__1.TEST_REFERENCES[0];
            const queryService = moduleRef.get(TestReferenceService);
            return expect(queryService.setRelation('virtualTestEntity', entity._id.toHexString(), __fixtures__1.TEST_ENTITIES[1]._id.toHexString())).rejects.toThrow('SetRelation not supported for virtual relation virtualTestEntity');
        });
        describe('with modify options', () => {
            it('should throw an error if the entity is not found with the id and provided filter', async () => {
                const entity = __fixtures__1.TEST_REFERENCES[0];
                const queryService = moduleRef.get(TestReferenceService);
                return expect(queryService.setRelation('testEntity', entity._id.toHexString(), __fixtures__1.TEST_ENTITIES[1]._id.toHexString(), {
                    filter: { referenceName: { eq: __fixtures__1.TEST_REFERENCES[1].referenceName } },
                })).rejects.toThrow(`Unable to find TestReference with id: ${String(entity._id)}`);
            });
            it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
                const entity = __fixtures__1.TEST_REFERENCES[0];
                const queryService = moduleRef.get(TestReferenceService);
                return expect(queryService.setRelation('testEntity', entity._id.toHexString(), __fixtures__1.TEST_ENTITIES[1]._id.toHexString(), {
                    relationFilter: { stringType: { like: '%-one' } },
                })).rejects.toThrow('Unable to find testEntity to set on TestReference');
            });
        });
    });
    describe('#removeRelation', () => {
        it('call select and return the result', async () => {
            const entity = __fixtures__1.TEST_REFERENCES[0];
            const queryService = moduleRef.get(TestReferenceService);
            const queryResult = await queryService.removeRelation('testEntity', entity._id.toHexString(), __fixtures__1.TEST_ENTITIES[1]._id.toHexString());
            const { testEntity, ...expected } = entity;
            expect(queryResult).toEqual(expect.objectContaining(expected));
            const relation = await queryService.findRelation(__fixtures__1.TestEntity, 'testEntity', entity);
            expect(relation).toBeUndefined();
        });
        it('should reject with a virtual reference', async () => {
            const entity = __fixtures__1.TEST_REFERENCES[0];
            const queryService = moduleRef.get(TestReferenceService);
            return expect(queryService.removeRelation('virtualTestEntity', entity._id.toHexString(), __fixtures__1.TEST_ENTITIES[1]._id.toHexString())).rejects.toThrow('RemoveRelation not supported for virtual relation virtualTestEntity');
        });
        describe('with modify options', () => {
            it('should throw an error if the entity is not found with the id and provided filter', async () => {
                const entity = __fixtures__1.TEST_REFERENCES[0];
                const queryService = moduleRef.get(TestReferenceService);
                return expect(queryService.removeRelation('testEntity', entity._id.toHexString(), __fixtures__1.TEST_ENTITIES[1]._id.toHexString(), {
                    filter: { referenceName: { eq: __fixtures__1.TEST_REFERENCES[1].referenceName } },
                })).rejects.toThrow(`Unable to find TestReference with id: ${String(entity._id)}`);
            });
            it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
                const entity = __fixtures__1.TEST_REFERENCES[0];
                const queryService = moduleRef.get(TestReferenceService);
                return expect(queryService.removeRelation('testEntity', entity._id.toHexString(), __fixtures__1.TEST_ENTITIES[1]._id.toHexString(), {
                    relationFilter: { stringType: { like: '%-one' } },
                })).rejects.toThrow('Unable to find testEntity to remove from TestReference');
            });
        });
    });
    describe('#removeRelations', () => {
        it('call select and return the result', async () => {
            const entity = __fixtures__1.TEST_ENTITIES[0];
            const queryService = moduleRef.get(TestEntityService);
            const queryResult = await queryService.removeRelations('testReferences', entity._id.toHexString(), __fixtures__1.TEST_REFERENCES.slice(0, 3).map((r) => r._id.toHexString()));
            expect(queryResult.toObject()).toEqual(expect.objectContaining({
                _id: entity._id,
                testReferences: [],
            }));
            const relations = await queryService.queryRelations(__fixtures__1.TestReference, 'testReferences', entity, {});
            expect(relations).toHaveLength(0);
        });
        describe('with virtual reference', () => {
            it('should return a rejected promise', async () => {
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.removeRelations('virtualTestReferences', entity._id.toHexString(), __fixtures__1.TEST_REFERENCES.slice(0, 3).map((r) => r._id.toHexString()))).rejects.toThrow('RemoveRelations not supported for virtual relation virtualTestReferences');
            });
        });
        describe('with modify options', () => {
            it('should throw an error if the entity is not found with the id and provided filter', async () => {
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.removeRelations('testReferences', entity._id.toHexString(), __fixtures__1.TEST_REFERENCES.slice(0, 3).map((r) => r._id.toHexString()), {
                    filter: { stringType: { eq: __fixtures__1.TEST_ENTITIES[1].stringType } },
                })).rejects.toThrow(`Unable to find TestEntity with id: ${String(entity._id)}`);
            });
            it('should throw an error if the relations are not found with the relationIds and provided filter', async () => {
                const entity = __fixtures__1.TEST_ENTITIES[0];
                const queryService = moduleRef.get(TestEntityService);
                return expect(queryService.removeRelations('testReferences', entity._id.toHexString(), __fixtures__1.TEST_REFERENCES.slice(0, 3).map((r) => r._id.toHexString()), {
                    relationFilter: { referenceName: { like: '%-one' } },
                })).rejects.toThrow('Unable to find all testReferences to remove from TestEntity');
            });
        });
    });
});
//# sourceMappingURL=typegoose-query.service.spec.js.map