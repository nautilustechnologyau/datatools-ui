# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [5.0.1](https://github.com/ibi-group/datatools-ui/compare/v5.0.0...v5.0.1) (2022-03-23)

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## (2022-03-23)

### ⚠ BREAKING CHANGES

- **OatternStopCard.js lib/gtfs/util/index.js lib/types/index.js:** There have been added fields that need to coincide with changes on the backend as
  the api will be looking for the new fields and those fields need to be present on the Front end

### Features

- add ability to add custom files for deployments ([31aff54](https://github.com/ibi-group/datatools-ui/commit/31aff5480a8c133998645bd978b5f30cdc3f0b74))
- add support for editing and adding booking rules ([b597add](https://github.com/ibi-group/datatools-ui/commit/b597add63e64e68c589bdf7fdcf9eca4639b48d6))
- **auto-deploy:** Add OTP auto-deploy project setting ([223d093](https://github.com/ibi-group/datatools-ui/commit/223d093b6057ddb011f8169abf989b7c454aae15)), closes [ibi-group/datatools-server#361](https://github.com/ibi-group/datatools-server/issues/361)
- **deployment:** add a few things to enable auto-deployments ([afe8538](https://github.com/ibi-group/datatools-ui/commit/afe8538b936c73cd4feadc35c866443150f2086e))
- **DeploymentViewer:** add custom geocoder settings panel ([f697c19](https://github.com/ibi-group/datatools-ui/commit/f697c19b7d56a5690de14c609c6b8d0f2ec24303))
- **feed-fetch:** add feed fetch frequency form elements ([548508d](https://github.com/ibi-group/datatools-ui/commit/548508d475e9f753195db42ab58edd170e3d80cc)), closes [ibi-group/datatools-server#346](https://github.com/ibi-group/datatools-server/issues/346)
- **FeedLabel:** denote admin-only label ([83ae860](https://github.com/ibi-group/datatools-ui/commit/83ae860a3a114ccd45eef4043f14109a1b53ff32))
- **FeedSourceTableRow:** add label assigner to feed sources ([90d37ad](https://github.com/ibi-group/datatools-ui/commit/90d37ad952553ba0a05cf5eb7e3bc79428af12c0))
- **FeedSourceTableRow:** show labels of feed source ([be0b052](https://github.com/ibi-group/datatools-ui/commit/be0b052d7f6a0a8cbba124c9b3f940f6d95546f3))
- **FeedTransformation:** Add normalize field transformation ([c64125e](https://github.com/ibi-group/datatools-ui/commit/c64125e27bb8b06165d381843b7f4df261a97af9))
- **FeedVersionSpanChart:** Add chart to compare feed calendar spans. ([8c3fcac](https://github.com/ibi-group/datatools-ui/commit/8c3fcac8b95f182caec89ddc49fb8045546f08d9))
- **gtfs-transform:** add feed transformation settings ([388647c](https://github.com/ibi-group/datatools-ui/commit/388647cb6074c32bee011c827161729b3118f2f5)), closes [#544](https://github.com/ibi-group/datatools-ui/issues/544)
- **gtfs.yml and validation.js:** Updated GTFS Spec for stops.txt and agency.txt ([b299745](https://github.com/ibi-group/datatools-ui/commit/b2997454b4decd49643ef7916534fc1c0845bc7f)), closes [#663](https://github.com/ibi-group/datatools-ui/issues/663)
- **gtfs.yml:** Added fields to feed_info.txt ([acd651a](https://github.com/ibi-group/datatools-ui/commit/acd651a59c1ef0ae9318cecd0f084f0f9e4a6024)), closes [#663](https://github.com/ibi-group/datatools-ui/issues/663)
- **GtfsPlusVersionSummary:** Add GTFS+ validation issue details. ([5fb9ec9](https://github.com/ibi-group/datatools-ui/commit/5fb9ec97a10b0a555254caa841c84faeb4112816))
- **i18n:** add polish langauge ([ee3f5d9](https://github.com/ibi-group/datatools-ui/commit/ee3f5d97b3fb589de1a9e366c476e96f35fc5e0b))
- **Label:** add edit and delete button to labels ([c2945e2](https://github.com/ibi-group/datatools-ui/commit/c2945e209f898a72e22d875984a8d8d9d4536c73))
- **Labels:** add label assigner ([c03d868](https://github.com/ibi-group/datatools-ui/commit/c03d86891f6450d210e1d25a86698b11cfd744f2))
- **Labels:** add label descriptions ([350c6a1](https://github.com/ibi-group/datatools-ui/commit/350c6a1d9b4e50b7b7c5a9234a33761844355e5f))
- **Labels:** add label editor ([e7f12c1](https://github.com/ibi-group/datatools-ui/commit/e7f12c128e883a9e67daf2c9aab4177b092bd6d8))
- **Labels:** create new labels ([ccb4afb](https://github.com/ibi-group/datatools-ui/commit/ccb4afb29e4c7a923f8cd66c2127199539ce94a9))
- **notes:** add optional admin-only visibility for notes ([76d879f](https://github.com/ibi-group/datatools-ui/commit/76d879fd3f9609e92fee57e6088324ec456b2cd1)), closes [#702](https://github.com/ibi-group/datatools-ui/issues/702)
- **PeliasPanel:** support dropping pelias db ([a097c55](https://github.com/ibi-group/datatools-ui/commit/a097c55b200cbaad55c011c1a6b9e458a51f2f62))
- **ProjectFeedListToolbar:** allow filtering by label ([f8995e9](https://github.com/ibi-group/datatools-ui/commit/f8995e90b5763fba4634def53ab1de9cf2774cec))
- **ProjectFeedListToolbar:** allow user to and/or filter labels ([c3dd2e7](https://github.com/ibi-group/datatools-ui/commit/c3dd2e7ca7f2d2ef1b43b304dc6cc25954734755))
- **ProjectSettingsForm:** add project labels ([818bb95](https://github.com/ibi-group/datatools-ui/commit/818bb954ed7f4f143e9d29930dd0e68d25fb3ebf))
- **ProjectViewer:** show labels in project ([3121b7f](https://github.com/ibi-group/datatools-ui/commit/3121b7f03d5658411b2f4695e1dd02c95bf2cfe4))
- **Select compared version:** User can pick another (older) feed version to compare stats to the se ([d566f98](https://github.com/ibi-group/datatools-ui/commit/d566f98a852838c7544d809254e52b9543d13a8e))
- **UserList:** add users per page selector ([0445e12](https://github.com/ibi-group/datatools-ui/commit/0445e120afda4c6b85efa6d6851c648746944bd2)), closes [ibi-group/datatools-server#353](https://github.com/ibi-group/datatools-server/issues/353)

### Bug Fixes

- **actions/editor.js:** request base GTFS with no limits on tables ([7cc84f7](https://github.com/ibi-group/datatools-ui/commit/7cc84f723b660a4eeab42e760f8612e7af527463)), closes [#631](https://github.com/ibi-group/datatools-ui/issues/631)
- **actions/manager/deployments:** Suggest zip name based on deployment name. ([ebefbbf](https://github.com/ibi-group/datatools-ui/commit/ebefbbf85e9971e7ea9e2c8e2aa9d870d6ee75dc))
- **deployment:** fix type def for tripPlannerVersion ([122c6db](https://github.com/ibi-group/datatools-ui/commit/122c6db4946c28275758b12506de2634fa548b60))
- **deployment:** grab deployment that is actively deployed ([ffeaee8](https://github.com/ibi-group/datatools-ui/commit/ffeaee8b982d4eebd457aac164b05a3fceecf373)), closes [#665](https://github.com/ibi-group/datatools-ui/issues/665)
- **deps:** bump deps in scripts/package.json ([f7d80e7](https://github.com/ibi-group/datatools-ui/commit/f7d80e70efaecf9b4ef478fc857c55ae6e82c0f4))
- **editor-map:** handle new gtfs-lib response for encoded polylines ([84abb63](https://github.com/ibi-group/datatools-ui/commit/84abb63ec1ee28af8e4605e5340232d2438794cd)), closes [#627](https://github.com/ibi-group/datatools-ui/issues/627)
- **editor/util/validation:** Fix stop name validation. ([ef69da3](https://github.com/ibi-group/datatools-ui/commit/ef69da36f4a448b098dca8e5c8008888aad04074))
- **EditorMapLayersControl:** remove show routes on map ([1022e00](https://github.com/ibi-group/datatools-ui/commit/1022e00899a56af39e91c9f17c85b216e01e05c7)), closes [ibi-group/datatools-ui#627](https://github.com/ibi-group/datatools-ui/issues/627)
- **EntityListButton:** Fix `New Exception` button formatting ([bfa8e3d](https://github.com/ibi-group/datatools-ui/commit/bfa8e3de40ed2829eb3de080493f71ecbd29f503)), closes [#725](https://github.com/ibi-group/datatools-ui/issues/725) [#725](https://github.com/ibi-group/datatools-ui/issues/725)
- **FeedLabel:** further permission checks ([330a9d1](https://github.com/ibi-group/datatools-ui/commit/330a9d171842f209bedf4af9e424918d106985d3))
- **feeds.js:** format labels to be supported by server ([cb3a1e7](https://github.com/ibi-group/datatools-ui/commit/cb3a1e70ac44728baf370cda926ac4aa2cb14373))
- **FeedTransformation:** Revalidate errors if user selects a table for transform. ([7b00cee](https://github.com/ibi-group/datatools-ui/commit/7b00cee840ea112c6961167dc26b613ec040ddc8))
- **FeedTransformRules:** Remove version clone trigger, add gtfs+ trigger. ([9d78e37](https://github.com/ibi-group/datatools-ui/commit/9d78e3722fed54fae20006ce969fe3fddba2910f))
- **feedVersion:** correctly show all modes in ServicePerModeChart ([606f964](https://github.com/ibi-group/datatools-ui/commit/606f9642f7560a79b6429025f0905226f9d3a5a9)), closes [#610](https://github.com/ibi-group/datatools-ui/issues/610)
- **FeedVersionNavigator:** reverse version sort; add retrieval method filtering ([47e6572](https://github.com/ibi-group/datatools-ui/commit/47e657220d2fa4286b271e95d8a0af289953f48a)), closes [#544](https://github.com/ibi-group/datatools-ui/issues/544)
- **FeedVersionTabs:** Fix github lint checks ([03b77bb](https://github.com/ibi-group/datatools-ui/commit/03b77bb360abe0c0441b54e1d2e6eeca337ad8f7))
- Fix issues from PR lint. ([b7c0c50](https://github.com/ibi-group/datatools-ui/commit/b7c0c50e142885f447506b3712edd58d4c3751e9))
- **getGtfsPlusSpec:** Move sorting from GtfsPlusVersionSummary to getGtfsPlusSpec(). ([1820fc5](https://github.com/ibi-group/datatools-ui/commit/1820fc54173c042e044a4ebebe00be4f1c4b1015))
- **gtfs.yml:** add more currency types for fares ([18702dd](https://github.com/ibi-group/datatools-ui/commit/18702dd65ade982583208eaedab41bf686afb6b9)), closes [#550](https://github.com/ibi-group/datatools-ui/issues/550)
- **gtfs+:** change rider_category_id from Adult -> Regular ([734517d](https://github.com/ibi-group/datatools-ui/commit/734517d5672ee4a4ae954b3363d1fa588c182c9d)), closes [#546](https://github.com/ibi-group/datatools-ui/issues/546)
- **gtfsplus:** trim extra spaces from fields ([fca58ae](https://github.com/ibi-group/datatools-ui/commit/fca58ae67a8c6198579072c0de18f0ff3d83dd8f))
- **GtfsPlusVersionSummary:** Address PR comments ([bd14749](https://github.com/ibi-group/datatools-ui/commit/bd14749796a07d6178bbdf024fd204a04057ca0c))
- **GtfsPlusVersionSummary:** Tame down changes ([ade917a](https://github.com/ibi-group/datatools-ui/commit/ade917adfd1c83882323dd31ad8ded7242368abc))
- **index.js:** Add status=500 context ([7981da7](https://github.com/ibi-group/datatools-ui/commit/7981da71584542f65d8a6485028214fbda990eb1))
- **JobMonitor:** replace conveyal support email w/ config value ([9e148ff](https://github.com/ibi-group/datatools-ui/commit/9e148fff6a7bb8bc685bac0de8b43f0512561ca1))
- **LabelEditor:** show admin-only checkbox to project admins ([db2101c](https://github.com/ibi-group/datatools-ui/commit/db2101cd90cc3074eb5d87b24d12d5fd35061e58))
- **manager/actions/status:** Navigate to latest feed ver. after processing complete. ([eb648f9](https://github.com/ibi-group/datatools-ui/commit/eb648f905b88cf6aef53aeea46895b19f3cad901))
- Merge branch 'dev' into 'feed-diffs'. ([fbafd9d](https://github.com/ibi-group/datatools-ui/commit/fbafd9d49314ec9eef407c73a26fc2c38d3d9237))
- **MTC:** make SERVICE_WITHOUT_DAYS_OF_WEEK a blocking issue ([af06bba](https://github.com/ibi-group/datatools-ui/commit/af06bba1d13bef317e86f115e34cb9df992ecddb))
- **NormalizeField:** Adjust for changes from backend. ([5a981d6](https://github.com/ibi-group/datatools-ui/commit/5a981d63d09ff5387716249e55e2eb341f8282b1))
- **pattern-editor:** handle uncaught error and improve add stop by name ([06ea784](https://github.com/ibi-group/datatools-ui/commit/06ea784765e75c40a7a7c912ffc00988988a0d27)), closes [#617](https://github.com/ibi-group/datatools-ui/issues/617)
- **PatternStopCard.js:** Attempt to fix flow error ([0255029](https://github.com/ibi-group/datatools-ui/commit/025502962c8397a1e5d9860f7d0b8fb20b07d51d)), closes [#668](https://github.com/ibi-group/datatools-ui/issues/668)
- **PatternStopCard.js:** Attempt to fix flow issue again ([ae5eaae](https://github.com/ibi-group/datatools-ui/commit/ae5eaaefe8a46e81b4b560c332f10adf574e600d)), closes [#668](https://github.com/ibi-group/datatools-ui/issues/668)
- **PatternStopCard.js:** Attempt to fox flow issue 3 ([cb588be](https://github.com/ibi-group/datatools-ui/commit/cb588bed71d3620b1465d65453ecd4275aa9b91a)), closes [#668](https://github.com/ibi-group/datatools-ui/issues/668)
- **PatternStopCard.js:** Fix flow issue ([7717c28](https://github.com/ibi-group/datatools-ui/commit/7717c28996c349ae2862d698805cd8bdde877a08)), closes [#663](https://github.com/ibi-group/datatools-ui/issues/663)
- **PatternSTopCard.js:** Fixed prop bug ([4039af7](https://github.com/ibi-group/datatools-ui/commit/4039af7c2a0cf731ddb23ce3c02b4f61b136c21d)), closes [#668](https://github.com/ibi-group/datatools-ui/issues/668)
- **PeliasPanel:** support windows csv mime type ([687125e](https://github.com/ibi-group/datatools-ui/commit/687125eb57a9658f4236ecaaacf28583425306ae))
- Remove instances of BsLabel in FeedVersionViewer; bump react-bootstrap to 0.33. ([0fdd8e6](https://github.com/ibi-group/datatools-ui/commit/0fdd8e648cc8fcc3e5b80cc8bf60d957b4329709))
- **saveEntity, saveTripsForCalendar:** Resolve missing defaults with GTFS spec change ([548fb24](https://github.com/ibi-group/datatools-ui/commit/548fb245d0622af183781add229e57fc97e99e20)), closes [#716](https://github.com/ibi-group/datatools-ui/issues/716) [#717](https://github.com/ibi-group/datatools-ui/issues/717)
- **SubstitutionRow:** Add feedback for invalid substitution patterns. ([93c1062](https://github.com/ibi-group/datatools-ui/commit/93c1062cafb437489f8015a023e412153ab10b5e))
- **UserRow:** show project permissions summary in label ([0980eb9](https://github.com/ibi-group/datatools-ui/commit/0980eb95b14f3ee65bee01b374335dbfeeef0a5c)), closes [#622](https://github.com/ibi-group/datatools-ui/issues/622)
- **validation.js:** Remove ES lint waiver ([589b6c6](https://github.com/ibi-group/datatools-ui/commit/589b6c65d35e1067e86d2fdb90f31ba3fb42fa00)), closes [#668](https://github.com/ibi-group/datatools-ui/issues/668)

### improvement

- **OatternStopCard.js lib/gtfs/util/index.js lib/types/index.js:** Update to the GTFS Spec U ([93b1f53](https://github.com/ibi-group/datatools-ui/commit/93b1f538244205cadc912686a4cfb23d3c26e2e3)), closes [#663](https://github.com/ibi-group/datatools-ui/issues/663)
