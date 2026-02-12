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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("tsyringe");
const GeometryDatabaseService_1 = __importDefault(require("../services/GeometryDatabaseService"));
let GeometryIntegration = class GeometryIntegration {
    constructor(logger, geometryService) {
        this.logger = logger;
        this.geometryService = geometryService;
    }
    async storeGeometry(geometry) {
        try {
            return await this.geometryService.save(geometry);
        }
        catch (error) {
            this.logger.error('GeometryIntegration', 'storeGeometry', error.message);
            throw error;
        }
    }
    async getGeometry(name) {
        try {
            return await this.geometryService.findByName(name);
        }
        catch (error) {
            this.logger.error('GeometryIntegration', 'getGeometry', error.message);
            throw error;
        }
    }
    async search(query, page = 1, limit = 10) {
        try {
            return await this.geometryService.search(query, page, limit);
        }
        catch (error) {
            this.logger.error('GeometryIntegration', 'search', error.message);
            throw error;
        }
    }
    async removeGeometry(id) {
        try {
            return await this.geometryService.delete(id);
        }
        catch (error) {
            this.logger.error('GeometryIntegration', 'removeGeometry', error.message);
            throw error;
        }
    }
};
GeometryIntegration = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('Logger')),
    __metadata("design:paramtypes", [Object, GeometryDatabaseService_1.default])
], GeometryIntegration);
exports.default = GeometryIntegration;
