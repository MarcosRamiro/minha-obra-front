import { Injectable } from '@angular/core';
import { jwtDecode as jwt_decode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class JwtTokenService {

  constructor() {}
  
  private decodeToken(jwtToken: string) {
    return jwt_decode(jwtToken) as { [key: string]: string };  
  }

  getDecodeToken(token: string) {
    return this.decodeToken(token);
  }

  getUser(token: string) {
    const decoded = this.decodeToken(token);
    return decoded ? decoded['displayname'] : '';
  }

  getEmailId(token: string) {
    const decoded = this.decodeToken(token);
    return decoded ? decoded['email'] : '';
  }

  getExpiryTime(token: string) {
    const decoded = this.decodeToken(token);
    return decoded ? Number(decoded['exp']) : 0;
  }

  getSubject(token: string) {
    const decoded = this.decodeToken(token);
    return decoded ? decoded['sub'] : '';
  }

  getCreatedTime(token: string) {
    const decoded = this.decodeToken(token);
    return decoded ? decoded['iat'] : 0;
  }

  isTokenExpired(token: string): boolean {
    
    const expiryTime: any = this.getExpiryTime(token);

    if (!expiryTime) return true

    return (expiryTime - Date.now()) < 0;

  }
}
