"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("tsyringe");
const mongodb_1 = require("mongodb");
let GeometryDatabaseService = class GeometryDatabaseService {
    constructor(logger) {
        this.logger = logger;
    }
    setCollection(collection) {
        this.collection = collection;
    }
    async findByName(name) {
        return this.collection.findOne({ name });
    }
    async save(geometry) {
        const doc = {
            ...geometry,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await this.collection.insertOne(doc);
        return result.insertedId.toString();
    }
    async search(query, page, limit) {
        const filter = {};
        if (query.name)
            filter.name = { $regex: query.name, $options: 'i' };
        if (query.dimensions)
            filter['properties.dimensions'] = query.dimensions;
        const items = await this.collection
            .find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();
        const total = await this.collection.countDocuments(filter);
        return { items, total };
    }
    async delete(id) {
        const result = await this.collection.deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return result.deletedCount === 1;
    }
};
GeometryDatabaseService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('Logger')),
    __metadata("design:paramtypes", [Object])
], GeometryDatabaseService);
exports.default = GeometryDatabaseService;
