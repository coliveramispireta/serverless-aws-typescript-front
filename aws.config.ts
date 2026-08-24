import { REDIRECT_SIGNIN, REDIRECT_SIGNUP } from "@/app/global";

// Fallbacks defensivos: si algún env no llegó al build, el flujo Google
// nunca debe quedarse con redirect vacío (causa InvalidRedirectException).
const FALLBACK_SIGNIN =
  typeof window !== "undefined" ? `${window.location.origin}/dashboard` : "http://localhost:3000/dashboard";
const FALLBACK_SIGNOUT =
  typeof window !== "undefined" ? `${window.location.origin}/login` : "http://localhost:3000/login";

function safeUrl(value: string | undefined, fallback: string): string {
  const v = (value ?? "").trim();
  return v.length > 0 ? v : fallback;
}

export const awsConfig = {
  aws_project_region: "us-east-1",
  aws_cognito_region: "us-east-1",
  aws_user_pools_id: "us-east-1_ZXBsmyLH5",
  aws_user_pools_web_client_id: "3i82a91hvfkuss656nbr80cjnj",
  oauth: {
    domain: "us-east-1zxbsmylh5.auth.us-east-1.amazoncognito.com",
    scope: ["openid", "email", "profile"],
    redirectSignIn: safeUrl(REDIRECT_SIGNIN, FALLBACK_SIGNIN),
    redirectSignOut: safeUrl(REDIRECT_SIGNUP, FALLBACK_SIGNOUT),
    responseType: "token",
  },
  aws_cognito_username_attributes: ["EMAIL"],
  aws_cognito_social_providers: ["GOOGLE"],
  aws_cognito_signup_attributes: ["EMAIL"],
  aws_cognito_mfa_configuration: "OFF",
  aws_cognito_mfa_types: [],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 6,
    passwordPolicyCharacters: ["REQUIRES_LOWERCASE"],
  },
  aws_cognito_verification_mechanisms: [],
};







