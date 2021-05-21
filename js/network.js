const STAGE = 'https://stage.mafiaengine.com';
const LOCAL = 'http://localhost:5000';
const PRODUCTION = 'https://www.mafiaengine.com';

const socket = io(STAGE, { transports: ['websocket'] });
