import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageHelperService {

  constructor() { }

  setItem(key: string, value: any) {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    localStorage.setItem(key, value);
  }

  // Recupera um valor do localStorage
  getItem(key: string) {
    const value: any = localStorage.getItem(key);
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  // Remove um item do localStorage
  removeItem(key: string) {
    localStorage.removeItem(key);
  }

  // Limpa todos os dados do localStorage
  clear() {
    localStorage.clear();
  }

}
