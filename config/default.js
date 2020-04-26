const ip = require('ip');
const ms = require('ms');

module.exports = {

    intervalMs: ms('5m'),
    lookbackIntervalMs: ms('15m'),
    cleanupIntervalMs: ms('14d'),

    // Filter ip after collecting
    ip: {
        from: ip.toLong('192.168.178.1'),
        to: ip.toLong('192.168.178.254'),
    },

    mqtt: {
        hostname: '192.168.178.4',

        options: {
            qos: 1,
            retain: true
        },

        topics: {
            spaceStatus: 'sensor/presence/staffStatus',
            spaceStaffCount: 'sensor/presence/staffCount'
        }
    },

   

 

    nmap: {
        network: '192.168.178.1-255'
    }
};