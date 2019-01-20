import Redis from 'ioredis';

// WHEN CONNECTING TO REDIS RUNNING ON LOCAL MACHINE
// export const redis = new Redis();

// WHEN RUNNING REDIS IN DOCKER CONTAINER
export const redis = new Redis(
    6379,
    'redis'
);


// NOTATED CODE: 
// export const redis = new Redis(/* we could put a default connection string here if we didn't want the default redis port.  However, the default will work fine for local development*/);
