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

    async getHistoryOfAnimal(ctx, key) {
        const historyIterator = await ctx.stub.getHistoryForKey(key);
        const allResults = [];

        while (true) {
            const res = await historyIterator.next();

            if (res.value && res.value.value.toString()) {
                const Key = res.value.key;
                let Record;

                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } 
                
                catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }

                allResults.push(Record);
            }

            if (res.done) {
                await historyIterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
        
    }

    async readAllAnimals(ctx) {
        // Query to get all assets
        const getAllQuery = {
            selector: {}
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(getAllQuery));  

        const allResults = [];

        // Return all assets

        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } 
                
                catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }

                Record.key = Key;
                allResults.push(Record);
            }

            if (res.done) {
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }
}

module.exports = AnimalContract;
