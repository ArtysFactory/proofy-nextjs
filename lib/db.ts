// Database utilities for Neon PostgreSQL
import { neon } from '@neondatabase/serverless';

export interface Env {
    DATABASE_URL?: string;
    JWT_SECRET?: string;
    POLYGON_PRIVATE_KEY?: string;
    POLYGON_RPC_URL?: string;
}

// Get database connection
export function getDB() {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    
    return neon(databaseUrl);
}

// Helper function to run a single query
export async function query(sql: string, params: any[] = []) {
    const db = getDB();
    return db(sql, params);
}

export function getEnv(): Env {
    return {
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        POLYGON_PRIVATE_KEY: process.env.POLYGON_PRIVATE_KEY,
        POLYGON_RPC_URL: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    };
}
