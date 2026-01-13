import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

interface ICognitoClient {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export const CognitoClient = ({
  region,
  accessKeyId,
  secretAccessKey,
}: ICognitoClient) =>
  new CognitoIdentityProviderClient({
    region,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });
