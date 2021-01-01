# Welcome to your CDK TypeScript project!

This is an example project for CDK, where the `infrastructure` and the
`lambda code` are written in `typescript`.

The project includes an `Api Gateway` that invokes a `Lambda` that talks to
`Dynamodb`.

The example has 2 environments - `prod` and `dev`, however you can choose to
only synth and deploy 1.

The **CDK code** is located in the `infra` directory and the code for the
**lambdas** is in the `src` directory.

Shout out to [Thorsten Hoeger](https://dev.to/hoegertn) for his posts on CDK,
which inspired this boilerplate

## How to use

1. Clone the repository:

```bash
git clone git@github.com:bobbyhadz/cdk-typescript-boilerplate.git
```

2. Install the dependencies

```bash
cd cdk-typescript-boilerplate && npm run setup
```

3. Bootstrap the environment (s3 bucket for deployments)

```bash
cdk bootstrap
```

4. Deploy the `dev` stack

```bash
npm run deploy-dev
```

4. Optionally deploy the `prod` stack

```bash
npm run deploy-prod
```
