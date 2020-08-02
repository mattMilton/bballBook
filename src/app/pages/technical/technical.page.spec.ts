import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalPage } from './technical.page';

describe('TechnicalPage', () => {
  let component: TechnicalPage;
  let fixture: ComponentFixture<TechnicalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TechnicalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TechnicalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
