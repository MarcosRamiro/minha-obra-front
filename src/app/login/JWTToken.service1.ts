import { Injectable } from '@angular/core';
import { jwtDecode as jwt_decode } from "jwt-decode";

@Injectable()
export class JWTTokenService {

    jwtToken?: string;
    decodedToken?: { [key: string]: string };

    constructor() {
    }

    setToken(token: string) {
      if (token) {
        this.jwtToken = token;
      }
    }

    decodeToken() {
      if (this.jwtToken) {
      this.decodedToken = jwt_decode(this.jwtToken);
      }
    }

    getDecodeToken() {
      return jwt_decode(this.jwtToken+'');
    }

    getUser() {
      this.decodeToken();
      return this.decodedToken ? this.decodedToken['displayname'] : null;
    }

    getEmailId() {
      this.decodeToken();
      return this.decodedToken ? this.decodedToken['email'] : null;
    }

    getExpiryTime() {
      this.decodeToken();
      return this.decodedToken ? this.decodedToken['exp'] : null;
    }

    getSubject() {
      this.decodeToken();
      return this.decodedToken ? this.decodedToken['sub'] : null;
    }

    getCreatedTime() {
      this.decodeToken();
      return this.decodedToken ? this.decodedToken['iat'] : null;
    }

    isTokenExpired(): boolean {
      let expiryTime: any = this.getExpiryTime();

      if (!expiryTime) return false

//      if (expiryTime) {
        return ((1000 * expiryTime) - (new Date()).getTime()) < 0;
  //    } else {
    //    return false;
     // }
    }
}
