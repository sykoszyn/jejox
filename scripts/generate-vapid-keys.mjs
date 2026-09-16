import webPush from 'web-push';

const keys = webPush.generateVAPIDKeys();

console.log('Agregá estas variables a tu .env.local y a Vercel:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
