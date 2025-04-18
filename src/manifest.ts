import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

//@ts-ignore
const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-32.png',
    48: 'img/logo-48.png',
    128: 'img/logo-128.png',
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'img/logo-48.png',
  },
  // options_page: 'options.html',
  // devtools_page: 'devtools.html',
  // background: {
  //   service_worker: 'src/background/index.ts',
  //   type: 'module',
  // },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      // matches: ['<all_urls>'],
      js: ['src/contentScript/index.ts'],
      run_at: 'document_start',
    },
  ],
  // side_panel: {
  //   default_path: 'sidepanel.html',
  // },
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-32.png', 'img/logo-48.png', 'img/logo-128.png'],
      // matches: ['<all_urls>'],
      matches: ['http://*/*', 'https://*/*'],
    },
  ],
  // permissions: ['sidePanel', 'storage'],
  // permissions: ['storage'],
  permissions: ['activeTab'],
  // chrome_url_overrides: {
  //   newtab: 'newtab.html',
  // },
  // commands: {
  //   open_popup: {
  //     suggested_key: {
  //       default: 'Ctrl+Shift+Y',
  //       mac: 'Command+Shift+Y'
  //     },
  //     description: 'Open Inertia Props Inspector popup'
  //   }
  // },
})
