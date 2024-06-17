import { TestBed } from '@angular/core/testing';

import { LocalStorageHelperService } from './local-storage-helper.service';

describe('LocalStorageHelperService', () => {
  let service: LocalStorageHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
