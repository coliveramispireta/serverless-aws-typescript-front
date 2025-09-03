

export const awsConfig = {
  aws_project_region: "us-east-1",
  aws_cognito_region: "us-east-1",
  aws_user_pools_id: "us-east-1_ZXBsmyLH5", 
  aws_user_pools_web_client_id: "3i82a91hvfkuss656nbr80cjnj", 
  oauth: {
    domain: "us-east-1zxbsmylh5.auth.us-east-1.amazoncognito.com", 
    scope: ["openid", "email", "profile"],
    redirectSignIn: "http://localhost:3000/dashboard",
    redirectSignOut: "http://localhost:3000/login",
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
}







