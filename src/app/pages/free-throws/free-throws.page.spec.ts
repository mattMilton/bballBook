import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeThrowsPage } from './free-throws.page';

describe('FreeThrowsPage', () => {
  let component: FreeThrowsPage;
  let fixture: ComponentFixture<FreeThrowsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FreeThrowsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FreeThrowsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
