import { ConfigService } from '@nestjs/config';

export function getUserFromGoogleProfile(obj: any) {
  return {
    googleId: obj.sub,
    name: obj.name,
    email: obj.email,
    verified: obj.email_verified,
    locale: obj.locale,
    iconUrl: obj.picture,
    googleProps: obj,
  };
}

export function getGoogleOAuthOptions(configService: ConfigService) {
  const clientID = configService.get('GOOGLE_CLIENT_ID');
  const clientSecret = configService.get('GOOGLE_SECRET');
  const callbackURL = configService.get('GOOGLE_CALLBACK');
  return {
    clientID,
    clientSecret,
    callbackURL,
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scope: ['email', 'profile'],
  };
}

export function getGoogleAppOptions(configService: ConfigService) {
  const scope = configService.get('GOOGLE_SCOPE');
  const audience = configService.get('GOOGLE_AUDIENCE');
  return { scope: scope?.split(','), audience: audience?.split(',') };
}
