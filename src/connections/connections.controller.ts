import {
  Controller,
  Get,
  Query,
  UseInterceptors,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Delete,
} from "@nestjs/common";
import { ConnectionsService } from "./connections.service";
import { SnakeCaseInterceptor } from "src/interceptors/snakeCase.interceptor";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/guards/authGuard";
import { UserRole } from "src/masterData/userRoles.entity";
import { Roles } from "src/decorators/roles.decorator";
import { CreateConnectionDto } from "./dto/create-connection.dto";
import { UpdateConnectionDto } from "./dto/update-connection.dto";
import { Cron } from "@nestjs/schedule";
import {
  AssignPublicIp,
  ECSClient,
  LaunchType,
  RunTaskCommand,
} from "@aws-sdk/client-ecs";
import { ConfigService } from "@nestjs/config";
import { LoggerService } from "src/logger/logger.service";
import { fetchAllSubnets, fetchSecurityGroupId } from "./aws_helper";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@ApiTags("Connections")
@Controller("connections")
@UseInterceptors(TransformInterceptor, SnakeCaseInterceptor)
export class ConnectionsController {
  constructor(
    private readonly connectionsService: ConnectionsService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService
  ) {}

  @Get("")
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.OrgMember, UserRole.OrgAdmin, UserRole.AUDITOR)
  async getConnections(@Query("applicationId") applicationId: number) {
    return this.connectionsService.getConnections(applicationId);
  }

  @Post("")
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.OrgMember, UserRole.OrgAdmin)
  async createConnection(@Body() body: CreateConnectionDto) {
    return this.connectionsService.createConnection(body);
  }

  @Patch("/:id")
  @ApiOperation({ summary: "Update connection" })
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.OrgMember, UserRole.OrgAdmin)
  async updateConnection(
    @Param("id") id: number,
    @Body() body: UpdateConnectionDto
  ) {
    return await this.connectionsService.updateConnection(id, body);
  }

  @Delete("/:id")
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.OrgMember, UserRole.OrgAdmin)
  async deleteConnection(@Param("id") id: number) {
    return await this.connectionsService.deleteConnection(id);
  }

  @Cron("*/15 * * * *", {
    name: "aws-sync-cron",
    timeZone: "UTC",
  })
  async handleCron() {
    try {
      const lock = await this.connectionsService.acquireLock("aws-sync-cron");
      if (!lock) {
        this.logger.info("Another instance is already running the sync");
        return;
      }

      this.logger.info("Running AWS sync");
      const connections =
        await this.connectionsService.getPendingConnnections();

      this.logger.info("connections", connections);

      for (const connection of connections) {
        if (!connection.metadata["role_arn"]) {
          this.logger.info("No role arn found for connection", connection.id);
          continue;
        }

        let environmentVariables = {
          APPLICATION_ID: connection.application_id.toString(),
          AWS_ROLE_ARN: connection.metadata["role_arn"],
          CONNECTION_ID: connection.id.toString(),
        };

        if (connection.source_id) {
          environmentVariables["SOURCE_ID"] = connection.source_id.toString();
        }

        if (connection?.metadata?.["external_id"]) {
          environmentVariables["AWS_EXTERNAL_ID"] =
            connection.metadata["external_id"].toString();
        }

        await triggerECSTask({
          cluster: "connector-cluster",
          taskDefinition: "connector-task",
          region: this.configService.get<string>("AWS_S3_REGION"),
          environmentVariables: environmentVariables,
        });
        await this.connectionsService.updateConnection(connection.id, {
          last_synced_at: new Date(),
        });
      }

      await this.connectionsService.releaseLock("aws-sync-cron");
    } catch (error) {
      try {
        await this.connectionsService.releaseLock("aws-sync-cron");
      } catch (releaseError) {
        this.logger.error("Error releasing lock:", releaseError);
      }
      console.error("Error running AWS sync:", error);
    }
  }
}

async function triggerECSTask({
  cluster = "your-cluster-name",
  taskDefinition = "your-task-definition",
  region = process.env.AWS_REGION,
  environmentVariables = {},
  command: commandArgs = [],
  containerName = "ConnectorContainer",
}) {
  const client = new ECSClient({ region });
  const subnets = await fetchAllSubnets();
  const securityGroup = await fetchSecurityGroupId("connector-security-group");

  const params = {
    cluster,
    taskDefinition,
    launchType: LaunchType.FARGATE,
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets,
        securityGroups: [securityGroup],
        assignPublicIp: AssignPublicIp.ENABLED,
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: containerName,
          environment: Object.entries(environmentVariables).map(
            ([name, value]) => ({
              name,
              value: String(value),
            })
          ),
          command: commandArgs,
        },
      ],
    },
  };

  const runTaskCommand = new RunTaskCommand(params);
  try {
    return await client.send(runTaskCommand);
  } catch (error) {
    console.error("Error triggering ECS task:", error);
    throw error;
  }
}
