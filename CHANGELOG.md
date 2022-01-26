# bedrock-kms ChangeLog

## 8.1.0 - TBD

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
