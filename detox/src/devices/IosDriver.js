const path = require('path');
const fs = require('fs');
const DeviceDriverBase = require('./DeviceDriverBase');
const InvocationManager = require('../invoke').InvocationManager;
const invoke = require('../invoke');
const GREYConfigurationApi = require('./../ios/earlgreyapi/GREYConfiguration');
const GREYConfigurationDetox = require('./../ios/earlgreyapi/GREYConfigurationDetox');

class IosDriver extends DeviceDriverBase {
  constructor(client) {
    super(client);

    this.expect = require('../ios/expect');
    this.expect.setInvocationManager(new InvocationManager(client));
  }

  exportGlobals() {
    this.expect.exportGlobals();
  }

  createPayloadFile(notification) {
    const notificationFilePath = path.join(this.createRandomDirectory(), `payload.json`);
    fs.writeFileSync(notificationFilePath, JSON.stringify(notification, null, 2));
    return notificationFilePath;
  }

  async setURLBlacklist(urlList) {
    await this.client.execute(
      GREYConfigurationApi.setValueForConfigKey(
        GREYConfigurationApi.sharedInstance(),
        urlList,
        "GREYConfigKeyURLBlacklistRegex"
      )
    );
  }

  async enableSynchronization() {
    await this.client.execute(
      GREYConfigurationDetox.enableSynchronization(
        GREYConfigurationApi.sharedInstance()
      )
    );
  }

  async disableSynchronization() {
    await this.client.execute(
      GREYConfigurationDetox.disableSynchronization(
        GREYConfigurationApi.sharedInstance()
      )
    );
  }

  async shake(deviceId) {
    return await this.client.shake();
  }

  async setOrientation(deviceId, orientation) {
    // keys are possible orientations
    const orientationMapping = {
      landscape: 3, // top at left side landscape
      portrait: 1 // non-reversed portrait
    };
    if (!Object.keys(orientationMapping).includes(orientation)) {
      throw new Error(`setOrientation failed: provided orientation ${orientation} is not part of supported orientations: ${Object.keys(orientationMapping)}`);
    }

    const call = invoke.call(invoke.EarlGrey.instance,
      'rotateDeviceToOrientation:errorOrNil:',
      invoke.IOS.NSInteger(orientationMapping[orientation])
    );
    await this.client.execute(call);
  }

  defaultLaunchArgsPrefix() {
    return '-';
  }

  validateDeviceConfig(config) {
    //no validation
  }

  getPlatform() {
    return 'ios';
  }
}

module.exports = IosDriver;
