# bedrock-kms ChangeLog

## 11.0.0 - 2022-xx-xx

### Changed
- Update dependencies.
  - **BREAKING**: `@bedrock/did-io@9`
- Use `package.json` `files` field.

## 10.3.0 - 2022-06-19

### Added
- Cache KMS module APIs as imported.

## 10.2.0 - 2022-05-13

### Added
- Expose `_disableClearCacheOnUpdate` for testing cache busting only; do not use in
  production.

## 10.1.0 - 2022-05-13

### Added
- Add `fresh` option to `keystores.get()` API to allow for retrieving a fresh
  (not previously cached) keystore config record.

## 10.0.0 - 2022-04-29

### Changed
- **BREAKING**: Update peer deps:
  - `@bedrock/core@6`.
  - `@bedrock/did-context@4`
  - `@bedrock/did-io@8`
  - `@bedrock/jsonld-document-loader@3`
  - `@bedrock/mongodb@10`
  - `@bedrock/package-manager@3`
  - `@bedrock/security-context@7`
  - `@bedrock/veres-one-context@14`.

## 9.0.0 - 2022-04-05

### Changed
- **BREAKING**: Rename package to `@bedrock/kms`.
- **BREAKING**: Convert to module (ESM).
- **BREAKING**: Remove default export.
- **BREAKING**: Require node 14.x.

## 8.3.1 - 2022-03-29

### Fixed
- Use updated `bedrock-security-context` peer dependency.

## 8.3.0 - 2022-03-29

### Changed
- Update peer deps:
  - `bedrock@4.5`
  - `bedrock-mongodb@8.5`.
  - `bedrock-did-context@2.1`
  - `bedrock-package-manager@1.2`
  - `bedrock-jsonld-document-loader@1.3`
  - `bedrock-veres-one-context@12.1`.
- Update internals to use esm style and use `esm.js` to
  transpile to CommonJS.

## 8.2.0 - 2022-02-10

### Changed
- Use `bedrock-did-io@6`.

## 8.1.0 - 2022-02-08

### Changed
- Update peer dependency `bedrock-veres-one-context@12`.

## 8.0.0 - 2022-01-11

### Changed
- **BREAKING**: Require bedrock-did-io@5. This change effectively pulls in
  the latest did-veres-one driver which ultimately uses zcap@7.

## 7.4.0 - 2021-12-17

### Changed
- Replace `p-limit` with `p-all`.

## 7.3.0 - 2021-12-16

### Changed
- Changed `getStorageUsage` to use `p-limit` for handling max concurrency.

## 7.2.0 - 2021-11-22

### Added
- Add `aggregate` function option for `getStorageUsage` to allow custom
  aggregation of additional usage information. This is used, for example,
  by `bedrock-kms-http` to store zcap revocation storage usage.

### Fixed
- Fixed bugs with `keystores.getStorageUsage()`.

## 7.1.0 - 2021-11-15

### Added
- Added optional `explain` param to get more details about database performance.
- Added database tests in order to check database performance.

### Changed
- Exposed helper functions in order to properly test database calls.

## 7.0.1 - 2021-09-01

### Fixed
- Fix typo in controller+referenceId index.

## 7.0.0 - 2021-07-22

### Added
- Add `getStorageUsage` API. This function can be called with a meter ID,
  WebKMS module manager API and an optional abort signal. It will return the
  current storage usage for all keystores that use the identified meter.

### Changed
- **BREAKING**: Database keystore collection now named `kms-keystore` to match
  modern naming convention. There is no expectation that old systems will
  be able to upgrade in place to this new version, rather existing systems
  that relied on bedrock-kms (typically via bedrock-kms-http) must transition
  to new systems running the new version.

### Removed
- **BREAKING**: Removed deprecated `fields` option from `keystores.find` API.
  Use `options.projection` option instead.

## 6.0.0 - 2021-05-20

### Changed
- **BREAKING**: Drop support for node 10.
- **BREAKING**: Use `ed25519-signature-2020` signature suite. Operations must
  now be signed using the `Ed25519Signature2020` suite.
- Remove unused `did-veres-one`.
- Remove use of `jsonld-signatures`.
- Remove `@digitalbazaar/did-io` and use `bedrock-did-io@2.0`.
- Remove `did-method-key`.
- Update dependencies to latest:
  - [bedrock-did-io@2.0](https://github.com/digitalbazaar/bedrock-did-io/blob/main/CHANGELOG.md),
  - [webkms-switch@5.0](https://github.com/digitalbazaar/webkms-switch/blob/main/CHANGELOG.md).

## 5.0.0 - 2021-03-11

### Fixed
- **BREAKING**: Fix incorrectly configured MongoDB index on the `kmsKeystore`
  collection. If this software needs to be deployed along with an existing
  database, the index named `controller_1_config.referenceId_1` will need to
  be dropped manually. The index will be recreated automatically on Bedrock
  application startup.

## 4.0.1 - 2021-03-09

### Fixed
- Remove obsolete `allowedHost` config.

## 4.0.0 - 2021-03-09

### Added
- Keystore configurations may now include an optional `ipAllowList` array. If
  specified, the KMS system will only execute requests originating from IPs
  listed in `ipAllowList`. This applies to key operations for all keys in the
  keystore as well as modification of the configuration itself.

### Changed
- **BREAKING**: Change data model and validation of keystore configs. Configs
  no longer include `invoker` or `delegator` properties.

## 3.1.0 - 2020-09-25

## Added
- Add cache for public key records.

## 3.0.2 - 2020-07-09

## Fixed
- Fix usage of MongoDB projection API.

## 3.0.1 - 2020-06-09

## Added
- Add `delegator` and `invoker` as valid kms config properties.

## 3.0.0 - 2020-06-09

### Changed
- **BREAKING**: Upgraded to `bedrock-mongodb` ^7.0.0.
- Mongodb `update` is now `updateOne`.
- Mongodb `find` no longer accepts fields.

### Added
- `find` now throws in both options.projection and fields are set.

## 2.1.0 - 2020-05-15

### Changed
- Add support for `did:v1` resolution.
- Add dependency for `did-io`.
- Add dependency for `did-veres-one`.

## 2.0.1 - 2020-05-06

### Fixed
- Fix error handling in `keystore.update` API.

## 2.0.0 - 2020-04-02

### Changed
- **BREAKING**: Use webkms-switch@2.
- Remove unused peer deps.

## 1.4.0 - 2020-02-25

### Changed
- Add dependency for `did-key-method`.
- Add peer dependency for `bedrock-did-context`.
- Add peer dependency for `bedrock-jsonld-document-loader`.

## 1.3.0 - 2020-02-14

### Changed
- Use jsonld-signatures@5.

## 1.2.0 - 2020-02-07

### Added
- Add support for `inspectCapabilityChain` handler in `validateOperation`. This
  handler can be used to check for revocations in a capability chain.
- Handle reading DID key URLs (with `#`) in document loader.

## 1.1.0 - 2020-01-22

### Changed
- Specify peer dep bedrock-security-context@3.

## 1.0.2 - 2020-01-22

### Fixed
- Add missing jsonld-sigatures dep.

## 1.0.1 - 2019-12-20

### Fixed
- Fixed typo in module import.

## 1.0.0 - 2019-12-20

### Added
- Add core files.

- See git history for changes previous to this release.
