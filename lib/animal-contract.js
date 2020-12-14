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

    async createAnimal(ctx, animalId, animal, latitude, longitude) {
        const exists = await this.animalExists(ctx, animalId);
        if (exists) {
            throw new Error(`The animal ${animalId} already exists`);
        }

        const asset = { 
            animal,
            latitude,
            longitude 
        };

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

    async updateAnimal(ctx, animalId, newAnimal, latitude, longitude) {
        const exists = await this.animalExists(ctx, animalId);
        if (!exists) {
            throw new Error(`The animal ${animalId} does not exist`);
        }

        const buffer = await ctx.stub.getState(animalId);
        const oldAsset = JSON.parse(buffer.toString());

        const newAsset = { 
            animal: newAnimal,
            latitude,
            longitude 
        };

        const updatedAsset = {
            ...oldAsset,
            ...newAsset
        };

        const updateBuffer = Buffer.from(JSON.stringify(updatedAsset));
        await ctx.stub.putState(animalId, updateBuffer);
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
