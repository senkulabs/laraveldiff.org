export function mockTags() {
    return [];
}

/**
 * @param {string} sourceVersion
 * @param {string} targetVersion
 */
export function mockPatch(sourceVersion, targetVersion) {
    const _sourceVersion = 'v11.1.3';
    const _targetVersion = 'v11.1.4';
    
    if ([_sourceVersion, _targetVersion].toString() !== [sourceVersion, targetVersion].toString()) {
        throw new Error(`Opps, source version ${sourceVersion} and target version ${targetVersion} not found`);
    }

    return [
        {
          sha: '3995a5b919ca7b365d365c7103b40e026adeb7ed',
          filename: 'CHANGELOG.md',
          status: 'modified',
          additions: 5,
          deletions: 1,
          changes: 6,
          blob_url: 'https://github.com/laravel/laravel/blob/2897a49c65a37e385d25d6606d8258e1afb39774/CHANGELOG.md',
          raw_url: 'https://github.com/laravel/laravel/raw/2897a49c65a37e385d25d6606d8258e1afb39774/CHANGELOG.md',
          contents_url: 'https://api.github.com/repos/laravel/laravel/contents/CHANGELOG.md?ref=2897a49c65a37e385d25d6606d8258e1afb39774',
          patch: '@@ -1,6 +1,10 @@\n' +
            ' # Release Notes\n' +
            ' \n' +
            '-## [Unreleased](https://github.com/laravel/laravel/compare/v11.1.2...11.x)\n' +
            '+## [Unreleased](https://github.com/laravel/laravel/compare/v11.1.3...11.x)\n' +
            '+\n' +
            '+## [v11.1.3](https://github.com/laravel/laravel/compare/v11.1.2...v11.1.3) - 2024-07-03\n' +
            '+\n' +
            '+* [11.x] Comment maintenance store by [@timacdonald](https://github.com/timacdonald) in https://github.com/laravel/laravel/pull/6429\n' +
            ' \n' +
            ' ## [v11.1.2](https://github.com/laravel/laravel/compare/v11.1.1...v11.1.2) - 2024-06-20\n' +
            ' '
        },
        {
          sha: '125949ed5a1586ad97e094c7b338a51730c2aec1',
          filename: 'config/database.php',
          status: 'modified',
          additions: 3,
          deletions: 0,
          changes: 3,
          blob_url: 'https://github.com/laravel/laravel/blob/2897a49c65a37e385d25d6606d8258e1afb39774/config%2Fdatabase.php',
          raw_url: 'https://github.com/laravel/laravel/raw/2897a49c65a37e385d25d6606d8258e1afb39774/config%2Fdatabase.php',
          contents_url: 'https://api.github.com/repos/laravel/laravel/contents/config%2Fdatabase.php?ref=2897a49c65a37e385d25d6606d8258e1afb39774',
          patch: '@@ -37,6 +37,9 @@\n' +
            "             'database' => env('DB_DATABASE', database_path('database.sqlite')),\n" +
            "             'prefix' => '',\n" +
            "             'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),\n" +
            "+            'busy_timeout' => null,\n" +
            "+            'journal_mode' => null,\n" +
            "+            'synchronous' => null,\n" +
            '         ],\n' +
            ' \n' +
            "         'mysql' => ["
        }
      ];
}