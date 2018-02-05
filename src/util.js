import portscanner from 'portscanner';

export default {
  findPort(port, ipAddr) {
    return new Promise((resolve, reject) => {
      portscanner.findAPortNotInUse(port, port + 10, ipAddr, (err, aPort) => {
        if (err || !aPort) {
          reject();
        } else {
          resolve(aPort);
        }
      });
    });
  },
};
