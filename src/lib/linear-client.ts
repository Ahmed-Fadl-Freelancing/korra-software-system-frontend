const LINEAR_API_URL = "https://api.linear.app/graphql";

const API_KEY = import.meta.env.VITE_LINEAR_API_KEY || "";

async function gql(query: string, variables?: Record<string, any>): Promise<any> {
  if (!API_KEY) {
    throw new Error("VITE_LINEAR_API_KEY not set");
  }

  const response = await fetch(LINEAR_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: variables || {} }),
  });

  if (!response.ok) {
    throw new Error(`Linear API error: ${response.status}`);
  }

  const body = await response.json();
  if (body.errors) {
    throw new Error(`Linear GraphQL error: ${JSON.stringify(body.errors)}`);
  }

  return body.data || {};
}

export const CREATE_ISSUE = `
  mutation CreateIssue($input: IssueCreateInput!) {
    issueCreate(input: $input) {
      success
      issue {
        id
        identifier
        title
        url
        state {
          name
        }
      }
    }
  }
`;

export const UPDATE_ISSUE_STATUS = `
  mutation UpdateIssueStatus($id: String!, $stateId: String!) {
    issueUpdate(id: $id, input: { stateId: $stateId }) {
      success
      issue {
        id
        identifier
        state {
          name
          type
        }
      }
    }
  }
`;

export const GET_TEAM_STATES = `
  query GetTeamStates($teamKey: String!) {
    teams(filter: { key: { eq: $teamKey } }) {
      nodes {
        id
        states {
          nodes {
            id
            name
            type
          }
        }
      }
    }
  }
`;

export async function createLinearIssue(
  title: string,
  description: string,
  teamKey: string,
  priority: number = 3
) {
  const statesData = await gql(GET_TEAM_STATES, { teamKey });
  const teams = statesData.teams?.nodes || [];
  if (!teams.length) throw new Error(`Team ${teamKey} not found`);
  const teamId = teams[0].id;

  const result = await gql(CREATE_ISSUE, {
    input: {
      teamId,
      title,
      description,
      priority,
    },
  });

  if (!result.issueCreate?.success) {
    throw new Error("Issue creation failed");
  }

  return result.issueCreate.issue;
}

export async function updateIssueStatus(
  issueId: string,
  statusName: string,
  teamKey: string
) {
  const statesData = await gql(GET_TEAM_STATES, { teamKey });
  const teams = statesData.teams?.nodes || [];
  if (!teams.length) throw new Error(`Team ${teamKey} not found`);

  const states = teams[0].states?.nodes || [];
  const state = states.find((s: any) => s.name.toLowerCase() === statusName.toLowerCase());
  if (!state) {
    throw new Error(`Status '${statusName}' not found`);
  }

  const result = await gql(UPDATE_ISSUE_STATUS, {
    id: issueId,
    stateId: state.id,
  });

  if (!result.issueUpdate?.success) {
    throw new Error("Status update failed");
  }

  return result.issueUpdate.issue;
}
