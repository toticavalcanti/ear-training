"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// ===================================
// src/models/UserScore.ts
// ===================================
const mongoose_1 = __importStar(require("mongoose"));
const UserScoreSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    exerciseId: { type: String, required: true },
    exerciseType: {
        type: String,
        required: true,
        enum: ['interval', 'rhythmic', 'melodic', 'progression']
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['beginner', 'intermediate', 'advanced']
    },
    score: { type: Number, required: true, min: 0, max: 100 },
    accuracy: { type: Number, required: true, min: 0, max: 100 },
    timeSpent: { type: Number, required: true },
    attempts: { type: Number, required: true, min: 1 },
    completedAt: { type: Date, default: Date.now },
    perfectScore: { type: Boolean, default: false },
    experienceGained: { type: Number, default: 0 }
}, { timestamps: true });
// Índices compostos para performance
UserScoreSchema.index({ userId: 1, exerciseType: 1 });
UserScoreSchema.index({ userId: 1, completedAt: -1 });
UserScoreSchema.index({ userId: 1, perfectScore: 1 });
exports.default = mongoose_1.default.model('UserScore', UserScoreSchema);
