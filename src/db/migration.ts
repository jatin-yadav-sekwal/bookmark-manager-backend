import {neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(Bun.env.DATABASE_URl);

const db = drizzle(sql);

const main = async ()=>{
    try {
        await migrate(db,{
        migrationsFolder:'src/db/migrations'
    });
    } catch (error) {
        console.log(error);
        return "error occured in migration";
    }
}

main();
