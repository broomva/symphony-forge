/**
 * Railway provisioning service.
 * Uses the Railway GraphQL API to create/destroy services for Symphony instances.
 *
 * Requires RAILWAY_API_TOKEN and RAILWAY_PROJECT_ID environment variables.
 */

const RAILWAY_API_URL = "https://backboard.railway.com/graphql/v2";

interface RailwayConfig {
  apiToken: string;
  projectId: string;
}

interface RailwayService {
  id: string;
  name: string;
}

interface RailwayDeployment {
  id: string;
  status: string;
}

interface RailwayServiceDomain {
  domain: string;
}

function getConfig(): RailwayConfig {
  const apiToken = process.env.RAILWAY_API_TOKEN;
  const projectId = process.env.RAILWAY_PROJECT_ID;
  if (!(apiToken && projectId)) {
    throw new Error(
      "RAILWAY_API_TOKEN and RAILWAY_PROJECT_ID must be set for provisioning"
    );
  }
  return { apiToken, projectId };
}

async function graphql<T>(
  token: string,
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const response = await fetch(RAILWAY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Railway API error (${response.status}): ${text}`);
  }

  const json = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };
  if (json.errors?.length) {
    throw new Error(
      `Railway GraphQL error: ${json.errors.map((e) => e.message).join(", ")}`
    );
  }
  if (!json.data) {
    throw new Error("Railway API returned no data");
  }
  return json.data;
}

/**
 * Create a new Railway service for a Symphony instance.
 */
export async function createService(
  name: string,
  environmentId?: string
): Promise<RailwayService> {
  const { apiToken, projectId } = getConfig();

  const data = await graphql<{ serviceCreate: RailwayService }>(
    apiToken,
    `mutation($input: ServiceCreateInput!) {
      serviceCreate(input: $input) {
        id
        name
      }
    }`,
    {
      input: {
        name: `symphony-${name}`,
        projectId,
        ...(environmentId ? { environmentId } : {}),
      },
    }
  );

  return data.serviceCreate;
}

/**
 * Set environment variables on a Railway service.
 */
export async function setServiceVariables(
  serviceId: string,
  environmentId: string,
  variables: Record<string, string>
): Promise<boolean> {
  const { apiToken } = getConfig();

  await graphql(
    apiToken,
    `mutation($input: VariableCollectionUpsertInput!) {
      variableCollectionUpsert(input: $input)
    }`,
    {
      input: {
        serviceId,
        environmentId,
        variables,
      },
    }
  );

  return true;
}

/**
 * Deploy a Docker image to a Railway service.
 */
export async function deployImage(
  serviceId: string,
  environmentId: string,
  image: string
): Promise<RailwayDeployment> {
  const { apiToken } = getConfig();

  const data = await graphql<{
    serviceInstanceDeploy: RailwayDeployment;
  }>(
    apiToken,
    `mutation($serviceId: String!, $environmentId: String!, $input: ServiceInstanceDeployInput!) {
      serviceInstanceDeploy(serviceId: $serviceId, environmentId: $environmentId, input: $input) {
        id
        status
      }
    }`,
    {
      serviceId,
      environmentId,
      input: { image },
    }
  );

  return data.serviceInstanceDeploy;
}

/**
 * Generate a public domain for a Railway service.
 */
export async function createServiceDomain(
  serviceId: string,
  environmentId: string
): Promise<RailwayServiceDomain> {
  const { apiToken } = getConfig();

  const data = await graphql<{
    serviceDomainCreate: RailwayServiceDomain;
  }>(
    apiToken,
    `mutation($input: ServiceDomainCreateInput!) {
      serviceDomainCreate(input: $input) {
        domain
      }
    }`,
    {
      input: { serviceId, environmentId },
    }
  );

  return data.serviceDomainCreate;
}

/**
 * Get the latest deployment status for a service.
 */
export async function getDeploymentStatus(
  serviceId: string,
  environmentId: string
): Promise<RailwayDeployment | null> {
  const { apiToken } = getConfig();

  const data = await graphql<{
    deployments: { edges: Array<{ node: RailwayDeployment }> };
  }>(
    apiToken,
    `query($input: DeploymentListInput!) {
      deployments(input: $input, first: 1) {
        edges {
          node {
            id
            status
          }
        }
      }
    }`,
    {
      input: { serviceId, environmentId },
    }
  );

  return data.deployments.edges[0]?.node ?? null;
}

/**
 * Delete a Railway service entirely.
 */
export async function deleteService(serviceId: string): Promise<boolean> {
  const { apiToken } = getConfig();

  await graphql(
    apiToken,
    `mutation($id: String!) {
      serviceDelete(id: $id)
    }`,
    { id: serviceId }
  );

  return true;
}

/**
 * Provision a complete Symphony instance on Railway.
 * Creates the service, sets env vars, deploys the image, and generates a domain.
 */
export async function provisionInstance(params: {
  name: string;
  environmentId: string;
  image: string;
  envVars: Record<string, string>;
}): Promise<{
  serviceId: string;
  domain: string;
  deploymentId: string;
}> {
  const service = await createService(params.name, params.environmentId);

  await setServiceVariables(service.id, params.environmentId, params.envVars);

  const deployment = await deployImage(
    service.id,
    params.environmentId,
    params.image
  );

  const domainResult = await createServiceDomain(
    service.id,
    params.environmentId
  );

  return {
    serviceId: service.id,
    domain: domainResult.domain,
    deploymentId: deployment.id,
  };
}

/**
 * Tear down a Railway service (full cleanup).
 */
export function destroyInstance(serviceId: string): Promise<boolean> {
  return deleteService(serviceId);
}
