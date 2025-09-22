const { getDefaultConfig } = require('@expo/metro-config')

const defaultConfig = getDefaultConfig(__dirname)

// Support for `.cjs` file extensions
defaultConfig.resolver.sourceExts.push('cjs')

// This fixed the firebase crash with Hermes, that happened after update 2/5-25
defaultConfig.resolver.unstable_enablePackageExports = false

module.exports = defaultConfig
