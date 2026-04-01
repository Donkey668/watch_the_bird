export type LoginRequestPayload = {
  assistantAccount: string;
  userPassword: string;
};

export type LoginRequestStatus =
  | "success"
  | "invalid_input"
  | "invalid_credentials";

export type LoginResponse = {
  requestStatus: LoginRequestStatus;
  message: string;
  assistantAccount: string | null;
};

export type AuthSessionSnapshot = {
  status: "guest" | "authenticated";
  assistantAccount: string | null;
  authenticatedAt: string | null;
};

const TEST_ACCOUNT = {
  assistantAccount: "WTBTEST",
  userPassword: "123456",
} as const;

function normalizeCredentialValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildLoginResponse(
  requestStatus: LoginRequestStatus,
  message: string,
  assistantAccount: string | null = null,
): LoginResponse {
  return {
    requestStatus,
    message,
    assistantAccount,
  };
}

export function authenticateLogin(payload: unknown): {
  statusCode: 200 | 400 | 401;
  response: LoginResponse;
} {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      statusCode: 400,
      response: buildLoginResponse(
        "invalid_input",
        "请完整填写助手账号和用户密码。",
      ),
    };
  }

  const { assistantAccount, userPassword } = payload as Partial<LoginRequestPayload>;
  const normalizedAssistantAccount = normalizeCredentialValue(assistantAccount);
  const normalizedUserPassword = normalizeCredentialValue(userPassword);

  if (!normalizedAssistantAccount || !normalizedUserPassword) {
    return {
      statusCode: 400,
      response: buildLoginResponse(
        "invalid_input",
        "请完整填写助手账号和用户密码。",
      ),
    };
  }

  if (
    normalizedAssistantAccount !== TEST_ACCOUNT.assistantAccount ||
    normalizedUserPassword !== TEST_ACCOUNT.userPassword
  ) {
    return {
      statusCode: 401,
      response: buildLoginResponse(
        "invalid_credentials",
        "助手账号或用户密码错误。",
      ),
    };
  }

  return {
    statusCode: 200,
    response: buildLoginResponse(
      "success",
      "登录成功。",
      normalizedAssistantAccount,
    ),
  };
}
