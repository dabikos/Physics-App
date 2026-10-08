const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = function withNotificationBrand(config) {
  config = withAndroidManifest(config, mod => {
    const application = mod.modResults.manifest.application[0];
    const name = 'expo.modules.notifications.large_notification_icon';
    application['meta-data'] = application['meta-data'] || [];
    const existing = application['meta-data'].find(item => item.$['android:name'] === name);
    const attributes = { 'android:name': name, 'android:resource': '@drawable/notification_brand' };
    if (existing) existing.$ = attributes;
    else application['meta-data'].push({ $: attributes });
    return mod;
  });
  return withDangerousMod(config, ['android', async mod => {
    const destination = path.join(mod.modRequest.platformProjectRoot, 'app/src/main/res/drawable-nodpi');
    await fs.mkdir(destination, { recursive: true });
    await fs.copyFile(
      path.join(mod.modRequest.projectRoot, 'assets/images/notification-brand.png'),
      path.join(destination, 'notification_brand.png'),
    );
    return mod;
  }]);
};
