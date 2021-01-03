# Boilerplate for CDK for using Lambdas written in Typescript

This is an example project for CDK, where the `infrastructure` and the
`lambda code` are written in `typescript`.

The project includes an `Api Gateway` that invokes a `Lambda` that talks to
`Dynamodb`. There are 2 `Lambdas` - one for creation of tasks and one for
getting a list of all the tasks.

The type of the Task object looks like:

```typescript
type Task = {
  PK: string;
  name: string;
  state: string;
};
```

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

3. Optionally change the `Region` to which you will be deploying - default
   region is `eu-central-1` - **Frankfurt**. To change it open `infra/app.ts`
   and change the region for both `tasks-dev` and `tasks-prod` stacks

4. Bootstrap the environment (s3 bucket for deployments)

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

## Testing

Your stack should now be deployed. For testing - grab the `API Gateway url` from
the terminal outputs or from the out-file in the root directory -
`cdk-exports-dev.json` for `dev` and `cdk-exports-prod.json` for `prod`
environments.

First create some tasks by sending a `POST` request to the `/tasks` endpoint:

```bash
curl -X POST -H "Content-Type: application/json" \
    -d '{"name": "Walk the dog", "state": "finished"}' \
    https://YOUR_API_ID.execute-api.YOUR_DEPLOYMENT_REGION.amazonaws.com/tasks
```

Now list the created tasks by sending a `GET` request to the `/tasks` endpoint:

```bash
curl https://YOUR_API_ID.execute-api.YOUR_DEPLOYMENT_REGION.amazonaws.com/tasks
```

## Cleanup

Delete the dev-stack

```bash
cdk destroy tasks-dev
```

Delete the prod-stack

```
cdk destroy tasks-prod
```

## Useful commands

- `npm run setup` - installs the dependencies in both the `root` and the `src`
  directories
- `npm run synth-dev` - synths the `tasks-dev` stack and spit out a
  `template.yaml` file in the root directory, which is the cloudformation
  representation of the CDK code
- `npm run deploy-dev` - deploys the `tasks-dev` stack to cloudformation and
  outputs the `cdk-exports-dev.json` file, which contains the outputs specified
  in your CDK code, and is a file you will most likely have to use in your
  `frontend` - i.e. the `API URL from API Gateway`.
- `npm run synth-prod` and `npm run deploy-prod` - same as above but for the
  `tasks-prod` stack.
