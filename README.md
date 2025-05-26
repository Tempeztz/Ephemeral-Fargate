# Ephemeral ECS Fargate Cluster with AWS CDK (TypeScript)

## What is AWS CDK?

The **AWS Cloud Development Kit (CDK)** is an open-source framework for defining cloud infrastructure using familiar programming languages such as TypeScript. CDK synthesizes your code into AWS CloudFormation templates and deploys them safely and repeatably.

Learn more: [https://aws.amazon.com/cdk/](https://aws.amazon.com/cdk/)

---

## What is an Ephemeral ECS Fargate Cluster?

An **Ephemeral ECS Fargate Cluster** is a serverless container infrastructure that automatically deletes itself after a set time (default: 2 minutes). Useful for temporary testing, demos, or development to save costs and avoid lingering resources.

---

## About This Repository

This project defines an ephemeral ECS Fargate cluster using AWS CDK with TypeScript. It includes a Lambda function triggered by EventBridge to self-delete the CloudFormation stack after a short duration.

---

## Prerequisites

Before you start, make sure you have:

* **Node.js (v16 or higher)** installed
  [Download Node.js](https://nodejs.org/en/download/)

* **AWS CLI** installed and configured with credentials that have permissions to deploy resources
  [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
  [Configure AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)

* **AWS CDK installed globally**

  ```bash
  npm install -g aws-cdk
  ```

## Step-by-Step Setup and Deployment Instructions

### 1. Clone the Repository

 ```bash
 git clone https://github.com/Tempeztz/Ephemeral-Fargate.git
cd ephemeral-fargate
```

### 2. Install Project Dependencies

 ```bash
 npm install
```

### 3. Bootstrap Your AWS Environment (Only Needed Once Per Account/Region)
AWS CDK requires bootstrapping your AWS environment before deploying stacks.

 ```bash
cdk bootstrap aws://YOUR_ACCOUNT_ID/YOUR_REGION
```
Example:

 ```bash
cdk bootstrap aws://123456789012/us-east-1
```
This command provisions resources that CDK needs to perform deployments

### 4. Synthesize CloudFormation Templates
This step generates the CloudFormation template from your CDK code.

```bash
cdk synth
```
You should see the synthesized template printed in your console.

### 5. Deploy the Stack
Deploy your ephemeral ECS Fargate cluster stack to AWS.

```bash
cdk deploy
```
* Confirm the deployment when prompted (type y).

* The stack will create ECS resources and a Lambda function for auto-destruction.

### 6. Wait for Auto-Destruction
By default, the stack is set to delete itself after 2 minutes automatically. The Lambda triggered by EventBridge will destroy the CloudFormation stack, cleaning up resources.

## Optional: Manually Destroy the Stack
If you want to destroy the stack immediately:

```bash
cdk destroy
```

## Customizing the Auto-Destruction Timer
To change the auto-destruction time, edit lib/ephemeral-fargate-stack.ts:

```ts
const rule = new events.Rule(this, 'SelfDestructRule', {
  schedule: events.Schedule.expression('rate(2 minutes)'), // Change '2 minutes' to your desired duration
});
```

Then re-deploy the stack:

```bash
cdk deploy
```

## Cleaning Up
* The stack will auto-delete based on the timer.
* To clean manually, run cdk destroy as above.

## Troubleshooting Tips
* Ensure your AWS CLI credentials have sufficient permissions.
* Verify the AWS region matches your CDK bootstrap region.
* If CDK commands fail, run npm install again.
* For TypeScript errors, ensure your dependencies are installed and ts-node is available.

## License
MIT License

## Contributions
Feel free to fork, open issues, or submit pull requests.