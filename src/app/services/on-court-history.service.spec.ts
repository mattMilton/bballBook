import { TestBed } from '@angular/core/testing';

import { OnCourtHistoryService } from './on-court-history.service';

describe('OnCourtHistoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OnCourtHistoryService = TestBed.get(OnCourtHistoryService);
    expect(service).toBeTruthy();
  });
});
