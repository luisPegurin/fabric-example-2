/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { AnimalContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('AnimalContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new AnimalContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"animal 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"animal 1002 value"}'));
    });

    describe('#animalExists', () => {

        it('should return true for a animal', async () => {
            await contract.animalExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a animal that does not exist', async () => {
            await contract.animalExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createAnimal', () => {

        it('should create a animal', async () => {
            await contract.createAnimal(ctx, '1003', 'animal 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"animal 1003 value"}'));
        });

        it('should throw an error for a animal that already exists', async () => {
            await contract.createAnimal(ctx, '1001', 'myvalue').should.be.rejectedWith(/The animal 1001 already exists/);
        });

    });

    describe('#readAnimal', () => {

        it('should return a animal', async () => {
            await contract.readAnimal(ctx, '1001').should.eventually.deep.equal({ value: 'animal 1001 value' });
        });

        it('should throw an error for a animal that does not exist', async () => {
            await contract.readAnimal(ctx, '1003').should.be.rejectedWith(/The animal 1003 does not exist/);
        });

    });

    describe('#updateAnimal', () => {

        it('should update a animal', async () => {
            await contract.updateAnimal(ctx, '1001', 'animal 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"animal 1001 new value"}'));
        });

        it('should throw an error for a animal that does not exist', async () => {
            await contract.updateAnimal(ctx, '1003', 'animal 1003 new value').should.be.rejectedWith(/The animal 1003 does not exist/);
        });

    });

    describe('#deleteAnimal', () => {

        it('should delete a animal', async () => {
            await contract.deleteAnimal(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a animal that does not exist', async () => {
            await contract.deleteAnimal(ctx, '1003').should.be.rejectedWith(/The animal 1003 does not exist/);
        });

    });

});