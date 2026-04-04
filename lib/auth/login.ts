import accountPasswordLibrary from "@/data/auth/account-password-library.json";

export type LoginRequestPayload = {
  assistantAccount: string;
  userPassword: string;
};

export type LoginRequestStatus =
  | "success"
  | "invalid_input"
  | "account_not_found"
  | "invalid_password";

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

type AccountPasswordLibraryRecord = {
  assistantAccount: string;
  userPassword: string;
};

function isAccountPasswordLibraryRecord(
  value: unknown,
): value is AccountPasswordLibraryRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const { assistantAccount, userPassword } =
    value as Partial<AccountPasswordLibraryRecord>;

  return (
    typeof assistantAccount === "string" && typeof userPassword === "string"
  );
}

function buildAccountPasswordLookup(source: unknown) {
  const lookup = new Map<string, string>();

  if (!Array.isArray(source)) {
    return lookup;
  }

  for (const item of source) {
    if (!isAccountPasswordLibraryRecord(item)) {
      continue;
    }

    const assistantAccount = item.assistantAccount.trim();
    const userPassword = item.userPassword.trim();

    if (!assistantAccount || !userPassword) {
      continue;
    }

    lookup.set(assistantAccount, userPassword);
  }

  return lookup;
}

const ACCOUNT_PASSWORD_LOOKUP = buildAccountPasswordLookup(accountPasswordLibrary);

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

  const expectedPassword = ACCOUNT_PASSWORD_LOOKUP.get(normalizedAssistantAccount);

  if (expectedPassword === undefined) {
    return {
      statusCode: 401,
      response: buildLoginResponse("account_not_found", "请先注册助手账号！"),
    };
  }

  if (normalizedUserPassword !== expectedPassword) {
    return {
      statusCode: 401,
      response: buildLoginResponse("invalid_password", "用户密码错误。"),
    };
  }

  return {
    statusCode: 200,
    response: buildLoginResponse("success", "登录成功。", normalizedAssistantAccount),
  };
}