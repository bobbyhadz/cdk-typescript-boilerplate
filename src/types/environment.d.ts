declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TABLE_NAME: string;
      appRegion: string;
      userPoolId: string;
      accountId: string;
      identityPoolId: string;
      databaseHost: string;
      databasePort: number;
      databaseUser: string;
      databasePassword: string;
      databaseName: string;
      bucketName: string;
      domainName: string;
    }
  }
}

// If this file has no import/export (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
