import {
  EC2Client,
  DescribeSubnetsCommand,
  DescribeSecurityGroupsCommand,
} from "@aws-sdk/client-ec2";

const ec2Client = new EC2Client({ region: process.env.AWS_REGION });

export async function fetchAllSubnets() {
  try {
    const command = new DescribeSubnetsCommand({});
    const response = await ec2Client.send(command);

    return response.Subnets.filter(
      (subnet) => subnet.MapPublicIpOnLaunch === true
    ).map((subnet) => subnet.SubnetId);
  } catch (error) {
    console.error("Error fetching subnets:", error);
  }
}

export async function fetchSecurityGroupId(name: string) {
  try {
    const command = new DescribeSecurityGroupsCommand({});
    const response = await ec2Client.send(command);

    return response.SecurityGroups.find((sg) => sg.GroupName === name)?.GroupId;
  } catch (error) {
    console.error("Error fetching security groups:", error);
  }
}
