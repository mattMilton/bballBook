import { TestBed } from '@angular/core/testing';

import { PlaysLogService } from './plays-log.service';

describe('PlaysLogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PlaysLogService = TestBed.get(PlaysLogService);
    expect(service).toBeTruthy();
  });
});
