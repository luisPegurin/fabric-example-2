/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class AnimalContract extends Contract {

    async animalExists(ctx, animalId) {
        const buffer = await ctx.stub.getState(animalId);
        return (!!buffer && buffer.length > 0);
    }

    async createAnimal(ctx, animalId, value) {
        const exists = await this.animalExists(ctx, animalId);
        if (exists) {
            throw new Error(`The animal ${animalId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(animalId, buffer);
    }

    async readAnimal(ctx, animalId) {
        const exists = await this.animalExists(ctx, animalId);
        if (!exists) {
            throw new Error(`The animal ${animalId} does not exist`);
        }
        const buffer = await ctx.stub.getState(animalId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateAnimal(ctx, animalId, newValue) {
        const exists = await this.animalExists(ctx, animalId);
        if (!exists) {
            throw new Error(`The animal ${animalId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(animalId, buffer);
    }

    async deleteAnimal(ctx, animalId) {
        const exists = await this.animalExists(ctx, animalId);
        if (!exists) {
            throw new Error(`The animal ${animalId} does not exist`);
        }
        await ctx.stub.deleteState(animalId);
    }

}

module.exports = AnimalContract;
